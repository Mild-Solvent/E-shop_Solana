import mongoose, { Schema, Document } from "mongoose";

export interface IEscrow extends Document {
  escrowId: string;
  transactionSeed: string;
  escrowPDA: string;
  buyerWallet: string;
  sellerWallet: string;
  postId: string;
  amount: number;
  fee: number;
  netAmount: number;
  feeBasisPoints: number;
  status: "pending_funding" | "funded" | "approved" | "cancelled" | "failed";
  fundingTransactionHash?: string;
  approvalTransactionHash?: string;
  cancellationTransactionHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EscrowSchema = new Schema<IEscrow>(
  {
    escrowId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    transactionSeed: {
      type: String,
      required: true,
      index: true,
    },
    escrowPDA: {
      type: String,
      required: true,
      index: true,
    },
    buyerWallet: {
      type: String,
      required: true,
      index: true,
    },
    sellerWallet: {
      type: String,
      required: true,
      index: true,
    },
    postId: {
      type: String,
      required: true,
      ref: "Post",
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    fee: {
      type: Number,
      required: true,
      min: 0,
    },
    netAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    feeBasisPoints: {
      type: Number,
      required: true,
      min: 0,
      max: 10000,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending_funding", "funded", "approved", "cancelled", "failed"],
      default: "pending_funding",
      index: true,
    },
    fundingTransactionHash: {
      type: String,
      sparse: true,
    },
    approvalTransactionHash: {
      type: String,
      sparse: true,
    },
    cancellationTransactionHash: {
      type: String,
      sparse: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
EscrowSchema.index({ buyerWallet: 1, createdAt: -1 });
EscrowSchema.index({ sellerWallet: 1, createdAt: -1 });
EscrowSchema.index({ status: 1, createdAt: -1 });
EscrowSchema.index({ postId: 1 });

// Compound index for admin queries
EscrowSchema.index({ status: 1, updatedAt: -1 });

const Escrow = mongoose.models.Escrow || mongoose.model<IEscrow>("Escrow", EscrowSchema);

export default Escrow;
