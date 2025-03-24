import api from './api';
import { Transaction } from '../components/RecentTransactions';
import { v4 as uuidv4 } from 'uuid';

// Local storage keys
const CREDIT_SCORE_KEY = 'zkreditScore';
const TRANSACTION_HISTORY_KEY = 'walletTransactions';

// Wallet address used throughout the app
const WALLET_ADDRESS = '0x71C7656EC7ab88b098defB751B7401B5f6d8976F';

// Event name for transaction updates
export const TRANSACTION_PROCESSED_EVENT = 'transaction-processed';

/**
 * Creates a new transaction with risk assessment
 */
export async function createTransactionWithRisk(
  type: 'send' | 'receive' | 'swap' | 'contract',
  amount: number,
  token: string = 'ETH',
  address: string,
  description?: string
): Promise<Transaction> {
  // Format amount with 2 decimal places
  const formattedAmount = amount.toFixed(2);
  
  // Calculate USD value (simplified)
  const tokenToUsdRate = token === 'ETH' ? 2490.78 : token === 'BTC' ? 72971.65 : token === 'NFT' ? 132.12 : 1;
  const usdValue = (amount * tokenToUsdRate).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD'
  });
  
  // Extract the USD amount as a number for wallet balance updates
  const usdAmount = amount * tokenToUsdRate;
  
  // Generate random gas used between 0.001 and 0.02 ETH
  const gasUsed = (Math.random() * 0.019 + 0.001).toFixed(5);
  
  // Create base transaction
  const transaction: Transaction = {
    id: uuidv4(),
    type,
    status: 'completed',
    amount: formattedAmount,
    token,
    value: usdValue,
    address,
    timestamp: new Date().toLocaleString(),
    gasUsed: `${gasUsed} ETH`,
    description
  };
  
  // Update wallet balance based on transaction type
  if (typeof window !== 'undefined' && (window as any).updateWalletBalance) {
    // Get current balance from localStorage
    const currentBalanceStr = localStorage.getItem('walletBalance');
    if (currentBalanceStr) {
      const currentBalance = parseFloat(currentBalanceStr);
      let newBalance = currentBalance;
      
      // Adjust balance based on transaction type
      if (type === 'send') {
        newBalance -= usdAmount; // Outgoing transaction reduces balance
      } else if (type === 'receive') {
        newBalance += usdAmount; // Incoming transaction increases balance
      }
      
      // Update the wallet balance
      (window as any).updateWalletBalance(newBalance);
    }
  }
  
  // If it's a send transaction, analyze the risk and update credit score
  if (type === 'send') {
    try {
      // We now analyze risk based on multiple factors similar to the backend's flagger system:
      // 1. Transaction amount (high amounts are riskier)
      // 2. Recipient address (certain patterns indicate higher risk)
      // 3. Description content (certain keywords indicate higher risk)
      // 4. Time patterns (unusual times might indicate higher risk)
      
      // Calculate risk based on amount
      let amountRisk = 0;
      if (amount > 10) amountRisk = 20;
      if (amount > 50) amountRisk = 40;
      if (amount > 100) amountRisk = 60;
      if (amount > 1000) amountRisk = 80;
      
      // Calculate risk based on address
      let addressRisk = 0;
      // Simplified version of address risk analysis
      // In the real backend, we would check against known fraudulent addresses
      if (address.toLowerCase().includes('0x0000')) addressRisk = 70;
      if (address.length < 10) addressRisk = 50; // Shortened addresses might indicate obfuscation
      
      // Calculate risk based on description
      let descriptionRisk = 0;
      const riskKeywords = ['drugs', 'illegal', 'anonymous', 'mixer', 'tumbler', 'wash', 'launder'];
      if (description) {
        const lowercaseDesc = description.toLowerCase();
        for (const keyword of riskKeywords) {
          if (lowercaseDesc.includes(keyword)) {
            descriptionRisk = 95; // High risk for suspicious descriptions
            break;
          }
        }
      }
      
      // Calculate overall risk
      const overallRiskScore = Math.max(amountRisk, addressRisk, descriptionRisk);
      
      // Determine risk level
      let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
      if (overallRiskScore > 20 && overallRiskScore <= 40) {
        riskLevel = 'medium';
      } else if (overallRiskScore > 40 && overallRiskScore <= 75) {
        riskLevel = 'high';
      } else if (overallRiskScore > 75) {
        riskLevel = 'critical';
      }
      
      // Add risk info to transaction
      transaction.riskLevel = riskLevel;
      transaction.riskScore = overallRiskScore;
      
      // Update credit score based on transaction risk
      await updateCreditScoreFromTransaction(transaction);
      
      // Notify listeners about the transaction
      notifyTransactionProcessed(transaction);
    } catch (error) {
      console.error('Error analyzing transaction risk:', error);
    }
  }

  return transaction;
}

