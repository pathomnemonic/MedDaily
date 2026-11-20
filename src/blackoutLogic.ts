import { hashSeed } from "./lib";
import { blackoutCases, type BlackoutCase } from "./dataBlackout";

export type TokenKind = "word" | "num" | "punct" | "space";
export interface Token { text: string; kind: TokenKind }

/** Short everyday words are shown from the start, as in the original format. */
export const STOP_WORDS = new Set("a an the of in on at to for by with and or but nor as from into onto over under after before during than then that this these those it its is was were are be been being has have had he she his her him they them their we you i not no yes who whom whose which what when where while until so if per via also may can could would should will year years old day days week weeks month months hour hours minute minutes mg kg ml dl mmhg man woman boy girl patient".split(" "));

/** Everyday narrative and generic clinical words, also shown from the start so the chart reads as a sentence instead of a wall of bars. Never overlaps a diagnosis title (tested). */
const COMMON = "presented presents presentation developed develops reported reports noted notes showed shows shown revealed reveals found finding findings history examination exam physical vital signs sign test tests testing results result treatment treated treat received receive started start given give gave diagnosed symptoms symptom complained complaint brought emergency department hospital admitted admission discharged follow-up followup due new one two three four five six seven eight nine ten both left right normal high low elevated level levels rate pressure temperature pain family mother father sister brother child infant male female previous prior recent recently increased decreased began begin several each other more most without within there here any all some because despite about around approximately however now later earlier initially subsequently then daily weekly continued continues improved improvement resolved over twice once later last first second third only very mildly moderate severe mild marked markedly significant significantly further additional additionally showing showed identified confirmed suggested consistent suspected likely possible concern concerning evaluation evaluated evaluate workup referred referral clinic clinical physician doctor nurse care therapy medical drug medication medications dose doses oral intravenous intravenously course days overnight morning night evening noticed noticing felt feeling feels sudden suddenly gradual gradually onset episodes episode few many much well poor good bad no not never".split(" ");
for (const w of COMMON) STOP_WORDS.add(w);

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
