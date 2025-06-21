import React from "react";
import Image from "next/image";

interface TopActionsProps {
  soundOn: boolean;
  onSoundToggle: () => void;
  onShare: () => void;
}

const TopActions: React.FC<TopActionsProps> = ({
  soundOn,
  onSoundToggle,
  onShare,
}) => (
  <div className="flex flex-row gap-3 items-center mt-2 mb-4 px-2">
    <button
      onClick={onSoundToggle}
      className="flex flex-col items-center group hover:cursor-pointer"
      aria-label={soundOn ? "Turn sound off" : "Turn sound on"}
    >
      <span
        className={`rounded-lg w-12 h-12 flex items-center justify-center bg-white/80 shadow-md group-hover:bg-primary-orange/20 transition-all duration-200 ${
          soundOn ? "text-primary-orange" : "text-gray-400"
        }`}
      >
        <Image
          src={soundOn ? "/music-note-01.svg" : "/music-note-02.svg"}
          alt={soundOn ? "Sound On" : "Sound Off"}
          width={28}
          height={28}
        />
      </span>
      <span className="text-xs mt-1 text-gray-700 font-medium">
        Sound {soundOn ? "On" : "Off"}
      </span>
    </button>
    <button
      onClick={onShare}
      className="flex flex-col items-center group hover:cursor-pointer"
      aria-label="Share game"
    >
      <span className="rounded-lg w-12 h-12 flex items-center justify-center bg-white/80 shadow-md group-hover:bg-primary-orange/20 transition-all duration-200 text-gray-600 group-hover:text-primary-orange">
        <Image src="/sent.svg" alt="Share" width={28} height={28} />
      </span>
      <span className="text-xs mt-1 text-gray-700 font-medium">Share</span>
    </button>
  </div>
);

export default TopActions;
