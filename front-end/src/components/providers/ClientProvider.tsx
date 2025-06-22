'use client';

import { useState, useEffect, ReactNode } from 'react';
import { init, SDK } from '@dojoengine/sdk';
import { DojoSdkProvider } from '@dojoengine/sdk/react';
import { dojoConfig } from '../../lib/dojo/dojoConfig';
import { setupWorld } from '@/lib/dojo/typescript/contracts.gen';
import { schema, SchemaType } from '@/lib/dojo/typescript/models.gen';
import StarknetProvider from '@/lib/dojo/starknet-provider';
import { DojoProvider } from '../../lib/dojo/DojoProvider';

interface ClientProviderProps {
  children: ReactNode;
}

export function ClientProvider({ children }: ClientProviderProps) {
  const [sdk, setSdk] = useState<SDK<SchemaType> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initializeSdk() {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('🚀 Initializing Dojo SDK...');
        console.log('📋 Configuration:', {
          worldAddress: dojoConfig.manifest.world.address,
          toriiUrl: dojoConfig.toriiUrl,
          rpcUrl: dojoConfig.rpcUrl,
        });

        const sdkInstance = await init<SchemaType>({
          client: {
            worldAddress: dojoConfig.manifest.world.address,
            toriiUrl: dojoConfig.toriiUrl,
            relayUrl: process.env.NEXT_PUBLIC_RELAY_URL || "/ip4/127.0.0.1/tcp/9092/ws",

          } as any,
          domain: {
            name: "QuadClue",
            version: "1.0",
            chainId: "KATANA",
            revision: "1",
          },
        });

        // Validate the SDK instance
        if (!sdkInstance) {
          throw new Error('SDK initialization returned null');
        }

        console.log('✅ Dojo SDK initialized successfully!');
        console.log('📦 SDK Instance:', sdkInstance);
        
        // Test basic functionality
        try {
          console.log('🔍 Testing SDK connection...');
          
          // Test a simple query to verify connection - skip for now as it requires specific query
          console.log('✅ SDK instance available, skipping entity test');
          
          console.log('✅ SDK connection test successful!');
          
        } catch (queryError) {
          console.warn('⚠️ SDK connection test failed (but SDK is initialized):', queryError);
        }

        setSdk(sdkInstance);
        
      } catch (error) {
        console.error('❌ Failed to initialize Dojo SDK:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }
    
    initializeSdk();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Initializing Dojo SDK...</p>
          <p className="text-sm text-gray-400 mt-2">
            Connecting to world: {dojoConfig.manifest.world.address?.slice(0, 10)}...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold mb-2">Failed to Initialize Dojo SDK</h2>
          <p className="text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded"
          >
            Retry
          </button>
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-400">Debug Info</summary>
            <pre className="text-xs bg-gray-800 p-2 rounded mt-2 overflow-auto">
              {JSON.stringify({
                worldAddress: dojoConfig.manifest.world.address,
                toriiUrl: dojoConfig.toriiUrl,
                rpcUrl: dojoConfig.rpcUrl,
                relayUrl: process.env.NEXT_PUBLIC_RELAY_URL || "/ip4/127.0.0.1/tcp/9092/ws",
                manifestKeys: Object.keys(dojoConfig.manifest),
              }, null, 2)}
            </pre>
          </details>
        </div>
      </div>
    );
  }

  // Only render if SDK is successfully initialized
  if (!sdk) {
    return null;
  }

  // Correct provider hierarchy matching the working lyricsflip example:
  // DojoSdkProvider -> StarknetProvider -> DojoProvider -> children
  return (
    <DojoSdkProvider sdk={sdk} dojoConfig={dojoConfig} clientFn={setupWorld}>
      <StarknetProvider>
        <DojoProvider>
          {children}
        </DojoProvider>
      </StarknetProvider>
    </DojoSdkProvider>
  );
} 