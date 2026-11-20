import type { DiagnosisCase } from "./data";
import { branchSets } from "./dataBranch";
import { hashSeed, seeded, shuffle } from "./lib";

const progressiveClues = (clue: string): string[] => {
  const parts = clue.split(/(?<=[.;])\s+/).map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 3) return [parts[0], parts.slice(0, 2).join(" "), clue];
  if (parts.length === 2) return [parts[0], clue, clue];
  const words = clue.split(/\s+/);
  const first = Math.max(3, Math.ceil(words.length * 0.38));
  const second = Math.max(first + 2, Math.ceil(words.length * 0.72));
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
