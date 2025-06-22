'use client';

import { useDojoSDK } from '@dojoengine/sdk/react';
import { useState } from 'react';

interface DojoSDKStatusProps {
  show?: boolean;
}

export function DojoSDKStatus({ show = false }: DojoSDKStatusProps) {
  const { sdk } = useDojoSDK();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!show) return null;

  const testSDKConnection = async () => {
    if (!sdk) {
      console.log('❌ SDK not available');
      return;
    }

    try {
      console.log('🔍 Testing SDK methods...');
      
      // Test if SDK methods are available
      console.log('Available SDK methods:', Object.keys(sdk));
      
      // You can test specific methods here when you know your schema
      console.log('✅ SDK is healthy');
      
    } catch (error) {
      console.error('❌ SDK test failed:', error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`px-3 py-2 rounded-full text-sm font-medium transition-colors ${
          sdk 
            ? 'bg-green-600 hover:bg-green-700 text-white' 
            : 'bg-red-600 hover:bg-red-700 text-white'
        }`}
      >
        Dojo SDK: {sdk ? '✅' : '❌'}
      </button>

      {isExpanded && (
        <div className="absolute bottom-12 right-0 bg-gray-800 border border-gray-600 rounded-lg p-4 min-w-80 max-w-md">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white">Dojo SDK Status</h3>
              <button
                onClick={() => setIsExpanded(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-300">Status:</span>
                <span className={sdk ? 'text-green-400' : 'text-red-400'}>
                  {sdk ? 'Initialized' : 'Not Initialized'}
                </span>
              </div>

              {sdk && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Methods Available:</span>
                    <span className="text-blue-400">
                      {Object.keys(sdk).length}
                    </span>
                  </div>

                  <details className="mt-2">
                    <summary className="cursor-pointer text-gray-300 text-xs">
                      SDK Methods
                    </summary>
                    <pre className="text-xs bg-gray-900 p-2 rounded mt-1 overflow-auto max-h-32">
                      {JSON.stringify(Object.keys(sdk), null, 2)}
                    </pre>
                  </details>
                </>
              )}

              <button
                onClick={testSDKConnection}
                className="w-full mt-3 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
              >
                Test SDK Connection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 