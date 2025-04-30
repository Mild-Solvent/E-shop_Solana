import React from 'react';
import { FaFacebook, FaTwitter, FaInstagram, FaTiktok, FaBell } from 'react-icons/fa'; // Importing icons from react-icons

const Socials = () => {
  return (
    <div className="socials-container p-6 bg-blue-700 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Social Sharing</h2>
      <div className="social-icons flex space-x-4">
        <FaFacebook className="text-blue-600 w-6 h-6 cursor-pointer hover:text-blue-800" />
        <FaTwitter className="text-blue-400 w-6 h-6 cursor-pointer hover:text-blue-600" />
        <FaInstagram className="text-pink-500 w-6 h-6 cursor-pointer hover:text-pink-700" />
        <FaTiktok className="text-black w-6 h-6 cursor-pointer hover:text-gray-700" />
        <FaBell className="text-yellow-500 w-6 h-6 cursor-pointer hover:text-yellow-700" />
      </div>
    </div>
  );
};

export default Socials;