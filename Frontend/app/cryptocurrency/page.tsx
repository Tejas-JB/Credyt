"use client";

import React, { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import TransactionChart from '../components/TransactionChart';
import CryptoComparisonCharts from '../components/CryptoComparisonCharts';
import PriceAlertModal from '../components/PriceAlertModal';
import { fetchCryptoPrices } from '../utils/cryptoApi';

type TimeRange = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL';
type CryptoType = 'ETH' | 'BTC' | 'NFT';

export default function CryptocurrencyPage() {
  const [activeTimeRange, setActiveTimeRange] = useState<TimeRange>('1M');
  const [activeCrypto, setActiveCrypto] = useState<CryptoType>('ETH');
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cryptoPrices, setCryptoPrices] = useState<{[key: string]: number}>({
    ethereum: 0,
    bitcoin: 0,
    solana: 0, // Using Solana as proxy for NFT
  });
  
  // Time range buttons
  const timeRanges: TimeRange[] = ['1D', '1W', '1M', '3M', '6M', '1Y', 'ALL'];
  
  // Crypto options
  const cryptoOptions: { id: CryptoType; name: string; symbol: string }[] = [
    { id: 'ETH', name: 'Ethereum', symbol: 'ETH' },
    { id: 'BTC', name: 'Bitcoin', symbol: 'BTC' },
    { id: 'NFT', name: 'NFT Index', symbol: 'NFT' },
  ];
  
  // Fetch crypto prices
  const updateCryptoPrices = async () => {
    setIsLoading(true);
    try {
      const data = await fetchCryptoPrices(['bitcoin', 'ethereum', 'solana']);
      if (data) {
        const prices: {[key: string]: number} = {};
        Object.keys(data).forEach(id => {
          prices[id] = data[id].price;
        });
        setCryptoPrices(prices);
      }
    } catch (error) {
      console.error('Error fetching crypto prices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch real prices on component mount
  useEffect(() => {
    updateCryptoPrices();
    
    // Set up interval for periodic updates
    const interval = setInterval(updateCryptoPrices, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);
  
  // Function to format price with commas and decimal places
  const formatPrice = (price: number): string => {
    return price.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };
  
  // Get price for the selected crypto
  const getCurrentPrice = (crypto: CryptoType): number => {
    switch(crypto) {
      case 'ETH':
        return cryptoPrices.ethereum || 3800.00;
      case 'BTC':
        return cryptoPrices.bitcoin || 64000.00;
      case 'NFT':
        return cryptoPrices.solana || 950.00; // Using Solana as proxy for NFT
    }
  };
  
  // Dynamic market stats for each crypto
  const getMarketStats = (crypto: CryptoType) => {
    const price = getCurrentPrice(crypto);
    
    switch(crypto) {
      case 'ETH':
        return {
          price: `$${formatPrice(price)}`,
          change24h: '+2.4%',
          high24h: `$${formatPrice(price * 1.03)}`,
          low24h: `$${formatPrice(price * 0.97)}`,
          volume24h: `$${formatPrice(price * 3700000)}B`,
          marketCap: `$${formatPrice(price * 120700000 / 1000000000)}B`,
          supply: '120.7M ETH',
        };
      case 'BTC':
        return {
          price: `$${formatPrice(price)}`,
          change24h: '+1.8%',
          high24h: `$${formatPrice(price * 1.02)}`,
          low24h: `$${formatPrice(price * 0.98)}`,
          volume24h: `$${formatPrice(price * 510000)}B`,
          marketCap: `$${formatPrice(price * 19500000 / 1000000000)}B`,
          supply: '19.5M BTC',
        };
      case 'NFT':
        return {
          price: `$${formatPrice(price)}`,
          change24h: '-1.2%',
          high24h: `$${formatPrice(price * 1.03)}`,
          low24h: `$${formatPrice(price * 0.99)}`,
          volume24h: `$${formatPrice(price * 2200000)}B`,
          marketCap: `$${formatPrice(price * 19500000 / 1000000000)}B`,
          supply: 'N/A',
        };
    }
  };
  
  const currentStats = getMarketStats(activeCrypto);
  const cryptoTrend = currentStats.change24h.startsWith('+') ? 'up' : 'down';
  
  // Get the current selected crypto details
  const selectedCrypto = cryptoOptions.find(c => c.id === activeCrypto);
  
  return (
    <main className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Cryptocurrency Charts</h1>
            <p className="text-darkText">Track and analyze cryptocurrency performance</p>
          </div>
          <button 
            onClick={updateCryptoPrices}
            className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            {isLoading ? 'Updating...' : 'Refresh Prices'}
          </button>
        </div>
        
        {/* Crypto selector */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            {cryptoOptions.map((crypto) => (
              <button
                key={crypto.id}
                className={`px-4 py-2 rounded-lg ${
                  activeCrypto === crypto.id
                    ? 'bg-primary text-white'
                    : 'bg-card text-darkText border border-gray-700 hover:border-primary'
                }`}
                onClick={() => setActiveCrypto(crypto.id)}
              >
                {crypto.name} ({crypto.symbol})
              </button>
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main chart - spans 3 columns */}
          <div className="lg:col-span-3">
            <div className="card">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                  <h2 className="text-xl font-bold">{cryptoOptions.find(c => c.id === activeCrypto)?.name} Price Chart</h2>
                  <p className="text-darkText text-sm">{activeCrypto}/USD</p>
                </div>
                
                {/* Time range selector */}
                <div className="flex space-x-2">
                  {timeRanges.map((range) => (
                    <button
                      key={range}
                      className={`px-3 py-1 text-sm rounded-lg ${
                        activeTimeRange === range
                          ? 'bg-primary text-white'
                          : 'bg-card text-darkText border border-gray-700 hover:border-primary'
                      }`}
                      onClick={() => setActiveTimeRange(range)}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
              
              <TransactionChart selectedCrypto={activeCrypto} selectedTimeRange={activeTimeRange} />
            </div>
          </div>
          
          {/* Market stats sidebar - spans 1 column */}
          <div className="lg:col-span-1">
            <div className="card h-full">
              <h2 className="text-xl font-bold mb-6">Market Stats</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-darkText">Price</span>
                  <span className="font-bold">{currentStats.price}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-darkText">24h Change</span>
                  <span className={`${cryptoTrend === 'up' ? 'text-accent' : 'text-danger'} font-medium`}>
                    {currentStats.change24h}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-darkText">24h High</span>
                  <span>{currentStats.high24h}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-darkText">24h Low</span>
                  <span>{currentStats.low24h}</span>
                </div>
                
                <div className="border-t border-gray-800 my-4 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-darkText">24h Volume</span>
                    <span>{currentStats.volume24h}</span>
                  </div>
                  
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-darkText">Market Cap</span>
                    <span>{currentStats.marketCap}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-darkText">Circulating Supply</span>
                    <span>{currentStats.supply}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-800">
                <button 
                  className="btn w-full bg-card border border-gray-700 text-darkText hover:text-lightText hover:border-primary"
                  onClick={() => setShowAlertModal(true)}
                >
                  Set Price Alert
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Comparison charts - full width */}
        <div className="mt-6">
          <CryptoComparisonCharts />
        </div>
        
        {/* Technical analysis section */}
        <div className="mt-6 card">
          <h2 className="text-xl font-bold mb-6">Technical Analysis</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-4">Price Indicators</h3>
              <div className="space-y-3">
                {[
                  { name: 'Moving Average (MA)', value: 'Bullish', status: 'positive' },
                  { name: 'Relative Strength Index (RSI)', value: 'Neutral', status: 'neutral' },
                  { name: 'Moving Average Convergence Divergence (MACD)', value: 'Bullish', status: 'positive' },
                  { name: 'Bollinger Bands', value: 'Upper Band Test', status: 'neutral' },
                ].map((indicator, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-card/60 rounded-lg">
                    <span>{indicator.name}</span>
                    <span className={
                      indicator.status === 'positive' ? 'text-accent' : 
                      indicator.status === 'negative' ? 'text-danger' : 
                      'text-darkText'
                    }>
                      {indicator.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Market Sentiment</h3>
              <div className="space-y-3">
                {[
                  { name: 'Fear & Greed Index', value: '65 - Greed', status: 'positive' },
                  { name: 'Social Volume', value: 'High', status: 'positive' },
                  { name: 'Developer Activity', value: 'Steady', status: 'neutral' },
                  { name: 'Institutional Interest', value: 'Increasing', status: 'positive' },
                ].map((indicator, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-card/60 rounded-lg">
                    <span>{indicator.name}</span>
                    <span className={
                      indicator.status === 'positive' ? 'text-accent' : 
                      indicator.status === 'negative' ? 'text-danger' : 
                      'text-darkText'
                    }>
                      {indicator.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Price Alert Modal */}
      {selectedCrypto && (
        <PriceAlertModal
          isOpen={showAlertModal}
          onClose={() => setShowAlertModal(false)}
          cryptoName={selectedCrypto.name}
          cryptoSymbol={selectedCrypto.symbol}
          currentPrice={getCurrentPrice(activeCrypto).toString()}
        />
      )}
    </main>
  );
} 