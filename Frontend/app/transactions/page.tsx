"use client";

import React, { useState, useEffect, useRef } from 'react';
import Navigation from '../components/Navigation';
import RecentTransactions from '../components/RecentTransactions';
import TransactionChart from '../components/TransactionChart';
import { TransactionCategory, getCategoryDisplay } from '../utils/transactionPredictor';
import { addTransaction, Transaction } from '../components/RecentTransactions';
import { fetchCryptoPrices } from '../utils/cryptoApi';
import api from '../utils/api';
import { TransactionRiskResponse, TransactionIntentResponse } from '../utils/apiClient';
import { createTransactionWithRisk } from '../utils/transactionUtils';

interface SendMoneyFormData {
  recipientId: string;
  amount: string;
  token: 'ETH' | 'BTC';
  description: string;
  amountInUSD: string;
}

// Mock data for transaction categories
const categoryStats = [
  { category: 'business' as TransactionCategory, count: 12, percentage: 40, value: '$12,450.75' },
  { category: 'investment' as TransactionCategory, count: 8, percentage: 26.7, value: '$8,322.50' },
  { category: 'personal' as TransactionCategory, count: 6, percentage: 20, value: '$3,125.25' },
  { category: 'trading' as TransactionCategory, count: 3, percentage: 10, value: '$5,780.00' },
  { category: 'unknown' as TransactionCategory, count: 1, percentage: 3.3, value: '$250.00' },
];

// Initialize with default prices that will be updated
const tokenPrices = {
  'ETH': 2013.75,
  'BTC': 61199.33
};

