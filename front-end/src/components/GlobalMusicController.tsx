"use client";

import React from "react";

export default function GlobalMusicController() {
  React.useEffect(() => {
    const audio = document.getElementById(
      "global-background-music"
    ) as HTMLAudioElement | null;
    if (!audio) return;
    // Try to play on first user interaction
    const tryPlay = () => {
      if (window.localStorage.getItem("soundOn") !== "false") {
        audio.volume = 0.3;
        audio.loop = true;
        audio.play().catch(() => {});
      }
      document.removeEventListener("click", tryPlay);
      document.removeEventListener("touchstart", tryPlay);
    };
    document.addEventListener("click", tryPlay);
    document.addEventListener("touchstart", tryPlay);
    // React to soundOn changes in localStorage
    const onStorage = () => {
      if (window.localStorage.getItem("soundOn") === "false") {
        audio.pause();
      } else {
        audio.play().catch(() => {});
      }
    };
    window.addEventListener("storage", onStorage);
    return () => {
      document.removeEventListener("click", tryPlay);
      document.removeEventListener("touchstart", tryPlay);
      window.removeEventListener("storage", onStorage);
      audio.pause();
    };
  }, []);
  return null;
}
