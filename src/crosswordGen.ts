import { hashSeed, seeded, shuffle } from "./lib";
import { crosswordBank } from "./dataCrossword";

export interface PlacedWord { word: string; clue: string; row: number; col: number; across: boolean; number: number }
export interface Crossword { size: number; grid: string[][]; words: PlacedWord[] }

const SIZE = 11;
type Cell = string;
const empty = (): Cell[][] => Array.from({ length: SIZE }, () => Array<Cell>(SIZE).fill(""));

function canPlace(grid: Cell[][], word: string, row: number, col: number, across: boolean): boolean {
  const dr = across ? 0 : 1, dc = across ? 1 : 0;
  const endR = row + dr * (word.length - 1), endC = col + dc * (word.length - 1);
  if (row < 0 || col < 0 || endR >= SIZE || endC >= SIZE) return false;
  const before = [row - dr, col - dc], after = [endR + dr, endC + dc];
  for (const [r, c] of [before, after]) if (r >= 0 && c >= 0 && r < SIZE && c < SIZE && grid[r][c]) return false;
  let crossings = 0;
  for (let i = 0; i < word.length; i++) {
    const r = row + dr * i, c = col + dc * i, here = grid[r][c];
    if (here) { if (here !== word[i]) return false; crossings++; continue; }
    // A fresh letter must not sit beside another word's letters (that would create an accidental run).
    const sideA = across ? [r - 1, c] : [r, c - 1], sideB = across ? [r + 1, c] : [r, c + 1];
    for (const [sr, sc] of [sideA, sideB]) if (sr >= 0 && sc >= 0 && sr < SIZE && sc < SIZE && grid[sr][sc]) return false;
  }
  return crossings >= 1;
}

function build(seed: number, target: number): Crossword | null {
  const rand = seeded(seed);
  const pool = shuffle(crosswordBank, rand).filter(([w]) => w.length >= 4 && w.length <= 8);
  const grid = empty();
  const placed: Omit<PlacedWord, "number">[] = [];
  const first = pool.shift()!;
  const startCol = Math.max(0, Math.floor((SIZE - first[0].length) / 2));
  [...first[0]].forEach((ch, i) => { grid[Math.floor(SIZE / 2)][startCol + i] = ch; });
  placed.push({ word: first[0], clue: first[1], row: Math.floor(SIZE / 2), col: startCol, across: true });
  for (const [word, clue] of pool) {
    if (placed.length >= target) break;
    const options: [number, number, boolean][] = [];
    for (const other of placed) {
      for (let k = 0; k < other.word.length; k++) {
        for (let j = 0; j < word.length; j++) {
          if (word[j] !== other.word[k]) continue;
          const across = !other.across;
          const r = across ? other.row + (other.across ? 0 : k) : other.row + (other.across ? 0 : k) - j;
          const c = across ? other.col + (other.across ? k : 0) - j : other.col + (other.across ? k : 0);
          options.push([r, c, across]);
        }
      }
    }
    for (const [r, c, across] of shuffle(options, rand)) {
      if (!canPlace(grid, word, r, c, across)) continue;
      [...word].forEach((ch, i) => { grid[r + (across ? 0 : i)][c + (across ? i : 0)] = ch; });
      placed.push({ word, clue, row: r, col: c, across });
      break;
    }
  }
  if (placed.length < target) return null;
  // Number cells in reading order.
  const numbers = new Map<string, number>();
  let n = 0;
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) {
    if (placed.some((p) => p.row === r && p.col === c)) numbers.set(r + "," + c, ++n);
  }
  return { size: SIZE, grid, words: placed.map((p) => ({ ...p, number: numbers.get(p.row + "," + p.col)! })) };
}

/** Deterministic mini crossword: 6–7 crossing words from the bank, verified so every run of letters is a clued word. */
export function makeCrossword(seed: number): Crossword {
  for (let attempt = 0; attempt < 200; attempt++) {
    const result = build(hashSeed("xw|" + seed + "|" + attempt), 7);
    if (result && isValid(result)) return result;
  }
  for (let attempt = 0; attempt < 400; attempt++) {
    const result = build(hashSeed("xw6|" + seed + "|" + attempt), 6);
    if (result && isValid(result)) return result;
  }
  throw new Error("Could not generate a crossword");
}

/** Every horizontal/vertical run of 2+ letters must be exactly one placed word, and vice versa. */
export function isValid(cw: Crossword): boolean {
  const runs: string[] = [];
  const read = (get: (a: number, b: number) => string) => {
    for (let a = 0; a < cw.size; a++) {
      let run = "";
      for (let b = 0; b <= cw.size; b++) {
        const ch = b < cw.size ? get(a, b) : "";
        if (ch) run += ch; else { if (run.length >= 2) runs.push(run); run = ""; }
      }
    }
  };
  read((a, b) => cw.grid[a][b]);
  read((a, b) => cw.grid[b][a]);
  const words = cw.words.map((w) => w.word).sort();
  if (JSON.stringify([...runs].sort()) !== JSON.stringify(words)) return false;
  return cw.words.every((w) => [...w.word].every((ch, i) => cw.grid[w.row + (w.across ? 0 : i)][w.col + (w.across ? i : 0)] === ch));
}
