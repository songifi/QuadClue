import { FormEvent, useState } from 'react';
import { useAccount, useConnect } from '@starknet-react/core';
import { cartridgeConnector } from '@/lib/dojo/cartridgeConnector';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants';

export default function UsernameSignup() {
  const { address } = useAccount();
  const { connect, connectors } = useConnect();
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Show success message if connected
  if (address) {
    return (
      <div className="w-full text-center">
        <div className="mb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Welcome to QuadClue!</h3>
          <p className="text-gray-600 text-sm mb-4">Your wallet has been created successfully</p>
          <p className="text-xs text-gray-500 mb-6">
            Connected: {address.slice(0, 10)}...{address.slice(-4)}
          </p>
        </div>
        
        <button
          onClick={() => router.push(ROUTES.GAME)}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg"
        >
          🎮 Start Playing!
        </button>
      </div>
    );
  }

  async function handleSignup(e: FormEvent) {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!username.trim()) {
        throw new Error('Please enter a username');
      }

      if (username.trim().length < 3) {
        throw new Error('Username must be at least 3 characters long');
      }

      // Find cartridge connector
      const controller = connectors.find(c => c.id === cartridgeConnector.id) ?? cartridgeConnector;
      
      // Connect
      console.log('🔌 Connecting with username:', username.trim());
      await connect({ connector: controller });

      // Set username if available
      if ('setUsername' in controller) {
        try {
          await (controller as any).setUsername(username.trim());
          console.log('✅ Username set successfully');
        } catch (error) {
          console.warn('⚠️ Username setting failed:', error);
          setError('Username might already be taken. You can still play!');
        }
      }

      // Success - the component will re-render with the success state
    } catch (error: any) {
      console.error('❌ Signup error:', error);
      if (error.message?.includes('User rejected')) {
        setError('Signup was cancelled. Please try again.');
      } else if (error.message?.includes('already taken')) {
        setError('Username already taken. Please try a different one.');
      } else {
        setError(error.message || 'Failed to create wallet. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">Create Your Wallet</h3>
        <p className="text-gray-600 text-sm">Pick a username and get a smart wallet instantly</p>
      </div>
      
      <form onSubmit={handleSignup} className="flex flex-col gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choose Your Username
          </label>
          <input
            required
            disabled={isLoading}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Enter username (3+ characters)"
            value={username}
            onChange={e => setUsername(e.target.value)}
            minLength={3}
            maxLength={20}
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-start">
              <div className="text-red-500 mr-2">⚠️</div>
              <div className="text-sm text-red-700">{error}</div>
            </div>
          </div>
        )}

        <button 
          type="submit" 
          disabled={isLoading || !username.trim() || username.trim().length < 3}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Creating Wallet...
            </>
          ) : (
            '🚀 Create My Wallet'
          )}
        </button>
      </form>
      
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start">
          <div className="text-blue-500 mr-2">ℹ️</div>
          <div className="text-sm text-blue-700">
            Your wallet will be created instantly and secured with modern passkey technology. No seed phrases to remember!
          </div>
        </div>
      </div>

      {/* Additional help for new users */}
      <div className="mt-4 text-center">
        <button
          onClick={() => router.push(ROUTES.HOW_TO_PLAY)}
          className="text-blue-600 hover:text-blue-800 text-sm underline transition-colors"
        >
          Learn how to play first →
        </button>
      </div>
    </div>
  );
} 