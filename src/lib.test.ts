import { describe, expect, it } from "vitest";
import { connectionPuzzles, medleWords } from "./data";
import { deductionCases, glyphPatterns, spellingHivePuzzles } from "./dataExtra";
import { hashSeed, lineCells, dailyDateKey, makeWordSearch, nonogramRuns, scoreWord, seeded, shuffle } from "./lib";

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

  it("converts nonogram lines into exact run clues", () => {
    expect(nonogramRuns([0, 1, 1, 0, 1])).toEqual([2, 1]);
    expect(nonogramRuns([1, 1, 1, 1, 1])).toEqual([5]);
    expect(nonogramRuns([0, 0, 0, 0, 0])).toEqual([]);
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

describe("additional daily puzzle packs", () => {
  it("keeps every Spelling Hive bank internally valid", () => {
    for (const puzzle of spellingHivePuzzles) {
      expect(puzzle.letters).toHaveLength(7);
      expect(new Set(puzzle.letters).size).toBe(7);
      expect(puzzle.letters).toContain(puzzle.center);
      expect(new Set(puzzle.words).size).toBe(puzzle.words.length);
      expect(puzzle.words.every((word) =>
        word.length >= 4 &&
        word.includes(puzzle.center) &&
        [...word].every((letter) => puzzle.letters.includes(letter))
      )).toBe(true);
      expect(puzzle.words).toContain(puzzle.pangram);
    }
  });

  it("keeps every Casefile solution one-to-one", () => {
    for (const puzzle of deductionCases) {
      expect(puzzle.suspects).toHaveLength(3);
      expect(puzzle.locations).toHaveLength(3);
      expect(puzzle.objects).toHaveLength(3);
      expect(puzzle.solution).toHaveLength(3);
      expect(new Set(puzzle.solution.map((s) => s.suspect)).size).toBe(3);
      expect(new Set(puzzle.solution.map((s) => s.location)).size).toBe(3);
      expect(new Set(puzzle.solution.map((s) => s.object)).size).toBe(3);
      expect(puzzle.solution.every((s) =>
        puzzle.suspects.includes(s.suspect as never) &&
        puzzle.locations.includes(s.location as never) &&
        puzzle.objects.includes(s.object as never)
      )).toBe(true);
    }
  });
});


describe("Cell Sketch nonogram clues", () => {
  const runs = (line: number[]) => {
    const result: number[] = [];
    let current = 0;
    for (const cell of line) {
      if (cell) current++;
      else if (current) { result.push(current); current = 0; }
    }
    if (current) result.push(current);
    return result;
  };

  it("gives each hidden 5x5 shape a unique solution from row and column runs", () => {
    for (const puzzle of glyphPatterns) {
      const pattern = puzzle.pattern;
      const rowClues = pattern.map(runs);
      const colClues = pattern[0].map((_, c) => runs(pattern.map((row) => row[c])));
      const rowOptions = rowClues.map((clue) =>
        Array.from({ length: 32 }, (_, mask) => Array.from({ length: 5 }, (_, c) => (mask >> c) & 1))
          .filter((row) => JSON.stringify(runs(row)) === JSON.stringify(clue))
      );
      let solutions = 0;
      const rows: number[][] = [];
      const visit = (r: number) => {
        if (solutions > 1) return;
        if (r === 5) {
          if (colClues.every((clue, c) => JSON.stringify(runs(rows.map((row) => row[c]))) === JSON.stringify(clue))) solutions++;
          return;
        }
        for (const candidate of rowOptions[r]) {
          rows[r] = candidate;
          visit(r + 1);
        }
      };
      visit(0);
      expect(solutions, puzzle.name).toBe(1);
    }
  });
});
