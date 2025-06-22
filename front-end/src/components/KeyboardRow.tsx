import Image from "next/image";

// Utility to play button click sound if sound is on
export function playButtonClickSound() {
  if (typeof window !== "undefined") {
    const soundOn = localStorage.getItem("soundOn");
    if (soundOn === null || soundOn === "true") {
      const audio = new Audio("/sounds/button-click.wav");
      audio.volume = 0.5;
      audio.play();
    }
  }
}

// Utility to play hover sound if sound is on
export function playHoverSound() {
  if (typeof window !== "undefined") {
    const soundOn = localStorage.getItem("soundOn");
    if (soundOn === null || soundOn === "true") {
      const audio = new Audio("/sounds/hover.mp3");
      audio.volume = 0.5;
      audio.play();
    }
  }
}

interface KeyboardRowProps {
  keyboard: string[];
  used: boolean[];
  setUsed: (used: boolean[]) => void;
  input: string[];
  setInput: (input: string[]) => void;
  answerLength: number;
  disabled?: boolean;
}

export default function KeyboardRow({
  keyboard,
  used,
  setUsed,
  input,
  setInput,
  answerLength,
  disabled = false,
}: KeyboardRowProps) {
  return (
    <div className="flex gap-2 mb-2 w-full">
      <div className="grid grid-cols-6 gap-2 flex-1 pr-2">
        {keyboard.map((char, i) => (
          <div
            key={i}
            className={`w-12 h-12 bg-white font-extrabold text-[#1A1A1A] rounded-md flex items-center justify-center text-xl font-bricolage shadow cursor-pointer select-none ${
              used[i] || disabled ? "opacity-40" : ""
            } ${disabled ? "pointer-events-none" : ""}`}
            onClick={() => {
              if (disabled) return;
              playButtonClickSound();
              if (!used[i] && input.length < answerLength) {
                setInput([...input, char]);
                const nextUsed = [...used];
                nextUsed[i] = true;
                setUsed(nextUsed);
              }
            }}
            onMouseEnter={() => {
              if (!disabled) playHoverSound();
            }}
          >
            {char}
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        <button
          className={`bg-[#00FFC2] rounded-lg p-2 flex flex-col items-center justify-center font-bold text-white text-xs w-12 h-12 hover:cursor-pointer ${
            disabled ? "opacity-40 pointer-events-none" : ""
          }`}
          onClick={() => {
            if (!disabled) playButtonClickSound();
          }}
          onMouseEnter={() => {
            if (!disabled) playHoverSound();
          }}
          disabled={disabled}
        >
          <Image src="/AI.svg" alt="AI" width={24} height={24} />
          <div className="ml-1 text-[10px] text-[#1A1A1A] flex bg-white rounded-full px-1 w-full items-center justify-center">
            <Image src="/coins-02.svg" alt="coin" width={12} height={12} />
            <span>50</span>
          </div>
        </button>
        <button
          className={`bg-[#00FFC2] rounded-lg p-2 flex gap-1 flex-col items-center justify-center font-bold text-[#00FFC2] text-xs w-12 h-12 border border-[#00FFC2] hover:cursor-pointer ${
            disabled ? "opacity-40 pointer-events-none" : ""
          }`}
          onClick={() => {
            if (!disabled) playButtonClickSound();
          }}
          onMouseEnter={() => {
            if (!disabled) playHoverSound();
          }}
          disabled={disabled}
        >
          <Image src="/delete-02.svg" alt="delete" width={24} height={24} />
          <div className="ml-1 text-[10px] text-[#1A1A1A] flex bg-white rounded-full px-1 w-full items-center justify-center">
            <Image src="/coins-02.svg" alt="coin" width={12} height={12} />
            <span>150</span>
          </div>
        </button>
      </div>
    </div>
  );
}
