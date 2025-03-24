"use client";

import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { CreditScoreResponse } from '../utils/apiClient';
import { getCachedCreditScore, TRANSACTION_PROCESSED_EVENT } from '../utils/transactionUtils';

interface WalletMetric {
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

// Initial wallet balance in USD (matches the total value of token holdings)
const INITIAL_BALANCE = 101182.49;

// Mock wallet address
const WALLET_ADDRESS = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';

export default function WalletOverview() {
  const [walletMetrics, setWalletMetrics] = useState<WalletMetric[]>([
    {
      label: 'Total Balance',
      value: `$${INITIAL_BALANCE.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: '+5.3%',
      trend: 'up',
    },
    {
      label: 'Wallet Age',
      value: '478 days',
    },
    {
      label: 'Transaction Count',
      value: '1,243',
      change: '+12 today',
      trend: 'up',
    },
    {
      label: 'Active Days',
      value: '312',
    },
    {
      label: 'Gas Spent (Total)',
      value: '2.87 ETH',
    },
  ]);
  
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [creditScore, setCreditScore] = useState<CreditScoreResponse | null>(null);
  const [isLoadingScore, setIsLoadingScore] = useState(false);

  // Function to update wallet balance (exposed globally)
  const updateWalletBalance = (newBalance: number) => {
    const updatedMetrics = [...walletMetrics];
    updatedMetrics[0] = {
      ...updatedMetrics[0],
      value: `$${newBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    };
    setWalletMetrics(updatedMetrics);
    
    // Store the balance in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('walletBalance', newBalance.toString());
    }
  };
  
  // Handle deposit form submission
  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(depositAmount);
    
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid deposit amount');
      return;
    }
    
    // Get current balance from localStorage
    const currentBalanceStr = localStorage.getItem('walletBalance');
    if (currentBalanceStr) {
      const currentBalance = parseFloat(currentBalanceStr);
      // Add the deposit amount
      const newBalance = currentBalance + amount;
      // Update the wallet balance
      updateWalletBalance(newBalance);
      
      // Show success message
      alert(`Successfully deposited $${amount.toFixed(2)} to your wallet`);
      
      // Reset form and close modal
      setDepositAmount('');
      setShowDepositModal(false);
    }
  };
  
  // Function to update credit score in response to transactions
  const updateCreditScore = (newScore: CreditScoreResponse) => {
    setCreditScore(newScore);
  };
  
  // Fetch credit score
  const fetchCreditScore = async () => {
    setIsLoadingScore(true);
    try {
      // Try to get cached score first
      const cachedScore = await getCachedCreditScore();
      if (cachedScore) {
        setCreditScore(cachedScore);
      } else {
        // If no cached score, fetch from API
        const score = await api.getCreditScore(WALLET_ADDRESS);
        setCreditScore(score);
      }
    } catch (error) {
      console.error('Error fetching credit score:', error);
    } finally {
      setIsLoadingScore(false);
    }
  };

  // Load wallet balance from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedBalance = localStorage.getItem('walletBalance');
      if (storedBalance) {
        const balance = parseFloat(storedBalance);
        updateWalletBalance(balance);
      } else {
        // Initialize with default balance if not found
        localStorage.setItem('walletBalance', INITIAL_BALANCE.toString());
      }
      
