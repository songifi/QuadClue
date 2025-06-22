import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePuzzles } from '@/lib/dojo/usePuzzles';
import { useSystemCalls } from '@/lib/dojo/useSystemCalls';
import { GAME_CONFIG } from '@/lib/constants';
import toast from 'react-hot-toast';

interface GameState {
  currentPuzzleIndex: number;
  score: number;
  coins: number;
  level: number;
  hintsUsed: number;
  totalAttempts: number;
  completedPuzzles: Set<string>;
  gameComplete: boolean;
}

interface GameProgressionHook {
  gameState: GameState;
  currentPuzzle: any;
  availableLetters: string[];
  isAnswerCorrect: (guess: string) => boolean;
  submitAnswer: (guess: string) => Promise<{ success: boolean; isCorrect: boolean }>;
  nextPuzzle: () => void;
  useHint: () => string | null;
  resetGame: () => void;
  getDifficultyMultiplier: () => number;
  getScoreForPuzzle: (timeUsed?: number, hintsUsed?: number) => number;
}

// Utility to convert felt252 to ASCII
function felt252ToAscii(felt: string | number): string {
  try {
    const hex = typeof felt === 'number' ? felt.toString(16) : felt.toString();
    const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
    
    let ascii = '';
    for (let i = 0; i < cleanHex.length; i += 2) {
      const hexPair = cleanHex.substr(i, 2);
      const charCode = parseInt(hexPair, 16);
      if (charCode > 0 && charCode < 128) {
        ascii += String.fromCharCode(charCode);
      }
    }
    return ascii;
  } catch {
    return '';
  }
}

