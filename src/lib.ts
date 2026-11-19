export type GameId = "medle" | "connections" | "diagnosis" | "nextstep" | "microbe" | "labline" | "pairs" | "triage";

export const localDateKey = (date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return y + "-" + m + "-" + d;
};

export function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function shuffle<T>(items: readonly T[], random: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export const normalize = (value: string): string =>
  value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();

export type LetterMark = "correct" | "present" | "absent";

export function scoreWord(guess: string, answer: string): LetterMark[] {
  const g = guess.toUpperCase().split("");
  const a = answer.toUpperCase().split("");
  const marks: LetterMark[] = Array(g.length).fill("absent");
  const remaining: Record<string, number> = {};
  for (let i = 0; i < a.length; i++) {
    if (g[i] === a[i]) marks[i] = "correct";
    else remaining[a[i]] = (remaining[a[i]] ?? 0) + 1;
  }
  for (let i = 0; i < g.length; i++) {
    if (marks[i] === "correct") continue;
    if ((remaining[g[i]] ?? 0) > 0) {
      marks[i] = "present";
      remaining[g[i]]--;
    }
  }
  return marks;
}

export interface WordSearchBoard {
  grid: string[][];
  placed: string[];
}

const WORD_DIRECTIONS: [number, number][] = [
  [0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]
];

export function makeWordSearch(words: readonly string[], size: number, seed: number): WordSearchBoard {
  const random = seeded(seed);
  const grid = Array.from({ length: size }, () => Array<string>(size).fill(""));
  const placed: string[] = [];
  const clean = [...new Set(words.map(normalize).map((w) => w.replace(/ /g, "").toUpperCase()))]
    .filter((w) => w.length >= 3 && w.length <= size)
    .sort((a, b) => b.length - a.length);

  for (const word of clean) {
    let done = false;
    for (let attempt = 0; attempt < 500 && !done; attempt++) {
      const [dr, dc] = WORD_DIRECTIONS[Math.floor(random() * WORD_DIRECTIONS.length)];
      const r = Math.floor(random() * size);
      const c = Math.floor(random() * size);
      const er = r + dr * (word.length - 1);
      const ec = c + dc * (word.length - 1);
      if (er < 0 || ec < 0 || er >= size || ec >= size) continue;
      let fits = true;
      for (let k = 0; k < word.length; k++) {
        const existing = grid[r + dr * k][c + dc * k];
        if (existing && existing !== word[k]) fits = false;
      }
      if (!fits) continue;
      for (let k = 0; k < word.length; k++) grid[r + dr * k][c + dc * k] = word[k];
      placed.push(word);
      done = true;
    }
  }

  const alphabet = "AAAAAEEEEEEEEIIIIIIOOOOONNNNNRRRRRTTTTTLLLLSSSSUUUDDDGGBCMPFHVWY";
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!grid[r][c]) grid[r][c] = alphabet[Math.floor(random() * alphabet.length)];
    }
  }
  return { grid, placed };
}

export function lineCells(start: number, end: number, size: number): number[] {
  const sr = Math.floor(start / size), sc = start % size;
  const er = Math.floor(end / size), ec = end % size;
  const dr = er - sr, dc = ec - sc;
  const n = Math.max(Math.abs(dr), Math.abs(dc));
  if (n === 0) return [start];
  if (dr !== 0 && dc !== 0 && Math.abs(dr) !== Math.abs(dc)) return [];
  const stepR = Math.sign(dr), stepC = Math.sign(dc);
  return Array.from({ length: n + 1 }, (_, i) => (sr + stepR * i) * size + sc + stepC * i);
}