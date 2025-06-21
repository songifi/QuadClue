import Image from "next/image";

interface AskFriendsButtonProps {
  onShuffle: () => void;
}

export default function AskFriendsButton({ onShuffle }: AskFriendsButtonProps) {
  return (
    <div className="flex w-full gap-2 mt-2">
      <button className="flex-1 bg-[#FF8C00] text-[#1A1A1A] font-jetbrains font-bold rounded-xl h-12 flex items-center justify-center text-lg shadow-md hover:cursor-pointer">
        <Image
          src="/x-logo.svg"
          alt="X logo"
          width={28}
          height={28}
          className="mr-2"
        />
        <span className="font-jetbrains">Ask Your Friends</span>
      </button>
      <button
        className="bg-[#00FFC2] rounded-xl flex items-center justify-center w-12 h-12 shadow-md hover:cursor-pointer"
        onClick={onShuffle}
        type="button"
      >
        <Image src="/shuffle.svg" alt="Shuffle" width={28} height={28} />
      </button>
    </div>
  );
}
