'use client';

import React, { useState, useRef } from 'react';
import Modal from './Modal';

interface AddNFTModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNFT: (nft: {
    name: string;
    collection: string;
    image: string | File;
    purchaseDate: string;
    purchasePrice: string;
  }) => void;
}

const AddNFTModal: React.FC<AddNFTModalProps> = ({ isOpen, onClose, onAddNFT }) => {
  const [name, setName] = useState('');
  const [collection, setCollection] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const collectionOptions = [
    'Bored Ape Yacht Club',
    'Azuki',
    'Doodles',
    'Moonbirds',
    'CloneX',
    'CryptoPunks',
    'World of Women',
    'Art Blocks',
    'Other'
  ];

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Basic validation
    if (!name) {
      setError('NFT name is required');
      return;
    }
    
    if (!collection) {
      setError('Collection is required');
      return;
    }
    
    if (!purchaseDate) {
      setError('Purchase date is required');
      return;
    }
    
    if (!purchasePrice) {
      setError('Purchase price is required');
      return;
    }
    
    if (!image && !imagePreview) {
      setError('Please upload an image for your NFT');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // In a real app, this would upload the image to a storage service
      // For this demo, we'll use the image preview URL or a placeholder emoji
      const imageData = imagePreview || '🖼️';
      
      onAddNFT({
        name,
        collection,
        image: imageData,
        purchaseDate,
        purchasePrice: purchasePrice + ' ETH'
      });
      
      // Reset form
      setName('');
      setCollection('');
      setPurchaseDate('');
      setPurchasePrice('');
      setImagePreview(null);
      setImage(null);
      
      onClose();
    } catch (err) {
      console.error('Error adding NFT:', err);
      setError('Failed to add NFT. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New NFT"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image upload */}
        <div className="flex flex-col items-center">
          <div 
            onClick={handleImageClick}
            className={`h-48 w-48 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:border-primary transition-colors ${
              imagePreview ? 'border-primary' : 'border-gray-700'
            }`}
          >
            {imagePreview ? (
              <img 
                src={imagePreview} 
                alt="NFT Preview" 
                className="h-full w-full object-cover rounded-lg"
              />
            ) : (
              <div className="text-center p-4">
                <div className="text-3xl mb-2">🖼️</div>
                <p className="text-sm text-gray-400">Click to upload image</p>
                <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF, SVG</p>
              </div>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageChange}
            className="hidden"
            accept="image/*"
          />
        </div>
        
        {/* NFT Details */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            NFT Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="e.g. Bored Ape #1234"
            required
          />
        </div>
        
        <div>
          <label htmlFor="collection" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Collection
          </label>
          <select
            id="collection"
            value={collection}
            onChange={(e) => setCollection(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          >
            <option value="">Select Collection</option>
            {collectionOptions.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="purchaseDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Purchase Date
          </label>
          <input
            id="purchaseDate"
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            required
          />
        </div>
        
        <div>
          <label htmlFor="purchasePrice" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Purchase Price (ETH)
          </label>
          <div className="relative">
            <input
              id="purchasePrice"
              type="number"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <span className="text-gray-500 sm:text-sm">ETH</span>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="text-sm text-red-600 dark:text-red-400">
            {error}
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
            {isSubmitting ? 'Adding...' : 'Add NFT'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddNFTModal; 