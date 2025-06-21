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
        <h1 className="text-3xl font-extrabold text-[#1A1A1A] text-center mb-5 z-10 font-bricolage">
          HOW TO PLAY!
        </h1>
        <div className="flex flex-col justify-between gap-2 w-full max-w-xs mx-auto z-10 mb-0 md:h-[calc(100vh-350px)] font-jetbrains">
          <div
            className="text-left text-base font-jetbrains text-[#1A1A1A] leading-tight mb-1"
            style={{ whiteSpace: "pre-line" }}
          >
            Each puzzle gives{`\n`}you three hints.
          </div>
          <div
            className="text-right text-base font-jetbrains text-[#1A1A1A] leading-tight mb-1"
            style={{ whiteSpace: "pre-line" }}
          >
            Figure out what ties{`\n`}all four pics{`\n`}together.
          </div>
          <div
            className="text-left text-base font-jetbrains text-[#1A1A1A] leading-tight mb-1"
            style={{ whiteSpace: "pre-line" }}
          >
            Type in your answer.{`\n`}The quicker you solve, the{`\n`}higher
            your score!
          </div>
        </div>
      </div>
    </div>
  );
}
