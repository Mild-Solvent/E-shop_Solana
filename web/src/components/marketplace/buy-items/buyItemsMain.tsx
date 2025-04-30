import React from 'react';
import MarketplaceFilters from './MarketplaceFilters';
import Listing from './Listing';

const BuyItemsMain = () => {
  const listings = [
    { title: 'Vintage Watch', price: '2.5 SOL ($356.88)', image: '/placeholder.png' },
    { title: 'Leather Jacket', price: '5 SOL ($713.75)', image: '/placeholder.png' },
    { title: 'Antique Book', price: '1.2 SOL ($171.30)', image: '/placeholder.png' },
  ];

  return (
    <div className="bg-blue-900 min-h-screen min-w-full text-white">
      <MarketplaceFilters />
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {listings.map((listing, index) => (
          <Listing
            key={index}
            title={listing.title}
            price={listing.price}
            image={listing.image}
          />
        ))}
      </div>
    </div>
  );
};

export default BuyItemsMain;