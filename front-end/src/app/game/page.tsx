"use client";

import { useEffect, useState } from "react";
import GameHeader from "@/components/GameHeader";
import ImagesGrid from "@/components/ImagesGrid";
import AnswerTiles from "@/components/AnswerTiles";
import KeyboardRow from "@/components/KeyboardRow";
import AskFriendsButton from "@/components/AskFriendsButton";
import VictoryModal from "@/components/VictoryModal";
import { generateKeyboard, shuffle } from "@/lib/utils";
import { useGameProgression } from "@/lib/dojo/useGameProgression";
import { usePuzzles } from "@/lib/dojo/usePuzzles";

export default function GamePage() {
  // Game progression logic
  const {
    gameState,
    currentPuzzle,
    availableLetters,
    isAnswerCorrect,
    submitAnswer,
    nextPuzzle,
    useHint,
    resetGame,
    getScoreForPuzzle
  } = useGameProgression();

  const { puzzles } = usePuzzles();
  
  // Local game UI state
  const [input, setInput] = useState<string[]>([]);
  const [used, setUsed] = useState<boolean[]>([]);
  const [keyboard, setKeyboard] = useState<string[]>([]);
  const [victoryOpen, setVictoryOpen] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derive answer from available letters (word_length gives us the length)
  const expectedAnswer = currentPuzzle ? "?".repeat(currentPuzzle.word_length || 5) : "";

  // Setup keyboard when puzzle changes
  useEffect(() => {
    if (availableLetters.length > 0) {
      const shuffledLetters = shuffle([...availableLetters]);
      setKeyboard(shuffledLetters);
      setUsed(Array(shuffledLetters.length).fill(false));
      setInput([]);
      setStartTime(Date.now());
    }
  }, [currentPuzzle?.entityId]);

  // Check for victory condition when input changes
  useEffect(() => {
    const currentGuess = input.join("");
    if (currentGuess.length === (currentPuzzle?.word_length || 0) && currentGuess.length > 0) {
      handleGuessSubmission(currentGuess);
    }
  }, [input, currentPuzzle?.word_length]);

  const handleGuessSubmission = async (guess: string) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const result = await submitAnswer(guess);
      
      if (result.success && result.isCorrect) {
        const timeUsed = Math.floor((Date.now() - startTime) / 1000);
        setVictoryOpen(true);
      } else if (result.success && !result.isCorrect) {
        // Reset input for incorrect guess
        setInput([]);
        setUsed(Array(keyboard.length).fill(false));
      }
    } catch (error) {
      console.error('Error submitting guess:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVictoryClose = () => {
    setVictoryOpen(false);
  };

  const handleNextPuzzle = () => {
    nextPuzzle();
    setVictoryOpen(false);
  };

  const handleUseHint = () => {
    const hintLetter = useHint();
    if (hintLetter && !input.includes(hintLetter)) {
      // Auto-place the hint letter if there's space
      if (input.length < (currentPuzzle?.word_length || 0)) {
        const letterIndex = keyboard.indexOf(hintLetter);
        if (letterIndex !== -1) {
          setInput(prev => [...prev, hintLetter]);
          setUsed(prev => {
            const newUsed = [...prev];
            newUsed[letterIndex] = true;
            return newUsed;
          });
        }
      }
    }
  };

  const handleShuffle = () => {
    const availableIndices = keyboard
      .map((_, index) => index)
      .filter(index => !used[index]);
    
    const availableLettersToShuffle = availableIndices.map(index => keyboard[index]);
    const shuffledAvailable = shuffle(availableLettersToShuffle);
    
    const newKeyboard = [...keyboard];
    availableIndices.forEach((originalIndex, i) => {
      newKeyboard[originalIndex] = shuffledAvailable[i];
    });
    
    setKeyboard(newKeyboard);
  };

  // Loading state
  if (!puzzles || puzzles.length === 0) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-800">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-bold mb-2">Loading Puzzles...</h2>
          <p className="text-sm">Fetching puzzles from Dojo...</p>
        </div>
      </div>
    );
  }

  // Game complete state
  if (gameState.gameComplete) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-800">
        <div className="text-center text-white max-w-md mx-auto p-6">
          <h1 className="text-4xl font-bold mb-4">🎉 Congratulations!</h1>
          <p className="text-xl mb-6">You've completed all puzzles!</p>
          <div className="bg-gray-700 rounded-lg p-4 mb-6">
            <div className="text-2xl font-bold text-yellow-400">{gameState.score.toLocaleString()} Points</div>
            <div className="text-lg text-green-400">{gameState.coins} Coins Earned</div>
            <div className="text-sm text-gray-300">{gameState.totalAttempts} Total Attempts</div>
          </div>
          <button
            onClick={resetGame}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg"
          >
            Play Again
          </button>
        </div>
      </div>
    );
  }

  if (!currentPuzzle) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-800">
        <div className="text-white text-center">
          <h2 className="text-xl font-bold mb-4">No Puzzle Available</h2>
          <p>Unable to load current puzzle</p>
        </div>
      </div>
    );
  }

  const timeUsed = Math.floor((Date.now() - startTime) / 1000);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-800">
      <div
        className="relative min-h-screen w-full max-w-sm mx-auto flex flex-col items-center p-4 overflow-y-auto font-game"
        style={{
          backgroundColor: "#f3f6fa",
          backgroundImage: `repeating-linear-gradient(0deg, rgba(229,233,242,0.15) 0px, rgba(229,233,242,0.15) 24px, transparent 24px, transparent 48px), repeating-linear-gradient(90deg, rgba(229,233,242,0.15) 0px, rgba(229,233,242,0.15) 24px, transparent 24px, transparent 48px)`,
        }}
      >
        <VictoryModal
          open={victoryOpen}
          onClose={handleVictoryClose}
          onNextPuzzle={handleNextPuzzle}
          answer={input.join("")}
          score={getScoreForPuzzle(timeUsed, gameState.hintsUsed)}
          coins={Math.floor(getScoreForPuzzle(timeUsed, gameState.hintsUsed) / 100)}
          level={gameState.level}
          puzzlesSolved={gameState.completedPuzzles.size}
          totalPuzzles={puzzles.length}
          timeUsed={timeUsed}
          hintsUsed={gameState.hintsUsed}
          isGameComplete={gameState.completedPuzzles.size + 1 >= puzzles.length}
        />

        <GameHeader 
          level={gameState.level} 
          coins={gameState.coins}
          onUseHint={handleUseHint}
          hintsRemaining={3 - gameState.hintsUsed}
        />
        
        <ImagesGrid images={currentPuzzle.imageUrls || []} />
        
        {/* Progress indicator */}
        <div className="text-xs text-gray-600 mb-2 text-center">
          <p>Puzzle {gameState.currentPuzzleIndex + 1} of {puzzles.length}</p>
          <p>Level {gameState.level} • Score: {gameState.score.toLocaleString()}</p>
        </div>
        
        <AnswerTiles
          answer={expectedAnswer}
          input={input}
          setInput={setInput}
          keyboard={keyboard}
          used={used}
          setUsed={setUsed}
        />
        
        <KeyboardRow
          keyboard={keyboard}
          used={used}
          setUsed={setUsed}
          input={input}
          setInput={setInput}
          answerLength={currentPuzzle.word_length || 5}
          disabled={isSubmitting}
        />
        
        <AskFriendsButton onShuffle={handleShuffle} />
        
        {/* Game stats */}
        <div className="text-xs text-gray-500 mt-4 text-center">
          <p>Time: {Math.floor(timeUsed / 60)}:{(timeUsed % 60).toString().padStart(2, '0')}</p>
          <p>Attempts: {gameState.totalAttempts}</p>
        </div>
      </div>
    </div>
  );
}
