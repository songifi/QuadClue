export interface GameState {
  currentLevel: number;
  images: string[];
  correctAnswer: string;
  userAnswer: string[];
  selectedLetters: string[];
  availableLetters: string[];
  hints: number;
  score: number;
  timeRemaining: number;
  isCompleted: boolean;
  isPlaying: boolean;
}

export interface GameResult {
  level: number;
  score: number;
  timeUsed: number;
  hintsUsed: number;
  completedAt: Date;
}

export interface Puzzle {
  id: bigint;
  image_hashes: string[];
  answer_hash: string;
  word_length: number;
  available_letters: string[];
  active: boolean;
  difficulty: string;
  creation_time: bigint;
  solve_count: number;
  first_solver: string;
}

export interface PlayerStats {
  puzzles_solved: number;
  total_attempts: number;
  current_streak: number;
}

export interface PuzzleData {
  image_hashes: string[];
  answer: string;
}

export interface GameEvent {
  type:
    | "PuzzleCreated"
    | "PuzzleSolved"
    | "GuessSubmitted"
    | "PlayerStatsUpdated";
  data: unknown;
}
