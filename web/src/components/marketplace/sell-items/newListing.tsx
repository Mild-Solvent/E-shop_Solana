'use client';

import React, { useState } from "react";

interface FormData {
  itemName: string;
  price: string;
  description: string;
  quantity: string;
  category: string;
  shipping: string;
  file: File | null; // Allow file to be either File or null
}

const NewListing = () => {
  const [formData, setFormData] = useState<FormData>({
    itemName: "",
    price: "",
    description: "",
    quantity: "",
    category: "",
    shipping: "Worldwide",
    file: null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

  return (
    <div className="bg-blue-900 text-white p-6 rounded-lg max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">List a New Item</h1>
      <p className="mb-6">Fill out the details to list your item on the marketplace</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-2">Item Name</label>
          <input
            type="text"
            name="itemName"
            value={formData.itemName}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 text-white"
            placeholder="Item Name"
          />
        </div>
        <div>
          <label className="block mb-2">Price in SOL</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 text-white"
            placeholder="Price in SOL"
          />
        </div>
        <div>
          <label className="block mb-2">Item Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 text-white"
            placeholder="Item Description"
          />
        </div>
        <div>
          <label className="block mb-2">Quantity</label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 text-white"
            placeholder="Quantity"
          />
        </div>
        <div>
          <label className="block mb-2">Select a category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 text-white"
          >
            <option value="" disabled>
              Select a category
            </option>
            <option value="electronics">Electronics</option>
            <option value="fashion">Fashion</option>
            <option value="home">Home</option>
            <option value="books">Books</option>
          </select>
        </div>
        <div>
          <label className="block mb-2">Shipping</label>
          <select
            name="shipping"
            value={formData.shipping}
            onChange={handleChange}
            className="w-full p-2 rounded bg-gray-800 text-white"
          >
            <option value="Worldwide">Worldwide</option>
            <option value="Local">Local</option>
          </select>
        </div>
        <div>
          <label className="block mb-2">Choose File</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full p-2 rounded bg-gray-800 text-white"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded"
        >
          List Item
        </button>
      </form>
      <p className="mt-4 text-sm">
        Note: You will receive the amount of the sale and the estimated delivery
        fees for successful transactions. A 1% service fee will be deducted
        from the subtotal upon completion of each sale.
      </p>
    </div>
  );
};

export default NewListing;