export default function TransactionsPage() {
  const [showSendForm, setShowSendForm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const printFrameRef = useRef<HTMLIFrameElement>(null);
  const [formData, setFormData] = useState<SendMoneyFormData>({
    recipientId: '',
    amount: '',
    token: 'ETH',
    description: '',
    amountInUSD: '',
  });
  const [selectedRecipient, setSelectedRecipient] = useState('');
  const [convertedAmount, setConvertedAmount] = useState('');
  const [inputMode, setInputMode] = useState<'crypto' | 'usd'>('usd');
  const [currentTokenPrices, setCurrentTokenPrices] = useState(tokenPrices);
  const [isLoadingPrices, setIsLoadingPrices] = useState(false);
  
  // New state for risk analysis
  const [isAnalyzingRisk, setIsAnalyzingRisk] = useState(false);
  const [riskAnalysis, setRiskAnalysis] = useState<TransactionRiskResponse | null>(null);
  const [intentAnalysis, setIntentAnalysis] = useState<TransactionIntentResponse | null>(null);
  const [showRiskModal, setShowRiskModal] = useState(false);

  // Static list of client IDs
  const knownClients = [
    { id: 'client_id_001', name: 'John Doe', address: '0x71C...8e3B', creditScore: 750 },
    { id: 'client_id_002', name: 'Jane Smith', address: '0x45A...9f7C', creditScore: 680 },
    { id: 'client_id_003', name: 'Alice Johnson', address: '0x8f2...E3F', creditScore: 820 },
    { id: 'client_id_004', name: 'Bob Wilson', address: '0x3a2...6d9', creditScore: 790 },
    { id: 'client_id_005', name: 'Charlie Brown', address: '0xf9A...2a7', creditScore: 625 },
    { id: 'client_id_006', name: 'David Miller', address: '0x9B4...5Df', creditScore: 580 },
    { id: 'client_id_007', name: 'Eva Garcia', address: '0x71F...4A2', creditScore: 710 },
    { id: 'client_id_008', name: 'Frank Lee', address: '0x2E5...7C9', creditScore: 530 },
  ];

  // Fetch real-time cryptocurrency prices
  const updateTokenPrices = async () => {
    setIsLoadingPrices(true);
    try {
      const cryptoData = await fetchCryptoPrices(['bitcoin', 'ethereum']);
      
      // Update token prices with real-time data
      if (cryptoData.bitcoin && cryptoData.ethereum) {
        const newPrices = {
          'BTC': cryptoData.bitcoin.price,
          'ETH': cryptoData.ethereum.price
        };
        
        setCurrentTokenPrices(newPrices);
        
        // Update calculation if form has values
        if (formData.amount) {
          updateConversion(formData.amount, formData.token, inputMode, newPrices);
        }
      }
    } catch (error) {
      console.error('Error updating token prices:', error);
    } finally {
      setIsLoadingPrices(false);
    }
  };

  // Update conversion based on new values
  const updateConversion = (amount: string, token: 'ETH' | 'BTC', mode: 'crypto' | 'usd', prices = currentTokenPrices) => {
    if (amount) {
      if (mode === 'usd') {
        // Convert from USD to selected token
        const amountInUSD = parseFloat(amount);
        if (!isNaN(amountInUSD)) {
          const amountInCrypto = (amountInUSD / prices[token]).toFixed(8);
          setConvertedAmount(`≈ ${amountInCrypto} ${token}`);
          setFormData(prev => ({ 
            ...prev, 
            amountInUSD: amount
          }));
        }
      } else {
        // Convert from token to USD
        const amountInCrypto = parseFloat(amount);
        if (!isNaN(amountInCrypto)) {
          const amountInUSD = (amountInCrypto * prices[token]).toFixed(2);
          setConvertedAmount(`≈ $${amountInUSD}`);
          setFormData(prev => ({ 
            ...prev, 
            amountInUSD: amountInUSD
          }));
        }
      }
    } else {
      setConvertedAmount('');
      setFormData(prev => ({ ...prev, amountInUSD: '' }));
    }
  };

  // Effect to fetch prices when component mounts
  useEffect(() => {
    updateTokenPrices();
    
    // Set up interval for periodic updates (every 60 seconds)
    const interval = setInterval(updateTokenPrices, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Effect to update conversion when amount or token changes
  useEffect(() => {
    updateConversion(formData.amount, formData.token, inputMode);
  }, [formData.amount, formData.token, inputMode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'amount') {
      // Remove any non-numeric characters except decimal point
      const cleanedValue = value.replace(/[^\d.]/g, '');
      setFormData(prev => ({ ...prev, [name]: cleanedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (name === 'recipientId') {
      const recipient = knownClients.find(client => client.id === value);
      setSelectedRecipient(recipient ? recipient.name : '');
    }

    // If token changes, recalculate with the current amount
    if (name === 'token') {
      updateConversion(formData.amount, value as 'ETH' | 'BTC', inputMode);
    }
  };

  const toggleInputMode = () => {
    if (inputMode === 'usd') {
      // Switching to crypto input
      setInputMode('crypto');
      // Convert current USD amount to crypto
      if (formData.amountInUSD) {
        const amountInUSD = parseFloat(formData.amountInUSD);
        if (!isNaN(amountInUSD)) {
          const amountInCrypto = (amountInUSD / currentTokenPrices[formData.token]).toFixed(8);
          setFormData(prev => ({ ...prev, amount: amountInCrypto }));
          setConvertedAmount(`≈ $${formData.amountInUSD}`);
        }
      }
    } else {
      // Switching to USD input
      setInputMode('usd');
      // Convert current crypto amount to USD
      if (formData.amount) {
        const amountInCrypto = parseFloat(formData.amount);
        if (!isNaN(amountInCrypto)) {
          const amountInUSD = (amountInCrypto * currentTokenPrices[formData.token]).toFixed(2);
          setFormData(prev => ({ ...prev, amount: amountInUSD, amountInUSD: amountInUSD }));
          setConvertedAmount(`≈ ${amountInCrypto} ${formData.token}`);
        }
      }
    }
  };

  // Analyze transaction risk
  const analyzeTransactionRisk = async (): Promise<boolean> => {
    // Get the recipient details
    const recipient = knownClients.find(client => client.id === formData.recipientId);
    
    if (!recipient) {
      alert('Please select a valid recipient');
      return false;
    }

    const amountInCrypto = inputMode === 'usd' 
      ? parseFloat(formData.amount) / currentTokenPrices[formData.token]
      : parseFloat(formData.amount);
    
    if (isNaN(amountInCrypto) || amountInCrypto <= 0) {
      alert('Please enter a valid amount');
      return false;
    }

    setIsAnalyzingRisk(true);
    
    try {
      // Get risk analysis
      const risk = await api.analyzeTransactionRisk(
        '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', // Sender address (mock for now)
        recipient.address,
        amountInCrypto,
        formData.token
      );
      
      // Get intent analysis
      const intent = await api.predictTransactionIntent(
        '0x71C7656EC7ab88b098defB751B7401B5f6d8976F', // Sender address (mock for now)
        recipient.address,
        amountInCrypto
      );
      
      // Adjust risk based on recipient's credit score
      if (recipient.creditScore) {
        // Credit score thresholds
        if (recipient.creditScore >= 750) {
          // Decrease risk for recipients with excellent credit scores
          if (risk.riskLevel === 'medium') {
            risk.riskLevel = 'low';
            risk.explanation.push('Recipient has excellent credit score (750+)');
          } else if (risk.riskLevel === 'high') {
            risk.riskLevel = 'medium';
            risk.explanation.push('Risk reduced due to recipient\'s excellent credit score (750+)');
          }
        } else if (recipient.creditScore < 600) {
          // Increase risk for recipients with poor credit scores
          if (risk.riskLevel === 'low') {
            risk.riskLevel = 'medium';
            risk.explanation.push('Recipient has below average credit score (below 600)');
          } else if (risk.riskLevel === 'medium') {
            risk.riskLevel = 'high';
            risk.explanation.push('Risk increased due to recipient\'s poor credit score (below 600)');
          }
        }
      }
      
      setRiskAnalysis(risk);
      setIntentAnalysis(intent);
      
      // Show the risk modal if risk is medium or higher
      if (risk.riskLevel !== 'low') {
        setShowRiskModal(true);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error analyzing transaction risk:', error);
      alert('Failed to analyze transaction risk. Please try again.');
      return false;
    } finally {
      setIsAnalyzingRisk(false);
    }
  };

  // Modified handleSubmit to include risk analysis
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Analyze risk before proceeding
    const isRiskAcceptable = await analyzeTransactionRisk();
    if (!isRiskAcceptable) {
      return;
    }
    
    // Get the recipient details
    const recipient = knownClients.find(client => client.id === formData.recipientId);
    if (!recipient) {
      alert('Please select a valid recipient');
      return;
    }
    
    // Calculate the amount in crypto
    const amountInCrypto = inputMode === 'usd' 
      ? parseFloat(formData.amount) / currentTokenPrices[formData.token]
      : parseFloat(formData.amount);
    
    try {
      // Create transaction with risk analysis - also updates credit score
      const newTransaction = await createTransactionWithRisk(
        'send',
        amountInCrypto,
        formData.token,
        recipient.address,
        formData.description
      );
      
      // Add to global transactions list
      addTransaction(newTransaction);
      
      // Update the wallet balance by subtracting the sent amount
      if (typeof window !== 'undefined' && (window as any).updateWalletBalance) {
        // Get current balance from localStorage
        const currentBalanceStr = localStorage.getItem('walletBalance');
        if (currentBalanceStr) {
          const currentBalance = parseFloat(currentBalanceStr);
          // Amount in USD for the transaction
          const amountInUSD = parseFloat(formData.amountInUSD);
          // Subtract the sent amount
          const newBalance = currentBalance - amountInUSD;
          // Update the wallet balance
          (window as any).updateWalletBalance(newBalance);
        }
      }
      
      // If the RecentTransactions component has exposed a refresh method, call it
      if (typeof window !== 'undefined' && (window as any).refreshTransactions) {
        (window as any).refreshTransactions();
      }
      
      // Display confirmation
      const displayAmount = inputMode === 'usd' 
        ? `$${formData.amount} (${convertedAmount.replace('≈ ', '')})`
        : `${formData.amount} ${formData.token} (≈ $${formData.amountInUSD})`;
        
      alert(`Transaction initiated:\nSending ${displayAmount} to ${selectedRecipient}\nDescription: ${formData.description}`);
      
      // Reset form and state
      setShowSendForm(false);
      setShowRiskModal(false);
      setRiskAnalysis(null);
      setIntentAnalysis(null);
      setFormData({
        recipientId: '',
        amount: '',
        token: 'ETH',
        description: '',
        amountInUSD: '',
      });
      setConvertedAmount('');
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Failed to create transaction. Please try again.');
    }
  };

  // Function to proceed with risky transaction
  const proceedWithTransaction = async () => {
    setShowRiskModal(false);
    
    // Get the recipient details
    const recipient = knownClients.find(client => client.id === formData.recipientId);
    if (!recipient) {
      return;
    }
    
    // Calculate the amount in crypto
    const amountInCrypto = inputMode === 'usd' 
      ? parseFloat(formData.amount) / currentTokenPrices[formData.token]
      : parseFloat(formData.amount);
    
    try {
      // Create transaction with risk analysis - also updates credit score
      const newTransaction = await createTransactionWithRisk(
        'send',
        amountInCrypto,
        formData.token,
        recipient.address,
        formData.description
      );
      
      // Add risk info from analysis if not already present
      if (riskAnalysis && !newTransaction.riskLevel) {
        newTransaction.riskLevel = riskAnalysis.riskLevel as any;
        newTransaction.riskScore = riskAnalysis.riskScore;
      }
      
      // Add to global transactions list
      addTransaction(newTransaction);
      
      // Update the wallet balance by subtracting the sent amount
      if (typeof window !== 'undefined' && (window as any).updateWalletBalance) {
        // Get current balance from localStorage
        const currentBalanceStr = localStorage.getItem('walletBalance');
        if (currentBalanceStr) {
          const currentBalance = parseFloat(currentBalanceStr);
          // Amount in USD for the transaction
          const amountInUSD = parseFloat(formData.amountInUSD);
          // Subtract the sent amount
          const newBalance = currentBalance - amountInUSD;
          // Update the wallet balance
          (window as any).updateWalletBalance(newBalance);
        }
      }
      
      // If the RecentTransactions component has exposed a refresh method, call it
      if (typeof window !== 'undefined' && (window as any).refreshTransactions) {
        (window as any).refreshTransactions();
      }
      
      // Display confirmation
      const displayAmount = inputMode === 'usd' 
        ? `$${formData.amount} (${convertedAmount.replace('≈ ', '')})`
        : `${formData.amount} ${formData.token} (≈ $${formData.amountInUSD})`;
        
      alert(`Transaction initiated despite risks:\nSending ${displayAmount} to ${selectedRecipient}\nDescription: ${formData.description}`);
      
      // Reset form and state
      setShowSendForm(false);
      setRiskAnalysis(null);
      setIntentAnalysis(null);
      setFormData({
        recipientId: '',
        amount: '',
        token: 'ETH',
        description: '',
        amountInUSD: '',
      });
      setConvertedAmount('');
    } catch (error) {
      console.error('Error creating transaction:', error);
      alert('Failed to create transaction. Please try again.');
    }
  };

  // Function to cancel transaction
  const cancelTransaction = () => {
    setShowRiskModal(false);
    setRiskAnalysis(null);
    setIntentAnalysis(null);
  };

  // Handle PDF export
  const handleExport = () => {
    setShowExportModal(true);
  };

  // Generate PDF and print
  const generatePDF = () => {
    setIsPrinting(true);
    
    // Get current transactions from localStorage or fallback to empty array
    let currentTransactions = [];
    if (typeof window !== 'undefined') {
      try {
        const savedTransactions = localStorage.getItem('walletTransactions');
        if (savedTransactions) {
          currentTransactions = JSON.parse(savedTransactions);
        }
      } catch (e) {
        console.error('Failed to load transactions from localStorage:', e);
      }
    }
    
    // Create a print-friendly document in the iframe
    if (printFrameRef.current) {
      const iframeDoc = printFrameRef.current.contentDocument;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Wallet Transaction Export</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  color: #333;
                  line-height: 1.5;
                  padding: 20px;
                }
                h1 {
                  color: #1E40AF;
                  font-size: 24px;
                  margin-bottom: 20px;
                  text-align: center;
                }
                .header {
                  display: flex;
                  justify-content: space-between;
                  margin-bottom: 30px;
                  border-bottom: 1px solid #e0e0e0;
                  padding-bottom: 10px;
                }
                .logo {
                  font-weight: bold;
                  font-size: 20px;
                  color: #1E40AF;
                }
                .date {
                  color: #666;
                }
                .summary {
                  background-color: #f8f9fa;
                  padding: 15px;
                  border-radius: 5px;
                  margin-bottom: 20px;
                }
                .summary h2 {
                  margin-top: 0;
                  color: #1E40AF;
                  font-size: 18px;
                }
                .summary-items {
                  display: flex;
                  justify-content: space-between;
                }
                .summary-item {
                  text-align: center;
                  padding: 0 10px;
                }
                .summary-value {
                  font-size: 18px;
                  font-weight: bold;
                }
                .summary-label {
                  font-size: 14px;
                  color: #666;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 20px;
                }
                th {
                  background-color: #f0f0f0;
                  padding: 10px;
                  text-align: left;
                  font-weight: bold;
                  border-bottom: 2px solid #ddd;
                }
                td {
                  padding: 10px;
                  border-bottom: 1px solid #ddd;
                }
                .transaction-type {
                  display: inline-block;
                  padding: 3px 8px;
                  border-radius: 4px;
                  font-size: 12px;
                }
                .send {
                  background-color: #EDF2FF;
                  color: #3B82F6;
                }
                .receive {
                  background-color: #ECFDF5;
                  color: #10B981;
                }
                .swap {
                  background-color: #FEF3C7;
                  color: #D97706;
                }
                .contract {
                  background-color: #F3E8FF;
                  color: #8B5CF6;
                }
                .status {
                  display: inline-block;
                  padding: 3px 8px;
                  border-radius: 4px;
                  font-size: 12px;
                }
                .completed {
                  background-color: #ECFDF5;
                  color: #10B981;
                }
                .pending {
                  background-color: #FEF3C7;
                  color: #D97706;
                }
                .failed {
                  background-color: #FEE2E2;
                  color: #EF4444;
                }
                .footer {
                  margin-top: 30px;
                  text-align: center;
                  font-size: 12px;
                  color: #666;
                  border-top: 1px solid #e0e0e0;
                  padding-top: 10px;
                }
                @media print {
                  body {
                    padding: 0;
                  }
                  button {
                    display: none;
                  }
                }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="logo">Crypto Wallet</div>
                <div class="date">Export Date: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
              </div>
              
              <h1>Transaction History</h1>
              
              ${currentTransactions.length > 0 ? `
                <div class="summary">
                  <h2>Summary</h2>
                  <div class="summary-items">
                    <div class="summary-item">
                      <div class="summary-value">${currentTransactions.length}</div>
                      <div class="summary-label">Total Transactions</div>
                    </div>
                    <div class="summary-item">
                      <div class="summary-value">${calculateTotalValue(currentTransactions)}</div>
                      <div class="summary-label">Total Value</div>
                    </div>
                    <div class="summary-item">
                      <div class="summary-value">${calculateTokenTotal(currentTransactions, 'ETH')}</div>
                      <div class="summary-label">Total ETH</div>
                    </div>
                    <div class="summary-item">
                      <div class="summary-value">${calculateTokenTotal(currentTransactions, 'BTC')}</div>
                      <div class="summary-label">Total BTC</div>
                    </div>
                  </div>
                </div>
                
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Value</th>
                      <th>Status</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${currentTransactions.map(tx => `
                      <tr>
                        <td>${tx.timestamp}</td>
                        <td>
                          <span class="transaction-type ${tx.type}">
                            ${tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                          </span>
                        </td>
                        <td>${tx.type === 'send' ? '-' : tx.type === 'receive' ? '+' : ''}${tx.amount} ${tx.token}</td>
                        <td>${tx.value}</td>
                        <td>
                          <span class="status ${tx.status}">
                            ${tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                          </span>
                        </td>
                        <td>${tx.description || ''}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              ` : `
                <div class="text-center py-8">
                  <p>No transactions to display. Start by sending or receiving crypto.</p>
                </div>
              `}
              
              <div class="footer">
                <p>This is an automatically generated report from your Crypto Wallet account. For any questions, please contact support.</p>
              </div>
              
              <script>
                // Automatically trigger print when loaded
                window.onload = function() {
                  window.print();
                  window.onafterprint = function() {
                    window.parent.postMessage('printComplete', '*');
                  };
                };
              </script>
            </body>
          </html>
        `);
        iframeDoc.close();
      }
    }
  };

  // Helper function to calculate total value from transactions
  const calculateTotalValue = (transactions) => {
    let total = 0;
    transactions.forEach(tx => {
      const value = parseFloat(tx.value.replace('$', '').replace(',', ''));
      if (!isNaN(value)) {
        if (tx.type === 'receive' || tx.type === 'contract') {
          total += value;
        } else if (tx.type === 'send') {
          total -= value;
        }
      }
    });
    return `$${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Helper function to calculate total amount of a specific token
  const calculateTokenTotal = (transactions, tokenType) => {
    let total = 0;
    transactions.forEach(tx => {
      if (tx.token === tokenType) {
        const amount = parseFloat(tx.amount.replace(',', ''));
        if (!isNaN(amount)) {
          if (tx.type === 'receive' || tx.type === 'contract') {
            total += amount;
          } else if (tx.type === 'send') {
            total -= amount;
          }
        }
      }
    });
    return `${total.toLocaleString(undefined, { minimumFractionDigits: tokenType === 'BTC' ? 8 : 6, maximumFractionDigits: tokenType === 'BTC' ? 8 : 6 })} ${tokenType}`;
  };

  // Listen for print complete message
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'printComplete') {
        setIsPrinting(false);
        setShowExportModal(false);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Transactions</h1>
            <p className="text-darkText">Manage and track your cryptocurrency transactions</p>
          </div>
          <button 
            onClick={() => setShowSendForm(true)}
            className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            Send Money
          </button>
        </div>
        
        {/* Risk Analysis Modal */}
        {showRiskModal && riskAnalysis && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <div className="relative bg-background rounded-lg shadow-xl max-w-md w-full p-6 z-10">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <span className={`mr-2 text-2xl ${
                  riskAnalysis.riskLevel === 'critical' ? 'text-red-500' :
                  riskAnalysis.riskLevel === 'high' ? 'text-orange-500' :
                  'text-yellow-500'
                }`}>⚠️</span>
                Transaction Risk Alert
              </h3>
              
              <div className="mb-4">
                <div className="text-sm text-darkText mb-2">Risk Level:</div>
                <div className={`inline-block px-3 py-1 rounded-full text-sm ${
                  riskAnalysis.riskLevel === 'critical' ? 'bg-red-900/20 text-red-400' :
                  riskAnalysis.riskLevel === 'high' ? 'bg-orange-900/20 text-orange-400' :
                  'bg-yellow-900/20 text-yellow-400'
                }`}>
                  {riskAnalysis.riskLevel.charAt(0).toUpperCase() + riskAnalysis.riskLevel.slice(1)}
                </div>
              </div>
              
              <div className="mb-4">
                <div className="text-sm text-darkText mb-2">Risk Score:</div>
                <div className="w-full bg-gray-800 h-3 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full ${
                      riskAnalysis.riskLevel === 'critical' ? 'bg-red-500' :
                      riskAnalysis.riskLevel === 'high' ? 'bg-orange-500' :
                      'bg-yellow-500'
                    }`}
                    style={{ width: `${riskAnalysis.riskScore}%` }}
                  ></div>
                </div>
                <div className="text-xs text-right mt-1 text-darkText">{Math.round(riskAnalysis.riskScore)}/100</div>
              </div>
              
              {intentAnalysis && (
                <div className="mb-4">
                  <div className="text-sm text-darkText mb-2">Predicted Purpose:</div>
                  <div className="bg-card/50 rounded p-3">
                    <div className="font-medium mb-1">{intentAnalysis.intent.replace(/_/g, ' ')}</div>
                    <div className="text-xs text-darkText">Confidence: {(intentAnalysis.confidence * 100).toFixed(0)}%</div>
                  </div>
                </div>
              )}
              
              <div className="mb-4">
                <div className="text-sm text-darkText mb-2">Risk Factors:</div>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  {riskAnalysis.explanation.map((reason, index) => (
                    <li key={index}>{reason}</li>
                  ))}
                </ul>
              </div>
              
              <div className="flex gap-2 justify-end">
                <button 
                  className="px-4 py-2 bg-card border border-gray-700 rounded text-white hover:border-primary transition-colors"
                  onClick={cancelTransaction}
                >
                  Cancel Transaction
                </button>
                <button 
                  className={`px-4 py-2 rounded text-white transition-colors ${
                    riskAnalysis.riskLevel === 'critical' ? 'bg-red-600 hover:bg-red-700' :
                    'bg-orange-600 hover:bg-orange-700'
                  }`}
                  onClick={proceedWithTransaction}
                >
                  Proceed Anyway
                </button>
              </div>
            </div>
          </div>
        )}
        
        {showSendForm && (
          <div className="card p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Send Money</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Recipient</label>
                  <select 
                    name="recipientId" 
                    value={formData.recipientId} 
                    onChange={handleInputChange}
                    className="w-full rounded-lg bg-card border border-gray-700 py-2 px-4 text-sm focus:outline-none focus:border-primary"
                    required
                  >
                    <option value="">Select a recipient</option>
                    {knownClients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.name} ({client.address}) - Credit Score: {client.creditScore}
                      </option>
                    ))}
                  </select>
                  
                  {formData.recipientId && (
                    <div className="mt-2 flex items-center">
                      <span className="text-sm mr-2">Credit Score:</span>
                      {(() => {
                        const recipient = knownClients.find(c => c.id === formData.recipientId);
                        if (!recipient) return null;
                        
                        // Determine credit score rating
                        let scoreColor = '';
                        let scoreRating = '';
                        
                        if (recipient.creditScore >= 750) {
                          scoreColor = 'text-green-400';
                          scoreRating = 'Excellent';
                        } else if (recipient.creditScore >= 700) {
                          scoreColor = 'text-green-300';
                          scoreRating = 'Good';
                        } else if (recipient.creditScore >= 650) {
                          scoreColor = 'text-yellow-400';
                          scoreRating = 'Fair';
                        } else if (recipient.creditScore >= 600) {
                          scoreColor = 'text-orange-400';
                          scoreRating = 'Below Average';
                        } else {
                          scoreColor = 'text-red-400';
                          scoreRating = 'Poor';
                        }
                        
                        return (
                          <div className="flex items-center">
                            <span className={`font-bold ${scoreColor}`}>{recipient.creditScore}</span>
                            <span className="mx-2">-</span>
                            <span className={`px-2 py-1 rounded text-xs ${scoreColor}`}>
                              {scoreRating}
                            </span>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>
                
                <div>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-medium">Amount</label>
                      <button
                        type="button"
                        onClick={toggleInputMode}
                        className="text-xs px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20"
                      >
                        Switch to {inputMode === 'usd' ? 'Crypto' : 'USD'}
                      </button>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="relative flex-grow">
                        <div className="absolute left-3 top-2.5">
                          {inputMode === 'usd' ? '$' : ''}
                        </div>
                        <input 
                          type="text" 
                          name="amount" 
                          value={formData.amount} 
                          onChange={handleInputChange}
                          placeholder="0.00"
                          className={`w-full rounded-lg bg-card border border-gray-700 py-2 text-sm focus:outline-none focus:border-primary ${inputMode === 'usd' ? 'pl-7 pr-4' : 'px-4'}`}
                          required
                        />
                        {convertedAmount && (
                          <div className="absolute right-3 top-2.5 text-darkText text-xs">
                            {convertedAmount}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <select 
                          name="token" 
                          value={formData.token} 
                          onChange={handleInputChange}
                          className="w-full rounded-lg bg-card border border-gray-700 py-2 px-4 text-sm focus:outline-none focus:border-primary"
                        >
                          <option value="ETH">ETH</option>
                          <option value="BTC">BTC</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Description (Purpose of Transaction)</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange}
                  placeholder="What is this payment for?"
                  className="w-full rounded-lg bg-card border border-gray-700 py-2 px-4 text-sm focus:outline-none focus:border-primary h-24 resize-none"
                  required
                ></textarea>
              </div>
              
              <div className="flex justify-end gap-2">
                <button type="button" className="btn bg-card border border-gray-700 hover:border-primary text-darkText hover:text-lightText" onClick={() => setShowSendForm(false)}>
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={isAnalyzingRisk}
                >
                  {isAnalyzingRisk ? 'Analyzing Risk...' : 'Send Money'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-6">
          {/* Transaction Chart Section */}
          <div className="bg-slate-900 p-6 rounded-xl shadow-lg mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Transaction Activity</h2>
            </div>
            <TransactionChart selectedCrypto="ETH" selectedTimeRange="1M" />
          </div>
          
          {/* Transaction categories summary */}
          <div className="card p-6">
            <h2 className="text-xl font-bold mb-6">Transaction Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {categoryStats.map((stat) => {
                const display = getCategoryDisplay(stat.category);
                return (
                  <div key={stat.category} className="card bg-card/80 hover:bg-card/60 transition-colors p-5 rounded-xl shadow-md">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl">
                        {display.emoji}
                      </div>
                      <span className="font-semibold text-lg">{display.label}</span>
                    </div>
                    <div className="text-2xl font-bold mb-2">{stat.value}</div>
                    <div className="flex justify-between text-sm text-darkText mb-2">
                      <span>{stat.count} transactions</span>
                      <span>{stat.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-primary h-full rounded-full" 
                        style={{ width: `${stat.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Filters section */}
          <div className="card">
            <div className="flex flex-wrap gap-4 justify-between items-center">
              <div className="flex gap-2">
                <button className="btn-primary">All</button>
                <button className="btn bg-card border border-gray-700 hover:border-primary text-darkText hover:text-lightText">Sent</button>
                <button className="btn bg-card border border-gray-700 hover:border-primary text-darkText hover:text-lightText">Received</button>
                <button className="btn bg-card border border-gray-700 hover:border-primary text-darkText hover:text-lightText">Swaps</button>
              </div>
              
              <div className="flex gap-2">
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Search transactions" 
                    className="rounded-lg bg-card border border-gray-700 py-2 px-4 text-sm focus:outline-none focus:border-primary"
                  />
                  <span className="absolute right-3 top-2.5">🔍</span>
                </div>
                <button className="btn bg-card border border-gray-700 hover:border-primary text-darkText hover:text-lightText">
                  Filter
                </button>
                <button 
                  className="btn bg-card border border-gray-700 hover:border-primary text-darkText hover:text-lightText"
                  onClick={handleExport}
                >
                  Export
                </button>
              </div>
            </div>
          </div>
          
          {/* Transaction list - full width */}
          <div>
            <RecentTransactions />
          </div>
        </div>
      </div>
      
      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-card rounded-xl shadow-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Export Transactions</h3>
            
            <div className="mb-4">
              <p className="text-darkText mb-4">Generate a PDF report of your recent transactions. Choose your export options below:</p>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span>Include transaction summary</span>
                </label>
                
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span>Include transaction details</span>
                </label>
                
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" defaultChecked />
                  <span>Include transaction categories</span>
                </label>
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <button 
                className="btn bg-card border border-gray-700 hover:border-primary text-darkText hover:text-lightText"
                onClick={() => setShowExportModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-primary flex items-center"
                onClick={generatePDF}
                disabled={isPrinting}
              >
                {isPrinting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  'Generate PDF'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Hidden iframe for PDF generation and printing */}
      <iframe 
        ref={printFrameRef}
        className="hidden"
        title="Print Frame"
      />
    </main>
  );
} 