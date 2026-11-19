import { makeStrandsBoard, type StrandsBoard } from "./strandsLogic";
import { hashSeed, seeded, shuffle } from "./lib";

export interface TrailPack { name: string; words: readonly string[] }
export interface TrailPuzzle extends StrandsBoard { theme: string; trail: string }

const usable = (pack: TrailPack) => [...new Set(pack.words.map((w) => w.toUpperCase().replace(/[^A-Z]/g, "")))].filter((w) => w.length >= 3 && w.length <= 10);
/** A pack qualifies when it has a long trail word and enough theme words to fill a board. */
export const trailPackOk = (pack: TrailPack): boolean => { const w = usable(pack); return w.length >= 5 && w.some((x) => x.length >= 5); };

/** Choose a trail word (the longest fitting word) plus a handful of theme words, then lay out a board that provably fits them. */
export function makeTrailPuzzle(pack: TrailPack, seed: number): TrailPuzzle {
  const clean = [...new Set(pack.words.map((w) => w.toUpperCase().replace(/[^A-Z]/g, "")))].filter((w) => w.length >= 3 && w.length <= 10);
  if (clean.length < 4) throw new Error("Pack too small: " + pack.name);
  for (let attempt = 0; attempt < 40; attempt++) {
    const random = seeded(hashSeed("trail|" + seed + "|" + attempt));
    const long = clean.filter((w) => w.length >= 5);
    const trail = (long.length ? shuffle(long, random) : [...clean].sort((a, b) => b.length - a.length))[0];
    const rest = shuffle(clean.filter((w) => w !== trail && w.length <= trail.length), random);
    const words = [trail];
    let letters = trail.length;
    for (const word of rest) {
      if (words.length >= 7) break;
      if (letters + word.length > 52) continue;
      words.push(word); letters += word.length;
    }
    if (words.length < 5) continue;
    try {
      const board = makeStrandsBoard(words, hashSeed("board|" + seed + "|" + attempt), 8, 10);
      return { ...board, theme: pack.name, trail: board.spangram };
    } catch { /* try another word selection */ }
  }
  throw new Error("Could not build a Theme Trail for " + pack.name);
}
