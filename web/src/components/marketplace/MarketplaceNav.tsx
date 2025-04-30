import React from 'react';

const MarketplaceNav = ({ onNavigate }: { onNavigate: (section: string) => void }) => {
  return (
    <nav className="bg-blue-900 text-white p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold">SolZone Marketplace</h1>
      <div className="flex space-x-4">
        <button onClick={() => onNavigate('buy-items')} className="hover:underline">
          Buy Items
        </button>
        <button onClick={() => onNavigate('sell-items')} className="hover:underline">
          Sell Items
        </button>
        <button onClick={() => onNavigate('account')} className="hover:underline">
          Account
        </button>
      </div>
    </nav>
  );
};

export default MarketplaceNav;