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

import { normalize } from "./lib";

/** Levenshtein distance with an early exit once the distance must exceed `limit`. */
export function editDistance(a: string, b: string, limit = 3): number {
  if (Math.abs(a.length - b.length) > limit) return limit + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    let best = i;
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      best = Math.min(best, row[j]);
    }
    if (best > limit) return limit + 1;
    prev = row;
  }
  return prev[b.length];
}

export interface AnswerLike { answer: string; aliases?: string[] }
export interface AnswerMatch<T extends AnswerLike> { match: T; fuzzy: boolean }

/**
 * Match free text against a curated answer list. Exact (normalized) matches win; otherwise a
 * single-typo (≤1 edit for 5–9 letters, ≤2 for longer) match is accepted only when exactly one
 * answer is that close, so a typo can never be resolved to the wrong answer.
 */
export function matchAnswer<T extends AnswerLike>(input: string, answers: readonly T[]): AnswerMatch<T> | null {
  const squash = (text: string) => normalize(text).replace(/ /g, "");
  const value = squash(input);
  if (!value) return null;
  const forms = (item: T) => [item.answer, ...(item.aliases ?? [])].map(squash);
  const exact = answers.find((item) => forms(item).includes(value));
  if (exact) return { match: exact, fuzzy: false };
  if (value.length < 5) return null;
  const allowed = value.length >= 10 ? 2 : 1;
  const close = answers.filter((item) => forms(item).some((form) => form.length >= 5 && editDistance(value, form, allowed) <= allowed));
  return close.length === 1 ? { match: close[0], fuzzy: true } : null;
}

export interface RumbleTurnState { turn: number; playerCount: number; correct: boolean }
/** Trivia Crack rule: a correct answer keeps the turn; a miss passes it to the next player. */
export function rumbleNextTurn({ turn, playerCount, correct }: RumbleTurnState): number {
  return correct || playerCount <= 1 ? turn : (turn + 1) % playerCount;
}
