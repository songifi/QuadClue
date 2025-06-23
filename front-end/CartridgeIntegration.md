# Adding Cartridge Controller (Username → Wallet) to QuadClue

This guide shows the **minimal set of code changes** required to let a player
pick a username and instantly get a Cartridge smart-contract wallet that works
with your existing Dojo/Starknet hooks.

Nothing in the game logic changes – we only:

1. install two npm packages,
2. expose a global `ControllerConnector`,
3. extend the existing `StarknetProvider`, and
4. add a tiny React component (`UsernameSignup`).

---

## 1  Install dependencies

```bash
cd front-end
npm i @cartridge/controller @cartridge/connector
```
(*These pull in `starknet` v6 automatically.*)

---

## 2  Create one global Cartridge connector

`front-end/src/lib/dojo/cartridgeConnector.ts`
```ts
import ControllerConnector from '@cartridge/connector/controller';

/**
 * A **single** instance for the whole app. Re-creating it every render
 * would break the embedded key-chain iframe.
 */
export const cartridgeConnector = new ControllerConnector({
  // Use your own RPC if you have one; otherwise keep the default.
  rpc: 'https://api.cartridge.gg/x/starknet/sepolia',
});
```

---

## 3  Expose the connector in `StarknetConfig`

Edit **`front-end/src/lib/dojo/starknet-provider.tsx`**

```diff
@@
 import { mainnet } from "@starknet-react/chains";
 import { jsonRpcProvider, StarknetConfig, voyager } from "@starknet-react/core";
 import { dojoConfig } from "./dojoConfig";
 import { usePredeployedAccounts } from "@dojoengine/predeployed-connector/react";
+import { cartridgeConnector } from "./cartridgeConnector";   // ← NEW
@@
-export default function StarknetProvider({ children }: PropsWithChildren) {
-    const { connectors } = usePredeployedAccounts({
+export default function StarknetProvider({ children }: PropsWithChildren) {
+    const { connectors: predeployed } = usePredeployedAccounts({
@@
-            provider={provider}
-            connectors={connectors}
+            provider={provider}
+            connectors={[cartridgeConnector, ...predeployed]}
```

Result: • local Katana "pre-deployed accounts" **and** Cartridge appear in every
`useConnect()` dropdown. — In production you will only see Cartridge.

---

## 4  Username-signup component

`front-end/src/components/UsernameSignup.tsx`
```tsx
import { FormEvent, useState } from 'react';
import { useAccount, useConnect, useDisconnect } from '@starknet-react/core';
import { cartridgeConnector } from '@/lib/dojo/cartridgeConnector';

export default function UsernameSignup() {
  const { address }             = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect }          = useDisconnect();
  const [username, setUsername] = useState('');

  // Pick the singleton from the list, or fall back to the import.
  const controller =
    connectors.find(c => c.id === cartridgeConnector.id) ?? cartridgeConnector;

  async function handleSignup(e: FormEvent) {
    e.preventDefault();

    // 1  Connect → (one pass-key / allow-site prompt)
    await connect({ connector: controller });

    // 2  If the account has no name yet, try to claim it.
    const current = await controller.username();
    if (!current) {
      try {
        await controller.setUsername(username.trim());
      } catch {
        alert('Username already taken 🥲');
      }
    }
  }

  return (
    <form onSubmit={handleSignup} className="flex flex-col gap-4">
      {address ? (
        <>
          <p className="text-sm break-all">Connected: {address}</p>
          <p className="text-sm">Username: {controller.usernameSync() ?? '<not set>'}</p>
          <button type="button" className="btn" onClick={() => disconnect()}>
            Disconnect
          </button>
        </>
      ) : (
        <>
          <input
            required
            className="input input-bordered"
            placeholder="Pick a username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">Get my wallet</button>
        </>
      )}
    </form>
  );
}
```

🌟 **Flow**
1. Player types a handle and clicks *Get my wallet* → `connect()` launches the
   embedded Controller, creating (or restoring) the smart-contract account.
2. If the account is fresh (no username), `setUsername` attempts to register the
   chosen handle. It throws if the name is already taken.
3. `useAccount()` (everywhere else in your code) now supplies this Cartridge
   wallet seamlessly.

---

## 5  Mount the component (example)

`front-end/src/app/profile/page.tsx`
```tsx
import UsernameSignup from '@/components/UsernameSignup';

export default function ProfilePage() {
  return (
    <main className="mx-auto max-w-md py-10">
      <h1 className="text-2xl font-bold mb-6">My Wallet</h1>
      <UsernameSignup />
    </main>
  );
}
```

You can place the component anywhere (navbar dropdown, modal, dedicated page).

---

## 6  Done!

• Players onboard with just a username.  
• Local-dev Katana accounts still work.  
• All existing Dojo hooks (`useSystemCalls`, …) receive the new account
  automatically.

Need advanced features? Open another ticket and we'll cover:
• session-key policies (gasless/game-only calls),  
• Cartridge Achievements,  
• Username cosmetics,  
• custom themes for the embedded UI, etc. 