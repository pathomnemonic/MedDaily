import { hashSeed, seeded, shuffle } from "./lib";

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
import { MED_SYNONYMS, ROMAN } from "./medSynonyms";

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
const GENERIC_WORDS = new Set("syndrome disease disorder infection deficiency poisoning toxicity cancer carcinoma sign test acute chronic primary secondary of the a an and in with to for on by type".split(" "));
/** Spelling and sound-alike variants collapse to one form (anaemia/anemia, sulphate/sulfate, cough/kof…), and doubled letters are forgiven. */
const canon = (text: string) => text.replace(/ /g, "").replace(/ae/g, "e").replace(/oe/g, "e").replace(/ph/g, "f").replace(/ou(?=r|s)/g, "o").replace(/ck/g, "k").replace(/c(?![he])/g, "k").replace(/y/g, "i").replace(/z/g, "s").replace(/([a-z0-9])\1+/g, "$1");
/** Roman numerals standing alone become digits: "type II diabetes" = "type 2 diabetes". */
const arabic = (text: string) => text.split(" ").map((w, i, all) => (ROMAN[w] && (i > 0 || all.length > 1) && (w.length > 1 || /^(type|grade|stage|class|group|factor|vitamin|phase)$/.test(all[i - 1] ?? "")) ? ROMAN[w] : w)).join(" ");

const synonymIndex = (() => {
  const index = new Map<string, string[][]>();
  for (const group of MED_SYNONYMS) for (const term of group) {
    const key = canon(arabic(normalize(term)));
    if (key) index.set(key, [...(index.get(key) ?? []), group]);
  }
  return index;
})();

/** The accepted spellings of a text: full forms (with synonyms) and, separately, the form without a generic tail like "syndrome". */
interface Forms { own: string[]; full: string[]; stripped: string[] }
const normalizedForms = (text: string): { full: string; bare: string; stripped: string } => {
  const bare = arabic(normalize(text.replace(/\([^)]*\)/g, " "))).replace(/^(the|a|an) /, "");
  const full = arabic(normalize(text)).replace(/^(the|a|an) /, "");
  const stripped = bare.replace(GENERIC_TAIL, "");
  return { full: canon(full), bare: canon(bare), stripped: stripped.length >= 5 && stripped !== bare ? canon(stripped) : "" };
};
const formsCache = new Map<string, Forms>();
const formsOfText = (text: string): Forms => {
  const hit = formsCache.get(text); if (hit) return hit;
  const n = normalizedForms(text);
  const own = [...new Set([n.full, n.bare])].filter(Boolean);
  const extra = own.flatMap((form) => (synonymIndex.get(form) ?? []).flatMap((group) => group.flatMap((term) => { const t = normalizedForms(term); return [t.full, t.bare]; })));
  const result = { own, full: [...new Set([...own, ...extra])].filter(Boolean), stripped: n.stripped ? [n.stripped] : [] };
  if (formsCache.size > 5000) formsCache.clear();
  formsCache.set(text, result);
  return result;
};
const spellings = (text: string): string[] => { const f = formsOfText(text); return [...new Set([...f.full, ...f.stripped])]; };

const SMALL = new Set("a an the of and in with to for on by or".split(" "));
/** The meaningful words of a text, in canonical spelling, ignoring joining words. */
const coreWords = (text: string): string[] => {
  const words = arabic(normalize(text.replace(/\([^)]*\)/g, " "))).split(" ").filter((w) => w && !SMALL.has(w));
  const strong = words.filter((w) => !GENERIC_WORDS.has(w));
  return (strong.length ? strong : words).map(canon).filter(Boolean);
};
const tolerance = (len: number) => (len >= 15 ? 4 : len >= 11 ? 3 : len >= 7 ? 2 : len >= 5 ? 1 : 0);
/** Whether two canonical words are the same word allowing typos; `prefix` also lets a long typed word be the start of the target. */
function wordDistance(typed: string, target: string, prefix: boolean): number {
  if (typed === target) return 0;
  const allowed = Math.min(tolerance(typed.length), tolerance(target.length));
  if (prefix && typed.length >= 6 && target.length > typed.length && target.startsWith(typed)) return 1;
  if (typed.length >= 4 && allowed > 0) { const d = typoDistance(typed, target, allowed); if (d <= allowed) return d; }
  return Infinity;
}

