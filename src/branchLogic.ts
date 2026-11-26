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
  // Daily seeds are UTC day ordinals. Alternate sets and advance each set's index once every two days:
  // 365 consecutive daily seeds therefore consume 183 microbes and 182 drugs without replacement.
  // Free Play passes a fresh hash seed and still receives a deterministic, effectively random target.
  const day = Math.abs(Math.trunc(seed));
  const set: BranchSet = day % 2 === 0 ? "microbe" : "drug";
  const pool = branchSets[set];
  const index = Math.floor(day / 2) % pool.length;
  return { set, target: pool[index] };
}

/** 100 for a first-guess win, 10 fewer per extra guess, 10 off for using the clue; a miss earns partial credit for closeness. */
export function branchScore(won: boolean, guesses: number, clueUsed: boolean, bestShared: number): number {
  if (won) return Math.max(10, 100 - (guesses - 1) * 10 - (clueUsed ? 10 : 0));
  return Math.min(35, bestShared * 7);
}

/**
 * Pixel height a guess twig needs so its name and divergent lineage path wrap in full instead of
 * truncating (issue 123). Must stay in step with the .bt-twig styles in styles.css: 124px of text
 * width, the name at 11px bold wraps to at most 2 lines, the path at 9px to at most 3 lines.
 */
export function branchTwigHeight(name: string, mid: string): number {
  const nameLines = Math.min(2, Math.max(1, Math.ceil(name.length / 20)));
  const midLines = mid ? Math.min(3, Math.max(1, Math.ceil(mid.length / 26))) : 0;
  return 6 + nameLines * 13 + (mid ? 2 + midLines * 11 : 0);
}

/** Share-grid square for a guess by how far down the lineage it matched. */
export function branchSquare(shared: number, pathLength: number, correct: boolean): string {
  if (correct) return "🟩";
  const ratio = shared / Math.max(1, pathLength - 1);
  return ratio >= 0.75 ? "🟨" : ratio >= 0.4 ? "🟧" : shared > 0 ? "🟥" : "⬛";
}
