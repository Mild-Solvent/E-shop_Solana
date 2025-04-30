'use client';

import React, { useState } from 'react';
import SellItemsNav from '@/components/marketplace/sell-items/sellItemsNav';
import NewListing from '@/components/marketplace/sell-items/newListing';
import PendingOrders from '@/components/marketplace/sell-items/pendingOrders';
import MyListings from '@/components/marketplace/sell-items/myListings';

const SellItemsMain = () => {
  const [currentSectionSell, setCurrentSectionSell] = useState('newListing');

  const renderSection = () => {
    switch (currentSectionSell) {
      case 'newListing':
        return <NewListing />;
      case 'myListings':
        return <MyListings />;
      case 'pendingOrders':
        return <PendingOrders />;
      default:
        return <NewListing />;
    }
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 text-white">
      <div className="bg-blue-900 min-h-screen min-w-full text-white">
        <SellItemsNav onNavigate={setCurrentSectionSell} />
        {renderSection()}
      </div>
    </div>
  );
};

export default SellItemsMain;