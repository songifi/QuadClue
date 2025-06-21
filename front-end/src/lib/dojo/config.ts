export interface DojoConfig {
  rpcUrl: string;
  toriiUrl: string;
  relayUrl?: string;
  worldAddress: string;
  masterAccount: {
    address: string;
    privateKey: string;
  };
  accountClassHash: string;
}

export const dojoConfig: DojoConfig = {
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || "http://localhost:5050",
  toriiUrl: process.env.NEXT_PUBLIC_TORII_URL || "http://localhost:8080",
  relayUrl: process.env.NEXT_PUBLIC_RELAY_URL || "http://localhost:9090",
  worldAddress: process.env.NEXT_PUBLIC_WORLD_ADDRESS || "",
  masterAccount: {
    address: process.env.NEXT_PUBLIC_MASTER_ADDRESS || "",
    privateKey: process.env.NEXT_PUBLIC_MASTER_PRIVATE_KEY || "",
  },
  accountClassHash: process.env.NEXT_PUBLIC_ACCOUNT_CLASS_HASH || "",
};
