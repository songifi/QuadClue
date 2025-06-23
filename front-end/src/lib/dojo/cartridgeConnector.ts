import { ControllerConnector } from '@cartridge/connector';
import { constants } from 'starknet';

// Simple connector with required fields based on type definitions
export const cartridgeConnector = new ControllerConnector({
  defaultChainId: constants.StarknetChainId.SN_SEPOLIA,
  chains: [
    {
      rpcUrl: 'https://api.cartridge.gg/x/starknet/sepolia',
    }
  ]
}); 