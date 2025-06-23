import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePuzzles } from '@/lib/dojo/usePuzzles';
import { useSystemCalls } from '@/lib/dojo/useSystemCalls';
import { useGuessSubmittedEvents } from '@/lib/dojo/useGuessSubmittedEvents';
import { GAME_CONFIG } from '@/lib/constants';
import toast from 'react-hot-toast';

// PHASE 2: Pending Submission Interface
interface PendingSubmission {
  id: string;              // unique submission ID
  puzzleId: number;        // which puzzle
  guess: string;           // what was guessed
  timestamp: number;       // when submitted
  resolved: boolean;       // whether we found a matching event
  timeoutId?: NodeJS.Timeout; // for timeout handling
}

interface GameState {
  currentPuzzleIndex: number;
  score: number;
  coins: number;
  level: number;
  hintsUsed: number;
  totalAttempts: number;
  completedPuzzles: Set<string>;
  gameComplete: boolean;
  // PHASE 2: New submission tracking states
  isSubmitting: boolean;
  pendingSubmissions: PendingSubmission[];
  // Image transition state
  isTransitioning: boolean;
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
  // PHASE 2: New submission state accessors
  isSubmitting: boolean;
  pendingSubmissions: PendingSubmission[];
  // Image transition state
  isTransitioning: boolean;
  // Victory callback
  onVictory?: (submission: PendingSubmission) => void;
  // Incorrect answer callback
  onIncorrectAnswer?: (submission: PendingSubmission) => void;
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

export function useGameProgression(onVictory?: (submission: PendingSubmission) => void, onIncorrectAnswer?: (submission: PendingSubmission) => void): GameProgressionHook {
  const { puzzles, isLoading } = usePuzzles();
  const { submitGuess, getCurrentPlayerStats, account } = useSystemCalls();
  
  // PHASE 1: Subscribe to GuessSubmitted events
  const guessEvents = useGuessSubmittedEvents();
  
  // Debug logging for event subscription
  useEffect(() => {
    console.log('🔔 Event Subscription Status:', {
      isSubscribed: guessEvents.isSubscribed,
      totalEvents: guessEvents.totalEvents,
      latestEvent: guessEvents.latestEvent,
      accountAddress: account?.address
    });
  }, [guessEvents.isSubscribed, guessEvents.totalEvents, guessEvents.latestEvent, account?.address]);
  
  // Initialize game state from localStorage or defaults
  const [gameState, setGameState] = useState<GameState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('quadclue-game-state');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          completedPuzzles: new Set(parsed.completedPuzzles || []),
          // PHASE 2: Initialize submission states (don't persist these)
          isSubmitting: false,
          pendingSubmissions: [],
          isTransitioning: false
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
      gameComplete: false,
      // PHASE 2: Initialize submission states
      isSubmitting: false,
      pendingSubmissions: [],
      isTransitioning: false
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
        // PHASE 2: Don't persist submission states
      };
      // Remove submission states from storage
      delete (toSave as any).isSubmitting;
      delete (toSave as any).pendingSubmissions;
      
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

  // PHASE 2: Submission Management Functions
  const generateSubmissionId = useCallback(() => {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }, []);

  const addPendingSubmission = useCallback((puzzleId: number, guess: string) => {
    const submissionId = generateSubmissionId();
    
    const newSubmission: PendingSubmission = {
      id: submissionId,
      puzzleId,
      guess,
      timestamp: Math.floor(Date.now() / 1000),
      resolved: false
    };

    // Add timeout handling (10 seconds)
    const timeoutId = setTimeout(() => {
      console.log('⏰ Submission timeout for:', submissionId);
      setGameState(prev => ({
        ...prev,
        pendingSubmissions: prev.pendingSubmissions.filter(s => s.id !== submissionId),
        isSubmitting: prev.pendingSubmissions.length <= 1 // false if this was the last one
      }));
      toast.error('Transaction timeout. Please try again.');
    }, 10000);

    newSubmission.timeoutId = timeoutId;

    setGameState(prev => ({
      ...prev,
      isSubmitting: true,
      pendingSubmissions: [...prev.pendingSubmissions, newSubmission]
    }));

    console.log('📝 Added pending submission:', {
      id: submissionId,
      puzzleId,
      guess,
      totalPending: gameState.pendingSubmissions.length + 1
    });

    return submissionId;
  }, [generateSubmissionId, gameState.pendingSubmissions.length]);

  const removePendingSubmission = useCallback((submissionId: string) => {
    setGameState(prev => {
      const submission = prev.pendingSubmissions.find(s => s.id === submissionId);
      if (submission?.timeoutId) {
        clearTimeout(submission.timeoutId);
      }

      const updatedPending = prev.pendingSubmissions.filter(s => s.id !== submissionId);
      
      return {
        ...prev,
        pendingSubmissions: updatedPending,
        isSubmitting: updatedPending.length > 0
      };
    });

    console.log('✅ Removed pending submission:', submissionId);
  }, []);

