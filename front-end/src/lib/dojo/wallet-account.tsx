import {
    Connector,
    useAccount,
    useConnect,
    useDisconnect,
} from "@starknet-react/core";
import { useCallback, useState, useEffect, useRef } from "react";
import React from "react";

export const WalletAccount = React.memo(() => {
    const { connectAsync, connectors } = useConnect();
    const { account, address } = useAccount();
    const { disconnect } = useDisconnect();
    const [pendingConnectorId, setPendingConnectorId] = useState<
        string | undefined
    >(undefined);

    // Use ref to track previous values for debugging
    const prevValuesRef = useRef({
        address: undefined as string | undefined,
        connectorsCount: 0,
        pendingConnectorId: undefined as string | undefined,
    });

    // Debug logging for wallet connection - only when values change
    useEffect(() => {
        const currentValues = {
            address,
            connectorsCount: connectors.length,
            pendingConnectorId,
        };

        // Only log if values have actually changed
        const hasChanged = 
            prevValuesRef.current.address !== currentValues.address ||
            prevValuesRef.current.connectorsCount !== currentValues.connectorsCount ||
            prevValuesRef.current.pendingConnectorId !== currentValues.pendingConnectorId;

        if (hasChanged) {
            console.log('🔗 WalletAccount Debug (changed):', {
                address,
                connectorsCount: connectors.length,
                connectors: connectors.map(c => ({ id: c.id, name: c.name, available: c.available() })),
                pendingConnectorId
            });

            prevValuesRef.current = currentValues;
        }
    }, [address, connectors.length, pendingConnectorId, connectors]);
//connect wallet 
    const connect = useCallback(
        async (connector: Connector) => {
            console.log('🔌 Attempting to connect with:', connector.name);
            setPendingConnectorId(connector.id);
            try {
                const result = await connectAsync({ connector });
                console.log('✅ Connection successful:', result);
            } catch (error) {
                console.error('❌ Connection failed:', error);
            }
            setPendingConnectorId(undefined);
        },
        [connectAsync]
    );

    const isWalletConnecting = useCallback((connectorId: string) => {
        return pendingConnectorId === connectorId;
    }, [pendingConnectorId]);

    if (undefined !== address) {
        return (
            <div className="mb-6">
                <div style={{ display: "flex", gap: "1rem" }}>
                    <button
                        onClick={() => disconnect()}
                        className="text-white border border-white p-3"
                    >
                        Disconnect
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-6">
            <h2 className="text-white">Connect Wallet</h2>
            <div style={{ display: "flex", gap: "1rem" }}>
                {connectors.map((connector) => (
                    <button
                        key={connector.id}
                        onClick={() => connect(connector)}
                        disabled={!connector.available()}
                        className="text-white border border-white p-3"
                    >
                        {connector.name}
                        {isWalletConnecting(connector.id) && "Connecting"}
                    </button>
                ))}
            </div>
        </div>
    );
});

WalletAccount.displayName = 'WalletAccount';