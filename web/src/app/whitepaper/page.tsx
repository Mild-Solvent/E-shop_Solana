import React from 'react';
import Header from '../../components/Header';

const WhitepaperPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 text-white">
      {/* Header */}
      <Header />

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-gray-50 shadow-md rounded-lg p-8">
          <h1 className="text-4xl font-bold text-center mb-8 text-blue-600">
            SolZone Whitepaper
          </h1>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-blue-800">
              1. Introduction
            </h2>

            <p className="text-gray-700 leading-relaxed mb-4">
              In the rapidly evolving world of blockchain technology, SolZone ($SZ) emerges as an innovative platform that combines the viral appeal of meme coins with practical utility. Built on the high-performance Solana blockchain, SolZone introduces a groundbreaking marketplace where individuals and businesses can seamlessly trade goods and services using cryptocurrency. By blending stability, utility, and eco-conscious practices, SolZone is set to redefine the digital commerce landscape.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-blue-800">
              2. Token Details
            </h2>
            
            <h3 className="text-xl font-medium mb-2 text-blue-700">
              Token Overview:
            </h3>
            
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li className="mb-1">Name: SolZone</li>
              <li className="mb-1">Ticker: $SZ</li>
              <li className="mb-1">Blockchain: Solana</li>
              <li className="mb-1">Total Supply: 1 billion tokens</li>
              <li className="mb-1">Deflationary Model: Gradual reduction to 100 million tokens through monthly buybacks and burns.</li>
            </ul>

            <h3 className="text-xl font-medium mb-2 text-blue-700">
              Token Distribution:
            </h3>
            
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li className="mb-1">Pool: 100% Locked</li>
              <li className="mb-1">Team: 5% (50 million $SZ)</li>
            </ul>

            <h3 className="text-xl font-medium mb-2 text-blue-700">
              Deflationary Model:
            </h3>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              SolZone employs a transparent and community-centric deflationary strategy. Monthly token buybacks and burns are conducted following each revenue-sharing airdrop. These events will be made publicly accessible through livestreams or transaction link sharing, ensuring transparency and trust. The supply will gradually decrease from 1 billion to 100 million tokens, promoting scarcity and increasing value for holders.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-blue-800">
              3. Utility of SolZone ($SZ)
            </h2>
            
            <h3 className="text-xl font-medium mb-2 text-blue-700">
              Marketplace Integration:
            </h3>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              At the heart of SolZone lies a digital marketplace that facilitates transactions using Solana (SOL) for stability.
            </p>
            
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li className="mb-1">User-Friendly Design: The marketplace offers an intuitive interface for both crypto veterans and newcomers.</li>
              <li className="mb-1">Secure Transactions: A robust platform for trading digital and physical goods/services.</li>
            </ul>
            
            <h3 className="text-xl font-medium mb-2 text-blue-700">
              Escrow System:
            </h3>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              An integrated escrow feature ensures secure transactions by holding funds until all parties agree to the terms, minimizing fraud risks.
            </p>
            
            <h3 className="text-xl font-medium mb-2 text-blue-700">
              Token Utility:
            </h3>
            
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li className="mb-1">Revenue Sharing: Receive monthly airdrops of marketplace profits proportional to holdings.</li>
              <li className="mb-1">Premium Features: Access exclusive marketplace benefits, including reduced fees for $SZ holders.</li>
              <li className="mb-1">Community Governance: Gain voting rights on critical platform decisions, fostering a sense of ownership among long-term holders.</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-blue-800">
              4. Revenue Sharing and Token Benefits
            </h2>
            
            <h3 className="text-xl font-medium mb-2 text-blue-700">
              Revenue Sharing Model:
            </h3>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              SolZone offers a unique revenue-sharing model that directly benefits the community and token holders. A 1% transaction fee is applied to both buyers and sellers on the platform, with $SZ holders enjoying a 20% discount (reducing the fee to 0.8%). The collected fees are allocated as follows:
            </p>
            
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li className="mb-1">10%: Used to buy back and burn $SZ tokens, reducing supply and increasing scarcity.</li>
              <li className="mb-1">40%: Redistributed to token holders as monthly airdrops.</li>
              <li className="mb-1">45%: Allocated for marketplace maintenance, marketing, and growth.</li>
              <li className="mb-1">5%: Dedicated to ongoing platform development.</li>
            </ul>
            
            <h3 className="text-xl font-medium mb-2 text-blue-700">
              How It Works:
            </h3>
            
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li className="mb-1">Transaction Fees: Platform fees generated from goods and services traded on the marketplace are collected.</li>
              <li className="mb-1">Allocation: Of the fees collected, 50% goes back to the community and token holders.</li>
              <li className="mb-1">Passive Income: Holders earn a share of the platform's profits, creating an opportunity for passive income without the complexities of staking.</li>
              <li className="mb-1">Market Impact: The combination of token burns and airdrops increases market cap and liquidity, incentivizing long-term holding.</li>
            </ul>
            
            <h3 className="text-xl font-medium mb-2 text-blue-700">
              Revenue Sharing Formula:
            </h3>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              The airdrop distribution is calculated as follows:
            </p>
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li className="mb-1">P: Total monthly profit allocated for distribution.</li>
              <li className="mb-1">H: Number of $SZ tokens held by the user.</li>
              <li className="mb-1">T: Total circulating supply of $SZ at the time of distribution.</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              A user's airdrop amount (A) is calculated as:<br />
              A = (P * H) / T
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              This ensures fair and proportional distribution based on each holder's stake.
            </p>
            
            <h3 className="text-xl font-medium mb-2 text-blue-700">
              Additional Benefits for Token Holders:
            </h3>
            
            <ul className="list-disc pl-6 mb-4 text-gray-700">
              <li className="mb-1">Fee Discounts: $SZ holders enjoy significant reductions in marketplace fees, making it easier for users to start crypto-based businesses with zero entry costs.</li>
              <li className="mb-1">Voting Rights: Token holders actively participate in key decisions, shaping the platform's future and ensuring a community-driven ecosystem.</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-blue-800">
              5. Unique Selling Point
            </h2>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              SolZone stands out as the first meme coin with real utility, offering a cryptocurrency- powered marketplace. It combines the excitement of meme coins with practical applications, bridging the gap between hype and functionality in the blockchain space.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-blue-800">
              6. Eco-Friendly Approach
            </h2>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              By hosting all transactions digitally on the SolZone marketplace, we contribute to environmental sustainability. Solana's energy-efficient blockchain minimizes the carbon footprint of each transaction, aligning with eco-conscious values and practices.
            </p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-blue-800">
              7. Roadmap
            </h2>
            
            <div className="mb-4">
              <h3 className="text-xl font-medium mb-2 text-blue-700">
                Phase 1: Foundation
              </h3>
              <ul className="list-disc pl-6 text-gray-700">
                <li className="mb-1">Launch $SZ on Solana.</li>
                <li className="mb-1">Develop and release the SolZone marketplace.</li>
                <li className="mb-1">Establish community engagement channels (website, X account, Telegram).</li>
              </ul>
            </div>
            
            <div className="mb-4">
              <h3 className="text-xl font-medium mb-2 text-blue-700">
                Phase 2: Growth
              </h3>
              <ul className="list-disc pl-6 text-gray-700">
                <li className="mb-1">Begin monthly token burns and revenue-sharing airdrops.</li>
                <li className="mb-1">Expand marketplace features with premium utilities.</li>
                <li className="mb-1">Secure listings on major centralized exchanges (CEXs).</li>
              </ul>
            </div>
            
            <div className="mb-4">
              <h3 className="text-xl font-medium mb-2 text-blue-700">
                Phase 3: Expansion
              </h3>
              <ul className="list-disc pl-6 text-gray-700">
                <li className="mb-1">Build strategic partnerships within and beyond the blockchain space.</li>
                <li className="mb-1">Introduce community governance features.</li>
              </ul>
            </div>
            
            <div className="mb-4">
              <h3 className="text-xl font-medium mb-2 text-blue-700">
                Phase 4: Future Vision
              </h3>
              <ul className="list-disc pl-6 text-gray-700">
                <li className="mb-1">Explore additional DeFi utilities, such as lending.</li>
                <li className="mb-1">Expand $SZ utility to new areas in digital and real-world applications.</li>
              </ul>
            </div>
          </section>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-blue-800">
              8. Conclusion
            </h2>
            
            <p className="text-gray-700 leading-relaxed mb-4">
              SolZone ($SZ) transcends the traditional meme coin narrative by delivering real utility through its marketplace on the Solana blockchain. With a focus on sustainability, community empowerment, and innovation, SolZone redefines what a meme coin can achieve. Join us in revolutionizing digital commerce and be part of a thriving, decentralized ecosystem.
            </p>
          </section>
          
          <section className="mt-12 pt-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-600">
              Disclaimer
            </h2>
            
            <p className="text-gray-500 text-sm italic">
              This whitepaper is for informational purposes only and does not constitute financial advice. Always perform your own research before investing in any blockchain project.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default WhitepaperPage;