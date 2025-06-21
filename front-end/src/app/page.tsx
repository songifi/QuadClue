"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import NavigationBar from "@/components/NavigationBar";
import TopActions from "@/components/TopActions";
import LogoSection from "@/components/LogoSection";
import CallToActionButton from "@/components/CallToActionButton";

const CLU3HomeScreen = () => {
  const [soundOn, setSoundOn] = useState(() => {
    if (typeof window !== "undefined") {
      const stored = window.localStorage.getItem("soundOn");
      return stored !== "false";
    }
    return true;
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const router = useRouter();

  // Play sound effect
  const playSound = (src: string, volume = 0.5) => {
    if (soundOn) {
      const audio = new Audio(src);
      audio.volume = volume;
      audio.play().catch(() => {});
    }
  };

  // Add hover sound effects
  const handleButtonHover = () => {
    playSound("/sounds/hover.mp3", 0.2);
  };

  const handleLetsPlay = () => {
    playSound("/sounds/button-click.wav", 0.6);
    setTimeout(() => {
      router.push(ROUTES.HOW_TO_PLAY);
    }, 100);
  };

  const handleSoundToggle = () => {
    playSound("/sounds/toggle.wav", 0.5);
    setSoundOn((prev) => {
      const newSoundOn = !prev;
      window.localStorage.setItem("soundOn", String(newSoundOn));
      // Sync with global background music
      if (typeof window !== "undefined") {
        const globalMusic = document.getElementById(
          "global-background-music"
        ) as HTMLAudioElement | null;
        if (globalMusic) {
          if (newSoundOn) {
            globalMusic.play().catch(() => {});
          } else {
            globalMusic.pause();
          }
        }
      }
      return newSoundOn;
    });
  };

  const handleShare = () => {
    playSound("/sounds/button-click.wav", 0.6);
    if (navigator.share) {
      navigator.share({
        title: "CLU3 - Think in Pieces",
        text: "Check out this amazing word puzzle game!",
        url: window.location.href,
      });
    }
  };

  useEffect(() => {
    setIsAnimating(true);
    setHasMounted(true);
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-800">
      <div
        className="relative min-h-screen w-full max-w-sm mx-auto flex flex-col items-center justify-between p-4 overflow-y-auto font-game"
        style={{
          backgroundColor: "#f3f6fa",
          backgroundImage: `repeating-linear-gradient(0deg, rgba(229,233,242,0.15) 0px, rgba(229,233,242,0.15) 24px, transparent 24px, transparent 48px), repeating-linear-gradient(90deg, rgba(229,233,242,0.15) 0px, rgba(229,233,242,0.15) 24px, transparent 24px, transparent 48px)`,
        }}
      >
        {/* Animated background elements with sound-reactive effects */}
        <div className="absolute inset-0 opacity-5 pointer-events-none select-none">
          <div
            className={`absolute top-16 left-4 w-24 h-24 rounded-full blur-3xl bg-primary-orange transition-all duration-1000 ${
              soundOn ? "animate-pulse" : ""
            }`}
          ></div>
          <div
            className={`absolute bottom-24 right-4 w-28 h-28 rounded-full blur-3xl bg-primary-green transition-all duration-1000 ${
              soundOn ? "animate-pulse" : ""
            }`}
            style={{ animationDelay: "0.5s" }}
          ></div>
          <div
            className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-3xl bg-purple-400 transition-all duration-1000 ${
              soundOn ? "animate-pulse" : ""
            }`}
            style={{ animationDelay: "1s" }}
          ></div>
        </div>

        <div className="flex-1 w-full mt-24 flex flex-col justify-center items-center">
          <LogoSection isAnimating={isAnimating} />

          {/* Sound status indicator */}
          {hasMounted && (
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
              <div
                className={`w-2 h-2 rounded-full ${
                  soundOn ? "bg-green-400 animate-pulse" : "bg-gray-400"
                }`}
              ></div>
              <span>{soundOn ? "Audio On" : "Audio Off"}</span>
            </div>
          )}
        </div>

        <div className="w-full flex flex-row gap-2 mb-8 min-w-0 max-w-[340px] mx-auto mt-4 items-start">
          <div className="flex flex-row gap-4 flex-1 min-w-0">
            <div onMouseEnter={handleButtonHover}>
              <TopActions
                soundOn={soundOn}
                onSoundToggle={handleSoundToggle}
                onShare={handleShare}
              />
            </div>
          </div>
          <div className="flex-shrink-0 flex-[0_0_auto]">
            <div onMouseEnter={handleButtonHover}>
              <CallToActionButton onClick={handleLetsPlay} />
            </div>
          </div>
        </div>

        <NavigationBar
          onButtonHover={handleButtonHover}
          onButtonClick={() => playSound("/sounds/button-click.wav", 0.6)}
        />
      </div>
    </div>
  );
};

export default CLU3HomeScreen;
