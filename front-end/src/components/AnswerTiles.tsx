interface AnswerTilesProps {
  answer: string;
  input: string[];
  setInput: (input: string[]) => void;
  keyboard: string[];
  used: boolean[];
  setUsed: (used: boolean[]) => void;
}

export default function AnswerTiles({
  answer,
  input,
  setInput,
  keyboard,
  used,
  setUsed,
}: AnswerTilesProps) {
  return (
    <div className="flex justify-center gap-2 mb-4">
      {Array.from({ length: answer.length }).map((_, i) => (
        <div
          key={i}
          className={`w-10 h-10 flex items-center justify-center rounded-md font-bold text-xl font-jetbrains shadow-sm ${
            input[i]
              ? "bg-gray-900 text-[#00FFC2] cursor-pointer"
              : "bg-white text-gray-900"
          }`}
          onClick={() => {
            if (input[i]) {
              // Play toggle sound if sound is on
              if (typeof window !== "undefined") {
                const soundOn = localStorage.getItem("soundOn");
                if (soundOn === null || soundOn === "true") {
                  const audio = new Audio("/sounds/toggle.wav");
                  audio.volume = 0.5;
                  audio.play();
                }
              }
              const letter = input[i];
              const newInput = input.filter((_, idx) => idx !== i);
              setInput(newInput);
              const idx = keyboard.findIndex(
                (k, ki) => k === letter && used[ki]
              );
              if (idx !== -1) {
                const nextUsed = [...used];
                nextUsed[idx] = false;
                setUsed(nextUsed);
              }
            }
          }}
        >
          {input[i] || ""}
        </div>
      ))}
    </div>
  );
}
