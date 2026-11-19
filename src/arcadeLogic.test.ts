import { describe, expect, it } from "vitest";
import { associationPairPoints, associationTimeBonus, deepDiveAnswerAward, editDistance, generateWordLadder, letterWordPoints, makeLetterGrid, matchAnswer, rumbleNextTurn, traceGridWord, transformNonogram } from "./arcadeLogic";

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
