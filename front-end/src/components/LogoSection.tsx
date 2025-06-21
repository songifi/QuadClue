import React from "react";
import Image from "next/image";

interface LogoSectionProps {
  isAnimating: boolean;
}

const LogoSection: React.FC<LogoSectionProps> = ({ isAnimating }) => (
  <div
    className={`flex flex-col items-center mb-2 w-full max-w-xs mx-auto px-2 ${
      isAnimating ? "animate-bounce-in" : ""
    }`}
  >
    <Image
      src="/Clu3.svg"
      alt="CLU3 Logo"
      width={160}
      height={64}
      className="mb-4 w-32 md:w-40 h-auto"
      priority
    />
    <div className="flex flex-col items-center w-[22rem] md:w-[26rem]">
      <Image
        src="/texts.svg"
        alt="THINK IN PIECES"
        width={340}
        height={90}
        className="w-[18rem] md:w-[22rem] h-auto"
        priority
      />
    </div>
  </div>
);

export default LogoSection;
