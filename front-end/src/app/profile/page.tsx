"use client";

import Image from "next/image";
import NavigationBar from "@/components/NavigationBar";
import { ROUTES } from "@/lib/constants";
import { useRouter } from "next/navigation";
import ProfileAvatar from "@/components/ProfileAvatar";
import { useDisconnect } from "@starknet-react/core";

export default function ProfilePage() {
  const router = useRouter();
  const { disconnect } = useDisconnect();

  const handleClose = () => {
    router.push(ROUTES.HOME);
  };

  const handleDisconnect = () => {
    disconnect();
    router.push(ROUTES.HOME);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-800">
      <div
        className="relative min-h-screen w-full max-w-sm mx-auto flex flex-col items-center justify-start p-4 overflow-y-auto font-game"
        style={{
          backgroundColor: "#f3f6fa",
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(229,233,242,0.15) 0px, rgba(229,233,242,0.15) 24px, transparent 24px, transparent 48px), repeating-linear-gradient(90deg, rgba(229,233,242,0.15) 0px, rgba(229,233,242,0.15) 24px, transparent 24px, transparent 48px)",
        }}
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

        <div className="z-10 mt-2 flex justify-center w-full">
          <ProfileAvatar />
        </div>

        <div
          className="z-10 w-full max-w-xs relative flex justify-center items-center pb-6"
          style={{ minHeight: 420, height: 420 }}
        >
          <Image
            src="/orange-board.svg"
            alt="Orange board background"
            fill
            style={{ objectFit: "contain", zIndex: 0 }}
            className="rounded-2xl select-none pointer-events-none"
            priority
          />
          <div
            className="absolute top-1/2 left-1/2 z-10"
            style={{
              width: "98%",
              height: "88%",
              transform: "translate(-50%, -45%)",
            }}
          >
            <Image
              src="/long-white-board.svg"
              alt="Long white board overlay"
              fill
              style={{ objectFit: "contain" }}
              className="rounded-2xl select-none"
              priority
            />
          </div>
          {/* Card content */}
          <div className="absolute inset-0 top-12 flex flex-col justify-start items-center px-4 py-4 z-20 w-full h-full">
            <div
              className="text-center text-white font-bold text-lg py-3 relative"
              style={{ zIndex: 2 }}
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
                PROFILE
              </span>
            </div>
            <button
              onClick={handleClose}
              className="absolute top-12 right-7 w-2 h-3 flex items-center justify-center rounded-full focus:outline-none z-20 hover:cursor-pointer"
            >
              <Image
                src="/close.svg"
                alt="Close"
                width={20}
                height={20}
                style={{ display: "block" }}
              />
            </button>
            <div
              className="bg-transparent rounded-xl w-full flex flex-col items-center gap-4 mt-2"
              style={{ zIndex: 2 }}
            >
              <div>
                <div className="text-xs text-gray-400 text-center">
                  Your Username
                </div>
                <div className="bg-[#00FFC21F] rounded-[8px] flex flex-col items-center border border-[#D6E3EA] w-52 justify-center text-[#1A1A1A] font-bricolage font-bold text-lg">
                  PLAYER123
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-400 text-center">
                  Your Age
                </div>
                <select
                  className="bg-[#00FFC21F] rounded-[8px] h-8 flex text-center items-center border border-[#D6E3EA] w-52 justify-center text-[#1A1A1A] font-bricolage font-bold text-lg"
                  defaultValue={25}
                >
                  {Array.from({ length: 83 }, (_, i) => 18 + i).map((age) => (
                    <option key={age} value={age}>
                      {age}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <div className="text-xs text-gray-400 text-center">
                  Your Country
                </div>
                <select
                  className="bg-[#00FFC21F] rounded-[8px] h-8 flex text-center items-center border border-[#D6E3EA] w-52 justify-center text-[#1A1A1A] font-bricolage font-bold text-lg"
                  defaultValue="Nigeria"
                >
                  <option value="Nigeria">NIGERIA</option>
                  {/* Add more countries as needed */}
                </select>
              </div>
              
              {/* Disconnect Wallet Button */}
              <div className="mt-6 w-full">
                <button
                  onClick={handleDisconnect}
                  className="w-52 bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-colors font-bricolage"
                >
                  DISCONNECT WALLET
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="z-20 w-full max-w-xs fixed bottom-6 left-1/2 -translate-x-1/2">
          <NavigationBar activeRoute="/profile" />
        </div>
      </div>
    </div>
  );
}
