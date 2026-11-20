import { hashSeed, seeded, shuffle } from "./lib";
import { matchAnswer } from "./arcadeLogic";
import { hoofPrompts, type HoofAnswer, type HoofPrompt } from "./dataHoofbeats";

export const HOOF_ROUNDS = 7;
export const HOOF_SECONDS = 25;

/** Ten points per percent: 45% scores 450 and a 0.1% zebra scores 1. */
export const hoofPoints = (pct: number): number => Math.round(pct * 10);

export const sortedAnswers = (prompt: HoofPrompt): HoofAnswer[] => [...prompt.answers].sort((a, b) => b.pct - a.pct || a.name.localeCompare(b.name));

/** The best possible score for a prompt is its most common answer. */
export const promptMax = (prompt: HoofPrompt): number => hoofPoints(sortedAnswers(prompt)[0].pct);

export function pickHoofPrompts(seed: number): HoofPrompt[] {
  const rnd = seeded(hashSeed("hoof|" + seed));
  rnd(); rnd();
  return shuffle(hoofPrompts, rnd).slice(0, HOOF_ROUNDS);
}

/** Today's total as a share of the best possible total, out of 100. */
export const hoofScore = (total: number, max: number): number => (max > 0 ? Math.min(100, Math.round((total / max) * 100)) : 0);

export interface HoofRank { label: string; icon: string }
/** Horses are common, zebras are rare. */
export function hoofRank(pct: number): HoofRank {
  if (pct >= 20) return { label: "A horse", icon: "🐴" };
  if (pct >= 5) return { label: "A pony", icon: "🐎" };
  if (pct >= 1) return { label: "A donkey", icon: "🫏" };
  return { label: "A zebra", icon: "🦓" };
}

/** Typo-tolerant match of free text to a prompt's valid answers. */
export function matchHoof(input: string, prompt: HoofPrompt): { answer: HoofAnswer; fuzzy: boolean } | null {
  const found = matchAnswer(input, prompt.answers.map((a) => ({ answer: a.name, aliases: a.aliases, ref: a })));
  return found ? { answer: found.match.ref, fuzzy: found.fuzzy } : null;
}