/**
 * Match free text against a curated answer list, as generously as is safe. Order of preference:
 *  1. exact match after normalising spelling variants, sound-alikes, roman numerals, spacing, hyphens and doubled letters,
 *     with abbreviations, lay terms and alternate names treated as the same answer (MI = heart attack = myocardial infarction);
 *  2. a typo-tolerant match (swapped letters count as one edit; the allowance grows with word length);
 *  3. the player's text containing a listed answer ("I think it's hyperkalemia");
 *  4. word-by-word matching: the right words in any order ("infarction myocardial"), with typos, or the one
 *     distinctive word on its own ("tamponade", "mono", a long-enough start of a word).
 * A fuzzy match is only accepted when one answer is strictly closest, so a typo can never be resolved to
 * a sibling answer (hypokalemia vs hyperkalemia).
 */
export function matchAnswer<T extends AnswerLike>(input: string, answers: readonly T[], rivals: readonly string[] = []): AnswerMatch<T> | null {
  const typedForms = formsOfText(input);
  const typed = spellings(input);
  if (!typed.length || !typed[0]) return null;
  const itemForms = (item: T): Forms[] => [item.answer, ...(item.aliases ?? [])].map(formsOfText);
  const formsOf = (item: T) => itemForms(item).flatMap((f) => [...f.full, ...f.stripped]);
  // 0. the player typed one of this item's own names exactly: that item wins over any synonym of a sibling
  const own = answers.find((item) => itemForms(item).some((f) => f.own.some((form) => typedForms.own.includes(form))));
  if (own) return { match: own, fuzzy: false };
  // 1. an exact match including abbreviations and alternate names
  const full = answers.find((item) => itemForms(item).some((f) => f.full.some((form) => typedForms.full.includes(form))));
  if (full) return { match: full, fuzzy: false };
  // 2. the same name once a generic tail ("syndrome", "cancer") is ignored; only if one item claims it
  const tailed = answers.filter((item) => itemForms(item).some((f) => f.stripped.some((form) => typedForms.full.includes(form) || typedForms.stripped.includes(form)) || f.full.some((form) => typedForms.stripped.includes(form))));
  if (tailed.length === 1) return { match: tailed[0], fuzzy: false };
  // a different known diagnosis must never be accepted by a near-miss (graves vs gravis)
  if (rivals.some((r) => formsOfText(r).full.some((form) => typedForms.full.includes(form)))) return null;
  const value = typed[typed.length - 1];
  let best = Infinity, winners: T[] = [];
  if (value.length >= 4) {
    for (const item of answers) {
      let distance = Infinity;
      for (const form of formsOf(item)) {
        if (form.length < 4) continue;
        const allowed = Math.min(tolerance(form.length), tolerance(value.length));
        for (const t of typed) { const d = typoDistance(t, form, allowed); if (d <= allowed) distance = Math.min(distance, d); }
      }
      if (distance < best) { best = distance; winners = [item]; } else if (distance === best && distance < Infinity) winners.push(item);
    }
    if (winners.length === 1) return { match: winners[0], fuzzy: true };
    if (winners.length > 1) return null;
    const inside = answers.map((item) => ({ item, longest: Math.max(0, ...formsOf(item).filter((f) => f.length >= 6 && value.includes(f)).map((f) => f.length)) })).filter((x) => x.longest > 0).sort((x, y) => y.longest - x.longest);
    if (inside.length && (inside.length === 1 || inside[0].longest > inside[1].longest)) return { match: inside[0].item, fuzzy: true };
  }
  // Word-by-word: every distinctive word of the answer is present (any order), then every typed word belongs to the answer.
  const synonymTexts = (synonymIndex.get(typedForms.own[0] ?? "") ?? []).flat();
  const typedSets = [input, ...synonymTexts].map((t) => [...new Set(coreWords(t))]).filter((w) => w.length);
  if (!typedSets.length) return null;
  const score = (item: T, mode: "covers" | "inside"): number => {
    let top = Infinity;
    for (const text of [item.answer, ...(item.aliases ?? [])]) {
      const words = coreWords(text);
      if (!words.length) continue;
      for (const typedWords of typedSets) {
        const [needles, hay] = mode === "covers" ? [words, typedWords] : [typedWords, words];
        if (mode === "inside" && !needles.some((w) => w.length >= 6)) continue;
        let total = 0;
        for (const w of needles) {
          let d = Infinity;
          for (const h of hay) d = Math.min(d, wordDistance(mode === "covers" ? h : w, mode === "covers" ? w : h, mode === "inside"));
          total += d;
        }
        if (total < top) top = total;
      }
    }
    return top;
  };
  for (const mode of ["covers", "inside"] as const) {
    let low = Infinity, picks: T[] = [];
    for (const item of answers) {
      const d = score(item, mode);
      if (d === Infinity) continue;
      if (d < low) { low = d; picks = [item]; } else if (d === low) picks.push(item);
    }
    if (picks.length === 1) return { match: picks[0], fuzzy: true };
    if (picks.length > 1) return null;
  }
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

/** Apply one of the eight rotations/reflections of a nonogram pattern; quarter-turns swap rectangular dimensions. */
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
let medicalLadderCache: { key: string; paths: string[][] } | null = null;

/**
 * A ladder whose two ends are medical words: BFS over the one-letter-neighbour graph from a medical start
 * to another medical word 3–5 steps away. All valid endpoint paths are cached so daily seeds can rotate
 * through hundreds of distinct ladders instead of repeatedly selecting the first dozen.
 */
export function generateMedicalLadder(seed: number, dictionary: readonly string[], medical: readonly string[]): GeneratedWordLadder | null {
  const words = new Set(dictionary.map((w) => w.toUpperCase()).filter((w) => /^[A-Z]{4}$/.test(w)));
  const ends = [...new Set(medical.map((w) => w.toUpperCase()))].filter((w) => words.has(w)).sort();
  const key = words.size + "|" + ends.join("|");
  if (!medicalLadderCache || medicalLadderCache.key !== key) {
    const endSet = new Set(ends);
    const neighbours = (word: string): string[] => {
      const out: string[] = [];
      for (let i = 0; i < word.length; i++) for (let c = 65; c < 91; c++) {
        const next = word.slice(0, i) + String.fromCharCode(c) + word.slice(i + 1);
        if (next !== word && words.has(next)) out.push(next);
      }
      return out;
    };
    const paths: string[][] = [];
    const seen = new Set<string>();
    for (const start of ends) {
      const previous = new Map<string, string | null>([[start, null]]);
      const depth = new Map<string, number>([[start, 0]]);
      const queue = [start];
      for (let i = 0; i < queue.length; i++) {
        const word = queue[i], d = depth.get(word) ?? 0;
        if (d >= 3 && d <= 5 && endSet.has(word)) {
          const path: string[] = [];
          for (let at: string | null = word; at !== null; at = previous.get(at) ?? null) path.push(at);
          const ordered = path.reverse();
          const signature = ordered.join(">");
          if (!seen.has(signature)) { seen.add(signature); paths.push(ordered); }
        }
        if (d >= 5) continue;
        for (const next of neighbours(word)) if (!previous.has(next)) {
          previous.set(next, word); depth.set(next, d + 1); queue.push(next);
        }
      }
    }
    medicalLadderCache = { key, paths };
  }
  const paths = medicalLadderCache.paths;
  if (!paths.length) return null;
  const path = paths[Math.abs(Math.trunc(seed)) % paths.length];
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
/**
 * A slider range that contains the true value but gives no clue to it. The width depends only on the scoring
 * tolerance (about 12–26 tolerances wide), and the answer sits at a random 15–85% of the way along, so neither the
 * midpoint nor the distance from either end points at the answer. Non-negative answers keep a non-negative range.
 */
export function labRange(value: number, seed: number, tolerance = 0): { min: number; max: number } {
  // Nearby seeds (round offsets) must not give nearby layouts, so the seed is hashed before use.
  const r = seeded(hashSeed("labrange|" + seed + "|" + value));
  r(); r();
  const base = tolerance > 0 ? tolerance : Math.max(Math.abs(value) * 0.1, 0.5);
  const span = base * (12 + r() * 14);
  const at = 0.15 + r() * 0.7;
  let min = value - span * at;
  let max = min + span;
  if (value >= 0 && min < 0) { max -= min; min = 0; }
  return { min, max };
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
