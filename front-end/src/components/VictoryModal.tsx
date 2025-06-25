import Image from "next/image";
import { useEffect, useState } from "react";
import { PlayerStats } from "@/types/user";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";

interface VictoryModalProps {
  open: boolean;
  onClose: () => void;
  onNextPuzzle: () => void;
  answer: string;
  score: number;
  coins: number;
  isGameComplete?: boolean;
  level: number;
  puzzlesSolved: number;
  totalPuzzles: number;
  timeUsed?: number;
  hintsUsed?: number;
  playerStats?: PlayerStats | null; // new
}

export default function VictoryModal({
  open,
  onClose,
  onNextPuzzle,
  answer,
  score,
  coins,
  isGameComplete = false,
  level,
  puzzlesSolved,
  totalPuzzles,
  timeUsed = 0,
  hintsUsed = 0,
  playerStats,
}: VictoryModalProps) {
  const [showCelebration, setShowCelebration] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!open) return null;

  const handleContinue = () => {
    if (isGameComplete) {
      onClose();
    } else {
      onNextPuzzle();
      onClose();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="flex flex-col items-center w-full max-w-xs mx-auto">
        {/* Celebration animation */}
        {showCelebration && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="animate-bounce text-6xl">🎉</div>
          </div>
        )}

        {/* Main title */}
        <div
          className="text-[2.5rem] leading-none font-extrabold text-[#1A1A1A] text-center mb-1 font-bricolage"
          style={{
            textShadow: "0 4px 8px rgba(0,0,0,0.2)",
          }}
        >
          {isGameComplete ? "GAME COMPLETE!" : "AWESOME!"}
        </div>

        {/* Subtitle */}
        <div className="text-center text-[#1A1A1A] font-semibold text-sm mb-4 font-bricolage">
          {isGameComplete 
            ? "You solved all puzzles!" 
            : "You found the word.."
          }
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

            {/* Victory badge */}
            <div className="relative flex justify-center items-center w-full mb-4">
              <Image
                src="/victory-board.svg"
                alt="Victory board"
                width={210}
                height={56}
                className="select-none"
                priority
              />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white font-bold tracking-wide text-lg drop-shadow-md font-bricolage">
                {isGameComplete ? "COMPLETE!" : "VICTORY"}
              </span>
            </div>

            {/* Stats Grid */}
            <div className="absolute left-0 top-3 w-full h-full flex flex-col items-center justify-center pointer-events-none">
              {/* Score Section */}
              <div className="absolute top-[35%] left-1/2 transform -translate-x-1/2 w-[75%]">
                <div className="text-center mb-2">
                  <span className="text-xs text-[#8A9BA8] font-semibold tracking-wide font-jetbrains">
                    {playerStats ? "Total Score" : "Score"}
                  </span>
                  <div className="bg-[#00FFC21F] rounded-[12px] flex items-center justify-center border border-[#D6E3EA] py-2">
                    {playerStats ? (
                      <span className="text-2xl font-extrabold text-[#1A1A1A] font-jetbrains">
                        {playerStats.score.toLocaleString()}
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-extrabold text-[#1A1A1A] font-jetbrains">
                          {score.toLocaleString()}
                        </span>
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Coins Section */}
              <div className="absolute top-[55%] left-1/2 transform -translate-x-1/2 w-[75%]">
                <div className="text-center mb-2">
                  <span className="text-xs text-[#8A9BA8] font-semibold tracking-wide font-jetbrains">
                    {playerStats ? "Total Coins" : "Coins"}
                  </span>
                  <div className="bg-[#00FFC21F] rounded-[12px] flex items-center justify-center border border-[#D6E3EA] py-2">
                    <span className="flex items-center gap-2 text-xl font-extrabold text-[#1A1A1A] font-jetbrains">
                      <Image src="/star.svg" alt="star" width={20} height={20} />
                      {playerStats ? playerStats.coins : coins}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Section */}
              <div className="absolute top-[75%] left-1/2 transform -translate-x-1/2 w-[75%]">
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
                      <span className="text-sm font-bold text-[#1A1A1A] font-jetbrains">
                        {puzzlesSolved}/{totalPuzzles} • Level {level}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Answer tiles */}
        <div className="flex justify-center gap-1 mb-4">
          {answer.split("").map((char, i) => (
            <div
              key={i}
              className="w-12 h-12 bg-[#FF8C00] rounded-lg flex items-center justify-center font-bold text-xl text-white shadow-md"
            >
              {char}
            </div>
          ))}
        </div>

        {/* Performance Stats */}
        {!isGameComplete && (
          <div className="flex justify-between w-full text-xs text-gray-600 mb-4 px-2">
            <span>Time: {formatTime(timeUsed)}</span>
            <span>Hints: {hintsUsed}/3</span>
          </div>
        )}

        {/* Continue button(s) */}
        {isGameComplete ? (
          <div className="w-full space-y-2">
            <button
              className="w-full bg-blue-500 text-white font-bold rounded-xl py-4 text-lg shadow-lg hover:cursor-pointer transition-colors hover:bg-blue-600"
              onClick={() => {
                onClose();
                router.push(ROUTES.HOME);
              }}
            >
              RETURN HOME
            </button>
            <button
              className="w-full bg-[#FF8C00] text-white font-bold rounded-xl py-4 text-lg shadow-lg hover:cursor-pointer transition-colors hover:bg-[#e67e00]"
              onClick={handleContinue}
            >
              CLOSE
            </button>
          </div>
        ) : (
          <button
            className="w-full bg-[#FF8C00] text-white font-bold rounded-xl py-4 text-lg shadow-lg hover:cursor-pointer transition-colors hover:bg-[#e67e00]"
            onClick={handleContinue}
          >
            NEXT PUZZLE
          </button>
        )}
      </div>
    </div>
  );
}
