import mongoose, { Schema } from "mongoose";

export interface IUser {
  name: string;
  surname: string;
  nametag: string;
  walletAddress: string;
  posts: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
      maxlength: [60, "Name cannot be more than 60 characters"],
    },
    surname: {
      type: String,
      required: [true, "Please provide a surname"],
      maxlength: [60, "Surname cannot be more than 60 characters"],
    },
    nametag: {
      type: String,
      required: [true, "Please provide a nametag"],
      unique: true,
      maxlength: [30, "Nametag cannot be more than 30 characters"],
    },
    walletAddress: {
      type: String,
      required: [true, "Please provide a wallet address"],
      unique: true,
    },
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
