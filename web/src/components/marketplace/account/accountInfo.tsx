import React from 'react';

const AccountInfo = () => {
  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold mb-4">Account Information</h2>
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <span className="font-medium">Email</span>
          <span className="text-gray-600">user@example.com</span>
          <button className="text-blue-500 hover:underline">Change</button>
        </div>
        <div className="flex justify-between items-center border-b pb-2">
          <span className="font-medium">Username</span>
          <span className="text-gray-600">At nostrum nulla nis</span>
          <button className="text-blue-500 hover:underline">Change</button>
        </div>
        <div className="flex justify-between items-center border-b pb-2">
          <span className="font-medium">Address</span>
          <span className="text-gray-600">123 Crypto Street, Blockchain City</span>
          <button className="text-blue-500 hover:underline">Change</button>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium">Password</span>
          <span className="text-gray-600">********</span>
          <button className="text-blue-500 hover:underline">Change</button>
        </div>
      </div>
    </div>
  );
};

export default AccountInfo;