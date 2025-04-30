import React, { useState } from 'react';
import Image from 'next/image';

const Listing = ({ title, price, image }: { title: string; price: string; image: string }) => {
  const [imgSrc, setImgSrc] = useState(image);

  return (
    <div className="bg-blue-900 text-white p-4 rounded shadow-md">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="text-sm">Price: {price}</p>
      <div className="bg-gray-700 flex items-center justify-center mt-4 rounded">
        <Image
          src={imgSrc}
          alt={title}
          className="h-full object-contain fit-cover"
          width={220} // Adjust width as needed
          height={120} // Adjust height as needed
          onError={() => setImgSrc('/placeholder.svg')} // Fallback to placeholder image
        />
      </div>
    </div>
  );
};

export default Listing;