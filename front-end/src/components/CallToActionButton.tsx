import React from "react";
import { Play } from "lucide-react";

interface CallToActionButtonProps {
  onClick: () => void;
}

const CallToActionButton: React.FC<CallToActionButtonProps> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center gap-0.5 font-bold py-1 px-7 rounded-2xl text-lg transition-all duration-300 shadow-[0_4px_0_#d97706] hover:shadow-xl bg-primary-orange text-white active:scale-95 hover:cursor-pointer"
    style={{ boxShadow: "0 4px 0 #d97706", backgroundColor: "#FF8C00" }}
  >
    <Play size={26} className="mb-0.5" fill="white" stroke="white" />
    <span>LET&apos;S PLAY!</span>
  </button>
);

export default CallToActionButton;