  // PHASE 3: Event Processing Functions
  const handleCorrectGuess = useCallback((submission: PendingSubmission) => {
    console.log('🎉 Processing correct guess:', submission);
    
    // Calculate score and coins
    const puzzleScore = getScoreForPuzzle(0, gameState.hintsUsed);
    const coinsEarned = Math.floor(puzzleScore / 100);
    
    console.log("🎯 Correct answer rewards:", {
      puzzleScore,
      coinsEarned,
      hintsUsed: gameState.hintsUsed
    });
    
    // Update game state
    setGameState(prev => ({
      ...prev,
      score: prev.score + puzzleScore,
      coins: prev.coins + coinsEarned,
      completedPuzzles: new Set([...prev.completedPuzzles, currentPuzzle?.entityId]),
      hintsUsed: 0 // Reset hints for next puzzle
    }));
    
    // Trigger victory modal
    if (onVictory) {
      onVictory(submission);
    }
    
    toast.success(`🎉 Correct! +${puzzleScore} points, +${coinsEarned} coins`);
  }, [getScoreForPuzzle, gameState.hintsUsed, currentPuzzle?.entityId, onVictory]);

  const handleIncorrectGuess = useCallback((submission: PendingSubmission) => {
    console.log('❌ Processing incorrect guess:', submission);
    
    // Trigger incorrect answer modal
    if (onIncorrectAnswer) {
      onIncorrectAnswer(submission);
    }
    
    toast.error(`❌ "${submission.guess}" is incorrect. Try again!`);
  }, [onIncorrectAnswer]);

  const processGuessEvent = useCallback((event: any, matchedSubmission: PendingSubmission) => {
    console.log('🔄 === PHASE 3 PROCESSING EVENT ===');
    console.log('📝 Event details:', {
      puzzle_id: event.puzzle_id,
      is_correct: event.is_correct,
      player: event.player,
      timestamp: event.timestamp
    });
    console.log('📝 Matched submission:', {
      id: matchedSubmission.id,
      puzzleId: matchedSubmission.puzzleId,
      guess: matchedSubmission.guess,
      timestamp: matchedSubmission.timestamp,
      resolved: matchedSubmission.resolved
    });

    // Mark submission as resolved before processing
    setGameState(prev => ({
      ...prev,
      pendingSubmissions: prev.pendingSubmissions.map(s => 
        s.id === matchedSubmission.id ? { ...s, resolved: true } : s
      )
    }));

    // Remove from pending submissions
    removePendingSubmission(matchedSubmission.id);

    // Process based on correctness
    if (event.is_correct) {
      handleCorrectGuess(matchedSubmission);
    } else {
      handleIncorrectGuess(matchedSubmission);
    }

    console.log('🔄 === PHASE 3 EVENT PROCESSED ===');
  }, [removePendingSubmission, handleCorrectGuess, handleIncorrectGuess]);

  // PHASE 3: Event Matching Effect
  useEffect(() => {
    if (!guessEvents.latestEvent || gameState.pendingSubmissions.length === 0) {
      return;
    }

    console.log('🔍 === PHASE 3 EVENT MATCHING START ===');
    console.log('📊 Current state:', {
      latestEventTimestamp: guessEvents.latestEvent.timestamp,
      pendingSubmissions: gameState.pendingSubmissions.length,
      pendingDetails: gameState.pendingSubmissions.map(s => ({
        id: s.id,
        puzzleId: s.puzzleId,
        guess: s.guess,
        timestamp: s.timestamp,
        resolved: s.resolved
      }))
    });

    // Try to match the latest event with pending submissions
    for (const submission of gameState.pendingSubmissions) {
      const matchingEvent = guessEvents.findEventForSubmission(submission);
      
      if (matchingEvent) {
        console.log('✅ Found matching event for submission:', {
          submissionId: submission.id,
          eventPuzzleId: matchingEvent.puzzle_id,
          eventIsCorrect: matchingEvent.is_correct
        });
        
        processGuessEvent(matchingEvent, submission);
        break; // Process one event at a time
      }
    }

    console.log('🔍 === PHASE 3 EVENT MATCHING END ===');
  }, [guessEvents.latestEvent, gameState.pendingSubmissions, guessEvents.findEventForSubmission, processGuessEvent]);

