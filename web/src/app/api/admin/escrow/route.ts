import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  createReleaseFundsTransaction,
  createCancelEscrowTransaction,
  serializeTransaction,
  MARKETPLACE_AUTHORITY,
} from "@/lib/escrow-contract";
import Escrow from "@/models/Escrow";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // In real implementation, check if user is admin
    // For demo, allow all authenticated users to see escrows
    
    await connectToDatabase();

    // Get all escrow transactions from database
    const escrows = await Escrow.find({})
      .populate('postId', 'itemName')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      escrows,
    });
  } catch (error) {
    console.error("Error fetching escrows:", error);
    return NextResponse.json(
      { error: "Failed to fetch escrows" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { escrowId, transactionHash, type } = await request.json();

    if (!escrowId || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Find escrow in database
    const escrow = await Escrow.findOne({ escrowId });
    if (!escrow) {
      return NextResponse.json(
        { error: "Escrow not found" },
        { status: 404 }
      );
    }

    // Update escrow based on type
    const updateData: any = { updatedAt: new Date() };

    switch (type) {
      case "funding":
        updateData.status = "funded";
        updateData.fundingTransactionHash = transactionHash;
        break;
      case "approve":
        updateData.status = "approved";
        updateData.approvalTransactionHash = transactionHash;
        break;
      case "cancel":
        updateData.status = "cancelled";
        updateData.cancellationTransactionHash = transactionHash;
        break;
      default:
        return NextResponse.json(
          { error: "Invalid transaction type" },
          { status: 400 }
        );
    }

    // Update in database
    const updatedEscrow = await Escrow.findOneAndUpdate(
      { escrowId },
      updateData,
      { new: true }
    );

    console.log(`Escrow ${escrowId} updated: ${type}`, updatedEscrow);

    return NextResponse.json({
      success: true,
      escrow,
    });
  } catch (error) {
    console.error("Error updating escrow:", error);
    return NextResponse.json(
      { error: "Failed to update escrow" },
      { status: 500 }
    );
  }
}
