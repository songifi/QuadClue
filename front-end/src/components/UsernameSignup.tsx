import { FormEvent, useState } from 'react';
import { useAccount, useConnect } from '@starknet-react/core';
import { cartridgeConnector } from '@/lib/dojo/cartridgeConnector';

export default function UsernameSignup() {
  const { address } = useAccount();
  const { connect, connectors } = useConnect();
  const [username, setUsername] = useState('');

  // Only show the form if not connected
  if (address) {
    return null;
  }

  async function handleSignup(e: FormEvent) {
    e.preventDefault();

    try {
      // Find cartridge connector
      const controller = connectors.find(c => c.id === cartridgeConnector.id) ?? cartridgeConnector;
      
      // Connect
      await connect({ connector: controller });

      // Set username if available
      if ('setUsername' in controller) {
        try {
          await (controller as any).setUsername(username.trim());
        } catch {
          alert('Username already taken 🥲');
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      alert('Failed to create wallet. Please try again.');
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
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            placeholder="Enter username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
        </div>
        <button 
          type="submit" 
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg"
        >
          🚀 Create My Wallet
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
    </div>
  );
} 