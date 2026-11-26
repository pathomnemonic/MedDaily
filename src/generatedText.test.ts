import { describe, expect, it } from "vitest";
import { generatedRiddles } from "./dataRiddlesExpansion";
import { generatedBlackoutCases } from "./dataBlackoutExpansion";

/**
 * Lint for generated case text (issue 121): the "the finding" redaction must never corrupt a sentence.
 * Guards against repeated redaction tokens, articles doubled by a redaction, and doubled words,
 * across every generated Riddle Lab clue and Blackout case file.
 */
const generatedTexts: string[] = [
  ...generatedRiddles.flatMap((r) => r.clues),
  ...generatedBlackoutCases.map((c) => c.text)
];

describe("generated case text lint", () => {
  it("never repeats the redaction token back to back", () => {
    const bad = generatedTexts.filter((t) => /the finding(?:\s+(?:the\s+)?finding)+\b/i.test(t) || /the finding-(?:the )?finding/i.test(t) || /the finding\s+[A-Za-z]\s+the finding/i.test(t));
    expect(bad).toEqual([]);
  });
  it("never doubles an article around a redaction", () => {
    const bad = generatedTexts.filter((t) => /\bthe\s+the finding\b/i.test(t) || /\b(?:a|an)\s+the finding\b/i.test(t));
    expect(bad).toEqual([]);
  });
  it("never prints the same word twice in a row", () => {
    const bad = generatedTexts.filter((t) => /\b([a-z]{2,})\s+\1\b/i.test(t));
    expect(bad).toEqual([]);
  });
  it("keeps the reported Pancoast next step case fully readable", () => {
    const riddle = generatedRiddles.find((r) => r.id === "ns-nx114");
    expect(riddle?.clues[0]).toBe("I am caring for a patient with: A smoker has a superior sulcus lung mass with shoulder pain, C8-T1 symptoms, and Horner syndrome.");
    expect(riddle?.clues[1]).toBe("The clinical question is: What is the next diagnostic step?");
  });
});
