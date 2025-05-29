"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { redirect } from "next/navigation";

export default function SettingsPage() {
  const { user, isLoading } = useAuth();

  // Redirect to homepage if not authenticated
  if (!isLoading && !user) {
    redirect("/");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Account Settings</h1>

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <p>Loading...</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <p className="py-2 px-3 bg-gray-100 rounded">{user?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Surname
                </label>
                <p className="py-2 px-3 bg-gray-100 rounded">{user?.surname}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nametag
                </label>
                <p className="py-2 px-3 bg-gray-100 rounded">{user?.nametag}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wallet Address
                </label>
                <p className="py-2 px-3 bg-gray-100 rounded truncate">
                  {user?.walletAddress}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold mb-4">Security</h2>
            <button className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
              Disconnect Wallet
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
