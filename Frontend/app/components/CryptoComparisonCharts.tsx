"use client";

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps } from 'recharts';
import { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { fetchCryptoPrices } from '../utils/cryptoApi';

// Monthly multipliers for each currency
const monthlyMultipliers = {
  ETH: {
    Jan: 1.05, Feb: 1.02, Mar: 0.98, Apr: 1.10, 
    May: 1.15, Jun: 0.95, Jul: 1.08, Aug: 1.12, 
    Sep: 1.18, Oct: 1.22, Nov: 0.94, Dec: 1.25
  },
  BTC: {
    Jan: 1.02, Feb: 1.04, Mar: 0.99, Apr: 1.06, 
    May: 1.08, Jun: 0.97, Jul: 1.10, Aug: 1.12, 
    Sep: 1.15, Oct: 1.20, Nov: 0.96, Dec: 1.18
  },
  NFT: {
    Jan: 1.10, Feb: 1.15, Mar: 0.95, Apr: 1.20, 
    May: 1.30, Jun: 0.90, Jul: 1.25, Aug: 1.35, 
    Sep: 1.40, Oct: 1.50, Nov: 0.85, Dec: 1.60
  }
};

// Base sample data for each cryptocurrency with actual dates
const baseEthData = [
  { name: 'Jan', value: 1600, date: new Date(2023, 0, 15) }, // Jan 15, 2023
  { name: 'Feb', value: 1800, date: new Date(2023, 1, 15) }, // Feb 15, 2023
  { name: 'Mar', value: 1700, date: new Date(2023, 2, 15) }, // Mar 15, 2023
  { name: 'Apr', value: 2100, date: new Date(2023, 3, 15) }, // Apr 15, 2023
  { name: 'May', value: 2400, date: new Date(2023, 4, 15) }, // May 15, 2023
  { name: 'Jun', value: 2200, date: new Date(2023, 5, 15) }, // Jun 15, 2023
  { name: 'Jul', value: 2600, date: new Date(2023, 6, 15) }, // Jul 15, 2023
  { name: 'Aug', value: 2800, date: new Date(2023, 7, 15) }, // Aug 15, 2023
  { name: 'Sep', value: 3100, date: new Date(2023, 8, 15) }, // Sep 15, 2023
  { name: 'Oct', value: 3400, date: new Date(2023, 9, 15) }, // Oct 15, 2023
  { name: 'Nov', value: 3200, date: new Date(2023, 10, 15) }, // Nov 15, 2023
  { name: 'Dec', value: 3800, date: new Date(2023, 11, 15) }, // Dec 15, 2023
];

const baseBtcData = [
  { name: 'Jan', value: 42000, date: new Date(2023, 0, 15) }, // Jan 15, 2023
  { name: 'Feb', value: 45000, date: new Date(2023, 1, 15) }, // Feb 15, 2023
  { name: 'Mar', value: 43000, date: new Date(2023, 2, 15) }, // Mar 15, 2023
  { name: 'Apr', value: 47000, date: new Date(2023, 3, 15) }, // Apr 15, 2023
  { name: 'May', value: 50000, date: new Date(2023, 4, 15) }, // May 15, 2023
  { name: 'Jun', value: 48000, date: new Date(2023, 5, 15) }, // Jun 15, 2023
  { name: 'Jul', value: 52000, date: new Date(2023, 6, 15) }, // Jul 15, 2023
  { name: 'Aug', value: 55000, date: new Date(2023, 7, 15) }, // Aug 15, 2023
  { name: 'Sep', value: 58000, date: new Date(2023, 8, 15) }, // Sep 15, 2023
  { name: 'Oct', value: 61000, date: new Date(2023, 9, 15) }, // Oct 15, 2023
  { name: 'Nov', value: 59000, date: new Date(2023, 10, 15) }, // Nov 15, 2023
  { name: 'Dec', value: 64000, date: new Date(2023, 11, 15) }, // Dec 15, 2023
];

const baseNftData = [
  { name: 'Jan', value: 400, date: new Date(2023, 0, 15) }, // Jan 15, 2023
  { name: 'Feb', value: 480, date: new Date(2023, 1, 15) }, // Feb 15, 2023
  { name: 'Mar', value: 420, date: new Date(2023, 2, 15) }, // Mar 15, 2023
  { name: 'Apr', value: 500, date: new Date(2023, 3, 15) }, // Apr 15, 2023
  { name: 'May', value: 650, date: new Date(2023, 4, 15) }, // May 15, 2023
  { name: 'Jun', value: 600, date: new Date(2023, 5, 15) }, // Jun 15, 2023
  { name: 'Jul', value: 700, date: new Date(2023, 6, 15) }, // Jul 15, 2023
  { name: 'Aug', value: 750, date: new Date(2023, 7, 15) }, // Aug 15, 2023
  { name: 'Sep', value: 820, date: new Date(2023, 8, 15) }, // Sep 15, 2023
  { name: 'Oct', value: 900, date: new Date(2023, 9, 15) }, // Oct 15, 2023
  { name: 'Nov', value: 850, date: new Date(2023, 10, 15) }, // Nov 15, 2023
  { name: 'Dec', value: 950, date: new Date(2023, 11, 15) }, // Dec 15, 2023
];

// Apply multipliers to generate data with monthly multipliers
const applyMultipliers = (baseData, currencySymbol) => {
  const currencyType = currencySymbol === 'ETH' ? 'ETH' : 
                      currencySymbol === 'BTC' ? 'BTC' : 'NFT';
  
  return baseData.map(item => ({
    ...item,
    value: Math.round(item.value * monthlyMultipliers[currencyType][item.name]),
  }));
};

// Custom tooltip to display proper date format
const CustomTooltip = ({ active, payload, label }: TooltipProps<ValueType, NameType>) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-tooltip bg-gray-800 border border-gray-700 p-3 rounded-md shadow-lg">
        <p className="text-white font-medium">{data.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
        <p className="text-sm text-gray-300">
          <span className="font-medium">{payload[0].name}:</span> ${payload[0].value?.toLocaleString()}
        </p>
      </div>
    );
  }

  return null;
};

// Define time range type
type TimeRange = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL';

export default function CryptoComparisonCharts() {
  const [activeTimeRange, setActiveTimeRange] = useState<TimeRange>('1M');
  const [cryptoConfig, setCryptoConfig] = useState([
    {
      id: 'eth',
      name: 'Ethereum',
      symbol: 'ETH',
      data: applyMultipliers(baseEthData, 'ETH'),
      color: '#3b82f6',
      change: '+5.4%',
      price: '$3,800.00',
      trend: 'up'
    },
    {
      id: 'btc',
      name: 'Bitcoin',
      symbol: 'BTC',
      data: applyMultipliers(baseBtcData, 'BTC'),
      color: '#f59e0b',
      change: '+2.1%',
      price: '$64,000.00',
      trend: 'up'
    },
    {
      id: 'nft',
      name: 'NFT Index',
      symbol: 'NFT',
      data: applyMultipliers(baseNftData, 'NFT'),
      color: '#8b5cf6',
      change: '-1.2%',
      price: '$950.00',
      trend: 'down'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Time range buttons
  const timeRanges: TimeRange[] = ['1D', '1W', '1M', '3M', '6M', '1Y', 'ALL'];
  
  // Function to update crypto prices with real data
  const updateCryptoPrices = async () => {
    setIsLoading(true);
    try {
      // Fetch real-time cryptocurrency data
      const cryptoData = await fetchCryptoPrices(['bitcoin', 'ethereum', 'solana']); // Solana as proxy for NFT
      
      if (cryptoData) {
        // Update crypto configuration with real prices
        const updatedConfig = cryptoConfig.map(crypto => {
          let apiId: string;
          let price: number; 
          let change: string;
          let trend: 'up' | 'down' | 'neutral';
          
          // Map crypto IDs to API IDs
          switch (crypto.symbol) {
            case 'ETH':
              apiId = 'ethereum';
              break;
            case 'BTC':
              apiId = 'bitcoin';
              break;
            case 'NFT':
              apiId = 'solana'; // Using Solana as proxy for NFT index
              break;
            default:
              return crypto; // Return unchanged if not found
          }
          
          if (cryptoData[apiId]) {
            const apiData = cryptoData[apiId];
            price = apiData.price;
            const changePercent = apiData.price_change_percentage_24h;
            change = `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(1)}%`;
            trend = changePercent > 0 ? 'up' : changePercent < 0 ? 'down' : 'neutral';
            
            return {
              ...crypto,
              price: `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              change,
              trend
            };
          }
          
          return crypto; // Return unchanged if API data not found
        });
        
        setCryptoConfig(updatedConfig);
      }
    } catch (error) {
      console.error('Error updating crypto prices:', error);
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
  
  return (
    <div className="card">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold mb-2">Cryptocurrency Comparison</h2>
          <p className="text-darkText text-sm">Compare performance against USD</p>
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
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cryptoConfig.map((crypto) => (
          <div key={crypto.id} className="border border-gray-800 rounded-lg p-4 hover:border-primary transition-colors">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${crypto.color}20` }}>
                  <span className="text-sm font-bold" style={{ color: crypto.color }}>{crypto.symbol}</span>
                </div>
                <div className="ml-2">
                  <h3 className="font-medium">{crypto.name}</h3>
                  <p className="text-xs text-darkText">{crypto.symbol}/USD</p>
                </div>
              </div>
              <div className={`px-2 py-1 text-xs rounded ${
                crypto.trend === 'up' ? 'bg-accent/20 text-accent' : 'bg-danger/20 text-danger'
              }`}>
                {crypto.change}
              </div>
            </div>
            
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={crypto.data}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id={`color${crypto.symbol}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={crypto.color} stopOpacity={0.8} />
                      <stop offset="95%" stopColor={crypto.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={crypto.color}
                    fillOpacity={1}
                    fill={`url(#color${crypto.symbol})`}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-800">
              <div className="flex justify-between items-center">
                <div className="text-darkText text-sm">Current Price</div>
                <div className="font-bold">{crypto.price}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {isLoading && (
        <div className="text-center text-sm text-darkText mt-4">
          Updating prices...
        </div>
      )}
    </div>
  );
} 