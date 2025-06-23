import { GameResult } from "@/types/game";

// Player statistics returned by getPlayerStats Cairo system
export interface PlayerStats {
  score: number;           // lifetime score
  coins: number;           // lifetime coins
  puzzlesSolved: number;   // total solved
  totalAttempts: number;   // total guesses
  level: number;           // derived or stored on chain
  // add any other fields your contract returns
}

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