  // PHASE 2: Submit answer with pending submission tracking
  const submitAnswer = useCallback(async (guess: string) => {
    console.log("🎯 === PHASE 2 SUBMIT ANSWER START ===");
    console.log("📝 Input parameters:", {
      guess,
      currentPuzzle: currentPuzzle ? {
        id: currentPuzzle.id,
        entityId: currentPuzzle.entityId,
        word_length: currentPuzzle.word_length
      } : null,
      accountAddress: account?.address,
      isCurrentlySubmitting: gameState.isSubmitting,
      pendingCount: gameState.pendingSubmissions.length
    });

    if (!currentPuzzle || !account?.address) {
      console.error("❌ Missing requirements:", {
        hasCurrentPuzzle: !!currentPuzzle,
        hasAccount: !!account?.address
      });
      return { success: false, isCorrect: false };
    }

    // Prevent multiple simultaneous submissions for the same puzzle
    const puzzleId = currentPuzzle.id || currentPuzzle.entityId;
    const hasPendingForPuzzle = gameState.pendingSubmissions.some(s => s.puzzleId === puzzleId);
    
    if (hasPendingForPuzzle) {
      console.log("⚠️ Already have pending submission for this puzzle");
      toast.error('Please wait for the previous submission to complete');
      return { success: false, isCorrect: false };
    }

    // Increment attempts
    setGameState(prev => ({ 
      ...prev, 
      totalAttempts: prev.totalAttempts + 1 
    }));

    try {
      // PHASE 2: Add to pending submissions BEFORE contract call
      const submissionId = addPendingSubmission(puzzleId, guess);
      
      console.log(`🚀 Submitting guess to contract:`, {
        submissionId,
        guess,
        puzzleId,
        guessLength: guess.length,
        expectedLength: currentPuzzle.word_length
      });
      
      // Submit to blockchain - DON'T expect return value, wait for event
      console.log("⏳ Calling submitGuess...");
      const transactionResult = await submitGuess(puzzleId, guess);
      
      console.log(`📤 Transaction submitted:`, {
        transactionResult,
        resultType: typeof transactionResult,
        submissionId
      });

      // PHASE 2: Transaction submitted successfully
      // The actual correctness will be determined by the GuessSubmitted event
      toast.success('Guess submitted! Waiting for blockchain confirmation...');
      
      const result = { success: true, isCorrect: false }; // isCorrect will be determined by event
      console.log("🎯 === PHASE 2 SUBMIT ANSWER END ===");
      
      return result;
      
    } catch (error) {
      console.error('💥 Submit answer error:', error);
      console.error('💥 Error details:', {
        message: (error as any)?.message,
        stack: (error as any)?.stack,
        name: (error as any)?.name
      });
      
      // PHASE 2: Remove from pending on error
      const submissionToRemove = gameState.pendingSubmissions.find(s => s.puzzleId === puzzleId);
      if (submissionToRemove) {
        removePendingSubmission(submissionToRemove.id);
      }
      
      toast.error('Failed to submit answer');
      console.log("🎯 === PHASE 2 SUBMIT ANSWER END (ERROR) ===");
      return { success: false, isCorrect: false };
    }
  }, [currentPuzzle, submitGuess, account?.address, gameState.isSubmitting, gameState.pendingSubmissions, addPendingSubmission, removePendingSubmission]);

  // Move to next puzzle
  const nextPuzzle = useCallback(() => {
    if (!puzzles) return;
    
    // Start transition
    setGameState(prev => ({ ...prev, isTransitioning: true }));
    
    // Find next available (uncompleted) puzzle
    let nextIndex = gameState.currentPuzzleIndex;
    let attempts = 0;
    
    do {
      nextIndex = (nextIndex + 1) % puzzles.length;
      attempts++;
      
      // If we've checked all puzzles and none are available, stay on current
      if (attempts >= puzzles.length) {
        if (gameState.completedPuzzles.size >= puzzles.length) {
          setGameState(prev => ({ ...prev, gameComplete: true, isTransitioning: false }));
        } else {
          setGameState(prev => ({ ...prev, isTransitioning: false }));
        }
        return;
      }
    } while (gameState.completedPuzzles.has(puzzles[nextIndex]?.entityId));
    
    // Update to new puzzle and end transition after a brief delay
    setGameState(prev => ({
      ...prev,
      currentPuzzleIndex: nextIndex,
      level: prev.level + 1,
      hintsUsed: 0
    }));
    
    // End transition after images have time to load
    setTimeout(() => {
      setGameState(prev => ({ ...prev, isTransitioning: false }));
    }, 800); // 800ms should be enough for images to start loading
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
      gameComplete: false,
      isSubmitting: false,
      pendingSubmissions: [],
      isTransitioning: false
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
    getScoreForPuzzle,
    isSubmitting: gameState.isSubmitting,
    pendingSubmissions: gameState.pendingSubmissions,
    isTransitioning: gameState.isTransitioning,
    onVictory,
    onIncorrectAnswer
  };
}
