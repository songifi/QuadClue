'use client';

import { useAccount } from '@starknet-react/core';
import { WalletAccount } from '@/lib/dojo';
import { useEffect, useState, useRef } from 'react';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants';

interface WalletConnectionGuardProps {
  children: React.ReactNode;
}

// Define which routes are public (don't require wallet connection)
const PUBLIC_ROUTES: string[] = [
  ROUTES.SIGNUP,
  ROUTES.HOW_TO_PLAY,
];

// Define routes that should redirect to signup for first-time users
const PROTECTED_ROUTES: string[] = [
  ROUTES.GAME,
  ROUTES.DASHBOARD,
  ROUTES.PROFILE,
];

export const WalletConnectionGuard = React.memo(({ children }: WalletConnectionGuardProps) => {
  const { address, isConnected } = useAccount();
  const [hasAttemptedConnection, setHasAttemptedConnection] = useState(false);
  const [showConnectionPrompt, setShowConnectionPrompt] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

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
      console.log('🔒 WalletConnectionGuard (changed):', { isConnected, address, pathname });
      prevValuesRef.current = currentValues;
    }
  }, [isConnected, address, pathname]);

  // Handle route protection logic
  useEffect(() => {
    if (!isConnected) {
      // For home page, show connection prompt instead of redirecting
      if (pathname === ROUTES.HOME) {
        setShowConnectionPrompt(true);
        return;
      }

      // For protected routes, redirect to signup for better UX
      if (PROTECTED_ROUTES.includes(pathname)) {
        console.log('🔄 Redirecting unauthenticated user to signup from:', pathname);
        router.push(ROUTES.SIGNUP);
        return;
      }

      // For public routes, allow access
      if (PUBLIC_ROUTES.includes(pathname)) {
        setShowConnectionPrompt(false);
        return;
      }
    } else {
      // User is connected, hide any connection prompts
      setShowConnectionPrompt(false);
      
      // If user is on signup page and already connected, redirect to home
      if (pathname === ROUTES.SIGNUP) {
        console.log('🔄 Redirecting connected user from signup to home');
        router.push(ROUTES.HOME);
        return;
      }
    }
  }, [isConnected, pathname, router]);

  // Allow access to public routes without connection
  if (PUBLIC_ROUTES.includes(pathname)) {
    return <>{children}</>;
  }

  // Show connection prompt for home page when not connected
  if (!isConnected && showConnectionPrompt && pathname === ROUTES.HOME) {
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

          {/* Quick Signup Option - Primary CTA */}
          <div className="mb-6">
            <button
              onClick={() => router.push(ROUTES.SIGNUP)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition-colors mb-3"
            >
              🚀 New Player? Start Here!
            </button>
            <p className="text-center text-gray-400 text-sm">
              Get started instantly with just a username
            </p>
          </div>

          <div className="border-t border-gray-600 pt-4">
            <div className="text-center text-gray-400 text-sm mb-4">
              Already have a wallet? Connect it directly:
            </div>
            <WalletAccount />
            
            <div className="text-xs text-gray-500 space-y-1 mt-4">
              <p>Supported wallets:</p>
              <p>• Argent X • Braavos</p>
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

  // If not connected and trying to access a protected route, 
  // we'll redirect in useEffect, so show loading in the meantime
  if (!isConnected && PROTECTED_ROUTES.includes(pathname)) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Redirecting to signup...</p>
        </div>
      </div>
    );
  }

  // Show connected state and render children
  if (isConnected) {
    return (
      <div>
        {/* Connection Success Banner - only show on certain pages */}
        {!PUBLIC_ROUTES.includes(pathname) && (
          <div className="bg-green-900 border-b border-green-700 px-4 py-2">
            <div className="max-w-4xl mx-auto flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-400 mr-2" />
                <span className="text-sm text-green-300">
                  Connected: {address?.slice(0, 10)}...{address?.slice(-4)}
                </span>
              </div>
              <button
                onClick={() => router.push(ROUTES.PROFILE)}
                className="text-xs text-green-400 hover:text-green-300"
              >
                View Profile
              </button>
            </div>
          </div>
        )}
        
        {/* Render the actual app */}
        {children}
      </div>
    );
  }

  // Default: render children (fallback)
  return <>{children}</>;
});

WalletConnectionGuard.displayName = 'WalletConnectionGuard'; 