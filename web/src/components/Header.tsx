"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const Header = () => {
  const { wallet, user, connectWallet, disconnectWallet, isLoading } =
    useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className="w-full flex justify-between items-center px-5 py-3 bg-[#00103D] text-white">
      <div className="flex items-center rounded-full">
        <Link href="/">
          <Image
            src="/Logo.jpeg"
            alt="Logo"
            width={50}
            height={40}
            className="h-10"
          />
        </Link>
      </div>
      <nav className="flex-1 ml-5">
        <ul className="flex justify-center space-x-6 list-none m-0 p-0">
          <li>
            <Link
              href="/whitepaper"
              className="text-white text-sm hover:underline"
            >
              Whitepaper
            </Link>
          </li>
          <li>
            <Link
              href="/calculator"
              className="text-white text-sm hover:underline"
            >
              Calculator
            </Link>
          </li>
          <li>
            <Link
              href="/marketplace"
              className="text-white text-sm hover:underline"
            >
              Marketplace
            </Link>
          </li>
          {!user && (
            <>
              <li>
                <Link
                  href="/login"
                  className="text-white text-sm hover:underline"
                >
                  Log In
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="text-white text-sm hover:underline"
                >
                  Sign Up
                </Link>
              </li>
            </>
          )}
        </ul>
      </nav>
      <div className="flex items-center">
        {wallet.isConnected && user ? (
          <div className="relative">
            <button
              onClick={toggleDropdown}
              className="flex items-center space-x-2 bg-[#6C63FF] text-white rounded-md px-4 py-2 text-sm hover:bg-[#5A52E0]"
            >
              <span className="truncate max-w-[100px]">
                {wallet.publicKey
                  ? `${wallet.publicKey.slice(0, 4)}...${wallet.publicKey.slice(
                      -4
                    )}`
                  : ""}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
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
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                <div className="py-2 px-4 text-sm text-gray-700 border-b border-gray-200">
                  <p className="font-medium">Signed in as</p>
                  <p className="truncate">{user.nametag || user.name}</p>
                </div>
                <div className="py-1">
                  <Link
                    href="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Settings
                  </Link>
                </div>
                <div className="py-1 border-t border-gray-200">
                  <button
                    onClick={() => {
                      disconnectWallet();
                      setIsDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={connectWallet}
            disabled={isLoading}
            className={`bg-[#6C63FF] text-white rounded-md px-4 py-2 text-sm hover:bg-[#5A52E0] ${
              isLoading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {isLoading ? "Connecting..." : "Connect Wallet"}
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
