import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function generateRandomLetters(
  answer: string,
  count: number = 12
): string[] {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const answerLetters = answer.toUpperCase().split("");
  const extraLettersNeeded = Math.max(0, count - answerLetters.length);

  const extraLetters: string[] = [];
  for (let i = 0; i < extraLettersNeeded; i++) {
    const randomLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
    if (
      !answerLetters.includes(randomLetter) &&
      !extraLetters.includes(randomLetter)
    ) {
      extraLetters.push(randomLetter);
    }
  }

  const allLetters = [...answerLetters, ...extraLetters];
  return shuffleArray(allLetters);
}

// Helper for CLU3 game: unique answer letters + random extras, shuffled, up to 10
export function generateKeyboard(answer: string, total: number = 10): string[] {
  const answerLetters = Array.from(new Set(answer.toUpperCase().split("")));
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const remaining = alphabet.filter((l) => !answerLetters.includes(l));
  const extraCount = Math.max(0, total - answerLetters.length);
  const extra = shuffleArray(remaining).slice(0, extraCount);
  return shuffleArray([...answerLetters, ...extra]);
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export { shuffleArray as shuffle };

export function calculateScore(
  timeUsed: number,
  hintsUsed: number,
  baseScore: number = 1000
): number {
  const timeBonus = Math.max(0, 300 - timeUsed); // 5 minutes max time
  const hintPenalty = hintsUsed * 100;
  return Math.max(100, baseScore + timeBonus - hintPenalty);
}

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}
