import { seeded, shuffle } from "./lib";
import type { ConnectionGroup } from "./data";

/** Assemble four non-overlapping category groups into a fresh Connections board. */
export function generateConnectionsBoard(
  puzzles: readonly (readonly ConnectionGroup[])[],
  seed: number
): ConnectionGroup[] {
  const unique = new Map<string, ConnectionGroup>();
  for (const group of puzzles.flat()) {
    const key = group.category + "|" + [...group.words].sort().join("|");
    if (!unique.has(key)) unique.set(key, group);
  }
  const groups = [...unique.values()];
  for (let attempt = 0; attempt < 80; attempt++) {
    const candidates = shuffle(groups, seeded((seed + attempt * 104729) >>> 0));
    const selected: ConnectionGroup[] = [];
    const categories = new Set<string>();
    const words = new Set<string>();
    for (const group of candidates) {
      const normalized = group.words.map((word) => word.trim().toLowerCase());
      if (categories.has(group.category) || normalized.some((word) => words.has(word))) continue;
      selected.push(group);
      categories.add(group.category);
      normalized.forEach((word) => words.add(word));
      if (selected.length === 4) return selected;
    }
  }
  throw new Error("Could not assemble four distinct Connections categories.");
}

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

export interface GeneratedWordLadder {
  start: string;
  end: string;
  path: string[];
  note: string;
}

/** Build a fresh ladder by searching the one-letter-neighbor graph of the supplied dictionary. */
export function generateWordLadder(seed: number, dictionary: readonly string[]): GeneratedWordLadder | null {
  const words = [...new Set(dictionary.map((word) => word.toUpperCase()))].filter((word) => /^[A-Z]{4,6}$/.test(word));
  const buckets = new Map<string, string[]>();
  for (const word of words) {
    for (let index = 0; index < word.length; index++) {
      const pattern = word.slice(0, index) + "_" + word.slice(index + 1);
      const group = buckets.get(pattern) ?? [];
      group.push(word);
      buckets.set(pattern, group);
    }
  }
  const neighbors = new Map<string, Set<string>>();
  for (const group of buckets.values()) {
    for (const word of group) {
      const set = neighbors.get(word) ?? new Set<string>();
      for (const other of group) if (other !== word) set.add(other);
      neighbors.set(word, set);
    }
  }

  const random = seeded((seed + 0x1f123bb5) >>> 0);
  const starts = shuffle(words, random);
  const candidates: string[][] = [];
  for (const start of starts) {
    const previous = new Map<string, string | null>([[start, null]]);
    const distance = new Map<string, number>([[start, 0]]);
    const queue = [start];
    for (let cursor = 0; cursor < queue.length; cursor++) {
      const current = queue[cursor];
      const depth = distance.get(current) ?? 0;
      if (depth >= 3 && depth <= 5) {
        const path: string[] = [];
        let at: string | null = current;
        while (at !== null) {
          path.push(at);
          at = previous.get(at) ?? null;
        }
        candidates.push(path.reverse());
      }
      if (depth >= 5 || candidates.length >= 160) continue;
      for (const next of neighbors.get(current) ?? []) {
        if (previous.has(next)) continue;
        previous.set(next, current);
        distance.set(next, depth + 1);
        queue.push(next);
      }
    }
    if (candidates.length >= 40) break;
  }
  if (!candidates.length) return null;
  const path = shuffle(candidates, random)[0];
  return { start: path[0], end: path[path.length - 1], path, note: "Generated from the medical word bank." };
}

/** Apply one of the eight rotations/reflections of a square nonogram pattern. */
export function transformNonogram(pattern: readonly (readonly number[])[], seed: number): number[][] {
  let result = pattern.map((row) => [...row]);
  const turns = Math.abs(seed) % 4;
  const flip = Math.floor(Math.abs(seed) / 4) % 2 === 1;
  for (let turn = 0; turn < turns; turn++) {
    result = result[0].map((_, column) => result.map((row) => row[column]).reverse());
  }
  if (flip) result = result.map((row) => [...row].reverse());
  return result;
}

/** Score a correct Association Blitz pair; combo is the streak before this match. */
export function associationPairPoints(combo: number): number {
  return 100 + Math.min(Math.max(0, Math.floor(combo)) * 10, 50);
}

/** Association Blitz time bonus, capped at the 75-second round maximum. */
export function associationTimeBonus(secondsRemaining: number): number {
  return Math.max(0, Math.min(75, Math.floor(secondsRemaining))) * 2;
}
