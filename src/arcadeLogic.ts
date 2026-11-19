import { seeded, shuffle } from "./lib";

const DICE = [
  "AAEEGN","ABBJOO","ACHOPS","AFFKPS","AOOTTW","CIMOTU","DEILRX","DELRVY",
  "DISTTY","EEGHNW","EEINSU","EHRTVW","EIOSST","ELRTTY","HIMNQU","HLNNRZ"
];
export type LetterGrid = { grid: string[]; words: string[] };

/** Trace a word through adjacent cells in a 4×4 Boggle-style grid without reusing a cell. */
export function traceGridWord(grid: readonly string[], word: string): number[] | null {
  const target = word.toUpperCase();
  if (!/^[A-Z]{3,}$/.test(target) || grid.length !== 16 || target.length > 16) return null;
  const walk = (index: number, at: number, used: number[]): number[] | null => {
    if (grid[index] !== target[at] || used.includes(index)) return null;
    const nextUsed = [...used, index];
    if (at === target.length - 1) return nextUsed;
    const row = Math.floor(index / 4), col = index % 4;
    for (let r = Math.max(0, row - 1); r <= Math.min(3, row + 1); r++) {
      for (let c = Math.max(0, col - 1); c <= Math.min(3, col + 1); c++) {
        const next = r * 4 + c;
        if (next === index || nextUsed.includes(next)) continue;
        const found = walk(next, at + 1, nextUsed);
        if (found) return found;
      }
    }
    return null;
  };
  for (let i = 0; i < 16; i++) {
    const found = walk(i, 0, []);
    if (found) return found;
  }
  return null;
}

/** Choose a reproducible dice roll with a useful number of playable words. */
export function makeLetterGrid(seed: number, dictionary: readonly string[]): LetterGrid {
  const words = [...new Set(dictionary.map((w) => w.toUpperCase()))]
    .filter((w) => /^[A-Z]{3,8}$/.test(w));
  let best: LetterGrid = { grid: [], words: [] };
  for (let attempt = 0; attempt < 360; attempt++) {
    const random = seeded((seed + Math.imul(attempt + 1, 7919)) >>> 0);
    const dice = shuffle(DICE, random);
    const grid = dice.map((die) => die[Math.floor(random() * die.length)]);
    const found = words.filter((word) => traceGridWord(grid, word) !== null);
    if (found.length > best.words.length) best = { grid, words: found };
    if (found.length >= 9) return best;
  }
  return best;
}

export function letterWordPoints(word: string): number {
  if (word.length <= 3) return 1;
  if (word.length === 4) return 2;
  if (word.length === 5) return 4;
  if (word.length === 6) return 6;
  return 10;
}
