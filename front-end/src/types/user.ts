import { GameResult } from "@/types/game";

export interface UserProfile {
  username: string;
  age: number;
  country: string;
  avatar?: string;
  walletAddress?: string;
}

export interface UserStats {
  totalGames: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
}

export interface UserState {
  profile: UserProfile | null;
  stats: UserStats;
  balance: number;
  gameHistory: GameResult[];
  isLoggedIn: boolean;
}
