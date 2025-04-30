'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import MarketplaceNav from '@/components/marketplace/MarketplaceNav';
import BuyItemsMain from '@/components/marketplace/buy-items/buyItemsMain';
import SellItemsMain from '@/components/marketplace/sell-items/sellItemsMain';
import AccountMain from '@/components/marketplace/account/accountMain';

const MarketplacePage = () => {
  const [currentSection, setCurrentSection] = useState('buy-items');

  const renderSection = () => {
    switch (currentSection) {
      case 'buy-items':
        return <BuyItemsMain />;
      case 'sell-items':
        return <SellItemsMain />;
      case 'account':
        return <AccountMain />;
      default:
        return <BuyItemsMain />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 text-white">
      {/* Header Component */}
      <Header />
      <div className="bg-blue-900 min-h-screen min-w-full text-white">
        <MarketplaceNav onNavigate={setCurrentSection} />
        {renderSection()}
      </div>
    </div>
  );
};

export default MarketplacePage;