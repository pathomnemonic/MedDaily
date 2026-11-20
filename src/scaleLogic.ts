import { hashSeed, seeded, shuffle } from "./lib";
import { SCALE_CATEGORIES, scaleItems, type ScaleCategory, type ScaleItem } from "./dataScale";

/** Within 25% counts as a bullseye because anatomy varies; 20× off scores nothing. */
export const SCALE_PLATEAU = Math.log10(1.25);
export const SCALE_ZERO = Math.log10(20);

/** Points (0–100) for a guess against the true value, scored on the log scale. */
export function scaleScore(guess: number, actual: number): number {
  if (!(guess > 0) || !(actual > 0) || !Number.isFinite(guess) || !Number.isFinite(actual)) return 0;
  const d = Math.abs(Math.log10(guess / actual));
  if (d <= SCALE_PLATEAU) return 100;
  if (d >= SCALE_ZERO) return 0;
  return Math.round(100 * Math.pow(1 - (d - SCALE_PLATEAU) / (SCALE_ZERO - SCALE_PLATEAU), 1.2));
}

/** How far off the guess was, as a multiple (always ≥ 1). */
export const scaleFactor = (guess: number, actual: number): number => (guess > 0 && actual > 0 ? Math.max(guess / actual, actual / guess) : Infinity);

const sig = (n: number): string => {
  if (n >= 100) return String(Math.round(n));
  if (n >= 10) return String(Math.round(n * 10) / 10);
  return String(Math.round(n * 100) / 100);
};

/** Human-readable value in the most natural unit of the category (for example 0.003 g becomes "3 mg"). */
export function formatScale(cat: ScaleCategory, value: number): string {
  if (!(value > 0)) return "–";
  const { units } = SCALE_CATEGORIES[cat];
  if (cat === "count") {
    if (value < 1000) return sig(value);
    const steps: [number, string][] = [[1e12, "trillion"], [1e9, "billion"], [1e6, "million"], [1e3, "thousand"]];
    const [f, label] = steps.find(([factor]) => value >= factor) ?? steps[steps.length - 1];
    return sig(value / f) + " " + label;
  }
  // Largest unit that keeps the number at 1 or more (time falls back to seconds below one minute, and so on).
  const unit = [...units].reverse().find((u) => value / u.factor >= 1) ?? units[0];
  return sig(value / unit.factor) + " " + unit.label;
}

/** Short tick label for the ruler, such as "1 mg" or "10 kg" (counts use K, M, B, T). */
export function tickLabel(cat: ScaleCategory, value: number): string {
  if (cat !== "count") return formatScale(cat, value);
  if (value < 1e3) return String(value);
  const [f, l] = value >= 1e12 ? [1e12, "T"] : value >= 1e9 ? [1e9, "B"] : value >= 1e6 ? [1e6, "M"] : [1e3, "K"];
  return value / f + l;
}

export interface ScaleRound { cat: ScaleCategory; items: [ScaleItem, ScaleItem] }
export const SCALE_ROUNDS = 4;

/** Four rounds: weight, size, time and a wildcard (volume or count). Each round has two items at least 3× apart. */
export function pickScaleRounds(seed: number): ScaleRound[] {
  const rnd = seeded(hashSeed("scale|" + seed));
  rnd(); rnd();
  const cats: ScaleCategory[] = ["mass", "length", "time", rnd() < 0.5 ? "volume" : "count"];
  return cats.map((cat) => {
    const pool = shuffle(scaleItems.filter((x) => x.cat === cat), rnd);
    const first = pool[0];
    const second = pool.slice(1).find((x) => Math.abs(Math.log10(x.value / first.value)) >= 0.5) ?? pool[1];
    return { cat, items: [first, second] as [ScaleItem, ScaleItem] };
  });
}
