"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

interface Post {
  _id: string;
  itemName: string;
  price: number;
  description: string;
  quantity: number;
  category: string;
  shipping: string;
  imageUrl: string;
  status: string;
  seller: {
    _id: string;
    name: string;
    nametag: string;
    walletAddress: string;
  };
  createdAt: string;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, wallet, connectWallet } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/posts/${id}`);

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Product not found");
          }
          throw new Error("Failed to load product details");
        }

        const data = await response.json();
        setPost(data.post);
      } catch (error) {
        console.error("Error fetching product:", error);
        setError(error instanceof Error ? error.message : "An error occurred");
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to load product details"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handlePurchase = async () => {
    if (!user) {
      toast.error("Please connect your wallet to make a purchase");
      return;
    }

    if (!post) return;

    try {
      setPurchasing(true);
      const response = await fetch("/api/marketplace/buy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId: post._id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process purchase");
      }

      const result = await response.json();
      toast.success(
        "Purchase initiated! Please check your wallet to complete the transaction."
      );

      // In a real app, you would now handle the transaction with Phantom wallet
      // For demo purposes, we'll just redirect to a success page
      router.push("/marketplace/purchases");
    } catch (error) {
      console.error("Error purchasing item:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to process purchase"
      );
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 p-6 rounded-lg text-center">
          <h2 className="text-xl font-semibold text-red-800 mb-2">
            Error Loading Product
          </h2>
          <p className="text-red-600">{error || "Product not found"}</p>
          <Link
            href="/marketplace"
            className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Return to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  // Format the date
  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const isOwner = user && post.seller._id === user.id;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link
          href="/marketplace"
          className="text-blue-600 hover:underline flex items-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-1"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Marketplace
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2">
            <div className="relative h-80 md:h-full w-full bg-gray-200">
              {post.imageUrl ? (
                <Image
                  src={post.imageUrl}
                  alt={post.itemName}
                  fill
                  className="object-contain"
                />
              ) : (
                <Image
                  src="/placeholder.svg"
                  alt="No image available"
                  fill
                  className="object-contain p-4"
                />
              )}
              <div className="absolute top-0 right-0 m-2 px-2 py-1 bg-blue-500 text-white text-xs rounded">
                {post.category}
              </div>
            </div>
          </div>
          <div className="md:w-1/2 p-6">
            <h1 className="text-2xl font-bold mb-2">{post.itemName}</h1>
            <p className="text-gray-500 mb-4">
              Listed by @{post.seller.nametag} on {formattedDate}
            </p>

            <div className="mb-4">
              <h2 className="text-xl font-semibold text-blue-600">
                {post.price} SOL
              </h2>
              <p
                className={`text-sm ${
                  post.quantity > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {post.quantity > 0
                  ? `${post.quantity} in stock`
                  : "Out of stock"}
              </p>
            </div>

            <div className="mb-6">
              <h3 className="font-medium mb-2">Description</h3>
              <p className="text-gray-700">{post.description}</p>
            </div>

            <div className="mb-6">
              <h3 className="font-medium mb-2">Details</h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-gray-600">Category:</div>
                <div>{post.category}</div>
                <div className="text-gray-600">Shipping:</div>
                <div>{post.shipping}</div>
                <div className="text-gray-600">Seller:</div>
                <div className="truncate">@{post.seller.nametag}</div>
              </div>
            </div>

            {!isOwner && (
              <div className="mb-4">
                {user ? (
                  <button
                    onClick={handlePurchase}
                    disabled={purchasing || post.quantity <= 0}
                    className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium ${
                      purchasing || post.quantity <= 0
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {purchasing
                      ? "Processing..."
                      : post.quantity <= 0
                      ? "Out of Stock"
                      : "Buy Now"}
                  </button>
                ) : (
                  <button
                    onClick={connectWallet}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium"
                  >
                    Connect Wallet to Purchase
                  </button>
                )}
              </div>
            )}

            {isOwner && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-blue-800 font-medium">
                  This is your listing
                </p>
                <p className="text-sm text-blue-600">
                  You cannot purchase your own item
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Seller Information</h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xl font-bold mr-4">
              {post.seller.name?.charAt(0) ||
                post.seller.nametag?.charAt(0) ||
                "?"}
            </div>
            <div>
              <h3 className="font-medium">
                {post.seller.name || "@" + post.seller.nametag}
              </h3>
              <p className="text-gray-500 text-sm">
                Wallet: {post.seller.walletAddress.slice(0, 6)}...
                {post.seller.walletAddress.slice(-4)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
