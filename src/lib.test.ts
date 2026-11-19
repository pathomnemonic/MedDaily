import { describe, expect, it } from "vitest";
import { connectionPuzzles, medleWords } from "./data";
import { hashSeed, lineCells, dailyDateKey, makeWordSearch, scoreWord, seeded, shuffle } from "./lib";

describe("daily puzzle primitives", () => {
  it("creates stable seeds for stable keys", () => {
    expect(hashSeed("2026-11-19|general|medle")).toBe(hashSeed("2026-11-19|general|medle"));
    expect(hashSeed("2026-11-19|general|medle")).not.toBe(hashSeed("2026-11-20|general|medle"));
  });

  it("creates a repeatable seeded random sequence", () => {
    const first = seeded(42);
    const second = seeded(42);
    expect([first(), first(), first()]).toEqual([second(), second(), second()]);
  });

  it("shuffles deterministically without mutating the source", () => {
    const source = [1, 2, 3, 4, 5];
    const first = shuffle(source, seeded(7));
    expect(first).toEqual(shuffle(source, seeded(7)));
    expect(source).toEqual([1, 2, 3, 4, 5]);
    expect([...first].sort()).toEqual(source);
  });

  it("scores repeated letters without awarding duplicate matches", () => {
    expect(scoreWord("SHEEP", "SLEEP")).toEqual(["correct", "absent", "correct", "correct", "correct"]);
  });

  it("returns horizontal, vertical and diagonal word-search paths", () => {
    expect(lineCells(0, 4, 5)).toEqual([0, 1, 2, 3, 4]);
    expect(lineCells(0, 20, 5)).toEqual([0, 5, 10, 15, 20]);
    expect(lineCells(0, 12, 5)).toEqual([0, 6, 12]);
    expect(lineCells(0, 13, 5)).toEqual([]);
  });

  it("places all valid short words in a seeded grid", () => {
    const words = ["HEART", "BRAIN", "NERVE", "LIVER"];
    const board = makeWordSearch(words, 10, 123);
    expect(board.placed).toEqual(expect.arrayContaining(words));
    expect(board.grid).toHaveLength(10);
    expect(board.grid.every((row) => row.length === 10 && row.every((letter) => /^[A-Z]$/.test(letter)))).toBe(true);
  });

  it("uses the shared UTC date for daily rollover", () => {
    expect(dailyDateKey(new Date(Date.UTC(2026, 10, 19, 23, 59)))).toBe("2026-11-19");
    expect(dailyDateKey(new Date(Date.UTC(2026, 10, 20, 0, 0)))).toBe("2026-11-20");
  });
});

describe("content bank sanity", () => {
  it("keeps Medle answers five letters long and unique", () => {
    expect(new Set(medleWords).size).toBe(medleWords.length);
    expect(medleWords.every((word) => /^[A-Z]{5}$/.test(word))).toBe(true);
  });

  it("keeps Connections boards at four groups of four unique tiles", () => {
    for (const board of connectionPuzzles) {
      expect(board).toHaveLength(4);
      const words = board.flatMap((group) => group.words);
      expect(words).toHaveLength(16);
      expect(new Set(words.map((word) => word.toLowerCase())).size).toBe(16);
    }
  });
});