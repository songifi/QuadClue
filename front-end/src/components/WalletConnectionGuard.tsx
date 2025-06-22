'use client';

import { useAccount } from '@starknet-react/core';
import { WalletAccount } from '@/lib/dojo';
import { useEffect, useState, useRef } from 'react';
import React from 'react';

interface WalletConnectionGuardProps {
  children: React.ReactNode;
}

export const WalletConnectionGuard = React.memo(({ children }: WalletConnectionGuardProps) => {
  const { address, isConnected } = useAccount();
  const [hasAttemptedConnection, setHasAttemptedConnection] = useState(false);

  // Use ref to track previous values for debugging
  const prevValuesRef = useRef({
    isConnected: false,
    address: undefined as string | undefined,
  });

  useEffect(() => {
    const currentValues = {
      isConnected: !!isConnected,
      address,
    };

    // Only log if values have actually changed
    const hasChanged = 
      prevValuesRef.current.isConnected !== currentValues.isConnected ||
      prevValuesRef.current.address !== currentValues.address;

    if (hasChanged) {
      console.log('🔒 WalletConnectionGuard (changed):', { isConnected, address });
      prevValuesRef.current = currentValues;
    }
  }, [isConnected, address]);

  // Show connection screen if not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="max-w-md mx-auto p-8 bg-gray-800 rounded-lg border border-gray-700 text-center">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">QuadClue</h1>
            <p className="text-gray-300">Connect your wallet to start playing</p>
          </div>

          <div className="mb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              You need to connect a Starknet wallet to play QuadClue
            </p>
          </div>

          {/* Wallet Connection */}
          <div className="space-y-4">
            <WalletAccount />
            
            <div className="text-xs text-gray-500 space-y-1">
              <p>Supported wallets:</p>
              <p>• Argent X</p>
              <p>• Braavos</p>
            </div>
          </div>

          {/* Connection Status */}
          <div className="mt-6 p-3 bg-gray-700 rounded border border-gray-600">
            <div className="flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-red-400 mr-2" />
              <span className="text-sm text-red-300">Wallet Not Connected</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show connected state and render children
  return (
    <div>
      {/* Connection Success Banner */}
      <div className="bg-green-900 border-b border-green-700 px-4 py-2">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-green-400 mr-2" />
            <span className="text-sm text-green-300">
              Connected: {address?.slice(0, 10)}...{address?.slice(-4)}
            </span>
          </div>
          <button
            onClick={() => {
              // You can add disconnect functionality here if needed
              console.log('Wallet info:', { address, isConnected });
            }}
            className="text-xs text-green-400 hover:text-green-300"
          >
            View Details
          </button>
        </div>
      </div>
      
      {/* Render the actual app */}
      {children}
    </div>
  );
});

WalletConnectionGuard.displayName = 'WalletConnectionGuard'; 