'use client';

import React, { useState } from "react";
import Header from "@/components/Header";

const CalculatorPage = () => {
  const [tokenAmount, setTokenAmount] = useState("");
  const [marketplaceVolume, setMarketplaceVolume] = useState(1);
  const [totalSupply, setTotalSupply] = useState(1000000000);
  const [solPrice] = useState(142.81); // Removed setSolPrice

  const handleReset = () => {
    setTokenAmount("");
    setMarketplaceVolume(1);
    setTotalSupply(1000000000);
  };

  const calculateEarnings = () => {
    const transactionFee = 0.02; // 2% total transaction fee
    const distributionPercentage = 0.4; // 40% of fees distributed to token holders
    const tokenPrice = 0.1; // Assumed $SZ token price in USD

    const totalFees = marketplaceVolume * transactionFee;
    const distributedFees = totalFees * distributionPercentage;
    const userShare = (parseFloat(tokenAmount) / totalSupply) * distributedFees;

    return {
      szEarnings: userShare / tokenPrice || 0,
      usdEarnings: userShare || 0,
    };
  };

  const { szEarnings, usdEarnings } = calculateEarnings();

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 text-white">
    {/* Header Component */}
    <Header />
    <div className="min-h-screen min-w-full bg-blue-900 text-white flex items-center justify-center p-4">
      <div className="bg-blue-800 p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">$SZ Earnings Calculator</h1>
        <p className="text-sm text-center mb-6">
          Estimate your potential monthly earnings from holding $SZ tokens
        </p>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Your $SZ Holdings:</label>
          <input
            type="number"
            value={tokenAmount}
            onChange={(e) => setTokenAmount(e.target.value)}
            placeholder="Enter your $SZ token amount"
            className="w-full p-2 rounded bg-blue-700 text-white border border-blue-600"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">
            Estimated Monthly Marketplace Volume (in SOL):
          </label>
          <input
            type="range"
            min="1"
            max="100"
            value={marketplaceVolume}
            onChange={(e) => setMarketplaceVolume(Number(e.target.value))}
            className="w-full"
          />
          <div className="text-right text-sm mt-1">{marketplaceVolume} SOL</div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Total $SZ Supply:</label>
          <input
            type="number"
            value={totalSupply}
            onChange={(e) => setTotalSupply(Number(e.target.value))}
            className="w-full p-2 rounded bg-blue-700 text-white border border-blue-600"
          />
          <p className="text-xs mt-1">
            Note: Initial supply is 1 billion, decreasing over time due to token burns.
          </p>
        </div>

        <div className="bg-blue-700 p-4 rounded-lg mb-4">
          <h2 className="text-lg font-bold mb-2">Estimated Monthly Earnings:</h2>
          <p className="text-2xl font-bold">{szEarnings.toFixed(2)} $SZ</p>
          <p className="text-xl">{usdEarnings.toFixed(2)} USD</p>
          <p className="text-xs mt-2">
            Based on current SOL price: ${solPrice.toFixed(2)} USD
          </p>
        </div>

        <div className="text-xs text-gray-300 mb-4">
          Calculation based on:
          <ul className="list-disc list-inside">
            <li>2% total transaction fee (1% from buyer + 1% from seller)</li>
            <li>40% of fees distributed to $SZ token holders</li>
            <li>Your share of distribution based on token holdings</li>
            <li>Assumed $SZ token price: $0.10 USD</li>
          </ul>
        </div>

        <button
          onClick={handleReset}
          className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded"
        >
          Reset Calculator
        </button>
      </div>
    </div>
    </div>
  );
};

export default CalculatorPage;