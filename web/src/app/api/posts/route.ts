import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import Post from "@/models/Post";
import User from "@/models/User";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    // Connect to the database
    await connectToDatabase();

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const sellerId = searchParams.get("seller");
    const status = searchParams.get("status") || "active";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") || "desc";

    // Build the query
    const query: any = { status };

    if (category) {
      query.category = category;
    }

    if (sellerId) {
      query.seller = sellerId;
    }

    // Get the total count
    const total = await Post.countDocuments(query);

    // Fetch the posts
    const posts = await Post.find(query)
      .populate("seller", "name nametag walletAddress")
      .sort({ [sort]: order === "asc" ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Return the posts
    return NextResponse.json(
      {
        success: true,
        data: {
          posts,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
          },
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
    const user = await User.findOne({
      walletAddress: session.user.walletAddress,
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Parse the request body
    const data = await request.json();

    // Validate the data
    if (
      !data.itemName ||
      !data.price ||
      !data.description ||
      !data.quantity ||
      !data.category ||
      !data.shipping
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the post
    const post = await Post.create({
      seller: user._id,
      itemName: data.itemName,
      price: parseFloat(data.price),
      description: data.description,
      quantity: parseInt(data.quantity),
      category: data.category,
      shipping: data.shipping,
      imageUrl: data.imageUrl || "",
      status: "active",
      transaction: {},
    });

    // Add the post to the user's posts array
    await User.findByIdAndUpdate(user._id, {
      $push: { posts: post._id },
    });

    // Return the created post
    return NextResponse.json({ success: true, post }, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
