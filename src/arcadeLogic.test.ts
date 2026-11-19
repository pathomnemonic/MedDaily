import { describe, expect, it } from "vitest";
import { associationPairPoints, associationTimeBonus, deepDiveAnswerAward, editDistance, generateWordLadder, letterWordPoints, makeLetterGrid, matchAnswer, rumbleNextTurn, traceGridWord, transformNonogram, triviaRumbleResult } from "./arcadeLogic";
import { ladderDictionary } from "./dataExtra";

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

describe("Deep Dive answer matching", () => {
  const answers = [
    { answer: "Iron deficiency anemia", aliases: ["IDA"] },
    { answer: "Beta-thalassemia" },
    { answer: "Alpha-thalassemia" },
    { answer: "Lead poisoning" }
  ];
  it("accepts exact, normalized, and alias answers without marking them fuzzy", () => {
    expect(matchAnswer("  iron DEFICIENCY anemia ", answers)).toMatchObject({ fuzzy: false });
    expect(matchAnswer("ida", answers)?.match.answer).toBe("Iron deficiency anemia");
  });
  it("forgives a single typo only when it identifies one answer", () => {
    expect(matchAnswer("lead poisning", answers)).toMatchObject({ fuzzy: true });
    expect(matchAnswer("lead poisning", answers)?.match.answer).toBe("Lead poisoning");
    expect(matchAnswer("alpha-thalasemia", answers)?.match.answer).toBe("Alpha-thalassemia");
    const twins = [{ answer: "Hypokalemia" }, { answer: "Hyperkalemia" }];
    expect(matchAnswer("hypekalemia", twins)).toBeNull(); // equidistant from both: refuse to guess
  });
  it("ignores spaces and hyphens", () => {
    expect(matchAnswer("beta thalassemia", answers)?.match.answer).toBe("Beta-thalassemia");
    expect(matchAnswer("betathalassemia", answers)?.fuzzy).toBe(false);
  });
  it("rejects short, unrelated, or empty input", () => {
    expect(matchAnswer("", answers)).toBeNull();
    expect(matchAnswer("lead", answers)).toBeNull();
    expect(matchAnswer("copper", answers)).toBeNull();
    expect(editDistance("kitten", "sitting", 3)).toBe(3);
  });
});

