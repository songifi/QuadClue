import Image from "next/image";

interface VictoryModalProps {
  open: boolean;
  onClose: () => void;
  answer: string;
  score: number;
  coins: number;
}

export default function VictoryModal({
  open,
  onClose,
  answer,
  score,
  coins,
}: VictoryModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="flex flex-col items-center w-full max-w-xs mx-auto">
        {/* AWESOME! text */}
        <div
          className="text-[2.5rem] leading-none font-extrabold text-[#1A1A1A] text-center mb-1 font-bricolage"
          style={{
            textShadow: "0 4px 8px rgba(0,0,0,0.2)",
          }}
        >
          AWESOME!
        </div>

        {/* Subtitle */}
        <div className="text-center text-[#1A1A1A] font-semibold text-sm mb-4 font-bricolage">
          You found the word..
        </div>

        {/* Orange card container replaced with board.svg */}
        <div
          className="relative w-full flex justify-center items-center mb-4"
          style={{ minHeight: 240 }}
        >
          {/* Overlay white-board.svg above board.svg */}
          <Image
            src="/board.svg"
            alt="Board background"
            fill
            style={{ objectFit: "contain", zIndex: 0, maxHeight: 260 }}
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
              maxHeight: 180,
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
              style={{ boxShadow: "0 2px 8px #0002", padding: 0 }}
            >
              <Image
                src="/close.svg"
                alt="Close"
                width={20}
                height={20}
                style={{ display: "block" }}
              />
            </button>

            {/* VICTORY badge replaced with victory-board.svg */}
            <div
              className="relative flex justify-center items-center w-full mb-46"
              style={{ minHeight: 56 }}
            >
              <Image
                src="/victory-board.svg"
                alt="Victory board"
                width={210}
                height={56}
                className="select-none"
                priority
                style={{ marginTop: "-8px" }}
              />
              <span
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white font-bold tracking-wide text-lg drop-shadow-md font-bricolage"
                style={{ letterSpacing: "0.04em", marginTop: "-2px" }}
              >
                VICTORY
              </span>
            </div>

            {/* Score sections */}
            <div className="absolute left-0 top-3 w-full h-full flex flex-col items-center justify-center pointer-events-none">
              <div
                style={{
                  position: "absolute",
                  top: "38%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "75%",
                }}
                className="flex flex-col items-center w-full"
              >
                <span className="text-xs text-[#8A9BA8] font-semibold tracking-wide font-jetbrains">
                  Your Score
                </span>
                <div
                  className="bg-[#00FFC21F] rounded-[12px] flex flex-col items-center border border-[#D6E3EA] w-full justify-center"
                  style={{ minHeight: 44, marginBottom: 12 }}
                >
                  <span className="text-[1.5rem] font-extrabold text-[#1A1A1A] leading-none font-jetbrains">
                    {score}
                  </span>
                </div>
              </div>
              <div
                style={{
                  position: "absolute",
                  top: "65%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "75%",
                }}
                className="flex flex-col items-center w-full"
              >
                <span className="text-xs text-[#8A9BA8] font-semibold tracking-wide font-jetbrains">
                  Your Score
                </span>
                <div className="bg-[#00FFC21F] rounded-[12px] py-2 flex flex-col items-center border border-[#D6E3EA] w-full justify-center">
                  <span className="flex items-center gap-1 text-[1.5rem] font-extrabold text-[#FFC300] leading-none font-jetbrains">
                    <Image
                      src="/star.svg"
                      alt="star"
                      width={22}
                      height={22}
                      className="inline-block -mt-0.5"
                    />
                    <span className="text-[#1A1A1A] font-extrabold text-[1.5rem] font-jetbrains">
                      {coins}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Answer tiles */}
        <div className="flex justify-center gap-1 mb-6">
          {answer.split("").map((char, i) => (
            <div
              key={i}
              className="w-12 h-12 bg-[#FF8C00] rounded-lg flex items-center justify-center font-bold text-xl text-white shadow-md"
            >
              {char}
            </div>
          ))}
        </div>

        {/* Continue button */}
        <button
          className="w-full bg-[#FF8C00] text-white font-bold rounded-xl py-4 text-lg shadow-lg hover:cursor-pointer"
          onClick={onClose}
        >
          CONTINUE
        </button>
      </div>
    </div>
  );
}
