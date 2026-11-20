import { hashSeed, seeded, shuffle } from "./lib";
import { crossCriteria, crossDrugs, type CrossCriterion } from "./dataCrossmatch";

export const CROSS_GUESSES = 12;
export interface CrossPuzzle { rows: CrossCriterion[]; cols: CrossCriterion[] }

/** Drugs that satisfy both criteria of a cell. */
export const cellAnswers = (row: CrossCriterion, col: CrossCriterion): string[] => row.members.filter((m) => col.members.includes(m));

/** True when each of the nine cells can be given a different drug. */
export function hasDistinctFill(rows: CrossCriterion[], cols: CrossCriterion[]): boolean {
  const options: string[][] = [];
  for (const r of rows) for (const c of cols) options.push(cellAnswers(r, c));
  const used = new Set<string>();
  const assign = (i: number): boolean => {
    if (i === options.length) return true;
    for (const d of options[i]) if (!used.has(d)) { used.add(d); if (assign(i + 1)) return true; used.delete(d); }
    return false;
  };
  return assign(0);
}

/** How many criteria list a drug: familiar drugs appear in many lists, so picking them earns less of a rarity bonus. */
const familiarity = new Map<string, number>();
for (const c of crossCriteria) for (const m of c.members) familiarity.set(m, (familiarity.get(m) ?? 0) + 1);
export const familiarityOf = (drug: string): number => familiarity.get(drug) ?? 1;

/** 6 points for a correct cell plus up to 4 for choosing a less familiar answer than the other valid ones. */
export function crossCellPoints(row: CrossCriterion, col: CrossCriterion, drug: string): number {
  const answers = cellAnswers(row, col).sort((a, b) => familiarityOf(b) - familiarityOf(a) || a.localeCompare(b));
  const rank = answers.indexOf(drug);
  if (rank < 0) return 0;
  return 6 + (answers.length > 1 ? Math.round((4 * rank) / (answers.length - 1)) : 0);
}

/** Richness of a layout: each cell counts up to three valid drugs, so puzzles with more choice per cell score higher. */
const richness = (rows: CrossCriterion[], cols: CrossCriterion[]): number => rows.reduce((n, r) => n + cols.reduce((m, c) => m + Math.min(3, cellAnswers(r, c).length), 0), 0);

/**
 * Daily puzzle: any three criteria across and any three down (groups and properties mix), with at least one valid drug in every
 * cell, a full distinct fill, and as much choice per cell as the data allows. Deterministic for a seed.
 */
export function generateCrossPuzzle(seed: number): CrossPuzzle {
  const rnd = seeded(hashSeed("cross|" + seed));
  rnd(); rnd();
  const all = crossCriteria;
  for (const need of [18, 15, 12, 9]) {
    for (let attempt = 0; attempt < 1500; attempt++) {
      const rows = shuffle(all, rnd).slice(0, 3);
      const compatible = all.filter((c) => !rows.includes(c) && rows.every((r) => cellAnswers(r, c).length >= 1));
      if (compatible.length < 3) continue;
      const cols = shuffle(compatible, rnd).slice(0, 3);
      if (richness(rows, cols) >= need && hasDistinctFill(rows, cols)) return { rows, cols };
    }
  }
  throw new Error("Could not build a Crossmatch puzzle");
}

export const isCrossDrug = (name: string): boolean => crossDrugs.some((d) => d.toLowerCase() === name.toLowerCase());
