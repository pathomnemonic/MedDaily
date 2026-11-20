import { hashSeed } from "./lib";
import { blackoutCases, type BlackoutCase } from "./dataBlackout";

export type TokenKind = "word" | "num" | "punct" | "space";
export interface Token { text: string; kind: TokenKind }

/** Short everyday words are shown from the start, as in the original format. */
export const STOP_WORDS = new Set("a an the of in on at to for by with and or but nor as from into onto over under after before during than then that this these those it its is was were are be been being has have had he she his her him they them their we you i not no yes who whom whose which what when where while until so if per via also may can could would should will year years old day days week weeks month months hour hours minute minutes mg kg ml dl mmhg man woman boy girl patient".split(" "));

export function tokenize(text: string): Token[] {
  const out: Token[] = [];
  const re = /([A-Za-z][A-Za-z'-]*)|(\d[\d.,%/:-]*)|(\s+)|([^\sA-Za-z\d]+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) out.push(m[1] ? { text: m[1], kind: "word" } : m[2] ? { text: m[2], kind: "num" } : m[3] ? { text: m[3], kind: "space" } : { text: m[4], kind: "punct" });
  return out;
}

/** Light stemming so a guess of "cavities" also reveals "cavity", and "swelling" reveals "swollen"-style forms only when they share a stem. */
export function stem(word: string): string {
  let w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length > 4 && w.endsWith("ies")) w = w.slice(0, -3) + "y";
  else if (w.length > 4 && w.endsWith("es") && /(s|x|z|ch|sh)es$/.test(w)) w = w.slice(0, -2);
  else if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) w = w.slice(0, -1);
  if (w.length > 5 && w.endsWith("ing")) w = w.slice(0, -3);
  else if (w.length > 4 && w.endsWith("ed")) w = w.slice(0, -2);
  return w;
}

export const isStop = (word: string): boolean => STOP_WORDS.has(word.toLowerCase());

/** Words that make up the diagnosis title (split on spaces and hyphens), each of which must be revealed to win by words. */
export const titleWords = (title: string): string[] => title.split(/[\s-]+/).filter(Boolean);

export const pickBlackoutCase = (seed: number): BlackoutCase => blackoutCases[hashSeed("blackout|" + seed) % blackoutCases.length];

/** 100 points up to eight guesses, then 3 fewer per extra guess, minus 8 per hint, never below 15 for a win. */
export function blackoutScore(guesses: number, hints: number): number {
  return Math.max(15, 100 - Math.max(0, guesses - 8) * 3 - hints * 8);
}
