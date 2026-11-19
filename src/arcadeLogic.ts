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

/** Edit distance where swapping two neighbouring letters counts as one edit (the most common typing slip). */
function typoDistance(a: string, b: string, limit: number): number {
  if (Math.abs(a.length - b.length) > limit) return limit + 1;
  const rows: number[][] = [];
  for (let i = 0; i <= a.length; i++) {
    rows[i] = [i];
    for (let j = 1; j <= b.length; j++) {
      if (i === 0) { rows[i][j] = j; continue; }
      let d = Math.min(rows[i - 1][j] + 1, rows[i][j - 1] + 1, rows[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d = Math.min(d, rows[i - 2][j - 2] + 1);
      rows[i][j] = d;
    }
  }
  return rows[a.length][b.length];
}

const GENERIC_TAIL = / (syndrome|disease|disorder|infection|deficiency|poisoning|toxicity|cancer|carcinoma|sign|test)$/;
/** British/American and Greek-root spelling variants collapse to one form, and doubled letters are forgiven. */
const canon = (text: string) => text.replace(/ /g, "").replace(/ae/g, "e").replace(/oe/g, "e").replace(/ph/g, "f").replace(/ou(?=r|s)/g, "o").replace(/([a-z])\1+/g, "$1");
/** Each accepted spelling of a text: with and without a generic tail word like "syndrome", leading articles removed. */
const spellings = (text: string): string[] => {
  const bare = normalize(text.replace(/\([^)]*\)/g, " ")).replace(/^(the|a|an) /, "");
  const full = normalize(text).replace(/^(the|a|an) /, "");
  const stripped = bare.replace(GENERIC_TAIL, "");
  return [...new Set([full, bare, stripped.length >= 5 ? stripped : bare].map(canon))].filter(Boolean);
};

/**
 * Match free text against a curated answer list, generously. Order of preference:
 *  1. exact match after normalising spelling variants (anaemia/anemia), spacing, hyphens and doubled letters;
 *  2. a typo-tolerant match (swapped letters count as one edit; the allowance grows with word length);
 *  3. the player's text containing a listed answer ("I think it's hyperkalemia").
 * A fuzzy match is only accepted when one answer is strictly closest, so a typo can never be resolved to
 * a sibling answer (hypokalemia vs hyperkalemia).
 */
export function matchAnswer<T extends AnswerLike>(input: string, answers: readonly T[]): AnswerMatch<T> | null {
  const typed = spellings(input);
  if (!typed.length || !typed[0]) return null;
  const formsOf = (item: T) => [item.answer, ...(item.aliases ?? [])].flatMap(spellings);
  const exact = answers.find((item) => formsOf(item).some((form) => typed.includes(form)));
  if (exact) return { match: exact, fuzzy: false };
  const value = typed[typed.length - 1];
  if (value.length < 4) return null;
  let best = Infinity, winners: T[] = [];
  for (const item of answers) {
    let distance = Infinity;
    for (const form of formsOf(item)) {
      if (form.length < 4) continue;
      const allowed = Math.min(form.length >= 12 ? 3 : form.length >= 8 ? 2 : form.length >= 5 ? 1 : 0, value.length >= 12 ? 3 : value.length >= 8 ? 2 : value.length >= 5 ? 1 : 0);
      for (const t of typed) { const d = typoDistance(t, form, allowed); if (d <= allowed) distance = Math.min(distance, d); }
    }
    if (distance < best) { best = distance; winners = [item]; } else if (distance === best && distance < Infinity) winners.push(item);
  }
  if (winners.length === 1) return { match: winners[0], fuzzy: true };
  if (winners.length > 1) return null;
  const inside = answers.map((item) => ({ item, longest: Math.max(0, ...formsOf(item).filter((f) => f.length >= 6 && value.includes(f)).map((f) => f.length)) })).filter((x) => x.longest > 0).sort((x, y) => y.longest - x.longest);
  if (inside.length && (inside.length === 1 || inside[0].longest > inside[1].longest)) return { match: inside[0].item, fuzzy: true };
  return null;
}

export interface RumbleTurnState { turn: number; playerCount: number; correct: boolean }
/** Trivia Crack rule: a correct answer keeps the turn; a miss passes it to the next player. */
export function rumbleNextTurn({ turn, playerCount, correct }: RumbleTurnState): number {
  return correct || playerCount <= 1 ? turn : (turn + 1) % playerCount;
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


export const deepDivePointsByTier = [10, 15, 30, 60, 85, 100] as const;

/** Award editorial rarity points without allowing a prompt to exceed 100 points. */
export function deepDiveAnswerAward(tier: number, currentRoundScore: number): number {
  const base = Number.isInteger(tier) && tier >= 1 && tier <= 6 ? deepDivePointsByTier[tier - 1] : 0;
  return Math.max(0, Math.min(base, 100 - Math.max(0, currentRoundScore)));
}


/**
 * A ladder whose two ends are medical words: BFS over the one-letter-neighbour graph from a medical start
 * to another medical word 3–5 steps away. Intermediate words are ordinary dictionary words.
 */
export function generateMedicalLadder(seed: number, dictionary: readonly string[], medical: readonly string[]): GeneratedWordLadder | null {
  const words = new Set(dictionary.map((w) => w.toUpperCase()).filter((w) => /^[A-Z]{4}$/.test(w)));
  const ends = [...new Set(medical.map((w) => w.toUpperCase()))].filter((w) => words.has(w));
  const neighbours = (word: string): string[] => {
    const out: string[] = [];
    for (let i = 0; i < word.length; i++) for (let c = 65; c < 91; c++) {
      const next = word.slice(0, i) + String.fromCharCode(c) + word.slice(i + 1);
      if (next !== word && words.has(next)) out.push(next);
    }
    return out;
  };
  const random = seeded((seed + 0x2545f491) >>> 0);
  const found: string[][] = [];
  for (const start of shuffle(ends, random)) {
    const previous = new Map<string, string | null>([[start, null]]);
    const depth = new Map<string, number>([[start, 0]]);
    const queue = [start];
    for (let i = 0; i < queue.length; i++) {
      const word = queue[i], d = depth.get(word) ?? 0;
      if (d >= 3 && d <= 5 && ends.includes(word)) {
        const path: string[] = [];
        for (let at: string | null = word; at !== null; at = previous.get(at) ?? null) path.push(at);
        found.push(path.reverse());
      }
      if (d >= 5) continue;
      for (const next of neighbours(word)) if (!previous.has(next)) { previous.set(next, word); depth.set(next, d + 1); queue.push(next); }
    }
    if (found.length >= 12) break;
  }
  if (!found.length) return null;
  const path = shuffle(found, random)[0];
  return { start: path[0], end: path[path.length - 1], path, note: "Medical ladder: both ends are medical words." };
}

export function triviaRumbleResult(correctCounts: readonly number[], mode: "solo" | "pass", totalTurns: number): { score: number; maxScore: number; perfect: boolean } {
  const best = Math.max(0, ...correctCounts);
  const perPlayerTurns = mode === "solo" ? totalTurns : Math.ceil(totalTurns / 2);
  return { score: best * 100, maxScore: perPlayerTurns * 100, perfect: best === perPlayerTurns };
}

/**
 * Labline scoring (0–100). Prompts with a tolerance score by distance as before; threshold prompts (tolerance 0)
 * used to be all-or-nothing, so they now award partial credit within ~12% of the value and full marks only when exact.
 */
export function labScore(estimate: number, value: number, tolerance: number): number {
  const diff = Math.abs(estimate - value);
  if (diff < 1e-9) return 100;
  if (tolerance === 0) return Math.max(0, Math.round(100 * (1 - diff / Math.max(Math.abs(value) * 0.12, 1e-6))) );
  if (diff <= tolerance) return Math.max(85, Math.round(100 * (1 - 0.15 * diff / tolerance)));
  return Math.max(0, Math.round(100 * (1 - diff / Math.max(tolerance * 3, Math.abs(value) * 0.2))));
}
/** A slider range that contains the true value but does not put it at the midpoint. */
export function labRange(value: number, seed: number): { min: number; max: number } {
  const r = seeded((seed + 0x9e3779b1) >>> 0);
  const a = 0.3 + r() * 0.35, b = 1.5 + r() * 0.9;
  const base = Math.abs(value) < 1e-9 ? 1 : Math.abs(value);
  return { min: Math.max(0, value - base * (1 - a) * 1), max: value + base * (b - 1) };
}
/** Bonus for consecutive strong rounds: 0, 10, 20, 30, 30... (the first strong round starts the streak). */
export const labStreakBonus = (streakBefore: number): number => Math.min(30, streakBefore * 10);

/**
 * Body Map Blitz scoring for one tap. `distFrac` is the gap between the tap and the nearest edge of the target,
 * as a fraction of the diagram's width (0 when the tap is inside). Inside scores 6–10 by speed; near misses still
 * earn partial credit, so every tap is graded by how close it landed rather than hit-or-miss.
 */
export function bodyTapPoints(inside: boolean, distFrac: number, elapsedSeconds: number): number {
  if (inside) return elapsedSeconds <= 4 ? 10 : elapsedSeconds <= 8 ? 8 : 6;
  if (!(distFrac >= 0)) return 0;
  return distFrac <= 0.03 ? 5 : distFrac <= 0.06 ? 3 : distFrac <= 0.1 ? 1 : 0;
}
