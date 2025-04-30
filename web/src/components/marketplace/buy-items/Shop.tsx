import React from 'react';
import Listing from './Listing';

const Shop = () => {
  const listings = [
    { title: 'Gaming Laptop', price: '10 SOL ($1427.50)', image: '/placeholder.png' },
    { title: 'Smartphone', price: '7 SOL ($999.25)', image: '/placeholder.png' },
    { title: 'Headphones', price: '3 SOL ($428.25)', image: '/placeholder.png' },
  ];

  return (
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
  );
};

export default Shop;