'use client';

import React, { useEffect, useState } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import Navigation from '../components/Navigation';
import PriceAlertModal from '../components/PriceAlertModal';

interface PriceAlert {
  id: string;
  cryptoName: string;
  cryptoSymbol: string;
  currentPrice: string;
  price: string;
  alertType: 'above' | 'below';
  frequency: 'once' | 'daily' | 'always';
  email: string;
  createdAt: string;
  active: boolean;
}

export default function PriceAlertsPage() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedCrypto, setSelectedCrypto] = useState({
    name: 'Bitcoin',
    symbol: 'BTC',
    price: '$84,704.95'
  });

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      // For demo purposes, we'll use a sample email
      const userEmail = 'demo@example.com';
      const response = await fetch(`/api/price-alert?email=${encodeURIComponent(userEmail)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }
      
      const data = await response.json();
      
      // Ensure that alerts is always an array
      if (Array.isArray(data)) {
        setAlerts(data);
      } else {
        console.warn('API did not return an array of alerts:', data);
        setAlerts([]);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
      setError('Failed to load your price alerts. Please try again later.');
      setAlerts([]); // Set alerts to empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAlertStatus = async (alertId: string) => {
    const alert = alerts.find(a => a.id === alertId);
    if (!alert) return;
    
    const updatedAlert = { ...alert, active: !alert.active };
    
    // Update UI optimistically
    setAlerts(alerts.map(a => a.id === alertId ? updatedAlert : a));
    
    // In a real app, you would update the alert status on the server
    // await fetch(`/api/price-alert/${alertId}`, {
    //   method: 'PATCH',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ active: updatedAlert.active }),
    // });
  };

  const deleteAlert = async (alertId: string) => {
    if (!confirm('Are you sure you want to delete this alert?')) return;
    
    // Update UI optimistically
    setAlerts(alerts.filter(a => a.id !== alertId));
    
    // In a real app, you would delete the alert on the server
    // await fetch(`/api/price-alert/${alertId}`, { method: 'DELETE' });
  };

  const handleOpenModal = (crypto: { name: string, symbol: string, price: string }) => {
    setSelectedCrypto(crypto);
    setShowModal(true);
  };

  const downloadAlertsReport = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Price Alerts Report', 20, 20);
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 20, 30);
    
    if (alerts.length === 0) {
      doc.text('No active price alerts', 20, 50);
    } else {
      // Create table with alert data
      const tableData = alerts.map(alert => [
        alert.cryptoName,
        alert.cryptoSymbol,
        alert.currentPrice,
        `$${alert.price}`,
        alert.alertType === 'above' ? 'Above' : 'Below',
        alert.frequency === 'once' ? 'Once' : alert.frequency === 'daily' ? 'Daily' : 'Always',
        alert.active ? 'Active' : 'Inactive',
        new Date(alert.createdAt).toLocaleDateString()
      ]);
      
      // @ts-ignore - jspdf-autotable extends jsPDF
      doc.autoTable({
        startY: 40,
        head: [['Name', 'Symbol', 'Current Price', 'Alert Price', 'Type', 'Frequency', 'Status', 'Created']],
        body: tableData,
      });
    }
    
    // Add footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text('CryptoWallet App - Price Alerts Report', 20, doc.internal.pageSize.height - 10);
      doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 40, doc.internal.pageSize.height - 10);
    }
    
    // Save the PDF
    doc.save('price-alerts-report.pdf');
  };

  // Sample cryptocurrencies for the quick add section
  const popularCryptos = [
    { name: 'Bitcoin', symbol: 'BTC', price: '$84,704.95' },
    { name: 'Ethereum', symbol: 'ETH', price: '$3,071.19' },
    { name: 'Solana', symbol: 'SOL', price: '$175.23' },
    { name: 'Cardano', symbol: 'ADA', price: '$0.45' }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
      
      <main className="flex-1 p-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="sm:flex sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Price Alerts</h1>
            
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button
                onClick={downloadAlertsReport}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Download Report
              </button>
            </div>
          </div>
          
          {/* Quick Add Section */}
          <div className="mt-8 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Quick Add Alert</h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                Set a price alert for popular cryptocurrencies
              </p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700">
              <div className="flex overflow-x-auto p-4 space-x-4">
                {popularCryptos.map((crypto) => (
                  <div 
                    key={crypto.symbol}
                    className="flex-none p-4 border border-gray-200 dark:border-gray-700 rounded-lg min-w-[200px] bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => handleOpenModal(crypto)}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">{crypto.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{crypto.symbol}</div>
                    <div className="mt-2 text-lg font-semibold text-gray-900 dark:text-white">{crypto.price}</div>
                    <button 
                      className="mt-3 w-full inline-flex justify-center items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:text-indigo-200 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Set Alert
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Alerts Table */}
          <div className="mt-8 bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Your Price Alerts</h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">
                Manage your active price alerts
              </p>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700">
              {isLoading ? (
                <div className="text-center py-10">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
                  <p className="mt-4 text-gray-500 dark:text-gray-400">Loading your alerts...</p>
                </div>
              ) : error ? (
                <div className="py-8 text-center">
                  <p className="text-red-500 dark:text-red-400">{error}</p>
                  <button 
                    onClick={fetchAlerts}
                    className="mt-4 px-4 py-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300"
                  >
                    Try again
                  </button>
                </div>
              ) : alerts.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400">You don't have any price alerts yet.</p>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">Create an alert to get notified when cryptocurrency prices change.</p>
                  <button 
                    onClick={() => handleOpenModal(popularCryptos[0])}
                    className="mt-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Create your first alert
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Cryptocurrency
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Alert Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Condition
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Frequency
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                      {alerts.map((alert) => (
                        <tr key={alert.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900 dark:text-white">
                              {alert.cryptoName}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {alert.cryptoSymbol}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-gray-900 dark:text-white">${alert.price}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Current: {alert.currentPrice}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              alert.alertType === 'above' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                            }`}>
                              {alert.alertType === 'above' ? 'Goes Above' : 'Goes Below'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {alert.frequency === 'once' ? 'Once' : 
                             alert.frequency === 'daily' ? 'Daily' : 'Always'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(alert.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              alert.active 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            }`}>
                              {alert.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => toggleAlertStatus(alert.id)}
                              className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
                            >
                              {alert.active ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => deleteAlert(alert.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {showModal && (
        <PriceAlertModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          cryptoName={selectedCrypto.name}
          cryptoSymbol={selectedCrypto.symbol}
          currentPrice={selectedCrypto.price}
        />
      )}
    </div>
  );
} 