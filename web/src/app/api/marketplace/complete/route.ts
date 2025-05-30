import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Post from "@/models/Post";
import User from "@/models/User";
import { releaseEscrowToSeller, verifyTransaction } from "@/lib/solana";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to the database
    await connectToDatabase();

    // Parse the request body
    const data = await request.json();

    // Validate the data
    if (!data.postId) {
      return NextResponse.json({ error: "Missing post ID" }, { status: 400 });
    }

    // Find the post
    const post = await Post.findById(data.postId).populate("seller");

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Get the user
    const user = await User.findOne({
      walletAddress: session.user.walletAddress,
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Handle transaction signature from Phantom wallet
    if (data.transactionSignature) {
      try {
        // Verify the transaction on Solana
        const transactionInfo = await verifyTransaction(
          data.transactionSignature
        );

        if (!transactionInfo) {
          return NextResponse.json(
            { error: "Transaction could not be verified" },
            { status: 400 }
          );
        }

        // Update the post with transaction details
        post.status = "sold";
        post.transaction.paymentStatus = "completed";
        post.transaction.transactionHash = data.transactionSignature;

        await post.save();

        return NextResponse.json(
          {
            success: true,
            message: "Payment confirmed. Transaction complete.",
            post: {
              id: post._id,
              title: post.itemName,
              status: post.status,
            },
          },
          { status: 200 }
        );
      } catch (error) {
        console.error("Error verifying transaction:", error);
        return NextResponse.json(
          { error: "Failed to verify transaction" },
          { status: 400 }
        );
      }
    }

    // Check if this is a pending transaction
    if (post.status !== "pending") {
      return NextResponse.json(
        { error: "This transaction is not in pending status" },
        { status: 400 }
      );
    }

    // Check if the user is the buyer or seller
    const isSeller = post.seller._id.toString() === user._id.toString();
    const isBuyer =
      post.transaction.buyerId?.toString() === user._id.toString();

    if (!isSeller && !isBuyer) {
      return NextResponse.json(
        { error: "You are not authorized to complete this transaction" },
        { status: 403 }
      );
    }

    // If the user is the buyer, they're confirming receipt
    if (isBuyer) {
      post.transaction.shippingStatus = "delivered";
      await post.save();

      return NextResponse.json(
        {
          success: true,
          message: "Delivery confirmed. Waiting for seller to release funds.",
          post: {
            id: post._id,
            title: post.itemName,
            status: post.status,
          },
        },
        { status: 200 }
      );
    }

    // If the user is the seller, they're releasing the funds
    if (isSeller) {
      // Check if the item has been marked as delivered
      if (post.transaction.shippingStatus !== "delivered") {
        return NextResponse.json(
          { error: "Cannot release funds until buyer confirms delivery" },
          { status: 400 }
        );
      }

      // Release the funds from escrow to the seller
      const releaseResult = await releaseEscrowToSeller(
        post.seller.walletAddress,
        post.price,
        post.transaction.escrowId || ""
      );

      // Update the post with transaction details
      post.status = "sold";
      post.transaction.paymentStatus = "completed";
      post.transaction.transactionHash = releaseResult.transactionHash;

      await post.save();

      return NextResponse.json(
        {
          success: true,
          message: "Funds released to seller. Transaction complete.",
          transaction: releaseResult,
          post: {
            id: post._id,
            title: post.itemName,
            status: post.status,
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ error: "Invalid operation" }, { status: 400 });
  } catch (error) {
    console.error("Error completing transaction:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
