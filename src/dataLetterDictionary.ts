import { connectionPuzzles, medleWords, microbePacks, pairsBank } from "./data";
import { ladderDictionary, scrambleWords, wordLadders } from "./dataExtra";
import { normalize } from "./lib";

/** Shared curated vocabulary for Letter Lab and the intermediate steps in Letter Rungs. */
export const LETTER_DICTIONARY = [...new Set([
  ...ladderDictionary,
  ...medleWords,
  ...scrambleWords.map(([word]) => word),
  ...wordLadders.flatMap((ladder) => ladder.path),
  ...pairsBank.map(([term]) => term),
  ...connectionPuzzles.flatMap((board) => board.flatMap((group) => group.words)),
  ...microbePacks.flatMap((pack) => pack.words)
].map((value) => normalize(String(value)).replace(/\s/g, "").toUpperCase()).filter((word) => /^[A-Z]{3,8}$/.test(word)))];
