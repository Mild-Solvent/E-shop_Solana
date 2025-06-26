import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Post from "@/models/Post";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Connect to the database
    await connectToDatabase();

    // Get the post ID from the params - await the params promise
    const { id } = await params;

    // Find the post
    const post = await Post.findById(id).populate(
      "seller",
      "name nametag walletAddress"
    );

    // Check if the post exists
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Return the post
    return NextResponse.json({ success: true, post }, { status: 200 });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
