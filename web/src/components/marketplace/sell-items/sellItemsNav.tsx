import React from "react";

const MarketplaceNav = ({
  onNavigate,
}: {
  onNavigate: (section: string) => void;
}) => {
  return (
    <nav className="bg-blue-900 text-white p-4 flex justify-between items-center border-t border-blue-500">
      <h1 className="text-2xl font-bold">Tool Bar</h1>
      <div className="flex space-x-4">
        <button
          onClick={() => onNavigate("newListing")}
          className="hover:underline"
        >
          New Listing
        </button>
        <button
          onClick={() => onNavigate("myListings")}
          className="hover:underline"
        >
          My Listing
        </button>
        <button
          onClick={() => onNavigate("pendingOrders")}
          className="hover:underline"
        >
          Pending Orders
        </button>
      </div>
    </nav>
  );
};

export default MarketplaceNav;
