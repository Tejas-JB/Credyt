'use client';

import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import AddNFTModal from '../components/AddNFTModal';

interface NFT {
  id: string;
  name: string;
  collection: string;
  image: string;
  purchaseDate: string;
  purchasePrice: string;
  currentValue: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
}

export default function NFTsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [nfts, setNfts] = useState<NFT[]>([
    {
      id: '1',
      name: 'Bored Ape #7234',
      collection: 'Bored Ape Yacht Club',
      image: '🐵',
      purchaseDate: 'Mar 15, 2022',
      purchasePrice: '80 ETH',
      currentValue: '96 ETH',
      change: '+20%',
      trend: 'up',
    },
    {
      id: '2',
      name: 'Azuki #1456',
      collection: 'Azuki',
      image: '👺',
      purchaseDate: 'Apr 22, 2022',
      purchasePrice: '12 ETH',
      currentValue: '8 ETH',
      change: '-33%',
      trend: 'down',
    },
    {
      id: '3',
      name: 'Doodle #4532',
      collection: 'Doodles',
      image: '🎨',
      purchaseDate: 'Feb 10, 2022',
      purchasePrice: '5 ETH',
      currentValue: '4.8 ETH',
      change: '-4%',
      trend: 'down',
    },
    {
      id: '4',
      name: 'Moonbird #2187',
      collection: 'Moonbirds',
      image: '🦉',
      purchaseDate: 'May 5, 2022',
      purchasePrice: '8.5 ETH',
      currentValue: '9.2 ETH',
      change: '+8%',
      trend: 'up',
    },
    {
      id: '5',
      name: 'CloneX #3211',
      collection: 'CloneX',
      image: '🤖',
      purchaseDate: 'Jan 28, 2022',
      purchasePrice: '6.2 ETH',
      currentValue: '6.5 ETH',
      change: '+5%',
      trend: 'up',
    },
    {
      id: '6',
      name: 'CryptoPunk #7842',
      collection: 'CryptoPunks',
      image: '👾',
      purchaseDate: 'Dec 5, 2021',
      purchasePrice: '65 ETH',
      currentValue: '72 ETH',
      change: '+11%',
      trend: 'up',
    },
  ]);

  // Function to add a new NFT
  const handleAddNFT = (newNft: {
    name: string;
    collection: string;
    image: string | File;
    purchaseDate: string;
    purchasePrice: string;
  }) => {
    // Format the purchase date
    const date = new Date(newNft.purchaseDate);
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    
    // Generate a random ID
    const id = Math.random().toString(36).substring(2, 9);
    
    // In a real app, we would calculate the current value based on market data
    // For this demo, we'll set it to be the same as purchase price
    const currentValue = newNft.purchasePrice;
    
    // Add the new NFT to the list
    const nftToAdd: NFT = {
      id,
      name: newNft.name,
      collection: newNft.collection,
      image: typeof newNft.image === 'string' ? newNft.image : '🖼️', // Use emoji if it's a File object
      purchaseDate: formattedDate,
      purchasePrice: newNft.purchasePrice,
      currentValue,
      change: '0%', // New NFTs start with 0% change
      trend: 'neutral',
    };
    
    setNfts([nftToAdd, ...nfts]);
  };

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">NFT Portfolio</h1>
          <p className="text-darkText">Explore and manage your digital collectibles</p>
        </div>
        
        {/* NFT Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="stat-card">
            <h3 className="text-darkText">Total NFTs</h3>
            <div className="text-2xl font-bold">{nfts.length}</div>
            <div className="text-sm text-darkText">Across {new Set(nfts.map(nft => nft.collection)).size} collections</div>
          </div>
          
          <div className="stat-card">
            <h3 className="text-darkText">Portfolio Value</h3>
            <div className="text-2xl font-bold">196.5 ETH</div>
            <div className="text-sm text-darkText">$335,890.75</div>
          </div>
          
          <div className="stat-card">
            <h3 className="text-darkText">Floor Value</h3>
            <div className="text-2xl font-bold">145.2 ETH</div>
            <div className="text-sm text-darkText">$248,292.60</div>
          </div>
          
          <div className="stat-card">
            <h3 className="text-darkText">Profit/Loss</h3>
            <div className="flex items-center">
              <div className="text-2xl font-bold text-accent">+18.5%</div>
            </div>
            <div className="text-sm text-darkText">Since purchase</div>
          </div>
        </div>
        
        {/* Just the All NFTs tab - no other tabs */}
        <div className="border-b border-gray-800 mb-6">
          <div className="flex">
            <div className="pb-4 px-1 text-sm font-medium border-b-2 border-primary text-primary">
              All NFTs
            </div>
          </div>
        </div>
        
        {/* Search and Add NFT */}
        <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
          <div className="relative w-full md:w-auto">
            <input 
              type="text" 
              placeholder="Search NFTs" 
              className="w-full md:w-80 rounded-lg bg-card border border-gray-700 py-2 px-4 text-sm focus:outline-none focus:border-primary"
            />
            <span className="absolute right-3 top-2.5">🔍</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button 
              className="btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              + Add NFT
            </button>
          </div>
        </div>
        
        {/* NFT Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {nfts.map((nft) => (
            <div key={nft.id} className="card group hover:border hover:border-primary transition-all">
              <div className="relative">
                {/* This would be an actual image in a real app */}
                <div className="h-64 bg-gray-800 rounded-t-lg flex items-center justify-center text-6xl">
                  {nft.image}
                </div>
                <div className="absolute top-3 right-3 bg-card/80 backdrop-blur-sm px-2 py-1 rounded text-xs">
                  {nft.collection}
                </div>
              </div>
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-lg">{nft.name}</h3>
                  <div className={`text-sm px-2 py-0.5 rounded ${
                    nft.trend === 'up' ? 'bg-accent/20 text-accent' : 
                    nft.trend === 'down' ? 'bg-danger/20 text-danger' : 
                    'bg-gray-700 text-gray-400'
                  }`}>
                    {nft.change}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-darkText">Purchased:</div>
                  <div>{nft.purchaseDate}</div>
                  
                  <div className="text-darkText">Purchase Price:</div>
                  <div>{nft.purchasePrice}</div>
                  
                  <div className="text-darkText">Current Value:</div>
                  <div className="font-medium">{nft.currentValue}</div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-800 grid grid-cols-2 gap-2">
                  <button className="btn-primary text-xs">View Details</button>
                  <button className="btn bg-card border border-gray-700 hover:border-primary text-darkText hover:text-lightText text-xs">List for Sale</button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Load more button */}
        <div className="flex justify-center">
          <button className="btn-secondary px-8">
            Load More NFTs
          </button>
        </div>
      </div>
      
      {/* Add NFT Modal */}
      <AddNFTModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddNFT={handleAddNFT}
      />
    </main>
  );
} 