/**
 * Updates the credit score based on a transaction
 */
export async function updateCreditScoreFromTransaction(transaction: Transaction): Promise<void> {
  try {
    // Get the current credit score
    let currentScore = await getCachedCreditScore();
    
    if (!currentScore) {
      // If no cached score, fetch from API
      currentScore = await api.getCreditScore(WALLET_ADDRESS);
    }
    
    // Calculate score adjustment based on transaction risk
    let scoreAdjustment = 0;
    
    if (transaction.riskLevel === 'critical') {
      // Significant negative impact for critical risk transactions
      scoreAdjustment = -15;
    } else if (transaction.riskLevel === 'high') {
      // Moderate negative impact for high risk transactions
      scoreAdjustment = -8;
    } else if (transaction.riskLevel === 'medium') {
      // Small negative impact for medium risk transactions
      scoreAdjustment = -3;
    } else {
      // Slight positive impact for low risk transactions
      scoreAdjustment = 1;
    }
    
    // Apply adjustment to credit score
    const newScore = Math.max(300, Math.min(850, currentScore.score + scoreAdjustment));
    
    // Update the cached score
    const updatedScore = {
      ...currentScore,
      score: newScore,
      lastUpdated: new Date().toISOString()
    };
    
    // Update factors based on risk level
    if (transaction.riskLevel === 'high' || transaction.riskLevel === 'critical') {
      // Add negative factor
      updatedScore.factors.negative = [
        'Recent high-risk transaction detected',
        ...updatedScore.factors.negative.filter(f => f !== 'Recent high-risk transaction detected')
      ].slice(0, 3); // Keep maximum 3 negative factors
    }
    
    // Cache the updated score
    localStorage.setItem(CREDIT_SCORE_KEY, JSON.stringify(updatedScore));
    
    // Update any UI elements that display the credit score
    if (typeof window !== 'undefined' && (window as any).updateCreditScore) {
      (window as any).updateCreditScore(updatedScore);
    }
  } catch (error) {
    console.error('Error updating credit score:', error);
  }
}

/**
 * Gets the cached credit score or fetches a new one
 */
export async function getCachedCreditScore() {
  try {
    const cachedScore = localStorage.getItem(CREDIT_SCORE_KEY);
    
    if (cachedScore) {
      return JSON.parse(cachedScore);
    }
    
    // If no cached score, fetch from API
    const score = await api.getCreditScore(WALLET_ADDRESS);
    localStorage.setItem(CREDIT_SCORE_KEY, JSON.stringify(score));
    return score;
  } catch (error) {
    console.error('Error getting credit score:', error);
    return null;
  }
}

/**
 * Notify listeners that a transaction has been processed
 * @param transaction The transaction that was processed
 */
export const notifyTransactionProcessed = (transaction: Transaction) => {
  // Dispatch a custom event with the transaction data
  if (typeof window !== 'undefined') {
    const event = new CustomEvent(TRANSACTION_PROCESSED_EVENT, { 
      detail: { transaction } 
    });
    window.dispatchEvent(event);
  }
};

