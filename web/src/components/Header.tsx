import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full flex justify-between items-center px-5 py-3 bg-[#00103D] text-white">
      <div className="flex items-center">
        <img src="/path-to-logo.png" alt="Logo" className="h-10" />
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