      // Expose the update functions globally
      (window as any).updateWalletBalance = updateWalletBalance;
      (window as any).updateCreditScore = updateCreditScore; // Add credit score update function
    }
    
    // Fetch credit score
    fetchCreditScore();

    // Set up the global updateCreditScore function
    if (typeof window !== 'undefined') {
      (window as any).updateCreditScore = updateCreditScore;
      
      // Add event listener for transaction processing
      const handleTransactionProcessed = () => {
        console.log('Transaction processed event received, updating credit score');
        fetchCreditScore();
      };
      
      window.addEventListener(TRANSACTION_PROCESSED_EVENT, handleTransactionProcessed);
      
      // Clean up
      return () => {
        delete (window as any).updateWalletBalance;
        delete (window as any).updateCreditScore; // Clean up credit score update function
        window.removeEventListener(TRANSACTION_PROCESSED_EVENT, handleTransactionProcessed);
      };
    }
  }, []);

  return (
    <div className="card h-full">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">Wallet Overview</h2>
        <button 
          onClick={() => setShowDepositModal(true)}
          className="btn-primary text-sm px-3 py-1"
        >
          Deposit
        </button>
      </div>

      {/* Credit Score Card */}
      {creditScore && (
        <div className="mb-6 p-4 bg-card/50 rounded-lg border border-gray-800">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold text-lg">ZKredit Score</h3>
            <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
              {creditScore.score >= 750 ? 'Excellent' : 
               creditScore.score >= 700 ? 'Good' :
               creditScore.score >= 650 ? 'Fair' : 'Needs Work'}
            </div>
          </div>
          
          <div className="flex items-center mb-3">
            <div className="text-3xl font-bold mr-2">{creditScore.score}</div>
            <div className="text-darkText text-sm">/ {creditScore.maxScore}</div>
          </div>
          
          <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden mb-4">
            <div 
              className={`h-full rounded-full ${
                creditScore.score >= 750 ? 'bg-green-500' :
                creditScore.score >= 700 ? 'bg-blue-500' :
                creditScore.score >= 650 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${(creditScore.score / creditScore.maxScore) * 100}%` }}
            ></div>
          </div>
          
          {creditScore.factors.positive.length > 0 && (
            <div className="mb-2">
              <div className="text-xs text-darkText mb-1">Positive Factors:</div>
              <ul className="text-xs text-green-400 space-y-1">
                {creditScore.factors.positive.slice(0, 2).map((factor, index) => (
                  <li key={index} className="flex items-center">
                    <span className="mr-1">✓</span> {factor}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {creditScore.factors.negative.length > 0 && (
            <div>
              <div className="text-xs text-darkText mb-1">Areas to Improve:</div>
              <ul className="text-xs text-red-400 space-y-1">
                {creditScore.factors.negative.slice(0, 2).map((factor, index) => (
                  <li key={index} className="flex items-center">
                    <span className="mr-1">✗</span> {factor}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mt-3 text-xs text-right text-darkText">
            Last updated: {new Date(creditScore.lastUpdated).toLocaleDateString()}
          </div>
        </div>
      )}
      
      {isLoadingScore && (
        <div className="mb-6 p-4 bg-card/50 rounded-lg border border-gray-800 flex justify-center items-center">
          <div className="text-sm">Loading credit score...</div>
        </div>
      )}

      <div className="space-y-4">
        {walletMetrics.map((metric, index) => (
          <div key={index} className="border-b border-gray-800 last:border-0 pb-3 last:pb-0">
            <div className="flex justify-between">
              <span className="text-darkText">{metric.label}</span>
              {metric.trend && (
                <span className={`text-xs px-2 py-0.5 rounded ${
                  metric.trend === 'up' ? 'bg-accent/20 text-accent' : 
                  metric.trend === 'down' ? 'bg-danger/20 text-danger' : 
                  'bg-gray-700 text-gray-400'
                }`}>
                  {metric.change}
                </span>
              )}
            </div>
            <div className="text-lg font-semibold mt-1">{metric.value}</div>
          </div>
        ))}
      </div>
      
      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
          <div className="bg-card p-6 rounded-lg shadow-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Deposit Funds</h3>
              <button 
                onClick={() => setShowDepositModal(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleDeposit}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Amount (USD)</label>
                <div className="relative">
                  <div className="absolute left-3 top-2.5">$</div>
                  <input 
                    type="text" 
                    value={depositAmount} 
                    onChange={(e) => setDepositAmount(e.target.value.replace(/[^\d.]/g, ''))}
                    placeholder="0.00"
                    className="w-full rounded-lg bg-background border border-gray-700 py-2 pl-7 pr-4 text-sm focus:outline-none focus:border-primary"
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <button type="button" className="btn bg-card border border-gray-700 hover:border-primary text-darkText hover:text-lightText" onClick={() => setShowDepositModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 