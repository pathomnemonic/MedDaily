import { describe, expect, it } from "vitest";
import { generateWordLadder, letterWordPoints, makeLetterGrid, traceGridWord, transformNonogram } from "./arcadeLogic";

describe("Letter Lab grid rules", () => {
  const grid = [
    "A","B","C","D",
    "E","F","G","H",
    "I","J","K","L",
    "M","N","O","P"
  ];

  it("traces adjacent letters without reusing a tile", () => {
    expect(traceGridWord(grid, "AFK")).toEqual([0, 5, 10]);
    expect(traceGridWord(grid, "AEJ")).toEqual([0, 4, 9]);
    expect(traceGridWord(grid, "AHO")).toBeNull();
    expect(traceGridWord(["A","A","B","C", ...grid.slice(4)], "AAA")).toBeNull();
  });

  it("generates the same playable board for the same seed", () => {
    const words = ["CARE","CURE","COLD","CORD","CARD","WARD","WARM","MIND","MILD","FINE","FIVE","DIVE","LIVE","LOVE","MOVE","NEURON","PLASMA"];
    const first = makeLetterGrid(20261119, words);
    const second = makeLetterGrid(20261119, words);
    expect(first).toEqual(second);
    expect(first.grid).toHaveLength(16);
    expect(first.grid.every((letter) => /^[A-Z]$/.test(letter))).toBe(true);
    for (const word of first.words) expect(traceGridWord(first.grid, word)).not.toBeNull();
    expect(first.words.length).toBeGreaterThan(0);
  });

  it("scores longer words more generously", () => {
    expect(letterWordPoints("ACE")).toBe(1);
    expect(letterWordPoints("WORD")).toBe(2);
    expect(letterWordPoints("HEART")).toBe(4);
    expect(letterWordPoints("NEURON")).toBe(6);
    expect(letterWordPoints("THERAPY")).toBe(10);
  });
});

describe("generated Word Ladder puzzles", () => {
  const dictionary = [
    "COLD","CORD","CARD","WARD","WARM","WORD","WORM","WORK",
    "HEAD","HEAL","TEAL","TELL","TALL","TAIL",
    "LOVE","HAVE","HATE","SICK","SILK","SILL","WILL","WELL",
    "MIND","BIND","BOND","BODY","FOOL","POOL","POLL","POLE","PALE","SALE","SAGE",
    "STAR","SCAR","SOAR","BOAR","BOOR","DOOR","MOOR","MOON"
  ];
  it("creates valid paths of four to six words across many seeds", () => {
    for (let seed = 0; seed < 100; seed++) {
      const puzzle = generateWordLadder(seed, dictionary);
      expect(puzzle).not.toBeNull();
      expect(puzzle!.path.length).toBeGreaterThanOrEqual(4);
      expect(puzzle!.path.length).toBeLessThanOrEqual(6);
      expect(puzzle!.path[0]).toBe(puzzle!.start);
      expect(puzzle!.path[puzzle!.path.length - 1]).toBe(puzzle!.end);
      for (let index = 1; index < puzzle!.path.length; index++) {
        const previous = puzzle!.path[index - 1];
        const current = puzzle!.path[index];
        expect([...previous].filter((letter, i) => letter !== current[i])).toHaveLength(1);
      }
    }
  });
  it("is deterministic for the same seed", () => {
    expect(generateWordLadder(17, dictionary)).toEqual(generateWordLadder(17, dictionary));
  });
});

describe("generated Cell Sketch variants", () => {
  it("preserves a square nonogram's dimensions and filled-cell count", () => {
    const pattern = [
      [0,1,0,0,0],
      [1,1,1,0,0],
      [0,1,0,1,0],
      [0,0,1,1,1],
      [0,0,0,1,0]
    ];
    const filled = pattern.flat().filter(Boolean).length;
    for (let seed = 0; seed < 8; seed++) {
      const transformed = transformNonogram(pattern, seed);
      expect(transformed).toHaveLength(5);
      expect(transformed.every((row) => row.length === 5)).toBe(true);
      expect(transformed.flat().filter(Boolean)).toHaveLength(filled);
    }
  });
});
