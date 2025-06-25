export const GAME_CONFIG = {
  MAX_HINTS: 3,
  TIME_LIMIT: 300, // 5 minutes
  BASE_SCORE: 1000,
  LETTERS_COUNT: 12,
  IMAGES_PER_PUZZLE: 4,
} as const;

export const COLORS = {
  PRIMARY_ORANGE: "#FF8C00",
  PRIMARY_GREEN: "#00FF88",
  SUCCESS_GREEN: "#4CAF50",
  DARK_100: "#1a1a1a",
  DARK_200: "#2a2a2a",
} as const;

export const ROUTES = {
  HOME: "/",
  HOW_TO_PLAY: "/how-to-play",
  GAME: "/game",
  PROFILE: "/profile",
  SIGNUP: "/signup",
  DASHBOARD: "/dashboard",
} as const;
