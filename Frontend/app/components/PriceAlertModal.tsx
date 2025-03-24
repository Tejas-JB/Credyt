"use client";

import React, { useState } from 'react';
import Modal from './Modal';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface PriceAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  cryptoName: string;
  cryptoSymbol: string;
  currentPrice: string;
}

const PriceAlertModal: React.FC<PriceAlertModalProps> = ({
  isOpen,
  onClose,
  cryptoName,
  cryptoSymbol,
  currentPrice
}) => {
  const [email, setEmail] = useState('');
  const [price, setPrice] = useState('');
  const [alertType, setAlertType] = useState('above');
  const [frequency, setFrequency] = useState('once');
  const [includeReport, setIncludeReport] = useState(false);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    // Basic validation
    if (!email) {
      setFormError('Email is required');
      return;
    }
    
    if (!price || isNaN(parseFloat(price))) {
      setFormError('Please enter a valid price');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Generate PDF if needed
      let pdfBase64 = null;
      if (includeReport) {
        pdfBase64 = await generatePDFReport();
      }
      
      // Call the API to create the price alert
      const response = await fetch('/api/price-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          cryptoName,
          cryptoSymbol,
          currentPrice,
          price,
          alertType,
          frequency,
          includeReport,
          pdfBase64,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to set price alert');
      }
      
      const data = await response.json();
      
      // Show the PDF in a new window (in a real app, this would be sent by email)
      if (includeReport) {
        showPDFPreview();
      }
      
      // Show success message and close modal
      alert(`Price alert set! We'll email you at ${email} when ${cryptoSymbol} goes ${alertType} $${price}.`);
      onClose();
    } catch (error) {
      console.error('Failed to set price alert:', error);
      setFormError(error instanceof Error ? error.message : 'Failed to set price alert. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generate the PDF report
  const generatePDFReport = async (): Promise<string | null> => {
    try {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text(`${cryptoName} (${cryptoSymbol}) Price Alert Report`, 20, 20);
      
      // Add date
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 20, 30);
      
      // Add alert details
      doc.setFontSize(14);
      doc.text('Alert Details', 20, 45);
      
      // Create table for alert details
      // @ts-ignore - jspdf-autotable extends jsPDF
      doc.autoTable({
        startY: 50,
        head: [['Setting', 'Value']],
        body: [
          ['Cryptocurrency', `${cryptoName} (${cryptoSymbol})`],
          ['Current Price', currentPrice],
          ['Alert Price', `$${price}`],
          ['Alert Type', alertType === 'above' ? 'Price goes above' : 'Price goes below'],
          ['Frequency', frequency === 'once' ? 'Once' : frequency === 'daily' ? 'Daily' : 'Always'],
          ['Notification Email', email]
        ],
      });
      
      // Add placeholder for chart image
      doc.text('Price Chart', 20, 120);
      doc.setDrawColor(200);
      doc.rect(20, 125, 170, 80);
      doc.setFontSize(12);
      doc.text('Chart image would be included in the actual email', 50, 165);
      
      // Add market notes
      doc.setFontSize(14);
      doc.text('Market Notes', 20, 220);
      doc.setFontSize(10);
      doc.text('This report is generated for informational purposes only and does not constitute financial advice.', 20, 230);
      doc.text('Past performance is not indicative of future results. Always do your own research before investing.', 20, 240);
      
      // Return base64 encoded PDF for API
      return doc.output('datauristring').split(',')[1];
    } catch (error) {
      console.error('Error generating PDF:', error);
      return null;
    }
  };
  
  // Show PDF preview in a new window (simulating what would be emailed)
  const showPDFPreview = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text(`${cryptoName} (${cryptoSymbol}) Price Alert Report`, 20, 20);
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 20, 30);
    
    // Add alert details
    doc.setFontSize(14);
    doc.text('Alert Details', 20, 45);
    
    // Create table for alert details
    // @ts-ignore - jspdf-autotable extends jsPDF
    doc.autoTable({
      startY: 50,
      head: [['Setting', 'Value']],
      body: [
        ['Cryptocurrency', `${cryptoName} (${cryptoSymbol})`],
        ['Current Price', currentPrice],
        ['Alert Price', `$${price}`],
        ['Alert Type', alertType === 'above' ? 'Price goes above' : 'Price goes below'],
        ['Frequency', frequency === 'once' ? 'Once' : frequency === 'daily' ? 'Daily' : 'Always'],
        ['Notification Email', email]
      ],
    });
    
    // Add placeholder for chart image
    doc.text('Price Chart', 20, 120);
    doc.setDrawColor(200);
    doc.rect(20, 125, 170, 80);
    doc.setFontSize(12);
    doc.text('Chart image would be included in the actual email', 50, 165);
    
    // Add market notes
    doc.setFontSize(14);
    doc.text('Market Notes', 20, 220);
    doc.setFontSize(10);
    doc.text('This report is generated for informational purposes only and does not constitute financial advice.', 20, 230);
    doc.text('Past performance is not indicative of future results. Always do your own research before investing.', 20, 240);
    
    // Open in a new window
    window.open(URL.createObjectURL(doc.output('blob')));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Set Price Alert for ${cryptoName}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="your@email.com"
            required
          />
        </div>
        
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Alert me when price goes
          </label>
          <div className="mt-1 flex">
            <select
              value={alertType}
              onChange={(e) => setAlertType(e.target.value)}
              className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
            >
              <option value="above">Above</option>
              <option value="below">Below</option>
            </select>
            <span className="inline-flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">
              $
            </span>
            <input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-r-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="0.00"
              required
              step="0.01"
              min="0"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Current price: {currentPrice}
          </p>
        </div>
        
        <div>
          <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Alert Frequency
          </label>
          <select
            id="frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="once">Once (alert is sent once and then disabled)</option>
            <option value="daily">Daily (alert is sent once per day when condition is met)</option>
            <option value="always">Always (alert is sent every time the condition is met)</option>
          </select>
        </div>
        
        <div className="flex items-center">
          <input
            id="includeReport"
            type="checkbox"
            checked={includeReport}
            onChange={(e) => setIncludeReport(e.target.checked)}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
          />
          <label htmlFor="includeReport" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Include PDF report with current market analysis
          </label>
        </div>
        
        {formError && (
          <div className="text-sm text-red-600 dark:text-red-400">
            {formError}
          </div>
        )}
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Setting alert...' : 'Set Alert'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default PriceAlertModal; 