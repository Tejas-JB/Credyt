"use client";

import React, { useState, useEffect } from 'react';
import { predictTransactionCategory, getCategoryDisplay } from '../utils/transactionPredictor';

export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'swap' | 'contract';
  status: 'completed' | 'pending' | 'failed';
  amount: string;
  token: string;
  value: string;
  address: string;
  timestamp: string;
  gasUsed: string;
  description?: string;
  clientId?: string;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  riskScore?: number;
}

// Initial sample transactions
const initialTransactions: Transaction[] = [];

// Create a global variable to store transactions between component renders
// Note: In a real app, you'd use a more robust solution like Redux, Context API, or a database
let globalTransactions = [...initialTransactions];

export function addTransaction(transaction: Transaction) {
  // Add to the global transactions array
  globalTransactions = [transaction, ...globalTransactions];
  
  // If running in browser, also store in localStorage for persistence
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('walletTransactions', JSON.stringify(globalTransactions));
    } catch (e) {
      console.error('Failed to save transactions to localStorage:', e);
    }
  }
  
  return globalTransactions;
}

// Function to clear all transactions
export function clearTransactions() {
  globalTransactions = [];
  
  // Clear localStorage as well
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem('walletTransactions');
    } catch (e) {
      console.error('Failed to clear transactions from localStorage:', e);
    }
  }
  
  // If window.refreshTransactions exists, call it to update UI
  if (typeof window !== 'undefined' && (window as any).refreshTransactions) {
    (window as any).refreshTransactions();
  }
  
  return globalTransactions;
}

