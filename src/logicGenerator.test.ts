import { describe, expect, it } from "vitest";
import { countDeductionSolutions, generateDeductionCase } from "./logicGenerator";

describe("procedural Casefile Logic generator", () => {
  it("creates unique, solvable three-by-three deduction puzzles across many seeds", () => {
    for (let seed = 0; seed < 150; seed++) {
      const puzzle = generateDeductionCase(seed * 7919);
      expect(puzzle.suspects).toHaveLength(3);
      expect(new Set(puzzle.suspects).size).toBe(3);
      expect(puzzle.locations).toHaveLength(3);
      expect(new Set(puzzle.locations).size).toBe(3);
      expect(puzzle.objects).toHaveLength(3);
      expect(new Set(puzzle.objects).size).toBe(3);
      expect(puzzle.solution).toHaveLength(3);
      expect(puzzle.clues.length).toBeGreaterThanOrEqual(5);
      expect(countDeductionSolutions(puzzle.constraints)).toBe(1);
    }
  });

  it("is deterministic for a given seed and changes when the seed changes", () => {
    expect(generateDeductionCase(42)).toEqual(generateDeductionCase(42));
    expect(generateDeductionCase(42).title).not.toBe(generateDeductionCase(43).title);
  });
});
