import React from 'react';

const MarketplaceFilters = () => {
  return (
    <div className="bg-blue-800 text-white p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <input
          type="text"
          placeholder="Search keywords"
          className="p-2 rounded bg-gray-700 text-white"
        />
        <select className="p-2 rounded bg-gray-700 text-white">
          <option>Category</option>
          <option>Electronics</option>
          <option>Clothing</option>
          <option>Books</option>
        </select>
        <select className="p-2 rounded bg-gray-700 text-white">
          <option>Country</option>
          <option>USA</option>
          <option>Canada</option>
          <option>UK</option>
        </select>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            placeholder="0"
            className="p-2 rounded bg-gray-700 text-white w-16"
          />
          <span>to</span>
          <input
            type="number"
            placeholder="100"
            className="p-2 rounded bg-gray-700 text-white w-16"
          />
        </div>
      </div>
      <div className="flex justify-between items-center mt-4">
        <div className="flex space-x-1">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="text-yellow-400">★</span>
          ))}
        </div>
        <button className="bg-blue-500 text-white px-4 py-2 rounded">Search</button>
      </div>
    </div>
  );
};

export default MarketplaceFilters;