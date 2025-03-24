"use client";

import React, { useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// Types for metrics data
interface MetricCard {
  title: string;
  value: string | number;
  subtitle: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}

// Sample data for bar chart
const txVolumeData = [
  { name: 'Jan', value: 4000 },
  { name: 'Feb', value: 3000 },
  { name: 'Mar', value: 2000 },
  { name: 'Apr', value: 2780 },
  { name: 'May', value: 1890 },
  { name: 'Jun', value: 2390 },
];

// Sample data for pie chart
const dexActivityData = [
  { name: 'Uniswap', value: 45 },
  { name: 'SushiSwap', value: 20 },
  { name: 'Curve', value: 15 },
  { name: 'Balancer', value: 10 },
  { name: 'Other', value: 10 },
];

// Colors for pie chart
const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#6b7280'];

// Tab type
type ActivityTab = 'transactions' | 'dex' | 'nft' | 'contracts';

export default function ActivityMetrics() {
  const [activeTab, setActiveTab] = useState<ActivityTab>('transactions');
  
  // Metrics data
  const metricCards: MetricCard[] = [
    {
      title: 'Transaction Count',
      value: '1,243',
      subtitle: 'All-time transactions',
      change: '+12%',
      trend: 'up',
    },
    {
      title: 'Active Days',
      value: '312',
      subtitle: 'Days with activity',
      change: '+5%',
      trend: 'up',
    },
    {
      title: 'Gas Spent',
      value: '2.87 ETH',
      subtitle: '$4,912.35',
      change: '-3%',
      trend: 'down',
    },
    {
      title: 'Avg. Tx Value',
      value: '0.42 ETH',
      subtitle: '$714.28 per transaction',
      change: '+8%',
      trend: 'up',
    },
  ];
  
  // Tabs for different metrics
  const tabs: { id: ActivityTab; label: string }[] = [
    { id: 'transactions', label: 'Transactions' },
    { id: 'dex', label: 'DEX Activity' },
    { id: 'nft', label: 'NFT Activity' },
    { id: 'contracts', label: 'Contract Interactions' },
  ];
  
  // Render appropriate chart based on active tab
  const renderChart = () => {
    switch (activeTab) {
      case 'transactions':
        return (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={txVolumeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a2236', borderColor: '#2d3748', borderRadius: '0.5rem' }}
                  labelStyle={{ color: '#f8fafc' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      case 'dex':
        return (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dexActivityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dexActivityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a2236', borderColor: '#2d3748', borderRadius: '0.5rem' }}
                  labelStyle={{ color: '#f8fafc' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      case 'nft':
        return (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center text-darkText">
              <div className="text-4xl mb-2">🖼️</div>
              <p>No NFT activity to display</p>
              <button className="btn-primary mt-4">Browse NFT Marketplaces</button>
            </div>
          </div>
        );
      case 'contracts':
        return (
          <div className="h-64 px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: 'Uniswap V3', count: 42, icon: '🔄' },
                { name: 'OpenSea', count: 12, icon: '🖼️' },
                { name: 'Aave', count: 8, icon: '💰' },
                { name: 'ENS', count: 3, icon: '🔖' },
                { name: 'Compound', count: 5, icon: '💎' },
                { name: 'Curve', count: 7, icon: '📊' },
              ].map((contract, i) => (
                <div key={i} className="bg-card/60 rounded-lg p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    {contract.icon}
                  </div>
                  <div>
                    <div className="font-medium">{contract.name}</div>
                    <div className="text-darkText text-sm">{contract.count} interactions</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="card h-full">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-6">Wallet Activity Metrics</h2>
        
        {/* Metrics cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {metricCards.map((card, index) => (
            <div key={index} className="stat-card">
              <div className="flex justify-between items-start">
                <h3 className="text-darkText">{card.title}</h3>
                {card.trend && (
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    card.trend === 'up' ? 'bg-accent/20 text-accent' : 
                    card.trend === 'down' ? 'bg-danger/20 text-danger' : 
                    'bg-gray-700 text-gray-400'
                  }`}>
                    {card.change}
                  </span>
                )}
              </div>
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="text-sm text-darkText">{card.subtitle}</div>
            </div>
          ))}
        </div>
        
        {/* Activity tabs */}
        <div className="border-b border-gray-800 mb-6">
          <div className="flex space-x-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`pb-2 px-1 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-darkText hover:text-lightText'
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Chart based on active tab */}
        {renderChart()}
      </div>
    </div>
  );
} 