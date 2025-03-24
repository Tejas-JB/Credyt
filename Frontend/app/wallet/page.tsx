import React from 'react';
import Navigation from '../components/Navigation';
import WalletOverview from '../components/WalletOverview';
import TokenHoldings from '../components/TokenHoldings';

export default function WalletPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Wallet</h1>
          <p className="text-darkText">Manage your cryptocurrency wallet</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left sidebar */}
          <div className="md:col-span-1">
            <WalletOverview />
          </div>
          
          {/* Main content */}
          <div className="md:col-span-2">
            <TokenHoldings />
          </div>
        </div>
      </div>
    </main>
  );
} 