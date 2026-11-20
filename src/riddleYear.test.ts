import { describe, expect, it } from "vitest";
import { riddles, riddleOptions } from "./dataRiddles";

describe("Riddle Lab year bank", () => {
  it("contains at least 365 distinct clue ladders", () => {
    expect(riddles.length).toBeGreaterThanOrEqual(365);
    expect(new Set(riddles.map((item) => item.id)).size).toBe(riddles.length);
    expect(new Set(riddles.map((item) => item.kind + "|" + item.answer.toLowerCase() + "|" + item.clues.join("|"))).size).toBe(riddles.length);
  });

  it("gives every riddle four progressive clues and four distinct same-kind choices", () => {
    for (const item of riddles) {
      expect(item.clues).toHaveLength(4);
      expect(item.clues.every((clue) => clue.length > 12)).toBe(true);
      const options = riddleOptions(item, () => 0.37);
      expect(options).toHaveLength(4);
      expect(new Set(options).size).toBe(4);
      expect(options).toContain(item.answer);
    }
  });
});
