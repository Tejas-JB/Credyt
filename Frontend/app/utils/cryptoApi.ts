// Interface for cryptocurrency data
export interface CryptoData {
  id: string;
  symbol: string;
  name: string;
  price: number;
  price_change_percentage_24h: number;
  last_updated: string;
}

// Cache mechanism to avoid excessive API calls
const cache: {
  data: { [symbol: string]: CryptoData };
  timestamp: number;
  expiryTime: number;
} = {
  data: {},
  timestamp: 0,
  expiryTime: 60000, // Cache expires after 1 minute
};

/**
 * Fetch cryptocurrency data from CoinGecko API
 * @param symbols Array of cryptocurrency symbols (e.g., ["btc", "eth"])
 * @returns Object with cryptocurrency data
 */
export async function fetchCryptoPrices(symbols: string[] = ['bitcoin', 'ethereum']): Promise<{ [symbol: string]: CryptoData }> {
  // Convert symbols to lowercase and join with commas
  const normalizedSymbols = symbols.map(s => s.toLowerCase()).join(',');
  
  // Check if cache is still valid
  const now = Date.now();
  if (cache.timestamp > 0 && now - cache.timestamp < cache.expiryTime) {
    // Return cached data if all requested symbols are in cache
    const allSymbolsInCache = symbols.every(symbol => 
      cache.data[symbol.toLowerCase()] !== undefined
    );
    
    if (allSymbolsInCache) {
      console.log('Using cached cryptocurrency data');
      return cache.data;
    }
  }
  
  try {
    // Fetch data from CoinGecko API
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${normalizedSymbols}&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=24h`
    );
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Process and store the data in the format we need
    const result: { [symbol: string]: CryptoData } = {};
    data.forEach((coin: any) => {
      result[coin.id] = {
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        price: coin.current_price,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        last_updated: coin.last_updated,
      };
    });
    
    // Update cache
    cache.data = result;
    cache.timestamp = now;
    
    return result;
  } catch (error) {
    console.error('Error fetching cryptocurrency prices:', error);
    
    // If API call fails, return cached data if available
    if (Object.keys(cache.data).length > 0) {
      console.log('Using cached data due to API error');
      return cache.data;
    }
    
    // If no cached data, return fallback data
    return {
      bitcoin: {
        id: 'bitcoin',
        symbol: 'BTC',
        name: 'Bitcoin',
        price: 61199.33,
        price_change_percentage_24h: 0.5,
        last_updated: new Date().toISOString(),
      },
      ethereum: {
        id: 'ethereum',
        symbol: 'ETH',
        name: 'Ethereum',
        price: 2013.75,
        price_change_percentage_24h: 1.3,
        last_updated: new Date().toISOString(),
      },
    };
  }
}

/**
 * Get token price in USD
 * @param symbol Token symbol (e.g., "BTC", "ETH")
 * @returns Price in USD
 */
export async function getTokenPrice(symbol: string): Promise<number> {
  const normalizedSymbol = symbol.toLowerCase();
  let id = normalizedSymbol === 'btc' ? 'bitcoin' : normalizedSymbol === 'eth' ? 'ethereum' : normalizedSymbol;
  
  try {
    const data = await fetchCryptoPrices([id]);
    return data[id]?.price || 0;
  } catch (error) {
    console.error(`Error getting price for ${symbol}:`, error);
    return normalizedSymbol === 'btc' ? 61199.33 : normalizedSymbol === 'eth' ? 2013.75 : 0;
  }
} 