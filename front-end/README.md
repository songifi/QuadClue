# QuadClue Frontend

A Next.js-based word puzzle game built on the Dojo engine, where players solve puzzles by guessing words based on image clues.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Project Overview](#project-overview)
- [Local Development Setup](#local-development-setup)
- [Configuration](#configuration)
- [Game Flow](#game-flow)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Dojo CLI** (follow [Dojo installation guide](https://dojoengine.org/getting-started))
- **Git**

### Installing Dojo

If you don't have Dojo installed:

```bash
curl -L https://install.dojoengine.org | bash
dojoup
```

## Project Overview

QuadClue is a blockchain-based puzzle game where:
- Players view 4 images and guess the connecting word
- Each puzzle has available letters that can be used
- Players earn points and coins for correct answers
- Game state is stored on the Starknet blockchain via Dojo

## Local Development Setup

### Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd QuadClue/front-end

# Install dependencies (use legacy peer deps to resolve conflicts)
npm install --legacy-peer-deps
```

### Step 2: Set Up the Dojo Contract

Open a new terminal and navigate to the contract directory:

```bash
cd ../contract
```

#### Terminal 1: Start Katana (Local Starknet Node)

```bash
katana --dev --http.api dev,starknet --dev.no-fee --http.cors_origins '*'
```

Keep this terminal running. Katana will output several important details:
- Account addresses and private keys
- RPC URL (typically `http://localhost:5050`)
- World address (generated after migration)

#### Terminal 2: Build and Deploy Contracts

```bash
# Build the contracts and generate TypeScript bindings
sozo build --typescript

# Deploy the contracts to Katana
sozo migrate
```

**Important:** After running `sozo migrate`, note the `WORLD_ADDRESS` from the output. You'll need this for the next steps.

#### Terminal 3: Start Torii (Dojo Indexer)

```bash
# Replace <WORLD_ADDRESS> with the actual world address from sozo migrate
torii --world <WORLD_ADDRESS> --http.cors_origins "*"
```

### Step 3: Update Frontend Configuration

#### Update Manifest File

After running `sozo migrate`, a new `manifest_dev.json` file is generated in the contract directory. Copy this file to the frontend:

```bash
# From the contract directory
cp manifest_dev.json ../front-end/
```

#### Update Dojo Configuration

Open `front-end/src/lib/dojo/dojoConfig.ts` and update the master address and private key to match your Katana instance:

```typescript
export const dojoConfig = createDojoConfig({
    // Replace these with the account details from your Katana output
    masterAddress: "0x127fd5f1fe78a71f8bcd1fec63e3fe2f0486b6ecd5c86a0466c3a21fa5cfcec",
    masterPrivateKey: "0xc5b2fcab997346f3ea1c00b002ecf6f382c5f9c9659a3894eb783c5320f912",
    
    // These usually don't need to change for local development
    accountClassHash: "0x07dc7899aa655b0aae51eadff6d801a58e97dd99cf4666ee59e704249e51adf2",
    feeTokenAddress: "0x4718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
    manifest,
});
```

### Step 4: Start the Frontend

```bash
# From the front-end directory
npm run dev
```

The application will be available at `http://localhost:3000`.

## Configuration

### Key Configuration Files

1. **`dojoConfig.ts`** - Main Dojo configuration
2. **`manifest_dev.json`** - Generated contract manifest (must be updated after each migration)
3. **`package.json`** - Dependencies and scripts

### Environment Variables

The app uses these default configurations:
- **RPC URL**: `http://localhost:5050` (Katana)
- **Torii URL**: `http://localhost:8080` (Torii indexer)

## Game Flow

### 1. Connect Wallet

When you first open the app:
1. The app will prompt you to connect a wallet
2. Use one of the pre-deployed Katana accounts
3. The app supports Katana's built-in accounts for local development

### 2. Create Test Puzzles (Dashboard)

Navigate to `/dashboard` to create puzzles:

1. **Quick Test**: Click "Create Test Puzzle (PAINT)" to create a pre-configured puzzle
2. **Custom Puzzle**: 
   - Fill in 4 image hashes
   - Provide an answer (3+ characters)
   - Click "Create Puzzle"

Example test puzzle data:
- **Images**: 4 URLs or hashes representing the concept
- **Answer**: The word that connects all images (e.g., "PAINT")

### 3. Play the Game

Navigate to `/game` to play:

1. View the 4 images
2. Use available letters to spell the answer
3. Letters are shuffled - use the shuffle button to rearrange
4. Complete puzzles to earn points and advance levels

### 4. Game Features

- **Hints**: Use hints to reveal letters (limited per puzzle)
- **Scoring**: Based on time and hints used
- **Progression**: Unlock new levels by completing puzzles
- **Persistence**: Game state is saved on the blockchain

## Troubleshooting

### Common Issues

#### 1. "Failed to Initialize Dojo SDK"

**Symptoms**: App shows initialization error

**Solutions**:
- Ensure Katana is running on `http://localhost:5050`
- Verify Torii is running and connected to the correct world address
- Check that `manifest_dev.json` is up to date
- Restart all services in order: Katana → Deploy → Torii → Frontend

#### 2. Wallet Connection Issues

**Symptoms**: Cannot connect wallet or transactions fail

**Solutions**:
- Use the correct account address/private key from Katana output
- Ensure the account has sufficient balance (Katana provides prefunded accounts)
- Check browser console for connection errors

#### 3. Contract Interaction Errors

**Symptoms**: Puzzle creation or game actions fail

**Solutions**:
- Verify the world address in Torii matches the deployed world
- Ensure all contracts are properly migrated
- Check that the account has necessary permissions

#### 4. "Module not found" or Dependency Issues

**Symptoms**: Build errors or import failures

**Solutions**:
```bash
# Clear dependencies and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Debug Mode

The app includes debug features:
- Console logging for wallet connections and SDK status
- Debug buttons in the dashboard for testing
- Connection status indicators

### Starting Fresh

To completely reset your local environment:

1. **Stop all services** (Katana, Torii, Frontend)
2. **Restart Katana** with a fresh state
3. **Rebuild and redeploy** contracts:
   ```bash
   sozo build --typescript
   sozo migrate
   ```
4. **Update manifest** in frontend
5. **Restart Torii** with new world address
6. **Update dojoConfig.ts** with new account details
7. **Restart frontend**

## Scripts

Available npm scripts:

```bash
# Development server with Turbopack
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Architecture

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Blockchain**: Starknet via Dojo engine
- **State Management**: Zustand + Dojo SDK
- **Wallet**: Starknet React with Katana accounts

---

For more information about Dojo development, visit the [official documentation](https://dojoengine.org).
