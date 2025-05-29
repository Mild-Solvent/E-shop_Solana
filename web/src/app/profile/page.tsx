"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { redirect } from "next/navigation";

export default function ProfilePage() {
  const { user, isLoading } = useAuth();

  // Redirect to homepage if not authenticated
  if (!isLoading && !user) {
    redirect("/");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <p>Loading...</p>
          </div>
        ) : (
          <>
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <div className="flex flex-col md:flex-row items-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold mb-4 md:mb-0 md:mr-6">
                  {user?.name?.charAt(0)}
                  {user?.surname?.charAt(0)}
                </div>
                <div>
                  <h1 className="text-2xl font-bold">
                    {user?.name} {user?.surname}
                  </h1>
                  <p className="text-gray-600">@{user?.nametag}</p>
                  <div className="mt-2 text-sm text-gray-500 flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                    <span className="truncate max-w-xs">
                      {user?.walletAddress}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">My Posts</h2>
              <div className="border rounded-lg p-8 text-center text-gray-500">
                <p>You haven't created any posts yet.</p>
                <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Create your first post
                </button>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4">Activity</h2>
              <div className="border rounded-lg p-8 text-center text-gray-500">
                <p>No recent activity.</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
