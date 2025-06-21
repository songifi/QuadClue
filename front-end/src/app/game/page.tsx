"use client";

import { useEffect, useState } from "react";
import GameHeader from "@/components/GameHeader";
import ImagesGrid from "@/components/ImagesGrid";
import AnswerTiles from "@/components/AnswerTiles";
import KeyboardRow from "@/components/KeyboardRow";
import AskFriendsButton from "@/components/AskFriendsButton";
import VictoryModal from "@/components/VictoryModal";
import { generateKeyboard, shuffle } from "@/lib/utils";
// import { a } from "framer-motion/client";

export default function GamePage() {
  // Placeholder for contract data
  const [images, setImages] = useState<string[]>([]);
  const [answer, setAnswer] = useState<string>("");
  const [input, setInput] = useState<string[]>([]);
  // Track which keyboard letters are used
  const [used, setUsed] = useState<boolean[]>(Array(10).fill(false));
  const [keyboard, setKeyboard] = useState<string[]>([]);
  const [victoryOpen, setVictoryOpen] = useState(false);
  const [score, setScore] = useState(2350); // Placeholder
  const [coins, setCoins] = useState(250); // Placeholder
  const [level, setLevel] = useState(1); // Placeholder for current level

  useEffect(() => {
    // TODO: Replace with contract call
    setAnswer("PAINT");
  }, []);

  useEffect(() => {
    if (!answer) return;
    setImages([
      // Placeholder images, replace with actual contract data
      `/${answer.toLowerCase()}1.png`,
      `/${answer.toLowerCase()}2.png`,
      `/${answer.toLowerCase()}3.png`,
      `/${answer.toLowerCase()}4.png`,
    ]);
    const fullKeyboard = generateKeyboard(answer);
    setKeyboard(fullKeyboard);
    setUsed(Array(fullKeyboard.length).fill(false));
    setInput([]);
  }, [answer]);

  useEffect(() => {
    setInput([]);
    setUsed(Array(keyboard.length).fill(false));
  }, [answer, keyboard.length]);

  useEffect(() => {
    if (input.join("") === answer && answer.length > 0) {
      setVictoryOpen(true);
    }
  }, [input, answer]);

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
          onClose={() => {
            // Advance to next level: update answer, images, score, coins, etc.
            // Example: increment a level state, fetch new data, reset input/keyboard
            setVictoryOpen(false);
            // Example logic for next level (replace with real data/logic):
            setAnswer("BRUSH");
            // Replace with new images
            setScore((prev) => prev + 100); // Example: increment score
            setCoins((prev) => prev + 10); // Example: increment coins
            setLevel((prev) => prev + 1); // Increment level
            // Keyboard/input will reset via useEffect on answer change
          }}
          answer={answer}
          score={score}
          coins={coins}
        />

        <GameHeader level={level} coins={coins} />
        <ImagesGrid images={images} />
        <AnswerTiles
          answer={answer}
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
          answerLength={answer.length}
        />
        <AskFriendsButton
          onShuffle={() => {
            setKeyboard((prev) => shuffle(prev));
            setUsed(Array(keyboard.length).fill(false));
            setInput([]);
          }}
        />
      </div>
    </div>
  );
}
