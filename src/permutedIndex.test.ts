import { describe, expect, it } from "vitest";
import { permutedIndex } from "./lib";

describe("permutedIndex", () => {
  it("visits every puzzle once before any repeat, for any pool size", () => {
    for (const size of [1, 2, 7, 24, 46, 100, 365, 400]) {
      const seen = new Set(Array.from({ length: size }, (_, d) => permutedIndex(20000 + d, size)));
      expect(seen.size).toBe(size);
    }
  });
  it("keeps consecutive days far apart and handles negative or huge seeds", () => {
    expect(Math.abs(permutedIndex(5, 100) - permutedIndex(6, 100))).toBeGreaterThan(10);
    expect(permutedIndex(-7, 30)).toBeGreaterThanOrEqual(0);
    expect(permutedIndex(4_000_000_000, 30)).toBeLessThan(30);
  });
});

import { generatedRiddles } from "./dataRiddlesExpansion";
describe("generated riddle text", () => {
  it("has no doubled redaction words", () => {
    const bad = generatedRiddles.flatMap((r) => r.clues).filter((c) => /the finding\s+(the\s+)?finding\b/i.test(c));
    expect(bad).toEqual([]);
  });
});