/**
 * Generates a set of test transactions with various risk levels to demonstrate
 * the flagging system for potentially fraudulent activities
 */
export function generateTestTransactions() {
  const transactions: Transaction[] = [];
  let totalBalanceChange = 0; // Track the total balance change
  
  // Critical risk transaction - potentially fraudulent
  transactions.push({
    id: uuidv4(),
    type: 'send',
    status: 'completed',
    amount: '7.51',
    token: 'ETH',
    value: '$18,786.16',
    address: '0x45A...9f7C',
    timestamp: new Date().toLocaleString(),
    gasUsed: '0.00483 ETH',
    description: 'Groceries',
    riskLevel: 'critical',
    riskScore: 85
  });
  totalBalanceChange -= 18786.16; // Deduct amount from balance
  
  // Send transaction (medium risk)
  transactions.push({
    id: uuidv4(),
    type: 'send',
    status: 'completed',
    amount: '5.78',
    token: 'ETH',
    value: '$14,396.71',
    address: '0x71C...8e3B',
    timestamp: new Date().toLocaleString(),
    gasUsed: '0.01468 ETH',
    description: 'Transfer to new wallet',
    riskLevel: 'medium',
    riskScore: 35
  });
  totalBalanceChange -= 14396.71; // Deduct amount from balance
  
  // High risk transaction - large amount to unknown address
  transactions.push({
    id: uuidv4(),
    type: 'send',
    status: 'completed',
    amount: '2.35',
    token: 'ETH',
    value: '$5,853.33',
    address: '0xf9A82CeD431b8F22BC5b92d5f9929420175Fc2a7',
    timestamp: new Date().toLocaleString(),
    gasUsed: '0.01843 ETH',
    description: 'Investment in new protocol',
    riskLevel: 'high',
    riskScore: 65
  });
  totalBalanceChange -= 5853.33; // Deduct amount from balance
  
  // Safe transaction (low risk)
  transactions.push({
    id: uuidv4(),
    type: 'send',
    status: 'completed',
    amount: '0.45',
    token: 'ETH',
    value: '$1,120.85',
    address: '0x3a2D3F8825B5d9a6bEcBEA54E8E53F726f7e46d9',
    timestamp: new Date().toLocaleString(),
    gasUsed: '0.00845 ETH',
    description: 'Monthly rent payment',
    riskLevel: 'low',
    riskScore: 15
  });
  totalBalanceChange -= 1120.85; // Deduct amount from balance
  
  // Receive transaction (no risk)
  transactions.push({
    id: uuidv4(),
    type: 'receive',
    status: 'completed',
    amount: '0.12',
    token: 'BTC',
    value: '$8,756.60',
    address: '0x8f26D3b31C3F6022a91fC0D16BE8Cba6A5E24E3F',
    timestamp: new Date().toLocaleString(),
    gasUsed: '0.01583 ETH',
    description: 'Payment for consulting services',
  });
  totalBalanceChange += 8756.60; // Add amount to balance
  
  // Add all transactions to global list and local storage
  transactions.forEach(tx => {
    // Add transaction to the global list
    if (typeof window !== 'undefined') {
      const addTransaction = (window as any).addTransaction;
      if (typeof addTransaction === 'function') {
        addTransaction(tx);
      }
    }
  });
  
  // Update the wallet balance
  if (typeof window !== 'undefined' && (window as any).updateWalletBalance) {
    // Get current balance from localStorage
    const currentBalanceStr = localStorage.getItem('walletBalance');
    if (currentBalanceStr) {
      const currentBalance = parseFloat(currentBalanceStr);
      // Apply the total balance change from all transactions
      const newBalance = currentBalance + totalBalanceChange;
      // Update the wallet balance
      (window as any).updateWalletBalance(newBalance);
    }
  }
  
  return transactions;
} 