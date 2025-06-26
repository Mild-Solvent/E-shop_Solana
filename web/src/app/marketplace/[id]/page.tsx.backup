"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import {
  Connection,
  PublicKey,
  Transaction,
  Commitment,
} from "@solana/web3.js";
import { solanaConnection, requestAirdrop } from "@/lib/solana";

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
  const [purchaseStep, setPurchaseStep] = useState<
    "initial" | "sending" | "confirming" | "completing" | "failed"
  >("initial");
  const [error, setError] = useState<string | null>(null);
  const [transactionSignature, setTransactionSignature] = useState<
    string | null
  >(null);
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({});
  const [requestingAirdrop, setRequestingAirdrop] = useState(false);

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
      setPurchaseStep("sending");
      setDebugInfo({});

      // Check if Phantom is available
      const windowObj = window as any;
      if (!windowObj.phantom?.solana?.isPhantom) {
        setPurchaseStep("failed");
        toast.error("Phantom wallet not found. Please install it first.");
        return;
      }

      const provider = windowObj.phantom.solana;

      // Make sure wallet is connected before continuing
      try {
        // Explicitly connect to wallet if not already connected
        if (!provider.isConnected) {
          toast.loading("Connecting to Phantom wallet...", {
            id: "connect-wallet",
          });
          await provider.connect();
          toast.success("Wallet connected!", { id: "connect-wallet" });
        }
      } catch (connectError: any) {
        console.error("Failed to connect wallet:", connectError);
        setPurchaseStep("failed");
        setDebugInfo((prev) => ({
          ...prev,
          connectError: connectError.message || String(connectError),
        }));
        toast.error("Failed to connect to Phantom wallet. Please try again.", {
          id: "connect-wallet",
        });
        return;
      }

      // Debug: Check wallet connection
      const phantomPublicKey = provider.publicKey?.toString() || null;
      setDebugInfo((prev) => ({ ...prev, walletPublicKey: phantomPublicKey }));

      if (!phantomPublicKey) {
        setPurchaseStep("failed");
        toast.error(
          "Your Phantom wallet is not connected. Please connect it first and try again."
        );
        return;
      }

      // Debug: Check wallet network
      try {
        const network = await provider.request({ method: "getNetwork" });
        setDebugInfo((prev) => ({ ...prev, walletNetwork: network }));
        if (network !== "devnet") {
          toast.error(
            `Your wallet is connected to ${network}. Please switch to devnet for testing.`
          );
        }
      } catch (networkError: any) {
        console.warn("Could not detect wallet network:", networkError);
        setDebugInfo((prev) => ({
          ...prev,
          networkError: networkError.message,
        }));
      }

      // Initiate the purchase in our backend
      toast.loading("Preparing transaction...", { id: "prepare-tx" });

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
        setPurchaseStep("failed");
        toast.error(errorData.error || "Failed to process purchase", {
          id: "prepare-tx",
        });
        throw new Error(errorData.error || "Failed to process purchase");
      }

      const result = await response.json();
      toast.success("Transaction prepared!", { id: "prepare-tx" });
      setDebugInfo((prev) => ({
        ...prev,
        preparedTransaction: {
          ...result.transaction,
          serializedTransaction: `${result.transaction.serializedTransaction.slice(
            0,
            20
          )}...`,
        },
      }));

      // Get the serialized transaction from the backend
      const { transaction } = result;

      // Send the transaction to Phantom wallet for signing
      try {
        toast.loading(
          "Please confirm the transaction in your Phantom wallet...",
          {
            id: "phantom-request",
          }
        );

        // Decode the serialized transaction
        const serializedTransaction = Buffer.from(
          transaction.serializedTransaction,
          "base64"
        );

        // Deserialize and rebuild the transaction
        const recoveredTransaction = Transaction.from(serializedTransaction);

        // Set the recent blockhash and fee payer in case they were lost
        recoveredTransaction.recentBlockhash = transaction.blockhash;
        recoveredTransaction.lastValidBlockHeight =
          transaction.lastValidBlockHeight;
        if (user.walletAddress) {
          recoveredTransaction.feePayer = new PublicKey(user.walletAddress);
        }

        // Send the transaction to Phantom for signing
        const signedTransaction = await provider.signTransaction(
          recoveredTransaction
        );

        toast.success("Transaction signed! Processing payment...", {
          id: "phantom-request",
        });
        setPurchaseStep("confirming");

        // Send the signed transaction to the Solana network
        const signature = await solanaConnection.sendRawTransaction(
          signedTransaction.serialize()
        );
        setTransactionSignature(signature);
        setDebugInfo((prev) => ({ ...prev, transactionSignature: signature }));

        toast.loading("Confirming transaction on the blockchain...", {
          id: "transaction-confirm",
        });

        // Wait for confirmation
        try {
          // Use getSignatureStatuses instead of confirmTransaction
          const { value } = await solanaConnection.getSignatureStatus(
            signature
          );
          setDebugInfo((prev) => ({ ...prev, initialStatus: value }));

          if (value && value.err) {
            throw new Error(`Transaction failed: ${JSON.stringify(value.err)}`);
          }

          // Poll for confirmation
          let confirmedTransaction = false;
          let attempts = 0;
          const maxAttempts = 30; // 30 attempts with 2 second intervals = 60 seconds max wait

          while (!confirmedTransaction && attempts < maxAttempts) {
            attempts++;

            // Wait 2 seconds between checks
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Check transaction status
            const { value: statusValue } =
              await solanaConnection.getSignatureStatus(signature);
            setDebugInfo((prev) => ({
              ...prev,
              pollingStatus: { attempt: attempts, status: statusValue },
            }));

            if (statusValue && statusValue.err) {
              throw new Error(
                `Transaction failed: ${JSON.stringify(statusValue.err)}`
              );
            }

            if (
              statusValue &&
              (statusValue.confirmationStatus === "confirmed" ||
                statusValue.confirmationStatus === "finalized")
            ) {
              confirmedTransaction = true;
              break;
            }
          }

          if (!confirmedTransaction) {
            throw new Error(
              `Transaction confirmation timed out after ${maxAttempts} attempts`
            );
          }

          toast.success("Transaction confirmed on the blockchain!", {
            id: "transaction-confirm",
          });
          setPurchaseStep("completing");
        } catch (confirmError: any) {
          console.error("Error confirming transaction:", confirmError);
          setDebugInfo((prev) => ({
            ...prev,
            confirmationError: confirmError.message,
          }));

          // Check transaction status manually
          try {
            const status = await solanaConnection.getSignatureStatus(
              signature,
              { searchTransactionHistory: true }
            );
            setDebugInfo((prev) => ({ ...prev, transactionStatus: status }));

            if (status?.value?.err) {
              throw new Error(
                `Transaction failed: ${JSON.stringify(status.value.err)}`
              );
            }

            if (
              status?.value?.confirmationStatus === "confirmed" ||
              status?.value?.confirmationStatus === "finalized"
            ) {
              toast.success("Transaction verified through status check!", {
                id: "transaction-confirm",
              });
              setPurchaseStep("completing");
            } else {
              throw new Error(
                `Transaction has not been confirmed. Status: ${
                  status?.value?.confirmationStatus || "unknown"
                }`
              );
            }
          } catch (statusError: any) {
            console.error("Error getting transaction status:", statusError);
            setDebugInfo((prev) => ({
              ...prev,
              statusError: statusError.message,
            }));
            throw new Error(
              `Could not verify transaction: ${statusError.message}`
            );
          }
        }

        // Notify our backend about the transaction signature
        const completeResponse = await fetch("/api/marketplace/complete", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            postId: post._id,
            transactionSignature: signature,
          }),
        });

        if (!completeResponse.ok) {
          const completeErrorData = await completeResponse.json();
          setDebugInfo((prev) => ({
            ...prev,
            completeError: completeErrorData,
          }));
          throw new Error(
            completeErrorData.error || "Failed to complete purchase"
          );
        }

        toast.success("Purchase completed successfully!");

        // Wait a moment before redirecting so the user can see the success message
        setTimeout(() => {
          router.push("/marketplace/purchases");
        }, 2000);
      } catch (walletError: any) {
        console.error("Wallet error:", walletError);
        setPurchaseStep("failed");
        setDebugInfo((prev) => ({
          ...prev,
          walletError: walletError.message || String(walletError),
        }));

        // Handle specific error cases
        if (walletError.message?.includes("User rejected")) {
          toast.error("Transaction was rejected by the user.", {
            id: "phantom-request",
          });
        } else if (walletError.message?.includes("insufficient funds")) {
          toast.error(
            "Insufficient funds in your wallet. Please add more SOL and try again.",
            {
              id: "phantom-request",
            }
          );
        } else {
          toast.error(
            `Transaction failed: ${walletError.message || "Unknown error"}`,
            {
              id: "phantom-request",
            }
          );
        }
      }
    } catch (error: any) {
      console.error("Error purchasing item:", error);
      setPurchaseStep("failed");
      setDebugInfo((prev) => ({
        ...prev,
        generalError: error.message || String(error),
      }));
      toast.error(
        error instanceof Error ? error.message : "Failed to process purchase"
      );
    } finally {
      if (purchaseStep === "failed") {
        setPurchasing(false);
      }
    }
  };

  // Helper function to request SOL from the devnet faucet
  const handleRequestTestSOL = async () => {
    if (!user?.walletAddress) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setRequestingAirdrop(true);
      toast.loading("Requesting SOL from devnet faucet...", {
        id: "airdrop-request",
      });

      const signature = await requestAirdrop(user.walletAddress, 1);

      toast.success("1 SOL has been sent to your wallet!");

      // Get updated balance
      try {
        const balance = await solanaConnection.getBalance(
          new PublicKey(user.walletAddress)
        );
        const solBalance = balance / 1000000000; // Convert lamports to SOL
        toast.success(`Your wallet now has ${solBalance.toFixed(2)} SOL`);
      } catch (err) {
        console.error("Failed to get balance:", err);
      }
    } catch (error: any) {
      console.error("Airdrop error:", error);
      toast.error(
        `Failed to request SOL: ${error.message || "Unknown error"}`,
        { id: "airdrop-request" }
      );
    } finally {
      setRequestingAirdrop(false);
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
                  <>
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
                        ? purchaseStep === "sending"
                          ? "Preparing Transaction..."
                          : purchaseStep === "confirming"
                          ? "Confirming Payment..."
                          : purchaseStep === "completing"
                          ? "Completing Purchase..."
                          : purchaseStep === "failed"
                          ? "Transaction Failed"
                          : "Processing..."
                        : post.quantity <= 0
                        ? "Out of Stock"
                        : "Buy Now"}
                    </button>

                    {purchasing && purchaseStep !== "failed" && (
                      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center">
                          <div
                            className={`mr-3 ${
                              purchaseStep === "completing"
                                ? "text-green-500"
                                : "text-blue-500"
                            }`}
                          >
                            {purchaseStep === "sending" && (
                              <svg
                                className="animate-spin h-5 w-5"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                            )}
                            {purchaseStep === "confirming" && (
                              <svg
                                className="animate-spin h-5 w-5"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                            )}
                            {purchaseStep === "completing" && (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              {purchaseStep === "sending" &&
                                "Preparing your transaction..."}
                              {purchaseStep === "confirming" &&
                                "Confirming your payment on the blockchain..."}
                              {purchaseStep === "completing" &&
                                "Payment confirmed! Completing your purchase..."}
                            </p>
                            {transactionSignature && (
                              <p className="text-xs text-gray-500 mt-1 truncate">
                                Transaction: {transactionSignature.slice(0, 8)}
                                ...{transactionSignature.slice(-8)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {purchaseStep === "failed" && (
                      <div className="mt-4 p-3 bg-red-50 rounded-lg">
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 text-red-500 mr-3"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-red-700">
                              Transaction failed. Please try again.
                            </p>
                            {Object.keys(debugInfo).length > 0 && (
                              <details className="mt-2">
                                <summary className="text-xs text-red-600 cursor-pointer">
                                  View error details
                                </summary>
                                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                                  {JSON.stringify(debugInfo, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Debug button for developers - Only in development */}
                    {process.env.NODE_ENV === "development" && (
                      <button
                        onClick={() =>
                          toast.success(
                            "This is a test message to verify toast notifications are working"
                          )
                        }
                        className="mt-2 text-xs text-gray-500 underline"
                      >
                        Test Notifications
                      </button>
                    )}

                    {/* Add Test SOL button for development */}
                    {process.env.NODE_ENV === "development" && (
                      <button
                        onClick={handleRequestTestSOL}
                        disabled={requestingAirdrop}
                        className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium"
                      >
                        {requestingAirdrop
                          ? "Requesting SOL..."
                          : "Get 1 SOL for Testing"}
                      </button>
                    )}
                  </>
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
