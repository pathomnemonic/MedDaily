import { hashSeed, seeded } from "./lib";
import { branchSets, type BranchLeaf, type BranchSet } from "./dataBranch";

export const BRANCH_GUESSES = 8;

/** How many leading lineage steps two items share (their path to the last common ancestor). */
export function sharedDepth(a: readonly string[], b: readonly string[]): number {
  let i = 0;
  while (i < a.length && i < b.length && a[i] === b[i]) i++;
  return i;
}

/** Number of answers that sit under a lineage prefix. */
export const candidatesUnder = (set: BranchSet, prefix: readonly string[]): number =>
  branchSets[set].filter((leaf) => prefix.every((step, i) => leaf.path[i] === step)).length;

/** Daily puzzle: a mystery microbe on some days and a mystery drug on others, the same for everyone with the same seed. */
export function pickBranchTarget(seed: number): { set: BranchSet; target: BranchLeaf } {
  const rnd = seeded(hashSeed("branch|" + seed));
  rnd();
  const set: BranchSet = rnd() < 0.5 ? "microbe" : "drug";
  const pool = branchSets[set];
  return { set, target: pool[Math.floor(rnd() * pool.length)] };
}

/** 100 for a first-guess win, 10 fewer per extra guess, 10 off for using the clue; a miss earns partial credit for closeness. */
export function branchScore(won: boolean, guesses: number, clueUsed: boolean, bestShared: number): number {
  if (won) return Math.max(10, 100 - (guesses - 1) * 10 - (clueUsed ? 10 : 0));
  return Math.min(35, bestShared * 7);
}

/** Share-grid square for a guess by how far down the lineage it matched. */
export function branchSquare(shared: number, pathLength: number, correct: boolean): string {
  if (correct) return "🟩";
  const ratio = shared / Math.max(1, pathLength - 1);
  return ratio >= 0.75 ? "🟨" : ratio >= 0.4 ? "🟧" : shared > 0 ? "🟥" : "⬛";
}
