import React from 'react';
import AccountInfo from './accountInfo';
import Socials from './socials';

const accountMain = () => {
  return (
    <div className="bg-blue-900 min-h-screen min-w-full text-white">
      <div className="container mx-auto p-4">
        <AccountInfo />
        <Socials />
      </div>
    </div>
  );
};

export default accountMain;