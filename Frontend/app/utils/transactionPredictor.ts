/**
 * Utility to predict transaction categories based on description text
 */

// List of keywords associated with different transaction categories
const categoryKeywords = {
  business: [
    'invoice', 'payment', 'service', 'client', 'contract', 'consulting', 
    'freelance', 'project', 'business', 'work', 'professional', 'vendor',
    'subscription', 'development'
  ],
  personal: [
    'rent', 'utilities', 'groceries', 'food', 'restaurant', 'shopping',
    'entertainment', 'movie', 'coffee', 'dinner', 'lunch', 'gift', 'donation',
    'charity', 'family', 'friend', 'personal'
  ],
  investment: [
    'investment', 'stock', 'portfolio', 'dividend', 'yield', 'return',
    'stake', 'defi', 'protocol', 'liquidity', 'pool', 'farm', 'staking',
    'interest', 'lending', 'borrow', 'loan', 'collateral', 'nft', 'token'
  ],
  trading: [
    'trade', 'swap', 'exchange', 'buy', 'sell', 'trading', 'arbitrage',
    'market', 'limit', 'price', 'position', 'leverage', 'long', 'short'
  ]
};

// Transaction prediction types
export type TransactionCategory = 'business' | 'personal' | 'investment' | 'trading' | 'unknown';

/**
 * Predicts the transaction category based on the description
 * 
 * @param description The transaction description
 * @returns The predicted transaction category
 */
export function predictTransactionCategory(description: string): TransactionCategory {
  if (!description) return 'unknown';
  
  const lowerDescription = description.toLowerCase();
  
  // Count occurrences of keywords from each category
  const scores: Record<TransactionCategory, number> = {
    business: 0,
    personal: 0,
    investment: 0,
    trading: 0,
    unknown: 0
  };
  
  // Calculate score for each category
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (lowerDescription.includes(keyword)) {
        scores[category as TransactionCategory] += 1;
      }
    }
  }
  
  // Find the category with the highest score
  let highestCategory: TransactionCategory = 'unknown';
  let highestScore = 0;
  
  for (const category of Object.keys(scores) as TransactionCategory[]) {
    if (scores[category] > highestScore) {
      highestScore = scores[category];
      highestCategory = category;
    }
  }
  
  // If no significant match found, return 'unknown'
  if (highestScore === 0) {
    return 'unknown';
  }
  
  return highestCategory;
}

/**
 * Gets an emoji and label for a transaction category
 * 
 * @param category The transaction category
 * @returns Object containing emoji and label for the category
 */
export function getCategoryDisplay(category: TransactionCategory): { emoji: string; label: string } {
  switch (category) {
    case 'business':
      return { emoji: '💼', label: 'Business' };
    case 'personal':
      return { emoji: '🏠', label: 'Personal' };
    case 'investment':
      return { emoji: '📈', label: 'Investment' };
    case 'trading':
      return { emoji: '🔄', label: 'Trading' };
    case 'unknown':
    default:
      return { emoji: '❓', label: 'Other' };
  }
} 