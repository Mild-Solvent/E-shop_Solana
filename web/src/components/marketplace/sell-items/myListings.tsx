import React from "react";

const MyListings = () => {
  const listings = [
    {
      title: "Vintage Watch",
      price: "2.5 SOL",
      quantity: 1,
      category: "Accessories",
      country: "USA",
    },
    {
      title: "Leather Jacket",
      price: "5 SOL",
      quantity: 3,
      category: "Clothing",
      country: "UK",
    },
  ];

  return (
    <div className="bg-darkBlue text-white p-6 rounded-lg max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">My Listings</h1>
      {listings.map((listing, index) => (
        <div
          key={index}
          className="bg-gradient-to-r from-blue-900 to-blue-800 p-4 rounded-lg mb-4 shadow-md"
        >
          <h2 className="text-xl font-semibold">{listing.title}</h2>
          <p>Price: {listing.price}</p>
          <p>Quantity: {listing.quantity}</p>
          <p>Category: {listing.category}</p>
          <p>Country: {listing.country}</p>
          <div className="flex justify-end mt-4">
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg mr-2 hover:bg-blue-600">
              Edit
            </button>
            <button className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyListings;