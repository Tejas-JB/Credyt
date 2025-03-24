"use client";

import React, { useState, useEffect } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { fetchCryptoPrices } from "../utils/cryptoApi";

// Define the data structure for the chart
interface ChartData {
  name: string;
  price: number;
  volume: number;
  date: Date;
}

// Sample data with proper date objects
const ethereumData: ChartData[] = [
  { name: "Jan", price: 1720, volume: 32, date: new Date(2023, 0, 1) },
  { name: "Feb", price: 1680, volume: 38, date: new Date(2023, 1, 1) },
  { name: "Mar", price: 1790, volume: 30, date: new Date(2023, 2, 1) },
  { name: "Apr", price: 1850, volume: 34, date: new Date(2023, 3, 1) },
  { name: "May", price: 1920, volume: 40, date: new Date(2023, 4, 1) },
  { name: "Jun", price: 1850, volume: 26, date: new Date(2023, 5, 1) },
  { name: "Jul", price: 1950, volume: 37, date: new Date(2023, 6, 1) },
  { name: "Aug", price: 2050, volume: 33, date: new Date(2023, 7, 1) },
  { name: "Sep", price: 2150, volume: 42, date: new Date(2023, 8, 1) },
  { name: "Oct", price: 2280, volume: 45, date: new Date(2023, 9, 1) },
  { name: "Nov", price: 2190, volume: 39, date: new Date(2023, 10, 1) },
  { name: "Dec", price: 2350, volume: 48, date: new Date(2023, 11, 1) },
];

const bitcoinData: ChartData[] = [
  { name: "Jan", price: 42700, volume: 28, date: new Date(2023, 0, 1) },
  { name: "Feb", price: 44200, volume: 34, date: new Date(2023, 1, 1) },
  { name: "Mar", price: 43400, volume: 26, date: new Date(2023, 2, 1) },
  { name: "Apr", price: 45800, volume: 32, date: new Date(2023, 3, 1) },
  { name: "May", price: 47500, volume: 38, date: new Date(2023, 4, 1) },
  { name: "Jun", price: 46200, volume: 24, date: new Date(2023, 5, 1) },
  { name: "Jul", price: 48900, volume: 35, date: new Date(2023, 6, 1) },
  { name: "Aug", price: 51400, volume: 31, date: new Date(2023, 7, 1) },
  { name: "Sep", price: 53800, volume: 40, date: new Date(2023, 8, 1) },
  { name: "Oct", price: 56700, volume: 43, date: new Date(2023, 9, 1) },
  { name: "Nov", price: 55200, volume: 37, date: new Date(2023, 10, 1) },
  { name: "Dec", price: 59800, volume: 46, date: new Date(2023, 11, 1) },
];

const nftIndexData: ChartData[] = [
  { name: "Jan", price: 420, volume: 22, date: new Date(2023, 0, 1) },
  { name: "Feb", price: 480, volume: 28, date: new Date(2023, 1, 1) },
  { name: "Mar", price: 450, volume: 20, date: new Date(2023, 2, 1) },
  { name: "Apr", price: 510, volume: 26, date: new Date(2023, 3, 1) },
  { name: "May", price: 580, volume: 32, date: new Date(2023, 4, 1) },
  { name: "Jun", price: 540, volume: 18, date: new Date(2023, 5, 1) },
  { name: "Jul", price: 620, volume: 29, date: new Date(2023, 6, 1) },
  { name: "Aug", price: 680, volume: 25, date: new Date(2023, 7, 1) },
  { name: "Sep", price: 730, volume: 34, date: new Date(2023, 8, 1) },
  { name: "Oct", price: 790, volume: 37, date: new Date(2023, 9, 1) },
  { name: "Nov", price: 750, volume: 31, date: new Date(2023, 10, 1) },
  { name: "Dec", price: 820, volume: 40, date: new Date(2023, 11, 1) },
];

// Custom tooltip for chart
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-gray-700 p-3 rounded-lg shadow-lg">
        <p className="text-sm font-medium mb-1">{new Date(payload[0].payload.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</p>
        <p className="text-xs mb-1">
          <span className="font-medium">Price:</span>{" "}
          ${payload[0].value.toLocaleString()}
        </p>
        <p className="text-xs">
          <span className="font-medium">Volume:</span>{" "}
          {payload[1]?.value}M
        </p>
      </div>
    );
  }
  return null;
};

type TimeRange = "1D" | "1W" | "1M" | "3M" | "6M" | "1Y" | "ALL";

interface TransactionChartProps {
  selectedCrypto: string;
  selectedTimeRange: TimeRange;
}

export default function TransactionChart({
  selectedCrypto = "ETH",
  selectedTimeRange = "1M",
}: TransactionChartProps) {
  // Define the crypto options with their respective data
  const [cryptoOptions, setCryptoOptions] = useState([
    { symbol: "ETH", name: "Ethereum", color: "#3b82f6", data: ethereumData },
    { symbol: "BTC", name: "Bitcoin", color: "#f59e0b", data: bitcoinData },
    { symbol: "NFT", name: "NFT Index", color: "#8b5cf6", data: nftIndexData },
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<string>("");

  // Get the current selected crypto data
  const currentCrypto = cryptoOptions.find(
    (crypto) => crypto.symbol === selectedCrypto
  ) || cryptoOptions[0];
  
  // Function to update crypto data with real prices
  const updateCryptoData = async () => {
    setIsLoading(true);
    try {
      // Fetch real-time cryptocurrency data
      const cryptoData = await fetchCryptoPrices(['bitcoin', 'ethereum', 'solana']); // Using Solana as proxy for NFT
      
      if (cryptoData) {
        // Update current price display
        let symbol: string;
        let price: number = 0;
        
        // Map selected crypto to API ID
        switch (selectedCrypto) {
          case 'ETH':
            symbol = 'ethereum';
            break;
          case 'BTC':
            symbol = 'bitcoin';
            break;
          case 'NFT':
            symbol = 'solana'; // Using Solana as proxy for NFT index
            break;
          default:
            symbol = 'ethereum';
        }
        
        if (cryptoData[symbol]) {
          price = cryptoData[symbol].price;
          setCurrentPrice(`$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
        }
        
        // Optional: We could update historical data here with real data if we had an API for that
      }
    } catch (error) {
      console.error('Error updating crypto data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fetch real prices on component mount and when selected crypto changes
  useEffect(() => {
    updateCryptoData();
    
    // Set up interval for periodic updates
    const interval = setInterval(updateCryptoData, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [selectedCrypto]);

  return (
    <div className="p-6 rounded-lg border border-gray-800 bg-card">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold">
            {currentCrypto.name} Price
          </h2>
          <div className="flex items-center mt-1">
            <span className="text-2xl font-bold mr-2">
              {currentPrice || `$${currentCrypto.data[currentCrypto.data.length - 1].price.toLocaleString()}`}
            </span>
            <span className="text-accent text-sm bg-accent/10 px-2 py-1 rounded-md">
              +5.4%
            </span>
          </div>
        </div>
        {isLoading && (
          <div className="text-sm text-darkText">
            Updating...
          </div>
        )}
      </div>

      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={currentCrypto.data}
            margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
          >
            <defs>
              <linearGradient
                id="colorPrice"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={currentCrypto.color}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={currentCrypto.color}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(255,255,255,0.1)"
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#94A3B8", fontSize: 12 }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke={currentCrypto.color}
              fillOpacity={1}
              fill="url(#colorPrice)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="volume"
              stroke="#6B7280"
              fill="none"
              strokeDasharray="3 3"
              strokeWidth={1}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 