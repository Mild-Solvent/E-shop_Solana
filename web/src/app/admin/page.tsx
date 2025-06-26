"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { toast } from "react-hot-toast";

interface EscrowTransaction {
  id: string;
  status: string;
  amount?: number;
  buyer?: string;
  seller?: string;
  postId?: string;
  fundingTransactionHash?: string;
  approvalTransactionHash?: string;
  cancellationTransactionHash?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function AdminDashboard() {
  const { user, wallet, connectWallet } = useAuth();
  const [escrows, setEscrows] = useState<EscrowTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingEscrow, setProcessingEscrow] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchEscrows();
    }
  }, [user]);

  const fetchEscrows = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/escrow");
      if (response.ok) {
        const data = await response.json();
        setEscrows(data.escrows || []);
      } else {
        toast.error("Failed to fetch escrows");
      }
    } catch (error) {
      console.error("Error fetching escrows:", error);
      toast.error("Error loading escrows");
    } finally {
      setLoading(false);
    }
  };

  const handleEscrowAction = async (escrowId: string, action: "approve" | "cancel") => {
    if (!wallet) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      setProcessingEscrow(escrowId);
      
      // Mock transaction hash - in real implementation, create and sign transaction
      const mockTxHash = `${action}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await fetch("/api/admin/escrow", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          escrowId,
          transactionHash: mockTxHash,
          type: action,
        }),
      });

      if (response.ok) {
        toast.success(`Escrow ${action}d successfully!`);
        await fetchEscrows(); // Refresh the list
      } else {
        const error = await response.json();
        toast.error(error.error || `Failed to ${action} escrow`);
      }
    } catch (error) {
      console.error(`Error ${action}ing escrow:`, error);
      toast.error(`Failed to ${action} escrow`);
    } finally {
      setProcessingEscrow(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "funded":
        return "bg-blue-100 text-blue-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "pending_funding":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Access Required</h2>
          <p className="text-gray-600 mb-6">Please connect your wallet to access the admin dashboard</p>
          <button
            onClick={connectWallet}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">Manage escrow transactions and marketplace operations</p>
            </div>
            <Link
              href="/marketplace"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Back to Marketplace
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">{escrows.length}</div>
            <div className="text-gray-600">Total Escrows</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-yellow-600">
              {escrows.filter(e => e.status === "funded").length}
            </div>
            <div className="text-gray-600">Pending Approval</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">
              {escrows.filter(e => e.status === "approved").length}
            </div>
            <div className="text-gray-600">Approved</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-red-600">
              {escrows.filter(e => e.status === "cancelled").length}
            </div>
            <div className="text-gray-600">Cancelled</div>
          </div>
        </div>

        {/* Escrow Transactions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Escrow Transactions</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading escrows...</p>
            </div>
          ) : escrows.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No escrow transactions found</p>
              <p className="text-sm text-gray-500 mt-2">
                Escrows will appear here when buyers create them through the marketplace
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Escrow ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Buyer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seller
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {escrows.map((escrow) => (
                    <tr key={escrow.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {escrow.id.slice(0, 8)}...{escrow.id.slice(-8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(escrow.status)}`}>
                          {escrow.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {escrow.amount ? `${escrow.amount} SOL` : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {escrow.buyer ? `${escrow.buyer.slice(0, 6)}...${escrow.buyer.slice(-6)}` : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {escrow.seller ? `${escrow.seller.slice(0, 6)}...${escrow.seller.slice(-6)}` : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {escrow.status === "funded" ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEscrowAction(escrow.id, "approve")}
                              disabled={processingEscrow === escrow.id}
                              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm"
                            >
                              {processingEscrow === escrow.id ? "..." : "Approve"}
                            </button>
                            <button
                              onClick={() => handleEscrowAction(escrow.id, "cancel")}
                              disabled={processingEscrow === escrow.id}
                              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-3 py-1 rounded text-sm"
                            >
                              {processingEscrow === escrow.id ? "..." : "Cancel"}
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-500">
                            {escrow.status === "approved" ? "Completed" : 
                             escrow.status === "cancelled" ? "Cancelled" : "Pending"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">🔒 How Escrow Works</h3>
          <div className="text-blue-800 space-y-2">
            <p>• Buyers create escrow transactions when purchasing items from the marketplace</p>
            <p>• Funds are held securely in escrow smart contracts until approved</p>
            <p>• As admin, you can approve transactions to release funds to sellers</p>
            <p>• You can also cancel transactions to refund buyers if needed</p>
            <p>• All actions are recorded on the Solana blockchain for transparency</p>
          </div>
        </div>
      </div>
    </div>
  );
}
