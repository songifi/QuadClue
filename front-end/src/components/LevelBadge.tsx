interface LevelBadgeProps {
  level: number;
}

export default function LevelBadge({ level }: LevelBadgeProps) {
  return (
    <div className="relative flex items-center justify-center w-[80px] h-[56px]">
      <svg
        viewBox="0 0 80 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0 w-full h-full"
      >
        <path
          d="M21,44 Q12,42 14,32 Q5,26 15,21 Q12,12 24,14 Q26,5 38,10 Q42,2 52,10 Q66,5 62,18 Q75,20 70,32 Q80,40 68,44 Q62,54 52,48 Q42,56 36,48 Q24,54 21,44 Z"
          fill="#DFFFFC"
          stroke="#FFB43A"
          strokeWidth="3"
        />
      </svg>
      <div className="flex flex-col items-center justify-center absolute inset-0">
        <span className="text-[11px] font-bold text-[#1A1A1A] leading-none">
          LEVEL
        </span>
        <span className="text-[20px] font-bold text-[#1A1A1A] leading-none">
          {level}
        </span>
      </div>
    </div>
  );
}
