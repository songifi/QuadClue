import Image from "next/image";
import { useEffect, useState } from "react";
import { PlayerStats } from "@/types/user";

interface IncorrectModalProps {
  open: boolean;
  onClose: () => void;
  onNext: () => void;
  incorrectGuess: string;
  correctAnswer?: string;
  level: number;
  puzzlesSolved: number;
  totalPuzzles: number;
  playerStats?: PlayerStats | null; // new
}

export default function IncorrectModal({
  open,
  onClose,
  onNext,
  incorrectGuess,
  correctAnswer,
  level,
  puzzlesSolved,
  totalPuzzles,
  playerStats,
}: IncorrectModalProps) {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (open) {
      setShowAnimation(true);
      const timer = setTimeout(() => setShowAnimation(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!open) return null;

  const handleContinue = () => {
    onNext();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="flex flex-col items-center w-full max-w-xs mx-auto">
        {/* Animation */}
        {showAnimation && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="animate-pulse text-6xl">❌</div>
          </div>
        )}

        {/* Main title */}
        <div
          className="text-[2.5rem] leading-none font-extrabold text-[#1A1A1A] text-center mb-1 font-bricolage"
          style={{
            textShadow: "0 4px 8px rgba(0,0,0,0.2)",
          }}
        >
          OOPS!
        </div>

        {/* Subtitle */}
        <div className="text-center text-[#1A1A1A] font-semibold text-sm mb-4 font-bricolage">
          That's not quite right...
        </div>

        {/* Main board container */}
        <div
          className="relative w-full flex justify-center items-center mb-4"
          style={{ minHeight: 280 }}
        >
          <Image
            src="/board.svg"
            alt="Board background"
            fill
            style={{ objectFit: "contain", zIndex: 0, maxHeight: 300 }}
            className="rounded-2xl select-none pointer-events-none"
            priority
          />
          <Image
            src="/white-board.svg"
            alt="White board overlay"
            fill
            style={{
              objectFit: "none",
              zIndex: 1,
              maxHeight: 200,
              pointerEvents: "none",
              top: "58%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              position: "absolute",
            }}
            className="rounded-2xl select-none absolute"
            priority
          />

          <div className="absolute inset-0 flex flex-col justify-center items-center px-4 py-4 z-10 w-full h-full">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-9 right-6 w-2 h-3 flex items-center justify-center rounded-full focus:outline-none z-20 hover:cursor-pointer"
              aria-label="Close"
            >
              <Image src="/close.svg" alt="Close" width={20} height={20} />
            </button>

            {/* Incorrect badge */}
            <div className="relative flex justify-center items-center w-full mb-4">
              <div className="bg-red-500 rounded-lg px-6 py-2 shadow-md">
                <span className="text-white font-bold tracking-wide text-lg drop-shadow-md font-bricolage">
                  INCORRECT
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="absolute left-0 top-3 w-full h-full flex flex-col items-center justify-center pointer-events-none">
              {/* Your Guess Section */}
              <div className="absolute top-[35%] left-1/2 transform -translate-x-1/2 w-[75%]">
                <div className="text-center mb-2">
                  <span className="text-xs text-[#8A9BA8] font-semibold tracking-wide font-jetbrains">
                    Your Guess
                  </span>
                  <div className="bg-red-50 rounded-[12px] flex items-center justify-center border border-red-200 py-2">
                    <span className="text-xl font-extrabold text-red-600 font-jetbrains">
                      {incorrectGuess.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Section */}
              <div className="absolute top-[60%] left-1/2 transform -translate-x-1/2 w-[75%]">
                <div className="text-center">
                  <span className="text-xs text-[#8A9BA8] font-semibold tracking-wide font-jetbrains">
                    Progress
                  </span>
                  <div className="bg-[#00FFC21F] rounded-[12px] flex items-center justify-center border border-[#D6E3EA] py-2">
                    {playerStats ? (
                      <span className="text-sm font-bold text-[#1A1A1A] font-jetbrains">
                        {playerStats.puzzlesSolved}/{playerStats.totalAttempts} solved • Level {playerStats.level}
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-[#1A1A1A] font-jetbrains">
                          {puzzlesSolved}/{totalPuzzles} • Level {level}
                        </span>
                        <div className="w-3 h-3 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Incorrect guess tiles */}
        <div className="flex justify-center gap-1 mb-4">
          {incorrectGuess.split("").map((char, i) => (
            <div
              key={i}
              className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center font-bold text-xl text-white shadow-md"
            >
              {char.toUpperCase()}
            </div>
          ))}
        </div>

        {/* Action button */}
        <button
          onClick={handleContinue}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-colors font-bricolage"
        >
          Next
        </button>
      </div>
    </div>
  );
} 