export default function RecentTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(globalTransactions);
  const [showRiskLegend, setShowRiskLegend] = useState(false);

  // Load transactions from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedTransactions = localStorage.getItem('walletTransactions');
        if (savedTransactions) {
          const parsedTransactions = JSON.parse(savedTransactions);
          globalTransactions = parsedTransactions;
          setTransactions(parsedTransactions);
        }
      } catch (e) {
        console.error('Failed to load transactions from localStorage:', e);
      }
    }
  }, []);

  // Add a function to refresh transactions from the global state
  // This can be called from outside the component
  const refreshTransactions = () => {
    setTransactions([...globalTransactions]);
  };

  // Expose both refresh and clear functions to the window object
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.refreshTransactions = refreshTransactions;
      // @ts-ignore
      window.clearTransactions = () => {
        clearTransactions();
        setTransactions([]);
      };
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        // @ts-ignore
        delete window.refreshTransactions;
        // @ts-ignore
        delete window.clearTransactions;
      }
    };
  }, []);

  // Function to render the appropriate icon based on transaction type
  const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
      case 'send':
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
            ↑
          </div>
        );
      case 'receive':
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
            ↓
          </div>
        );
      case 'swap':
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
            ⇄
          </div>
        );
      case 'contract':
        return (
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center text-warning">
            ⚙️
          </div>
        );
      default:
        return null;
    }
  };

  // Function to render the status badge
  const getStatusBadge = (status: Transaction['status']) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 text-xs rounded bg-accent/20 text-accent">Completed</span>;
      case 'pending':
        return <span className="px-2 py-1 text-xs rounded bg-warning/20 text-warning">Pending</span>;
      case 'failed':
        return <span className="px-2 py-1 text-xs rounded bg-danger/20 text-danger">Failed</span>;
      default:
        return null;
    }
  };

  // New function to display risk indicator for potentially fraudulent transactions
  const getRiskIndicator = (transaction: Transaction) => {
    if (!transaction.riskLevel) return null;
    
    switch(transaction.riskLevel) {
      case 'high':
        return (
          <div className="ml-2 px-2 py-1 text-xs rounded bg-warning/20 text-warning flex items-center">
            <span className="mr-1">⚠️</span> High Risk - Suspicious Activity
          </div>
        );
      case 'critical':
        return (
          <div className="ml-2 px-2 py-1 text-xs rounded bg-danger/20 text-danger flex items-center">
            <span className="mr-1">🚨</span> Fraud Alert - Potentially Malicious
          </div>
        );
      case 'medium':
        return (
          <div className="ml-2 px-2 py-1 text-xs rounded bg-primary/20 text-primary flex items-center">
            <span className="mr-1">⚠️</span> Unusual Activity
          </div>
        );
      default:
        return null;
    }
  };

  // Function to get the border style based on risk level
  const getTransactionBorderStyle = (riskLevel?: string) => {
    switch(riskLevel) {
      case 'critical':
        return 'border-2 border-danger/50 bg-danger/5';
      case 'high':
        return 'border-2 border-warning/50 bg-warning/5';
      case 'medium':
        return 'border border-primary/30 bg-primary/5';
      default:
        return '';
    }
  };

  // Risk Legend Component
  const RiskLegend = () => (
    <div className="mb-4 p-3 bg-card border border-border rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-sm">Transaction Risk Legend</h3>
        <button 
          onClick={() => setShowRiskLegend(false)}
          className="text-xs text-darkText hover:text-white"
        >
          Hide
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="flex items-center text-xs">
          <div className="w-3 h-3 rounded-full bg-accent mr-2"></div>
          <span>No Flag: Safe transaction with low risk</span>
        </div>
        <div className="flex items-center text-xs">
          <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
          <span><span className="mr-1">⚠️</span> Medium: Unusual transaction pattern</span>
        </div>
        <div className="flex items-center text-xs">
          <div className="w-3 h-3 rounded-full bg-warning mr-2"></div>
          <span><span className="mr-1">⚠️</span> High: Suspicious activity detected</span>
        </div>
        <div className="flex items-center text-xs">
          <div className="w-3 h-3 rounded-full bg-danger mr-2"></div>
          <span><span className="mr-1">🚨</span> Critical: Likely fraudulent activity</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="card h-full">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center">
          <h2 className="text-xl font-bold">Recent Transactions</h2>
          <button 
            className="ml-2 text-xs bg-primary/20 text-primary px-2 py-1 rounded hover:bg-primary/30 transition-colors"
            onClick={() => setShowRiskLegend(!showRiskLegend)}
          >
            {showRiskLegend ? 'Hide Legend' : 'Risk Info'}
          </button>
        </div>
        <div className="flex gap-2">
          <button 
            className="text-primary text-sm"
            onClick={() => {
              // This would typically navigate to a full transactions page
              alert('View all transactions');
            }}
          >
            View All
          </button>
          {transactions.length > 0 && (
            <button 
              className="text-danger text-sm"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all transactions? This action cannot be undone.')) {
                  clearTransactions();
                  setTransactions([]);
                }
              }}
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {showRiskLegend && <RiskLegend />}

      <div className="space-y-4">
        {transactions.length > 0 ? (
          transactions.map((tx) => (
            <div 
              key={tx.id} 
              className={`flex items-center p-3 rounded-lg hover:bg-card/60 transition-colors ${getTransactionBorderStyle(tx.riskLevel)}`}
            >
              {getTransactionIcon(tx.type)}
              
              <div className="ml-4 flex-grow">
                <div className="flex justify-between">
                  <span className="font-semibold flex items-center">
                    {tx.type === 'send' ? 'Sent' : 
                     tx.type === 'receive' ? 'Received' : 
                     tx.type === 'swap' ? 'Swapped' : 
                     'Contract Interaction'}
                    {getRiskIndicator(tx)}
                  </span>
                  <span className={`font-semibold ${
                    tx.type === 'receive' ? 'text-accent' : 
                    tx.type === 'send' || tx.type === 'contract' ? 'text-primary' : 
                    'text-secondary'
                  }`}>
                    {tx.type === 'send' ? '-' : tx.type === 'receive' ? '+' : ''}{tx.amount} {tx.token}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm text-darkText mt-1">
                  <span>{tx.address}</span>
                  <span>{tx.value}</span>
                </div>
                
                {tx.description && (
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-secondary">{tx.description}</span>
                    {(() => {
                      const category = predictTransactionCategory(tx.description);
                      const display = getCategoryDisplay(category);
                      return (
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs flex items-center">
                          {display.emoji} {display.label}
                        </span>
                      );
                    })()}
                  </div>
                )}
                
                <div className="flex justify-between text-xs mt-2">
                  <div className="flex items-center">
                    {getStatusBadge(tx.status)}
                  </div>
                  <span className="text-darkText">{tx.timestamp} · Gas: {tx.gasUsed}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-darkText">
            No transactions yet. Try sending or receiving crypto!
          </div>
        )}
      </div>
    </div>
  );
} 