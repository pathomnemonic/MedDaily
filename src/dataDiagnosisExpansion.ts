import type { DiagnosisCase } from "./data";
import { branchSets } from "./dataBranch";
import { hashSeed, seeded, shuffle } from "./lib";

const progressiveClues = (clue: string): string[] => {
  const words = clue.split(/\s+/);
  /** A fragment must never end right after a measurement ("Grows in bile and 6.5%…"): extend the cut past the word the number belongs to. */
  const extendPastMeasure = (cut: number): number => {
    let end = cut;
    while (end < words.length - 1 && /\d/.test(words[end - 1])) end += 1;
    return end;
  };
  const first = extendPastMeasure(Math.min(words.length - 2, Math.max(3, Math.ceil(words.length * 0.36))));
  const second = extendPastMeasure(Math.min(words.length - 1, Math.max(first + 2, Math.ceil(words.length * 0.72))));
  return [words.slice(0, first).join(" ") + "…", words.slice(0, second).join(" ") + "…", clue];
};

/**
 * Additional DoctorDle cases derived from the curated organism taxonomy.
 * The original distinguishing microbiology clue is retained and progressively revealed.
 */
export const branchDiagnosisCases: DiagnosisCase[] = branchSets.microbe.map((leaf) => {
  const siblings = branchSets.microbe.filter((candidate) =>
    candidate.name !== leaf.name && candidate.path.slice(0, -1).join("/") === leaf.path.slice(0, -1).join("/")
  );
  const fallback = branchSets.microbe.filter((candidate) => candidate.name !== leaf.name);
  const pool = siblings.length >= 3 ? siblings : fallback;
  const random = seeded(hashSeed("doctordle|" + leaf.name));
  const distractors = shuffle(pool, random).slice(0, 3).map((candidate) => candidate.name);
  return {
    id: "microbe-" + leaf.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    title: "The microbiology case",
    clues: progressiveClues(leaf.clue),
    options: [leaf.name, ...distractors],
    answer: leaf.name,
    explanation: leaf.clue,
    source: "Curated organism-identification clue; standard clinical microbiology references."
  };
});
