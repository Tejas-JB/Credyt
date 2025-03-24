"use client";

import { useState } from 'react';
import Navigation from './components/Navigation';
import WalletOverview from './components/WalletOverview';
import TransactionChart from './components/TransactionChart';
import RecentTransactions from './components/RecentTransactions';
import TokenHoldings from './components/TokenHoldings';
import ActivityMetrics from './components/ActivityMetrics';
import CryptoComparisonCharts from './components/CryptoComparisonCharts';
import { generateTestTransactions } from './utils/transactionUtils';

export default function Dashboard() {
  const [testDataGenerated, setTestDataGenerated] = useState(false);
  
  const handleGenerateTestData = () => {
    // Generate test transactions (this will update wallet balance internally)
    const transactions = generateTestTransactions();
    setTestDataGenerated(true);
    
    // Refresh transactions component if needed
    if (typeof window !== 'undefined' && (window as any).refreshTransactions) {
      (window as any).refreshTransactions();
    }
    
    // Also update credit score since risky transactions affect it
    if (typeof window !== 'undefined' && (window as any).updateCreditScore) {
      (window as any).updateCreditScore();
    }
    
    // Calculate total USD change
    const totalChange = transactions.reduce((total, tx) => {
      const value = parseFloat(tx.value.replace('$', '').replace(/,/g, ''));
      if (tx.type === 'send') {
        return total - value;
      } else if (tx.type === 'receive') {
        return total + value;
      }
      return total;
    }, 0);
    
    // Alert the user that the wallet balance has been updated
    setTimeout(() => {
      alert(`Test transactions generated! Your wallet balance has been updated by ${totalChange.toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2
      })}`);
    }, 100);
  };

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-darkText">Overview of your crypto wallet performance</p>
          </div>
          
          {!testDataGenerated && (
            <button
              onClick={handleGenerateTestData}
              className="px-4 py-2 bg-primary hover:bg-primary/80 text-white rounded-md transition-colors duration-200"
            >
              Generate Test Transactions with Risk Flags
            </button>
          )}
        </div>
        
        {/* Main dashboard grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Wallet overview card - spans 1 column */}
          <div className="lg:col-span-1">
            <WalletOverview />
          </div>
          
          {/* Individual Crypto price chart - spans 2 columns */}
          <div className="lg:col-span-2">
            <TransactionChart selectedCrypto="ETH" selectedTimeRange="1M" />
          </div>
          
          {/* Crypto comparison charts - spans full width */}
          <div className="lg:col-span-3">
            <CryptoComparisonCharts />
          </div>
          
          {/* Recent transactions list - spans 2 columns */}
          <div className="lg:col-span-2">
            <RecentTransactions />
          </div>
          
          {/* Token holdings - spans 1 column */}
          <div className="lg:col-span-1">
            <TokenHoldings />
          </div>
          
          {/* Activity metrics - spans full width */}
          <div className="lg:col-span-3">
            <ActivityMetrics />
          </div>
        </div>
      </div>
    </main>
  );
} 