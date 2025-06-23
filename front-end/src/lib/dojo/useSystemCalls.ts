import { useAccount } from "@starknet-react/core";
import { useDojoSDK } from "@dojoengine/sdk/react";
import { BigNumberish, ByteArray } from "starknet";
import { PuzzleData } from "@/types/game";
import { PlayerStats } from "@/types/user";
import toast from "react-hot-toast";
import { useEffect, useMemo, useCallback, useRef } from "react";
import { getEntityIdFromKeys } from "@dojoengine/utils";
import { v4 as uuidv4 } from "uuid";
import { setupWorld } from "./typescript/contracts.gen";

export function useSystemCalls() {
    const { account, address, isConnected } = useAccount();
  const { useDojoStore, client, provider } = useDojoSDK();
  const state = useDojoStore((state) => state);

  // Use ref to track previous values for debugging
  const prevValuesRef = useRef({
    accountAddress: null as string | null,
    isConnected: false,
    clientExists: false,
    providerExists: false,
  });

  // Memoize the working account
  const workingAccount = useMemo(() => account, [account]);

  // Memoize world actions setup
  const worldActions = useMemo(() => {
    return provider ? setupWorld(provider as any) : null;
  }, [provider]);

  // Optimized debug logging - only log when values actually change
  useEffect(() => {
    const currentValues = {
      accountAddress: account?.address || null,
      isConnected: !!isConnected,
      clientExists: !!client,
      providerExists: !!provider,
    };

    // Only log if values have actually changed
    const hasChanged = 
      prevValuesRef.current.accountAddress !== currentValues.accountAddress ||
      prevValuesRef.current.isConnected !== currentValues.isConnected ||
      prevValuesRef.current.clientExists !== currentValues.clientExists ||
      prevValuesRef.current.providerExists !== currentValues.providerExists;

    if (hasChanged) {
      console.log('⚙️ useSystemCalls Debug (changed):', {
        account: account?.address,
        address,
        isConnected,
        workingAccount: workingAccount?.address,
        accountHasExecute: !!workingAccount?.execute,
        clientExists: !!client,
        providerExists: !!provider,
        worldActionsExists: !!worldActions,
        hasCreatePuzzle: !!worldActions?.actions?.createPuzzle,
        worldActionsKeys: worldActions ? Object.keys(worldActions) : [],
        actionsKeys: worldActions?.actions ? Object.keys(worldActions.actions) : []
      });

      prevValuesRef.current = currentValues;
    }
  }, [account?.address, address, isConnected, workingAccount?.address, client, provider, worldActions]);

  // Memoize helper function
  const stringToByteArray = useCallback((str: string): ByteArray => {
    // Use a simpler approach - let Dojo handle the conversion
    return str as any;
  }, []);

  // Memoize create puzzle function
  const createPuzzle = useCallback(async (imageHashes: Array<BigNumberish>, answer: string) => {
    if (!workingAccount) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!worldActions?.actions?.createPuzzle) {
      console.error("❌ World actions not available:", {
        worldActions: !!worldActions,
        actions: !!worldActions?.actions,
        createPuzzle: !!worldActions?.actions?.createPuzzle
      });
      toast.error("World actions not initialized");
      return;
    }

    const transactionId = uuidv4();

    try {
      toast.loading("Creating puzzle...", { id: "create-puzzle" });
      
      const byteArrayAnswer = stringToByteArray(answer);
      
      console.log('🚀 Calling createPuzzle with:', {
        account: workingAccount.address,
        imageHashes,
        answer: byteArrayAnswer
      });

      // Apply optimistic update
      state.applyOptimisticUpdate(transactionId, (draft) => {
        console.log('Applied optimistic update for puzzle creation');
      });

      // Use the generated world actions
      const result = await worldActions.actions.createPuzzle(
        workingAccount as any,
        imageHashes,
        byteArrayAnswer
      );
      
      console.log('✅ CreatePuzzle result:', result);
      toast.success("Puzzle created successfully!", { id: "create-puzzle" });
      return result;
    } catch (error: any) {
      console.error("❌ Create puzzle error:", error);
      console.error("❌ Error details:", {
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
        fullError: error
      });
      state.revertOptimisticUpdate(transactionId);
      toast.error(`Failed to create puzzle: ${error?.message || 'Unknown error'}`, { id: "create-puzzle" });
      throw error;
    } finally {
      state.confirmTransaction(transactionId);
    }
  }, [workingAccount, worldActions, stringToByteArray, state]);

  // Memoize submit guess function
  const submitGuess = useCallback(async (puzzleId: BigNumberish, guess: string) => {
    console.log("🔧 === SUBMIT GUESS (useSystemCalls) START ===");
    console.log("🔧 Input parameters:", {
      puzzleId,
      guess,
      puzzleIdType: typeof puzzleId,
      hasWorkingAccount: !!workingAccount,
      workingAccountAddress: workingAccount?.address,
      hasWorldActions: !!worldActions,
      hasSubmitGuessAction: !!worldActions?.actions?.submitGuess
    });

    if (!workingAccount) {
      console.error("🔧 ❌ No working account");
      toast.error("Please connect your wallet");
      return false;
    }

    if (!worldActions?.actions?.submitGuess) {
      console.error("🔧 ❌ World actions not initialized");
      toast.error("World actions not initialized");
      return false;
    }

    const transactionId = uuidv4();
    console.log("🔧 🆔 Transaction ID:", transactionId);

    try {
      toast.loading("Submitting guess...", { id: "submit-guess" });
      
      const byteArrayGuess = stringToByteArray(guess);
      console.log("🔧 📝 Converted guess to ByteArray:", {
        originalGuess: guess,
        byteArrayGuess,
        byteArrayType: typeof byteArrayGuess
      });
      
      // Apply optimistic update
      state.applyOptimisticUpdate(transactionId, (draft) => {
        console.log('🔧 ⚡ Applied optimistic update for guess submission');
      });

      console.log("🔧 🚀 Calling contract submitGuess...");
      console.log("🔧 📤 Contract call parameters:", {
        account: workingAccount.address,
        puzzleId,
        guess: byteArrayGuess
      });

      // Use the generated world actions
      const result = await worldActions.actions.submitGuess(
        workingAccount as any,
        puzzleId,
        byteArrayGuess
      );
      
      console.log("🔧 📥 Contract call result:", {
        result,
        resultType: typeof result,
        isBoolean: typeof result === 'boolean',
        isTruthy: !!result,
        fullResult: result
      });
      
      toast.success("Guess submitted!", { id: "submit-guess" });
      console.log("🔧 ✅ Guess submitted successfully");
      console.log("🔧 === SUBMIT GUESS (useSystemCalls) END ===");
      
      return result;
    } catch (error) {
      console.error("🔧 💥 Submit guess error:", error);
      console.error("🔧 💥 Error details:", {
        message: (error as any)?.message,
        stack: (error as any)?.stack,
        name: (error as any)?.name,
        fullError: error
      });
      state.revertOptimisticUpdate(transactionId);
      toast.error("Failed to submit guess", { id: "submit-guess" });
      console.log("🔧 === SUBMIT GUESS (useSystemCalls) END (ERROR) ===");
      throw error;
    } finally {
      state.confirmTransaction(transactionId);
      console.log("🔧 🏁 Transaction confirmed");
    }
  }, [workingAccount, worldActions, stringToByteArray, state]);

  // Memoize add batch puzzle function
  const addBatchPuzzle = useCallback(async (puzzles: Array<PuzzleData>) => {
    if (!workingAccount) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!client?.actions) {
      toast.error("Dojo client not initialized");
      return;
    }

    const transactionId = uuidv4();

    try {
      toast.loading("Adding puzzles...", { id: "add-batch" });
      
      // Apply optimistic update
      state.applyOptimisticUpdate(transactionId, (draft) => {
        console.log('Applied optimistic update for batch puzzle creation');
      });

      // Use the generated client actions
      const result = await client.actions.addBatchPuzzle(
        workingAccount as any,
        puzzles
      );
      
      toast.success("Puzzles added successfully!", { id: "add-batch" });
      return result;
    } catch (error) {
      console.error("Add batch puzzle error:", error);
      state.revertOptimisticUpdate(transactionId);
      toast.error("Failed to add puzzles", { id: "add-batch" });
      throw error;
    } finally {
      state.confirmTransaction(transactionId);
    }
  }, [workingAccount, client, state]);

  // Memoize get player stats function
  const getPlayerStats = useCallback(async (player: string) => {
    if (!worldActions?.actions?.getPlayerStats) {
      console.warn("World actions not initialized");
      return null;
    }

    try {
      // Use the generated world actions
      const result = await worldActions.actions.getPlayerStats(player);
      return result;
    } catch (error) {
      console.error("Get player stats error:", error);
      return null;
    }
  }, [worldActions]);

  // Memoize get puzzle function
  const getPuzzle = useCallback(async (puzzleId: BigNumberish) => {
    if (!worldActions?.actions?.getPuzzle) {
      console.warn("World actions not initialized");
      return null;
    }

    try {
      // Use the generated world actions
      const result = await worldActions.actions.getPuzzle(puzzleId);
      return result;
    } catch (error) {
      console.error("Get puzzle error:", error);
      return null;
    }
  }, [worldActions]);

  // Memoize get puzzle layout function
  const getPuzzleLayout = useCallback(async (puzzleId: BigNumberish) => {
    if (!worldActions?.actions?.getPuzzleLayout) {
      console.warn("World actions not initialized");
      return null;
    }

    try {
      // Use the generated world actions
      const result = await worldActions.actions.getPuzzleLayout(puzzleId);
      return result;
    } catch (error) {
      console.error("Get puzzle layout error:", error);
      return null;
    }
  }, [worldActions]);

  // Memoize get current player stats function
  const getCurrentPlayerStats = useCallback(async (): Promise<PlayerStats | null> => {
    if (!workingAccount?.address) {
      return null;
    }
    
    try {
      const rawStats = await getPlayerStats(workingAccount.address);
      if (!rawStats) return null;
      
      // Log the raw struct once for verification
      console.log('📦 rawStats', rawStats);

      const stats = rawStats as any;

      // Compute helper values
      const puzzlesSolved = Number(stats?.puzzles_solved ?? stats?.puzzlesSolved ?? 0);
      const coinsEarned   = Number(stats?.tokens_earned ?? stats?.coins ?? 0);

      return {
        // Front-end calculated score: 100 points per puzzle solved
        score: puzzlesSolved * 100,

        // Map on-chain "tokens_earned" ↔ coins
        coins: coinsEarned,

        puzzlesSolved,
        totalAttempts: Number(stats?.total_attempts ?? stats?.totalAttempts ?? 0),
        level: Number(stats?.level ?? 1),
      } as PlayerStats;
    } catch (error) {
      console.error("Error fetching player stats:", error);
      return null;
    }
  }, [workingAccount?.address, getPlayerStats]);

  // Memoize the return value
  return useMemo(() => ({
    createPuzzle,
    submitGuess,
    addBatchPuzzle,
    getPlayerStats,
    getPuzzle,
    getPuzzleLayout,
    getCurrentPlayerStats,
    // Provide access to the account info
    account: workingAccount,
    isConnected,
    address,
  }), [
    createPuzzle,
    submitGuess,
    addBatchPuzzle,
    getPlayerStats,
    getPuzzle,
    getPuzzleLayout,
    getCurrentPlayerStats,
    workingAccount,
    isConnected,
    address,
  ]);
} 