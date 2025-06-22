'use client';

import React, { createContext, useContext, useMemo, useEffect, useRef } from 'react';
import { useDojoSDK } from '@dojoengine/sdk/react';
import { useSystemCalls } from '@/lib/dojo/useSystemCalls';

interface DojoContextValue {
  client: any;
  systemCalls: ReturnType<typeof useSystemCalls>;
}

const DojoContext = createContext<DojoContextValue | null>(null);

export const DojoProvider = React.memo(({ children }: { children: React.ReactNode }) => {
  const { client } = useDojoSDK();
  const systemCalls = useSystemCalls();

  // Use ref to track previous values for debugging
  const prevValuesRef = useRef({
    clientExists: false,
    systemCallsExists: false,
  });

  const value = useMemo(() => ({
    client,
    systemCalls,
  }), [client, systemCalls]);

  // Optimized debug logging - only log when values actually change
  useEffect(() => {
    const currentValues = {
      clientExists: !!client,
      systemCallsExists: !!systemCalls,
    };

    // Only log if values have actually changed
    const hasChanged = 
      prevValuesRef.current.clientExists !== currentValues.clientExists ||
      prevValuesRef.current.systemCallsExists !== currentValues.systemCallsExists;

    if (hasChanged) {
      console.log('🎯 DojoProvider Debug (changed):', {
        clientExists: !!client,
        clientKeys: client ? Object.keys(client) : [],
        systemCallsExists: !!systemCalls,
      });

      prevValuesRef.current = currentValues;
    }
  }, [client, systemCalls]);

  return <DojoContext.Provider value={value}>{children}</DojoContext.Provider>;
});

DojoProvider.displayName = 'DojoProvider';

export const useDojo = () => {
  const context = useContext(DojoContext);
  if (!context) {
    throw new Error('useDojo must be used within a DojoProvider');
  }
  return context;
}; 