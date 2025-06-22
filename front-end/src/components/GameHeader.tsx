"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import { ROUTES } from "@/lib/constants";
import LevelBadge from "./LevelBadge";

interface GameHeaderProps {
  level: number;
  coins: number;
  onUseHint?: () => void;
  hintsRemaining?: number;
}

export default function GameHeader({ level, coins, onUseHint, hintsRemaining = 3 }: GameHeaderProps) {
  const router = useRouter();
  const [soundOn, setSoundOn] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("soundOn");
      return stored !== "false";
    }
    return true;
  });

  // Keep local state in sync with global soundOn
  useEffect(() => {
    window.localStorage.setItem("soundOn", String(soundOn));
    // Also update the global music immediately
    const audio = document.getElementById(
      "global-background-music"
    ) as HTMLAudioElement | null;
    if (audio) {
      if (soundOn) {
        audio.play().catch(() => {});
      } else {
        audio.pause();
      }
    }
  }, [soundOn]);

  const handleClick = () => {
    router.push(ROUTES.HOME);
  };

  const handleHintClick = () => {
    if (onUseHint && hintsRemaining > 0) {
      onUseHint();
    }
  };

  return (
    <div className="flex flex-col items-end mb-2 w-full max-w-xs mx-auto">
      <div className="relative flex items-center justify-between w-full mb-2 bg-white p-2 overflow-visible">
        <Image
          src="/Clu3.svg"
          alt="CLU3 Logo"
          width={60}
          height={24}
          className="w-16 h-auto"
          priority
          onClick={handleClick}
          style={{ cursor: "pointer" }}
        />
        <div className="absolute left-1/2 -bottom-5 z-10 -translate-x-1/2 pointer-events-none">
          <LevelBadge level={level} />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-[#E3EDEE] rounded-full px-1 py-1 shadow-[0_4px_16px_0_rgba(0,0,0,0.08)]">
            <Image
              src="/star.svg"
              alt="star"
              width={15}
              height={15}
              className="mr-1"
            />
            <span className="font-bold text-[#1A1A1A] text-sm">{coins}</span>
            <button
              className="ml-2 w-6 h-6 bg-[#00FFC2] rounded-full flex items-center justify-center shadow"
              type="button"
            >
              <svg
                width={13}
                height={13}
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1A1A1A"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onUseHint && (
          <button
            className={`bg-gradient-to-tr from-[#F6FBFF] to-[rgba(0,0,0,0.15)] rounded-3xl p-2 shadow transition-all duration-200 flex items-center gap-1 ${
              hintsRemaining > 0 
                ? "hover:cursor-pointer hover:shadow-md" 
                : "opacity-40 cursor-not-allowed"
            }`}
            onClick={handleHintClick}
            disabled={hintsRemaining === 0}
            type="button"
            title={`${hintsRemaining} hints remaining`}
          >
            <svg
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span className="text-xs font-bold">{hintsRemaining}</span>
          </button>
        )}
        <button
          className="bg-gradient-to-tr from-[#F6FBFF] to-[rgba(0,0,0,0.15)] rounded-3xl p-2 shadow hover:cursor-pointer transition-all duration-200"
          onClick={() => setSoundOn((prev) => !prev)}
          type="button"
        >
          <Image
            src={soundOn ? "/music-note-01.svg" : "/music-note-02.svg"}
            alt="sound"
            width={18}
            height={18}
          />
        </button>
      </div>
    </div>
  );
}