describe("Trivia Rumble turn rule", () => {
  it("keeps the turn after a correct answer and passes it after a miss", () => {
    expect(rumbleNextTurn({ turn: 0, playerCount: 2, correct: true })).toBe(0);
    expect(rumbleNextTurn({ turn: 0, playerCount: 2, correct: false })).toBe(1);
    expect(rumbleNextTurn({ turn: 1, playerCount: 2, correct: false })).toBe(0);
    expect(rumbleNextTurn({ turn: 0, playerCount: 1, correct: false })).toBe(0);
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

  it("can supply a valid generated daily ladder across a full year of seeds", () => {
    const words = [...ladderDictionary];
    for (let day = 0; day < 365; day++) {
      const puzzle = generateWordLadder(day * 7919, words);
      expect(puzzle, "day " + day).not.toBeNull();
      expect(puzzle!.path.length).toBeGreaterThanOrEqual(4);
      expect(puzzle!.path.length).toBeLessThanOrEqual(6);
      expect(puzzle!.path.every((word) => ladderDictionary.has(word))).toBe(true);
      expect(new Set(puzzle!.path).size).toBe(puzzle!.path.length);
      for (let index = 1; index < puzzle!.path.length; index++) {
        expect([...puzzle!.path[index - 1]].filter((letter, i) => letter !== puzzle!.path[index][i])).toHaveLength(1);
      }
    }
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


describe("Association Blitz scoring", () => {
  it("rewards streaks without allowing the per-pair bonus to grow without bound", () => {
    expect([0, 1, 2, 3, 4, 5, 6, 11].map(associationPairPoints)).toEqual([100, 110, 120, 130, 140, 150, 150, 150]);
    expect(associationPairPoints(-4)).toBe(100);
  });

  it("caps the time bonus and never awards negative points", () => {
    expect(associationTimeBonus(75)).toBe(150);
    expect(associationTimeBonus(100)).toBe(150);
    expect(associationTimeBonus(1)).toBe(2);
    expect(associationTimeBonus(0)).toBe(0);
    expect(associationTimeBonus(-10)).toBe(0);
  });

  it("keeps the twelve-pair perfect-run maximum consistent with the UI", () => {
    const pairTotal = Array.from({ length: 12 }, (_, combo) => associationPairPoints(combo)).reduce((sum, points) => sum + points, 0);
    expect(pairTotal).toBe(1650); // 12 × 100 base + 450 capped combo bonus
    expect(pairTotal + associationTimeBonus(75)).toBe(1800);
  });
});


describe("Deep Dive rarity scoring", () => {
  it("rewards rarer answers more heavily", () => {
    expect([1,2,3,4,5,6].map((tier) => deepDiveAnswerAward(tier, 0))).toEqual([10,15,30,60,85,100]);
  });

  it("caps each prompt at one hundred points", () => {
    expect(deepDiveAnswerAward(6, 80)).toBe(20);
    expect(deepDiveAnswerAward(1, 95)).toBe(5);
    expect(deepDiveAnswerAward(6, 100)).toBe(0);
    expect(deepDiveAnswerAward(0, 0)).toBe(0);
    expect(deepDiveAnswerAward(7, 0)).toBe(0);

  });
});


describe("Trivia Rumble result scoring", () => {
  it("uses the full turn count for solo play", () => {
    expect(triviaRumbleResult([24], "solo", 24)).toEqual({ score: 2400, maxScore: 2400, perfect: true });
  });

  it("uses each player's actual turn count for pass-and-play", () => {
    expect(triviaRumbleResult([18, 15], "pass", 36)).toEqual({ score: 1800, maxScore: 1800, perfect: true });
    expect(triviaRumbleResult([12, 10], "pass", 36)).toEqual({ score: 1200, maxScore: 1800, perfect: false });
  });
});

import { labRange, labScore, labStreakBonus } from "./arcadeLogic";
describe("Labline scoring", () => {
  it("gives partial credit on threshold prompts instead of all-or-nothing", () => {
    expect(labScore(6.5, 6.5, 0)).toBe(100);
    expect(labScore(6.4, 6.5, 0)).toBeGreaterThan(70);
    expect(labScore(6.4, 6.5, 0)).toBeLessThan(100);
    expect(labScore(9, 6.5, 0)).toBe(0);
  });
  it("rewards closeness monotonically and caps the window above 85", () => {
    const values = [0, 1, 2, 3, 5, 8, 20].map((d) => labScore(14 + d, 14, 1.5));
    for (let i = 1; i < values.length; i++) expect(values[i]).toBeLessThanOrEqual(values[i - 1]);
    expect(labScore(14.5, 14, 1.5)).toBeGreaterThanOrEqual(85);
  });
  it("builds a slider range that always contains the answer without centering it", () => {
    for (let seed = 0; seed < 60; seed++) for (const v of [0, 7.4, 14, 126, 500]) {
      const { min, max } = labRange(v, seed);
      expect(min).toBeLessThanOrEqual(v); expect(max).toBeGreaterThanOrEqual(v); expect(max).toBeGreaterThan(min);
    }
    expect(labStreakBonus(0)).toBe(0); expect(labStreakBonus(2)).toBe(20); expect(labStreakBonus(9)).toBe(30);
  });
});

import { bodyTapPoints } from "./arcadeLogic";
describe("Body Map Blitz proximity scoring", () => {
  it("scores hits by speed and near misses by distance", () => {
    expect([2, 6, 12].map((t) => bodyTapPoints(true, 0, t))).toEqual([10, 8, 6]);
    expect([0.02, 0.05, 0.09, 0.2].map((d) => bodyTapPoints(false, d, 1))).toEqual([5, 3, 1, 0]);
    expect(bodyTapPoints(false, NaN, 1)).toBe(0);
    expect(bodyTapPoints(false, Infinity, 1)).toBe(0);
  });
});
