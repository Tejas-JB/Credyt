"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchCryptoPrices, CryptoData } from '../utils/cryptoApi';

interface Token {
  id: string;
  name: string;
  symbol: string;
  amount: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  priceHistory: number[];
  websiteUrl: string; // URL for price data
}

// Simulated scraped data from websites
interface ScrapedPriceData {
  price: number;
  changePercent: number;
}

// CoinMarketCap API response interfaces
interface CMCQuote {
  price: number;
  percent_change_24h: number;
}

interface CMCCurrency {
  id: number;
  name: string;
  symbol: string;
  quote: {
    USD: CMCQuote;
  };
}

interface CMCApiResponse {
  data: {
    [symbol: string]: CMCCurrency;
  };
}

export default function TokenHoldings() {
  const [tokens, setTokens] = useState<Token[]>([
    {
      id: '1',
      name: 'Ethereum',
      symbol: 'ETH',
      amount: '12.45',
      value: '$24,907.84',
      change: '+1.1%',
      trend: 'up',
      priceHistory: [1950, 1965, 1980, 1975, 1990, 2000, 2010, 2005, 2013, 2015],
      websiteUrl: 'https://finance.yahoo.com/quote/ETH-USD/',
    },
    {
      id: '2',
      name: 'Bitcoin',
      symbol: 'BTC',
      amount: '0.85',
      value: '$72,971.65',
      change: '+2.5%',
      trend: 'up',
      priceHistory: [60200, 60500, 60800, 61000, 61050, 61100, 61150, 61175, 61190, 61199],
      websiteUrl: 'https://finance.yahoo.com/quote/BTC-USD/',
    },
    {
      id: '3',
      name: 'NFT Index',
      symbol: 'NFT',
      amount: '25.00',
      value: '$3,303.00',
      change: '+2.9%',
      trend: 'up',
      priceHistory: [76, 75, 74, 73.5, 73, 72.5, 71.8, 72, 72.2, 75],
      websiteUrl: 'https://finance.yahoo.com/quote/SOL-USD/', // Using Solana as proxy for NFT index
    },
  ]);

  const [activeTokenGraph, setActiveTokenGraph] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastPrices, setLastPrices] = useState<{[key: string]: number}>({});

  // Function to fetch crypto prices using the new API utility
  const fetchCryptoPricesFromAPI = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Create a copy of current tokens to update
      const updatedTokens = [...tokens];
      const currentLastPrices = {...lastPrices};
      
      // Fetch cryptocurrency data from the API
      const cryptoData = await fetchCryptoPrices(['bitcoin', 'ethereum', 'solana']); // Solana as proxy for NFT
      
      if (cryptoData) {
        // Update each token with the fetched data
        for (let i = 0; i < updatedTokens.length; i++) {
          const token = updatedTokens[i];
          const symbol = token.symbol;
          
          // Map token symbols to API IDs
          let apiId: string;
          switch (symbol) {
            case 'BTC':
              apiId = 'bitcoin';
              break;
            case 'ETH':
              apiId = 'ethereum';
              break;
            case 'NFT':
              apiId = 'solana'; // Using Solana as proxy for NFT index
              break;
            default:
              continue; // Skip if unknown symbol
          }
          
          if (cryptoData[apiId]) {
            const coinData = cryptoData[apiId];
            const price = coinData.price;
            const changePercent = coinData.price_change_percentage_24h;
            
            // Save the current price as "last price" for the next update
            if (!currentLastPrices[symbol]) {
              currentLastPrices[symbol] = price;
            }
            
            // Calculate new value based on token amount and current price
            const amount = parseFloat(token.amount.replace(',', ''));
            const newValue = amount * price;
            
            // Update token with API data
            updatedTokens[i] = {
              ...token,
              value: `$${newValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              change: `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(1)}%`,
              trend: changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'neutral',
              // Add new price point to price history
              priceHistory: [...token.priceHistory.slice(-19), price]
            };
            
            // Update last price
            currentLastPrices[symbol] = price;
          }
        }
      }
      
      // Update tokens state
      setTokens(updatedTokens);
      setLastPrices(currentLastPrices);
      
      // Calculate and update total value
      const totalValue = updatedTokens.reduce((sum, token) => {
        const value = parseFloat(token.value.replace('$', '').replace(',', ''));
        return sum + value;
      }, 0);
      
      // Update the total value in the DOM
      const totalValueEl = document.getElementById('total-value');
      if (totalValueEl) {
        totalValueEl.textContent = `$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
      
    } catch (error) {
      console.error('Error fetching cryptocurrency prices:', error);
      setError('Failed to fetch latest cryptocurrency prices');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch of prices
    fetchCryptoPricesFromAPI();
    
    // Calculate initial total value immediately based on initial token values
    const initialTotalValue = tokens.reduce((sum, token) => {
      const value = parseFloat(token.value.replace('$', '').replace(',', ''));
      return sum + value;
    }, 0);
    
    // Update the total value in the DOM immediately
    const totalValueEl = document.getElementById('total-value');
    if (totalValueEl) {
      totalValueEl.textContent = `$${initialTotalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    
    // Set up interval for periodic updates
    const interval = setInterval(() => {
      fetchCryptoPricesFromAPI();
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  const toggleTokenGraph = (tokenId: string) => {
    if (activeTokenGraph === tokenId) {
      setActiveTokenGraph(null);
    } else {
      setActiveTokenGraph(tokenId);
    }
  };

  // Chart renderer
  const renderMiniChart = (data: number[], trend: 'up' | 'down' | 'neutral') => {
    const width = 100;
    const height = 30;
    const color = trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : '#6B7280';
    
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    
    const points = data.map((value, index) => ({
      x: (index / (data.length - 1)) * width,
      y: height - ((value - min) / range) * height
    }));
    
    const path = `M${points.map(p => `${p.x},${p.y}`).join(' L')}`;
    
    return (
      <svg width={width} height={height} className="overflow-visible">
        <path d={path} fill="none" stroke={color} strokeWidth="1.5" />
      </svg>
    );
  };

  // Calculate total value for display
  const calculateTotalValue = () => {
    const total = tokens.reduce((sum, token) => {
      // Extract numeric value by removing $ and commas
      const numericValue = parseFloat(token.value.replace('$', '').replace(/,/g, ''));
      return sum + numericValue;
    }, 0);
    
    return total.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="card h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Token Holdings</h2>
        <button 
          className={`text-xs px-3 py-1 rounded-md ${isLoading ? 'bg-primary/20 text-primary/50' : 'bg-primary/10 text-primary hover:bg-primary/20'}`}
          onClick={fetchCryptoPricesFromAPI}
          disabled={isLoading}
        >
          {isLoading ? 'Updating...' : 'Refresh Prices'}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-2 bg-danger/10 text-danger text-sm rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {tokens.map((token) => (
          <div key={token.id} className="rounded-lg transition-colors">
            <div className="flex items-center justify-between p-3 hover:bg-card/60 cursor-pointer" onClick={() => toggleTokenGraph(token.id)}>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mr-3 font-medium">
                  {token.symbol.charAt(0)}
                </div>
                <div>
                  <div className="font-medium">{token.name}</div>
                  <div className="text-darkText text-sm">{token.amount} {token.symbol}</div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-medium">{token.value}</div>
                <div className={`text-sm ${
                  token.trend === 'up' ? 'text-accent' : 
                  token.trend === 'down' ? 'text-danger' : 
                  'text-darkText'
                }`}>
                  {token.change}
                </div>
              </div>
            </div>
            
            {activeTokenGraph === token.id && (
              <div className="p-3 bg-card/30 rounded-b-lg border-t border-gray-800">
                <div className="mb-2">
                  {renderMiniChart(token.priceHistory, token.trend)}
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-darkText">30-day price history</span>
                  <Link 
                    href={token.websiteUrl} 
                    target="_blank"
                    className="text-xs px-3 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20"
                  >
                    View on Yahoo
                  </Link>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-800">
        <div className="flex justify-between mb-4">
          <span className="text-darkText">Total Value:</span>
          <span id="total-value" className="font-bold">{calculateTotalValue()}</span>
        </div>
      </div>
    </div>
  );
} 