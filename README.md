# QuadClue

A blockchain-based word puzzle game built on the Dojo engine, where players solve puzzles by guessing words based on image clues.

## Table of Contents

- [Overview](#overview)
- [How to Play](#how-to-play)
- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Game Flow](#game-flow)
- [Troubleshooting](#troubleshooting)
- [Architecture](#architecture)

## Overview

QuadClue is a decentralized puzzle game where:
- Players view 4 images and guess the connecting word
- Each puzzle has available letters that can be used to form the answer
- Players earn points and coins for correct answers
- Game state is stored on the Starknet blockchain via Dojo
- Features include hints, scoring system, and level progression

## How to Play

### Step 1: Study the Images
- Look at all **4 pictures** carefully
- Find the **common theme** or connection between them
- Think about what word could describe or relate to all images

### Step 2: Check the Word Length
- Look at the **word slots** (empty boxes)
- Count how many letters the answer has
- This gives you a clue about the word length

### Step 3: Use Available Letters
- You'll see **12 letters** at the bottom of the screen
- These are the **only letters** you can use to form your answer
- **Drag and drop** or **tap** letters to spell your guess
- You can only use each letter **once** (unless it appears multiple times)

### Step 4: Submit Your Guess
- Once you've spelled out your word, **submit your guess**
- If correct: ✅ You earn points and solve the puzzle!
- If wrong: ❌ Try again with different letters

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

## Local Development Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd QuadClue
```

### Step 2: Set Up the Dojo Contract

Navigate to the contract directory and set up the blockchain infrastructure:

```bash
cd contract
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

### Step 3: Set Up the Frontend

Open a new terminal and navigate to the frontend directory:

```bash
cd ../front-end

# Install dependencies (use legacy peer deps to resolve conflicts)
npm install --legacy-peer-deps
```

#### Update Frontend Configuration

1. **Update Manifest File**

After running `sozo migrate`, copy the generated manifest file to the frontend:

```bash
# From the contract directory
cp manifest_dev.json ../front-end/
```

2. **Update Dojo Configuration**

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

## Project Structure

```
QuadClue/
├── contract/                 # Dojo smart contracts
│   ├── src/
│   │   ├── lib.cairo        # Main contract library
│   │   ├── models.cairo     # Data models
│   │   └── systems/         # Contract systems
│   ├── dojo_dev.toml        # Dojo development config
│   └── manifest_dev.json    # Generated contract manifest
│
├── front-end/               # Next.js frontend application
│   ├── src/
│   │   ├── app/            # Next.js app router pages
│   │   ├── components/     # React components
│   │   ├── lib/            # Utilities and Dojo integration
│   │   └── types/          # TypeScript type definitions
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
│
└── README.md               # This file
```

## Configuration

### Key Configuration Files

1. **`contract/dojo_dev.toml`** - Dojo world configuration
2. **`contract/manifest_dev.json`** - Generated contract manifest (auto-generated)
3. **`front-end/src/lib/dojo/dojoConfig.ts`** - Frontend Dojo configuration
4. **`front-end/manifest_dev.json`** - Copy of contract manifest for frontend

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

Navigate to `http://localhost:3000/dashboard` to create puzzles:

1. **Quick Test**: Click "Create Test Puzzle (PAINT)" to create a pre-configured puzzle
2. **Custom Puzzle**: 
   - Fill in 4 image hashes or URLs
   - Provide an answer (3+ characters)
   - Click "Create Puzzle"

Example test puzzle data:
- **Images**: 4 URLs or hashes representing the concept
- **Answer**: The word that connects all images (e.g., "PAINT")

### 3. Play the Game

Navigate to `http://localhost:3000/game` to play:

1. View the 4 images for each puzzle
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
- Check that `manifest_dev.json` is up to date in both contract and frontend directories
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
cd front-end
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

### Starting Fresh

To completely reset your local environment:

1. **Stop all services** (Katana, Torii, Frontend)
2. **Restart Katana** with a fresh state
3. **Rebuild and redeploy** contracts:
   ```bash
   cd contract
   sozo build --typescript
   sozo migrate
   ```
4. **Update manifest** in frontend:
   ```bash
   cp manifest_dev.json ../front-end/
   ```
5. **Restart Torii** with new world address
6. **Update dojoConfig.ts** with new account details
7. **Restart frontend**

## Architecture

### Technology Stack

- **Blockchain**: Starknet with Cairo smart contracts
- **Game Engine**: Dojo framework for autonomous worlds
- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand + Dojo SDK
- **Wallet Integration**: Starknet React

### Key Components

- **Smart Contracts**: Handle game logic, puzzle storage, and player progression
- **Dojo SDK**: Provides blockchain integration and state synchronization
- **React Components**: UI components for game interface
- **Katana**: Local Starknet node for development
- **Torii**: Dojo indexer for efficient data querying

## Development Commands

### Contract Commands

```bash
cd contract

# Build contracts
sozo build

# Build with TypeScript bindings
sozo build --typescript

# Deploy to local Katana
sozo migrate

# Start local node
katana --dev --http.api dev,starknet --dev.no-fee --http.cors_origins '*'

# Start indexer (replace <WORLD_ADDRESS>)
torii --world <WORLD_ADDRESS> --http.cors_origins "*"
```

### Frontend Commands

```bash
cd front-end

# Install dependencies
npm install --legacy-peer-deps

# Development server
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

---

For more information about Dojo development, visit the [official documentation](https://dojoengine.org).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally following the setup guide
5. Submit a pull request

## License

[Add your license information here]
