// Mock API client to simulate backend responses during development
import { 
  CreditScoreResponse, 
  TransactionRiskResponse, 
  TransactionIntentResponse,
  WalletAnalysisResponse
} from './apiClient';

// Credit score API
export const getMockCreditScore = (walletAddress: string): CreditScoreResponse => {
  // Calculate a deterministic score based on wallet address
  const addressNum = parseInt(walletAddress.slice(-4), 16) || 500;
  const score = ((addressNum % 300) + 550);
  
  return {
    score,
    maxScore: 850,
    factors: {
      positive: [
        'Consistent transaction history',
        'Good token diversity',
        'No suspicious activities detected',
        'Wallet age over 180 days'
      ],
      negative: score < 700 ? [
        'Limited interaction with established protocols',
        'Recent high-value transfers',
        'Transaction volume volatility'
      ] : []
    },
    lastUpdated: new Date().toISOString()
  };
};

// Transaction risk analysis
export const analyzeMockTransactionRisk = (
  senderAddress: string,
  recipientAddress: string,
  amount: number,
  token: string
): TransactionRiskResponse => {
  // Base risk score on transaction amount and recipient
  const recipientRisk = parseInt(recipientAddress.slice(-2), 16) % 100 / 100;
  const amountRisk = Math.min(amount / 10000, 1);
  const riskScore = Math.min((recipientRisk * 0.7 + amountRisk * 0.3) * 100, 100);
  
  let riskLevel: 'low' | 'medium' | 'high' | 'critical';
  
  if (riskScore < 25) {
    riskLevel = 'low';
  } else if (riskScore < 50) {
    riskLevel = 'medium';
  } else if (riskScore < 75) {
    riskLevel = 'high';
  } else {
    riskLevel = 'critical';
  }
  
  const explanation = [];
  const flaggedFeatures = [];
  
  if (amount > 1000) {
    explanation.push('The transaction amount is unusually large');
    flaggedFeatures.push({
      feature: 'transaction_value',
      value: amount,
      threshold: 1000
    });
  }
  
  if (recipientRisk > 0.5) {
    explanation.push('The recipient address has limited transaction history');
    flaggedFeatures.push({
      feature: 'recipient_reputation',
      value: recipientRisk * 100,
      threshold: 50
    });
  }
  
  if (riskLevel === 'low') {
    explanation.push('No significant risk factors detected');
  }
  
  return {
    riskScore,
    riskLevel,
    explanation,
    flaggedFeatures: flaggedFeatures.length > 0 ? flaggedFeatures : undefined
  };
};

// Transaction intent prediction
export const predictMockTransactionIntent = (
  senderAddress: string,
  recipientAddress: string,
  amount: number
): TransactionIntentResponse => {
  // Determine intent based on transaction characteristics
  let intent: string;
  let confidence: number;
  const reasons: string[] = [];
  
  if (amount < 0.01) {
    intent = 'gas_fee_payment';
    confidence = 0.92;
    reasons.push('Very small transaction amount typical of gas fee payments');
  } else if (amount < 0.1) {
    intent = 'donation';
    confidence = 0.75;
    reasons.push('Small round amount typical of donations');
  } else if (amount > 10 && amount % 1 === 0) {
    intent = 'payment_for_goods_or_services';
    confidence = 0.85;
    reasons.push('Clean round number typical of payment for services');
  } else if (0.1 <= amount && amount <= 5) {
    intent = 'NFT_purchase';
    confidence = 0.82;
    reasons.push('Amount falls within common NFT price range');
  } else {
    intent = 'transfer_between_wallets';
    confidence = 0.65;
    reasons.push('Transaction characteristics suggest a transfer between owned wallets');
  }
  
  // Add a second reason
  if (senderAddress.slice(0, 4) === recipientAddress.slice(0, 4)) {
    reasons.push('Sender and recipient have similar wallet patterns');
    if (intent === 'transfer_between_wallets') {
      confidence += 0.15;
    }
  }
  
  return {
    intent,
    confidence: Math.min(confidence, 0.98),
    reasons
  };
};

// Complete wallet analysis
export const getMockWalletAnalysis = (walletAddress: string): WalletAnalysisResponse => {
  const creditScore = getMockCreditScore(walletAddress);
  
  // Determine risk profile based on credit score
  let overallRisk: 'low' | 'medium' | 'high';
  const details: string[] = [];
  
  if (creditScore.score > 750) {
    overallRisk = 'low';
    details.push(
      'Long history of responsible transactions',
      'No interactions with known suspicious addresses',
      'Consistent transaction patterns'
    );
  } else if (creditScore.score > 650) {
    overallRisk = 'medium';
    details.push(
      'Some interactions with newer protocols',
      'Occasional high-value transactions',
      'Moderate token diversity'
    );
  } else {
    overallRisk = 'high';
    details.push(
      'Limited transaction history',
      'Interactions with addresses of concern',
      'Unusual transaction patterns'
    );
  }
  
  // Wallet stats based on address
  const addressNum = parseInt(walletAddress.slice(-4), 16) || 500;
  const age = 30 + (addressNum % 1000);
  const transactionCount = 10 + (addressNum % 500);
  const averageValue = 50 + (addressNum % 1000);
  const totalVolume = averageValue * transactionCount;
  
  return {
    creditScore,
    riskProfile: {
      overallRisk,
      details
    },
    walletStats: {
      age,
      transactionCount,
      averageValue,
      totalVolume
    }
  };
};

// Mock API client
const mockApiClient = {
  getCreditScore: getMockCreditScore,
  analyzeTransactionRisk: analyzeMockTransactionRisk,
  predictTransactionIntent: predictMockTransactionIntent,
  getWalletAnalysis: getMockWalletAnalysis
};

export default mockApiClient; 