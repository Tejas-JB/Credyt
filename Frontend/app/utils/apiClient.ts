// API client for communicating with the ZKredit backend services

// Base API URL - change for production
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Types
export interface CreditScoreResponse {
  score: number;
  maxScore: number;
  factors: {
    positive: string[];
    negative: string[];
  };
  lastUpdated: string;
}

export interface TransactionRiskResponse {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  explanation: string[];
  flaggedFeatures?: {
    feature: string;
    value: number;
    threshold: number;
  }[];
}

export interface TransactionIntentResponse {
  intent: string;
  confidence: number;
  reasons: string[];
}

export interface WalletAnalysisResponse {
  creditScore: CreditScoreResponse;
  riskProfile: {
    overallRisk: 'low' | 'medium' | 'high';
    details: string[];
  };
  walletStats: {
    age: number;
    transactionCount: number;
    averageValue: number;
    totalVolume: number;
  };
}

// Utility function for API requests
const fetchFromApi = async <T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  const response = await fetch(url, { ...defaultOptions, ...options });
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API Error (${response.status}): ${errorText}`);
  }
  
  return response.json() as Promise<T>;
};

// Credit score API
export const getCreditScore = async (walletAddress: string): Promise<CreditScoreResponse> => {
  return fetchFromApi<CreditScoreResponse>(`/credit-score?wallet=${walletAddress}`);
};

// Transaction risk analysis
export const analyzeTransactionRisk = async (
  senderAddress: string,
  recipientAddress: string,
  amount: number,
  token: string
): Promise<TransactionRiskResponse> => {
  return fetchFromApi<TransactionRiskResponse>('/transaction-risk', {
    method: 'POST',
    body: JSON.stringify({
      sender: senderAddress,
      recipient: recipientAddress,
      value: amount,
      token
    })
  });
};

// Transaction intent prediction
export const predictTransactionIntent = async (
  senderAddress: string,
  recipientAddress: string,
  amount: number
): Promise<TransactionIntentResponse> => {
  return fetchFromApi<TransactionIntentResponse>('/transaction-intent', {
    method: 'POST',
    body: JSON.stringify({
      sender: senderAddress,
      recipient: recipientAddress,
      value: amount
    })
  });
};

// Complete wallet analysis
export const getWalletAnalysis = async (walletAddress: string): Promise<WalletAnalysisResponse> => {
  return fetchFromApi<WalletAnalysisResponse>(`/wallet-analysis?wallet=${walletAddress}`);
};

// Export the API client
const apiClient = {
  getCreditScore,
  analyzeTransactionRisk,
  predictTransactionIntent,
  getWalletAnalysis
};

export default apiClient; 