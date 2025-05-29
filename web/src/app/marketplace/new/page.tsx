import React from "react";
import NewListing from "@/components/marketplace/sell-items/newListing";

export default function NewListingPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Create a New Listing</h1>
      <NewListing />
    </div>
  );
}
