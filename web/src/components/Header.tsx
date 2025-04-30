import React from 'react';
import Image from 'next/image';
import Link from 'next/link'; // Import Link from next/link

const Header = () => {
  return (
    <header className="w-full flex justify-between items-center px-5 py-3 bg-[#00103D] text-white">
      <div className="flex items-center rounded-full">
        <Link href="/"> {/* Wrap the Image with Link */}
          <Image src="/Logo.jpeg" alt="Logo" width={50} height={40} className="h-10" />
        </Link>
      </div>
      <nav className="flex-1 ml-5">
        <ul className="flex justify-center space-x-6 list-none m-0 p-0">
          <li><a href="/whitepaper" className="text-white text-sm hover:underline">Whitepaper</a></li>
          <li><a href="/calculator" className="text-white text-sm hover:underline">Calculator</a></li>
          <li><a href="/marketplace" className="text-white text-sm hover:underline">Marketplace</a></li>
          <li><a href="/login" className="text-white text-sm hover:underline">Log In</a></li>
          <li><a href="/signup" className="text-white text-sm hover:underline">Sign Up</a></li>
        </ul>
      </nav>
      <div className="flex items-center">
        <button className="bg-[#6C63FF] text-white rounded-md px-4 py-2 text-sm hover:bg-[#5A52E0]">
          Connect Wallet
        </button>
      </div>
    </header>
  );
};

export default Header;