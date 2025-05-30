import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Post from "@/models/Post";
import User from "@/models/User";
import { createDirectTransaction } from "@/lib/solana";
import mongoose from "mongoose";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if the user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to the database
    await connectToDatabase();

    // Get the user from the database
    const buyer = await User.findOne({
      walletAddress: session.user.walletAddress,
    });

    if (!buyer) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

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

    if (post.status !== "active") {
      return NextResponse.json(
        { error: "This item is no longer available" },
        { status: 400 }
      );
    }

    if (post.seller._id.toString() === buyer._id.toString()) {
      return NextResponse.json(
        { error: "You cannot buy your own listing" },
        { status: 400 }
      );
    }

    // Check if there's enough quantity
    if (post.quantity <= 0) {
      return NextResponse.json(
        { error: "This item is out of stock" },
        { status: 400 }
      );
    }

    // Create a direct transaction (buyer to seller)
    try {
      const transactionDetails = await createDirectTransaction(
        buyer.walletAddress,
        post.seller.walletAddress,
        post.price
      );

      // Update the post with transaction details
      post.status = "pending";
      post.transaction = {
        buyerId: buyer._id,
        paymentStatus: "pending",
        shippingStatus: "pending",
      };

      // If the quantity was 1, mark as sold out for future purchases
      if (post.quantity === 1) {
        post.quantity = 0;
      } else {
        // Reduce the quantity by 1
        post.quantity -= 1;
      }

      await post.save();

      // Return the transaction details
      return NextResponse.json(
        {
          success: true,
          transaction: transactionDetails,
          post: {
            id: post._id,
            title: post.itemName,
            price: post.price,
            status: post.status,
          },
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error("Error creating transaction:", error);
      return NextResponse.json(
        {
          error: `Failed to create transaction: ${
            error.message || "Unknown error"
          }`,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error processing purchase:", error);
    return NextResponse.json(
      { error: `Internal server error: ${error.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}
