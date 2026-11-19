import { seeded, shuffle } from "./lib";

export interface StrandsBoard {
  grid: string[][];
  words: string[];
  paths: Record<string, number[]>;
  spangram: string;
  rows: number;
  columns: number;
}

const STEPS: [number, number][] = [
  [-1, -1], [-1, 0], [-1, 1], [0, -1],
  [0, 1], [1, -1], [1, 0], [1, 1]
];

function neighbors(index: number, rows: number, columns: number): number[] {
  const row = Math.floor(index / columns), column = index % columns;
  return STEPS.map(([dr, dc]) => [row + dr, column + dc] as const)
    .filter(([r, c]) => r >= 0 && r < rows && c >= 0 && c < columns)
    .map(([r, c]) => r * columns + c);
}

function findPath(
  word: string,
  occupied: Set<number>,
  rows: number,
  columns: number,
  random: () => number,
  spansBoard: boolean
): number[] | null {
  let budget = 18000;
  const starts = spansBoard
    ? shuffle(Array.from({ length: columns }, (_, column) => column), random)
    : shuffle(Array.from({ length: rows * columns }, (_, index) => index).filter((index) => !occupied.has(index)), random);

  const visit = (index: number, offset: number, path: number[], used: Set<number>): number[] | null => {
    if (--budget <= 0) return null;
    if (offset === word.length - 1) {
      return !spansBoard || Math.floor(index / columns) === rows - 1 ? path : null;
    }
    const row = Math.floor(index / columns);
    const remaining = word.length - offset - 1;
    if (spansBoard && row + remaining < rows - 1) return null;
    const options = shuffle(neighbors(index, rows, columns).filter((next) => !occupied.has(next) && !used.has(next)), random);
    for (const next of options) {
      const nextRow = Math.floor(next / columns);
      if (spansBoard && nextRow === rows - 1 && offset + 1 !== word.length - 1) continue;
      used.add(next);
      path.push(next);
      const result = visit(next, offset + 1, path, used);
      if (result) return result;
      path.pop();
      used.delete(next);
    }
    return null;
  };

  for (const start of starts) {
    if (occupied.has(start)) continue;
    const used = new Set([start]);
    const result = visit(start, 0, [start], used);
    if (result) return result;
    if (budget <= 0) break;
  }
  return null;
}

/**
 * Build a Strands-style board. Every target follows an eight-direction adjacent
 * path; the longest target is the spangram and connects the top and bottom edges.
 */
export function makeStrandsBoard(
  sourceWords: readonly string[],
  seed: number,
  rows = 8,
  columns = 10
): StrandsBoard {
  const words = [...new Set(sourceWords.map((word) => word.toUpperCase().replace(/[^A-Z]/g, "")))]
    .filter((word) => word.length >= 3 && word.length <= rows * columns);
  if (!words.length) throw new Error("A Strands board needs at least one valid word.");
  const spangram = [...words].sort((a, b) => b.length - a.length || a.localeCompare(b))[0];
  if (spangram.length < rows) throw new Error("The spangram must be long enough to touch both board edges.");

  for (let attempt = 0; attempt < 24; attempt++) {
    const random = seeded((seed + attempt * 7919) >>> 0);
    const occupied = new Set<number>();
    const paths: Record<string, number[]> = {};
    const ordered = [spangram, ...shuffle(words.filter((word) => word !== spangram), random).sort((a, b) => b.length - a.length)];
    let complete = true;
    for (let index = 0; index < ordered.length; index++) {
      const word = ordered[index];
      const path = findPath(word, occupied, rows, columns, random, index === 0);
      if (!path) { complete = false; break; }
      paths[word] = path;
      path.forEach((cell) => occupied.add(cell));
    }
    if (!complete) continue;
    const alphabet = "AAAAAEEEEEEEEIIIIIIOOOOONNNNNRRRRRTTTTTLLLLSSSSUUUDDDGGBCMPFHVWY";
    const grid = Array.from({ length: rows }, () => Array<string>(columns).fill(""));
    for (const [word, path] of Object.entries(paths)) {
      path.forEach((cell, index) => { grid[Math.floor(cell / columns)][cell % columns] = word[index]; });
    }
    for (let index = 0; index < rows * columns; index++) {
      const row = Math.floor(index / columns), column = index % columns;
      if (!grid[row][column]) grid[row][column] = alphabet[Math.floor(random() * alphabet.length)];
    }
    return { grid, words, paths, spangram, rows, columns };
  }
  throw new Error("Could not generate a complete Strands board for this word pack.");
}

export function extendStrandsPath(path: readonly number[], next: number, rows: number, columns: number): number[] {
  if (path.includes(next)) {
    return path[path.length - 2] === next ? path.slice(0, -1) : [...path];
  }
  if (path.length) {
    const last = path[path.length - 1];
    if (!neighbors(last, rows, columns).includes(next)) return [...path];
  }
  return [...path, next];
}

export function readStrandsPath(grid: readonly (readonly string[])[], path: readonly number[], columns: number): string {
  return path.map((cell) => grid[Math.floor(cell / columns)]?.[cell % columns] ?? "").join("");
}
