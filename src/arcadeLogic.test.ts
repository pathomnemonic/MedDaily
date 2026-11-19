import { describe, expect, it } from "vitest";
import { letterWordPoints, makeLetterGrid, traceGridWord } from "./arcadeLogic";

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
