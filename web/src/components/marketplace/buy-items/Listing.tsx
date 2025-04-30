import React from 'react';
import Image from 'next/image';

const Listing = ({ title, price, image }: { title: string; price: string; image: string }) => {
  return (
    <div className="bg-blue-900 text-white p-4 rounded shadow-md">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="text-sm">Price: {price}</p>
      <div className="bg-gray-700 h-32 w-full flex items-center justify-center mt-4 rounded">
        <Image
          src={image}
          alt={title}
          className="h-full object-contain"
          width={128} // Adjust width as needed
          height={128} // Adjust height as needed
          onError={() => console.error('Image failed to load')} // Optional error handling
        />
      </div>
    </div>
  );
};

export default Listing;