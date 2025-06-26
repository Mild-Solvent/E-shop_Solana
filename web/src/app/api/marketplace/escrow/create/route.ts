import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Post from "@/models/Post";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  createEscrowTransaction,
  serializeTransaction,
  EscrowParams,
} from "@/lib/escrow-contract";
import { v4 as uuidv4 } from "uuid";
import Escrow from "@/models/Escrow";

// Mock escrow transaction creation - replace with actual Solana program integration
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const { postId, amount, feeBasisPoints = 250 } = await request.json();

    // Validate the post exists and is active
    const post = await Post.findById(postId).populate("seller", "walletAddress");
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.status !== "active") {
      return NextResponse.json({ error: "Post is not available" }, { status: 400 });
    }

    // Calculate fees
    const fee = (amount * feeBasisPoints) / 10000;
    const netAmount = amount - fee;

    // Create real escrow transaction using your smart contract
    const escrowParams: EscrowParams = {
      buyerWallet: session.user.walletAddress,
      sellerWallet: post.seller.walletAddress,
      amount: amount,
      feeBasisPoints: feeBasisPoints,
    };

    const escrowResult = await createEscrowTransaction(escrowParams);
    const serializedTransaction = serializeTransaction(escrowResult.transaction);
    
    const escrowId = escrowResult.escrowId;

    // Save escrow to database
    const newEscrow = new Escrow({
      escrowId: escrowId,
      transactionSeed: escrowResult.transactionSeed,
      escrowPDA: escrowResult.escrowPDA,
      buyerWallet: session.user.walletAddress,
      sellerWallet: post.seller.walletAddress,
      postId,
      amount,
      fee,
      netAmount,
      feeBasisPoints,
      status: "pending_funding",
    });

    const savedEscrow = await newEscrow.save();
    console.log("Escrow created and saved to database:", savedEscrow);

    // Return escrow data for frontend
    const escrowData = {
      id: escrowId,
      transactionSeed: escrowResult.transactionSeed,
      escrowPDA: escrowResult.escrowPDA,
      serializedTransaction: serializedTransaction,
      amount,
      fee,
      netAmount,
      status: "pending_funding",
      buyer: session.user.walletAddress,
      seller: post.seller.walletAddress,
      postId,
      createdAt: new Date(),
    };

    return NextResponse.json({
      success: true,
      escrow: escrowData,
    });
  } catch (error) {
    console.error("Error creating escrow:", error);
    return NextResponse.json(
      { error: "Failed to create escrow" },
      { status: 500 }
    );
  }
}
