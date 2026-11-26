import { describe, expect, it } from "vitest";
import { riddles } from "./dataRiddles";
import { triviaQuestions } from "./dataArcade";
import { branchDiagnosisCases } from "./dataDiagnosisExpansion";
import { branchSets } from "./dataBranch";

/**
 * Content lint for issue 129: the framing of a question (the "I am a…" header in Riddle Lab, the
 * stem wording in Trivia Rumble) must match the type of its answer, and progressively revealed
 * clues must not cut a fact in half.
 */
const microbeNames = new Set(branchSets.microbe.map((leaf) => leaf.name));
const drugNames = new Set(branchSets.drug.map((leaf) => leaf.name));

describe("question framing matches answer type", () => {
  it("never labels an organism or drug riddle as a Diagnosis", () => {
    const bad = riddles.filter((r) => r.kind === "Diagnosis" && (microbeNames.has(r.answer) || drugNames.has(r.answer)));
    expect(bad.map((r) => r.id)).toEqual([]);
  });
  it("labels every organism riddle as Microbe, so its options are all organisms", () => {
    const bad = riddles.filter((r) => microbeNames.has(r.answer) && r.kind !== "Microbe");
    expect(bad.map((r) => r.id)).toEqual([]);
    const enterococcus = riddles.find((r) => r.answer === "Enterococcus faecalis");
    expect(enterococcus?.kind).toBe("Microbe");
  });
  it("asks for an organism, not a diagnosis, when every trivia option is an organism", () => {
    const bad = triviaQuestions.filter((q) => q.options.every((o) => microbeNames.has(o)) && /which diagnosis/i.test(q.question));
    expect(bad.map((q) => q.id)).toEqual([]);
    const microbeStems = triviaQuestions.filter((q) => q.id.startsWith("diagnosis-microbe-"));
    expect(microbeStems.length).toBeGreaterThan(150);
    expect(microbeStems.every((q) => q.question.startsWith("Which organism best fits"))).toBe(true);
  });
  it("never cuts a progressive clue fragment right after a measurement", () => {
    const bad = branchDiagnosisCases.filter((c) => c.clues.slice(0, 2).some((clue) => /\d/.test(clue.replace(/…$/, "").trim().split(/\s+/).pop() ?? "")));
    expect(bad.map((c) => c.answer)).toEqual([]);
    const enterococcus = branchDiagnosisCases.find((c) => c.answer === "Enterococcus faecalis");
    expect(enterococcus?.clues[0]).toBe("Grows in bile and 6.5% salt;…");
  });
});
