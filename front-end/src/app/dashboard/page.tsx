'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from '@starknet-react/core';
import { useSystemCalls } from '@/lib/dojo';
import { getTestPuzzleData, getBatchPuzzleData } from '@/lib/dojo/usePuzzles';
import { ROUTES } from '@/lib/constants';
import toast, { Toaster } from 'react-hot-toast';

export default function Dashboard() {
  const { createPuzzle, addBatchPuzzle, isConnected, account } = useSystemCalls();
  const testPuzzleData = getTestPuzzleData();
  const batchPuzzleData = getBatchPuzzleData();
  const router = useRouter();
  
  // Simple debug logging
  useEffect(() => {
    console.log('🔍 Dashboard Debug:', {
      isConnected,
      account: account?.address
    });
  }, [isConnected, account]);
  
  const [formData, setFormData] = useState({
    imageHash1: '',
    imageHash2: '',
    imageHash3: '',
    imageHash4: '',
    answer: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isBatchLoading, setIsBatchLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Quick test function to create a test puzzle
  const handleCreateTestPuzzle = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    const testData = testPuzzleData[0]; // Use first test puzzle (PAINT)
    
    try {
      setIsLoading(true);
      console.log('🧪 Creating test puzzle with data:', testData);
      
      await createPuzzle(testData.imageHashes, testData.answer);
      
      toast.success('Test puzzle created successfully!');
    } catch (error) {
      console.error('Error creating test puzzle:', error);
      toast.error('Failed to create test puzzle');
    } finally {
      setIsLoading(false);
    }
  };

  // New function to create batch puzzles
  const handleCreateBatchPuzzles = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      setIsBatchLoading(true);
      console.log('🚀 Creating batch puzzles with data:', batchPuzzleData);
      
      await addBatchPuzzle(batchPuzzleData);
      
      toast.success(`Successfully created ${batchPuzzleData.length} puzzles!`);
    } catch (error) {
      console.error('Error creating batch puzzles:', error);
      toast.error('Failed to create batch puzzles');
    } finally {
      setIsBatchLoading(false);
    }
  };

  // Load test data into form
  const handleLoadTestData = () => {
    const testData = testPuzzleData[0]; // Use first test puzzle
    setFormData({
      imageHash1: testData.imageHashes[0],
      imageHash2: testData.imageHashes[1],
      imageHash3: testData.imageHashes[2],
      imageHash4: testData.imageHashes[3],
      answer: testData.answer,
    });
    toast.success('Test data loaded into form!');
  };

  const handleCreatePuzzle = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    // Validate form
    const { imageHash1, imageHash2, imageHash3, imageHash4, answer } = formData;
    
    if (!imageHash1 || !imageHash2 || !imageHash3 || !imageHash4) {
      toast.error('Please provide all 4 image hashes');
      return;
    }
    
    if (!answer.trim()) {
      toast.error('Please provide an answer');
      return;
    }

    if (answer.length < 3) {
      toast.error('Answer must be at least 3 characters');
      return;
    }

    try {
      setIsLoading(true);
      
      const imageHashes = [imageHash1, imageHash2, imageHash3, imageHash4];
      
      // Use createPuzzle, but if it fails due to account issues, we'll handle it
      console.log('🎯 Creating puzzle with account:', (account as any)?.address);
      await createPuzzle(imageHashes, answer.toUpperCase());
      
      // Reset form on success
      setFormData({
        imageHash1: '',
        imageHash2: '',
        imageHash3: '',
        imageHash4: '',
        answer: '',
      });
      
    } catch (error) {
      console.error('Error creating puzzle:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Toaster position="top-right" />
      
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">QuadClue Dashboard</h1>
            <button 
              onClick={() => {
                console.log('🚨 Manual Debug Trigger - Current State:', {
                  isConnected,
                  account: account?.address,
                  timestamp: new Date().toISOString()
                });
                alert('Check console for debug info!');
              }}
              className="px-3 py-1 bg-yellow-600 hover:bg-yellow-500 text-white text-xs rounded transition-colors"
            >
              Debug Console
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        
        {/* Debug Info */}
        <div className="mb-8">
          <div className="p-4 bg-gray-800 rounded border border-gray-600">
            <p className="text-sm text-gray-400 mb-2">Connection Status:</p>
            <p className="text-sm text-green-400">✅ Wallet Connected: {(account as any)?.address?.slice(0, 10)}...{(account as any)?.address?.slice(-4)}</p>
            <button 
              onClick={async () => {
                try {
                  // Test wallet connection
                  if (account && 'getChainId' in account) {
                    const chainId = await account.getChainId();
                    alert(`Wallet working! Chain ID: ${chainId}`);
                  } else {
                    alert(`Wallet connected! Address: ${(account as any)?.address}`);
                  }
                } catch (error) {
                  console.error('Wallet test failed:', error);
                  alert('Wallet connection test failed - see console for details');
                }
              }}
              className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded transition-colors"
            >
              Test Wallet Connection
            </button>
          </div>
        </div>

        {/* Quick Test Actions */}
        <div className="mb-8 bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-4">🧪 Quick Test Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleCreateTestPuzzle}
              disabled={!isConnected || isLoading}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create Test Puzzle (PAINT)'}
            </button>
            <button
              onClick={handleCreateBatchPuzzles}
              disabled={!isConnected || isBatchLoading}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            >
              {isBatchLoading ? `Creating ${batchPuzzleData.length}...` : `Create Batch Puzzles (${batchPuzzleData.length})`}
            </button>
            <button
              onClick={handleLoadTestData}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md transition-colors"
            >
              Load Test Data Into Form
            </button>
            <button
              onClick={() => router.push(ROUTES.GAME)}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-md transition-colors flex items-center gap-2"
            >
              <span>🎮</span>
              Go to Game
            </button>
          </div>
          <div className="mt-3 space-y-1">
            <p className="text-xs text-gray-400">
              Test with existing images: paint1.png, paint2.png, paint3.png, paint4.png
            </p>
            <p className="text-xs text-gray-400">
              Batch puzzles: Book, Cold, Fire, Happy, Light, Money, Music, Sky, Time, Water
            </p>
          </div>
        </div>

        {/* Create Puzzle Form */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-semibold mb-6">Create New Puzzle</h2>
          
          <form onSubmit={handleCreatePuzzle} className="space-y-6">
            
            {/* Image Hashes */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Image Hashes (4 required)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((num) => (
                  <div key={num}>
                    <label className="block text-xs text-gray-400 mb-1">
                      Image {num}
                    </label>
                    <input
                      type="text"
                      value={formData[`imageHash${num}` as keyof typeof formData]}
                      onChange={(e) => handleInputChange(`imageHash${num}`, e.target.value)}
                      placeholder={`Hash for image ${num}`}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Answer */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Answer
              </label>
              <input
                type="text"
                value={formData.answer}
                onChange={(e) => handleInputChange('answer', e.target.value)}
                placeholder="Enter the puzzle answer"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                maxLength={20}
              />
              <p className="text-xs text-gray-400 mt-1">
                Answer will be converted to uppercase
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!isConnected || isLoading}
                className={`px-6 py-3 rounded-md font-medium transition-colors ${
                  !isConnected || isLoading
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Creating Puzzle...
                  </div>
                ) : (
                  'Create Puzzle'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4">How to Create a Puzzle</h3>
          <div className="space-y-2 text-gray-300">
            <p>• Connect your wallet using the button in the top right</p>
            <p>• Provide 4 image hashes that represent clues for your puzzle</p>
            <p>• Enter the answer that players need to guess</p>
            <p>• Click "Create Puzzle" to submit to the blockchain</p>
          </div>
        </div>

        {/* Example Section */}
        <div className="mt-6 bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h3 className="text-lg font-semibold mb-4">Example</h3>
          <div className="space-y-2 text-gray-400 text-sm">
            <p><strong>Image Hashes:</strong></p>
            <p>• hash1: "red_car_image_hash"</p>
            <p>• hash2: "blue_house_hash"</p>
            <p>• hash3: "green_tree_hash"</p>
            <p>• hash4: "yellow_sun_hash"</p>
            <p><strong>Answer:</strong> "NATURE" or "COLORS"</p>
          </div>
        </div>
      </div>
    </div>
  );
} 