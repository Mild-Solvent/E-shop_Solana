"use client";

import React, { useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

interface FormData {
  itemName: string;
  price: string;
  description: string;
  quantity: string;
  category: string;
  shipping: string;
  file: File | null;
}

const NewListing = () => {
  const { user, wallet, isLoading } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<FormData>({
    itemName: "",
    price: "",
    description: "",
    quantity: "1",
    category: "",
    shipping: "Worldwide",
    file: null,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // If user is not logged in, redirect to login page
  React.useEffect(() => {
    if (!isLoading && !user) {
      toast.error("You need to be logged in to create a listing");
      router.push("/");
    }
  }, [user, isLoading, router]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Validate file type
      const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!validTypes.includes(file.type)) {
        setError(
          "Invalid file type. Please upload an image (JPEG, PNG, WEBP, GIF)."
        );
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setError("File is too large. Maximum size is 5MB.");
        return;
      }

      setFormData({ ...formData, file });
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate form data
      if (
        !formData.itemName ||
        !formData.price ||
        !formData.description ||
        !formData.quantity ||
        !formData.category
      ) {
        setError("Please fill in all required fields");
        setIsSubmitting(false);
        return;
      }

      let imageUrl = "";

      // Upload image if one is selected
      if (formData.file) {
        const imageData = new FormData();
        imageData.append("file", formData.file);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: imageData,
        });

        if (!uploadResponse.ok) {
          const uploadError = await uploadResponse.json();
          throw new Error(uploadError.error || "Failed to upload image");
        }

        const uploadResult = await uploadResponse.json();
        imageUrl = uploadResult.fileUrl;
      }

      // Create listing in database
      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itemName: formData.itemName,
          price: formData.price,
          description: formData.description,
          quantity: formData.quantity,
          category: formData.category,
          shipping: formData.shipping,
          imageUrl,
        }),
      });

      if (!response.ok) {
        const responseData = await response.json();
        throw new Error(responseData.error || "Failed to create listing");
      }

      const result = await response.json();

      // Show success message
      toast.success("Listing created successfully!");

      // Redirect to the marketplace
      router.push("/marketplace");
    } catch (error) {
      console.error("Error creating listing:", error);
      setError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-blue-900 text-white p-6 rounded-lg max-w-2xl mx-auto shadow-lg">
      <h1 className="text-2xl font-bold mb-4">List a New Item</h1>
      <p className="mb-6">
        Fill out the details to list your item on the marketplace
      </p>

      {error && (
        <div className="bg-red-800 text-white p-3 rounded-md mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left column */}
          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-medium">Item Name *</label>
              <input
                type="text"
                name="itemName"
                value={formData.itemName}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-800 text-white"
                placeholder="Item Name"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Price in SOL *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-800 text-white"
                placeholder="Price in SOL"
                step="0.000001"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Quantity *</label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-800 text-white"
                placeholder="Quantity"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Select a category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-800 text-white"
                required
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
              <label className="block mb-2 font-medium">Shipping</label>
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
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <div>
              <label className="block mb-2 font-medium">
                Item Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 rounded bg-gray-800 text-white h-32"
                placeholder="Item Description"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">Item Image</label>
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-gray-700 rounded hover:bg-gray-600"
                >
                  Choose File
                </button>
                <span className="text-sm text-gray-300">
                  {formData.file ? formData.file.name : "No file chosen"}
                </span>
              </div>

              {previewUrl && (
                <div className="mt-2">
                  <div className="relative w-full h-40 bg-gray-800 rounded overflow-hidden">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="absolute inset-0 w-full h-full object-contain"
                    />
                  </div>
                </div>
              )}

              <p className="text-xs text-gray-400 mt-1">
                Supported formats: JPEG, PNG, WEBP, GIF. Max size: 5MB
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-700">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-lg font-medium ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isSubmitting ? "Creating Listing..." : "List Item"}
          </button>
        </div>
      </form>

      <div className="mt-6 bg-blue-800 rounded-lg p-4 text-sm">
        <h3 className="font-medium mb-2">Marketplace Information</h3>
        <p className="mb-2">
          Your wallet address:{" "}
          <span className="text-blue-300">
            {wallet.publicKey || "Not connected"}
          </span>
        </p>
        <p>
          Note: You will receive the amount of the sale minus a 1% service fee
          that will be deducted from the subtotal upon completion of each sale.
          An escrow system is used to protect both buyers and sellers.
        </p>
      </div>
    </div>
  );
};

export default NewListing;