export function useGameProgression(): GameProgressionHook {
  const { puzzles, isLoading } = usePuzzles();
  const { submitGuess, getCurrentPlayerStats } = useSystemCalls();
  
  // Initialize game state from localStorage or defaults
  const [gameState, setGameState] = useState<GameState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('quadclue-game-state');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          completedPuzzles: new Set(parsed.completedPuzzles || [])
        };
      }
    }
    return {
      currentPuzzleIndex: 0,
      score: 0,
      coins: 0,
      level: 1,
      hintsUsed: 0,
      totalAttempts: 0,
      completedPuzzles: new Set<string>(),
      gameComplete: false
    };
  });

  // Current puzzle data
  const currentPuzzle = useMemo(() => {
    if (!puzzles || puzzles.length === 0) return null;
    return puzzles[gameState.currentPuzzleIndex] || null;
  }, [puzzles, gameState.currentPuzzleIndex]);

  // Extract available letters from current puzzle
  const availableLetters = useMemo(() => {
    if (!currentPuzzle?.available_letters) return [];
    
    return (currentPuzzle.available_letters as any[]).map((felt: any) => 
      felt252ToAscii(felt)
    ).filter(letter => letter.length === 1);
  }, [currentPuzzle]);

  // Save game state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const toSave = {
        ...gameState,
        completedPuzzles: Array.from(gameState.completedPuzzles)
      };
      localStorage.setItem('quadclue-game-state', JSON.stringify(toSave));
    }
  }, [gameState]);

  // Check for game completion
  useEffect(() => {
    if (puzzles && puzzles.length > 0 && gameState.completedPuzzles.size >= puzzles.length) {
      setGameState(prev => ({ ...prev, gameComplete: true }));
      toast.success('🎉 Congratulations! You completed all puzzles!', { duration: 5000 });
    }
  }, [puzzles, gameState.completedPuzzles.size]);

  // Get difficulty multiplier based on puzzle difficulty
  const getDifficultyMultiplier = useCallback(() => {
    if (!currentPuzzle?.difficulty) return 1;
    
    const difficulty = felt252ToAscii(currentPuzzle.difficulty);
    switch (difficulty) {
      case 'LEVEL_1': return 1;
      case 'LEVEL_2': return 1.25;
      case 'LEVEL_3': return 1.5;
      case 'LEVEL_4': return 1.75;
      case 'LEVEL_5': return 2;
      default: return 1;
    }
  }, [currentPuzzle?.difficulty]);

  // Calculate score for completing a puzzle
  const getScoreForPuzzle = useCallback((timeUsed = 0, hintsUsed = 0) => {
    const basePuzzleScore = GAME_CONFIG.BASE_SCORE;
    const difficultyMultiplier = getDifficultyMultiplier();
    const timeBonus = Math.max(0, GAME_CONFIG.TIME_LIMIT - timeUsed) * 2;
    const hintPenalty = hintsUsed * 100;
    
    const totalScore = Math.round(
      (basePuzzleScore + timeBonus - hintPenalty) * difficultyMultiplier
    );
    
    return Math.max(100, totalScore); // Minimum 100 points
  }, [getDifficultyMultiplier]);

  // Check if a guess is correct (client-side verification using available letters)
  const isAnswerCorrect = useCallback((guess: string) => {
    if (!currentPuzzle || !availableLetters.length) return false;
    
    const upperGuess = guess.toUpperCase();
    const expectedLength = currentPuzzle.word_length || guess.length;
    
    // Check length
    if (upperGuess.length !== expectedLength) return false;
    
    // Check if all letters in guess are available
    const guessLetters = upperGuess.split('');
    const availableCopy = [...availableLetters];
    
    for (const letter of guessLetters) {
      const index = availableCopy.indexOf(letter);
      if (index === -1) return false;
      availableCopy.splice(index, 1); // Remove used letter
    }
    
    return true;
  }, [currentPuzzle, availableLetters]);

  // Submit answer to blockchain and handle result
  const submitAnswer = useCallback(async (guess: string) => {
    if (!currentPuzzle) {
      return { success: false, isCorrect: false };
    }

    // Increment attempts
    setGameState(prev => ({ 
      ...prev, 
      totalAttempts: prev.totalAttempts + 1 
    }));

    try {
      // Submit to blockchain
      const result = await submitGuess(currentPuzzle.id || currentPuzzle.entityId, guess);
      
      // The contract returns a boolean indicating if the guess was correct
      const isCorrect = Boolean(result);
      
      if (isCorrect) {
        // Calculate score and coins
        const puzzleScore = getScoreForPuzzle(0, gameState.hintsUsed);
        const coinsEarned = Math.floor(puzzleScore / 100);
        
        // Update game state
        setGameState(prev => ({
          ...prev,
          score: prev.score + puzzleScore,
          coins: prev.coins + coinsEarned,
          completedPuzzles: new Set([...prev.completedPuzzles, currentPuzzle.entityId]),
          hintsUsed: 0 // Reset hints for next puzzle
        }));
        
        toast.success(`Correct! +${puzzleScore} points, +${coinsEarned} coins`);
      } else {
        toast.error('Incorrect guess. Try again!');
      }
      
      return { success: true, isCorrect };
    } catch (error) {
      console.error('Submit answer error:', error);
      toast.error('Failed to submit answer');
      return { success: false, isCorrect: false };
    }
  }, [currentPuzzle, submitGuess, getScoreForPuzzle, gameState.hintsUsed]);

  // Move to next puzzle
  const nextPuzzle = useCallback(() => {
    if (!puzzles) return;
    
    // Find next available (uncompleted) puzzle
    let nextIndex = gameState.currentPuzzleIndex;
    let attempts = 0;
    
    do {
      nextIndex = (nextIndex + 1) % puzzles.length;
      attempts++;
      
      // If we've checked all puzzles and none are available, stay on current
      if (attempts >= puzzles.length) {
        if (gameState.completedPuzzles.size >= puzzles.length) {
          setGameState(prev => ({ ...prev, gameComplete: true }));
        }
        return;
      }
    } while (gameState.completedPuzzles.has(puzzles[nextIndex]?.entityId));
    
    setGameState(prev => ({
      ...prev,
      currentPuzzleIndex: nextIndex,
      level: prev.level + 1,
      hintsUsed: 0
    }));
  }, [puzzles, gameState.currentPuzzleIndex, gameState.completedPuzzles]);

  // Use a hint (reveal a letter)
  const useHint = useCallback(() => {
    if (gameState.hintsUsed >= GAME_CONFIG.MAX_HINTS) {
      toast.error('No more hints available!');
      return null;
    }
    
    if (!currentPuzzle || !availableLetters.length) {
      return null;
    }
    
    // For now, return a random available letter as hint
    // In a real implementation, you might want to reveal the first letter of the answer
    const hintLetter = availableLetters[Math.floor(Math.random() * availableLetters.length)];
    
    setGameState(prev => ({
      ...prev,
      hintsUsed: prev.hintsUsed + 1,
      coins: Math.max(0, prev.coins - 10) // Cost 10 coins per hint
    }));
    
    toast.success(`Hint: Use the letter "${hintLetter}"`);
    return hintLetter;
  }, [gameState.hintsUsed, currentPuzzle, availableLetters]);

  // Reset game
  const resetGame = useCallback(() => {
    const newState: GameState = {
      currentPuzzleIndex: 0,
      score: 0,
      coins: 0,
      level: 1,
      hintsUsed: 0,
      totalAttempts: 0,
      completedPuzzles: new Set(),
      gameComplete: false
    };
    
    setGameState(newState);
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('quadclue-game-state');
    }
    
    toast.success('Game reset!');
  }, []);

  return {
    gameState,
    currentPuzzle,
    availableLetters,
    isAnswerCorrect,
    submitAnswer,
    nextPuzzle,
    useHint,
    resetGame,
    getDifficultyMultiplier,
    getScoreForPuzzle
  };
}
