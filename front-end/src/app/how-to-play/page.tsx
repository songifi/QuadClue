"use client";

import LogoSection from "@/components/LogoSection";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";

export default function HowToPlayPage() {
  const router = useRouter();

  const handleClick = () => {
    // Play button click sound if sound is on
    if (typeof window !== "undefined") {
      const soundOn = localStorage.getItem("soundOn");
      if (soundOn === null || soundOn === "true") {
        const audio = new Audio("/sounds/button-click.wav");
        audio.volume = 0.5;
        audio.play();
      }
    }
    router.push(ROUTES.GAME);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-800">
      <div
        className="relative min-h-screen w-full max-w-sm mx-auto hover:cursor-pointer flex flex-col items-center p-4 overflow-y-auto font-game"
        style={{
          backgroundColor: "#f3f6fa",
          backgroundImage: `repeating-linear-gradient(0deg, rgba(229,233,242,0.15) 0px, rgba(229,233,242,0.15) 24px, transparent 24px, transparent 48px), repeating-linear-gradient(90deg, rgba(229,233,242,0.15) 0px, rgba(229,233,242,0.15) 24px, transparent 24px, transparent 48px)`,
        }}
        onClick={handleClick}
      >
        <div className="absolute inset-0 z-0 pointer-events-none select-none">
          {[
            { top: "8%", left: "12%" },
            { top: "22%", right: "10%" },
            { top: "50%", left: "18%" },
            { top: "60%", right: "18%" },
            { bottom: "8%", left: "10%" },
            { bottom: "6%", right: "12%" },
          ].map((pos, i) => (
            <svg
              key={i}
              width="56"
              height="56"
              viewBox="0 0 56 56"
              fill="none"
              className="absolute opacity-20"
              style={pos}
            >
              <path
                d="M28 4l6.928 14.142L50 20.485l-11.036 10.728L41.856 48 28 39.514 14.144 48l2.892-16.787L6 20.485l15.072-2.343L28 4z"
                fill="#7CBAC2"
              />
            </svg>
          ))}
        </div>
        <div className="relative z-10 flex flex-col items-center">
          <LogoSection isAnimating={false} />
        </div>
        
        {/* New comprehensive how-to-play content */}
        <div className="relative z-10 w-full max-w-xs mx-auto text-[#1A1A1A] font-jetbrains">
          
          {/* Main Title */}
          <h1 className="text-3xl font-extrabold text-center mb-4 font-bricolage">
            QuadClue
          </h1>
          
          <p className="text-center text-sm mb-4 font-medium">
            <strong>QuadClue</strong> is a word puzzle game where you guess the one word that links four images.
          </p>
          
          {/* How to Play Section */}
          <h2 className="text-lg font-bold mb-3 flex items-center">
            🎮 How to Play
          </h2>
          
          <div className="space-y-2 text-sm mb-4">
            <p>1. <strong>Look at 4 images</strong> presented on screen.</p>
            <p>2. <strong>Guess the common word</strong> that connects all four.</p>
            <p>3. <strong>Type your answer</strong> using the on-screen keyboard or input field.</p>
            <p>4. <strong>Use hints</strong> if you're stuck:</p>
            <div className="ml-4 space-y-1 text-xs">
              <p>• <em>Reveal a letter</em></p>
              <p>• <em>Remove wrong letters</em></p>
              <p>• <em>Skip the puzzle</em></p>
            </div>
          </div>
          
          {/* Example Section */}
          <h3 className="text-base font-bold mb-2 flex items-center">
            💡 Example
          </h3>
          
          <div className="bg-white bg-opacity-50 rounded-lg p-3 mb-4 text-xs">
            <div className="space-y-1">
              <p>🖼️ Dog</p>
              <p>🖼️ Cat</p>
              <p>🖼️ Rabbit</p>
              <p>🖼️ Parrot</p>
              <p className="text-green-600 font-bold">✅ Answer: PET</p>
            </div>
          </div>
          
          {/* Features Section */}
          <h3 className="text-base font-bold mb-2 flex items-center">
            🧩 Features
          </h3>
          
          <div className="space-y-1 text-xs mb-4">
            <p>• 4-picture word puzzles</p>
            <p>• Hundreds of levels</p>
            <p>• Hints and help tools</p>
            <p>• Clean, intuitive design</p>
            <p>• Fun and educational</p>
          </div>
          
          {/* Platform Section */}
          <h3 className="text-base font-bold mb-2 flex items-center">
            🌐 Platform
          </h3>
          
          <p className="text-xs mb-6">
            QuadClue is available on the <strong>web only</strong>.
          </p>
          
          {/* Click to Start Hint */}
          <div className="text-center">
            <p className="text-xs text-gray-600 animate-pulse">
              Tap anywhere to start playing!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
