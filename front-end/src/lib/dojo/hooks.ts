import { useState, useEffect, useCallback } from 'react';
import { Account } from 'starknet';
import { quadClueClient } from './client';
import { Puzzle, PlayerStats, PuzzleData } from '@/types/game';

export function useBurnerAccount() {
  const [account, setAccount] = useState<Account | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const createBurner = useCallback(async () => {
    setIsLoading(true);
    try {
      const newAccount = await quadClueClient.burnerManager.create();
      setAccount(newAccount);
      return newAccount;
    } catch (error) {
      console.error('Failed to create burner account:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getBurners = useCallback(() => {
    return quadClueClient.burnerManager.list();
  }, []);

  const selectBurner = useCallback((address: string) => {
    const selectedAccount = quadClueClient.burnerManager.get(address);
    setAccount(selectedAccount);
    return selectedAccount;
  }, []);

  return {
    account,
    createBurner,
    getBurners,
    selectBurner,
    isLoading,
  };
}

export function useQuadClueGame() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPuzzle = useCallback(async (
    account: Account,
    imageHashes: string[],
    answer: string
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const puzzleId = await quadClueClient.createPuzzle(account, imageHashes, answer);
      return puzzleId;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const submitGuess = useCallback(async (
    account: Account,
    puzzleId: bigint,
    guess: string
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      const isCorrect = await quadClueClient.submitGuess(account, puzzleId, guess);
      return isCorrect;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPuzzle = useCallback(async (puzzleId: bigint) => {
    setIsLoading(true);
    setError(null);
    try {
      const puzzle = await quadClueClient.getPuzzle(puzzleId);
      return puzzle;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPlayerStats = useCallback(async (playerAddress: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const stats = await quadClueClient.getPlayerStats(playerAddress);
      return stats;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPuzzleLayout = useCallback(async (puzzleId: bigint) => {
    setIsLoading(true);
    setError(null);
    try {
      const layout = await quadClueClient.getPuzzleLayout(puzzleId);
      return layout;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    createPuzzle,
    submitGuess,
    getPuzzle,
    getPlayerStats,
    getPuzzleLayout,
    isLoading,
    error,
  };
}