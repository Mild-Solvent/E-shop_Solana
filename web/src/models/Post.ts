import mongoose, { Schema } from "mongoose";

export interface IPost {
  seller: mongoose.Types.ObjectId;
  itemName: string;
  price: number;
  description: string;
  quantity: number;
  category: string;
  shipping: string;
  imageUrl: string;
  status: "active" | "sold" | "pending" | "cancelled";
  transaction: {
    escrowId?: string;
    buyerId?: mongoose.Types.ObjectId;
    paymentStatus?: "pending" | "completed" | "refunded";
    shippingStatus?: "pending" | "shipped" | "delivered";
    transactionHash?: string;
  };
  bids?: Array<{
    bidder: mongoose.Types.ObjectId;
    amount: number;
    timestamp: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    seller: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    itemName: {
      type: String,
      required: [true, "Please provide an item name"],
      maxlength: [100, "Item name cannot be more than 100 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please provide a price"],
      min: [0, "Price cannot be negative"],
    },
    description: {
      type: String,
      required: [true, "Please provide a description"],
      maxlength: [2000, "Description cannot be more than 2000 characters"],
    },
    quantity: {
      type: Number,
      required: [true, "Please provide quantity"],
      min: [1, "Quantity must be at least 1"],
    },
    category: {
      type: String,
      required: [true, "Please select a category"],
    },
    shipping: {
      type: String,
      required: [true, "Please specify shipping options"],
    },
    imageUrl: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ["active", "sold", "pending", "cancelled"],
      default: "active",
    },
    transaction: {
      escrowId: String,
      buyerId: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      paymentStatus: {
        type: String,
        enum: ["pending", "completed", "refunded"],
      },
      shippingStatus: {
        type: String,
        enum: ["pending", "shipped", "delivered"],
      },
      transactionHash: String,
    },
    bids: [
      {
        bidder: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        amount: {
          type: Number,
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Post ||
  mongoose.model<IPost>("Post", PostSchema);
