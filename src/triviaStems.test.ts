import { describe, expect, it } from "vitest";
import { distinctClues, triviaQuestions } from "./dataArcade";

describe("trivia question stems", () => {
  it("keeps only the fullest version of a clue that was revealed in growing pieces", () => {
    expect(distinctClues(["Skin commensal that sticks to…", "Skin commensal that sticks to catheters by…", "Skin commensal that sticks to catheters by forming biofilm."]))
      .toEqual(["Skin commensal that sticks to catheters by forming biofilm."]);
    expect(distinctClues(["Fever for a week.", "Rash on the palms.", "Raised ESR."])).toHaveLength(3);
  });
  it("never prints the same opening twice in one question", () => {
    const repeated = triviaQuestions.filter((q) => {
      const sentences = q.question.split(/…\s*/).map((s) => s.trim()).filter((s) => s.length > 12);
      return sentences.some((s, i) => sentences.slice(i + 1).some((later) => later.startsWith(s.slice(0, 20))));
    });
    expect(repeated.map((q) => q.id)).toEqual([]);
  });
});

import { riddles } from "./dataRiddles";
describe("riddle clues", () => {
  it("do not repeat the same opening across clues", () => {
    const strip = (s: string) => s.replace(/^[^:]*: /, "").replace(/^…/, "").replace(/…$/, "").trim();
    const repeated = riddles.filter((r) => r.clues.slice(1).some((c, i) => strip(c).startsWith(strip(r.clues[i]).slice(0, 18)) && strip(r.clues[i]).length > 18));
    expect(repeated.map((r) => r.id)).toEqual([]);
  });
});
