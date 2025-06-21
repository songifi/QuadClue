import React from "react";
import { Settings, Trophy, BarChart4, Coins } from "lucide-react";
import { useRouter } from "next/navigation";

const navItems = [
  { label: "STATS", icon: BarChart4, route: "/stats", strokeWidth: 1.5 },
  { label: "SCORES", icon: Trophy, route: "/scores", strokeWidth: 1.5 },
  { label: "BOUNTY", icon: Coins, route: "/bounty", strokeWidth: 1.5 },
  { label: "SETTINGS", icon: Settings, route: "/profile", strokeWidth: 1.5 },
];

interface NavigationBarProps {
  onButtonHover?: () => void;
  onButtonClick?: () => void;
  activeRoute?: string;
}

const NavigationBar = ({
  onButtonHover,
  onButtonClick,
  activeRoute,
}: NavigationBarProps) => {
  const router = useRouter();
  const currentRoute =
    activeRoute ||
    (typeof window !== "undefined" ? window.location.pathname : undefined);
  return (
    <div className="w-full px-0 py-0 safe-area-pb">
      <div className="flex w-full gap-2 justify-between">
        {navItems.map(({ label, icon: Icon, route, strokeWidth }) => {
          const isActive = currentRoute === route;
          return (
            <div key={label} className="flex flex-col items-center flex-1">
              <button
                onClick={() => {
                  if (onButtonClick) onButtonClick();
                  router.push(route);
                }}
                onMouseEnter={onButtonHover}
                className={`w-14 h-14 rounded-lg flex items-center justify-center shadow-[0_4px_16px_0_rgba(0,0,0,0.10)] border border-[#E3EDEE] transition-all duration-200 mb-1 cursor-pointer ${
                  isActive
                    ? "bg-[#F3FBFC] text-primary-orange border-primary-orange"
                    : "bg-[#F3FBFC] text-[#1A1A1A] hover:bg-primary-orange/10"
                }`}
                aria-label={label}
              >
                <Icon
                  size={26}
                  className={
                    isActive ? "text-primary-orange" : "text-[#1A1A1A]"
                  }
                  strokeWidth={strokeWidth}
                />
              </button>
              <span
                className={`text-sm font-bold tracking-wide font-jetbrains mt-1 ${
                  isActive ? "text-primary-orange" : "text-[#1A1A1A]"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default NavigationBar;
