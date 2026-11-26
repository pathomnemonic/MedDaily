import { describe, expect, it } from "vitest";
import { associationPairPoints, associationTimeBonus, deepDiveAnswerAward, editDistance, generateWordLadder, letterWordPoints, makeLetterGrid, matchAnswer, rumbleNextTurn, traceGridWord, transformNonogram, triviaRumbleResult } from "./arcadeLogic";
import { glyphPatterns, ladderDictionary } from "./dataExtra";

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
    expect(matchAnswer("lead", answers)?.match.answer).toBe("Lead poisoning"); // the distinctive word alone is enough
    expect(matchAnswer("an", answers)).toBeNull();
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


describe("Cell Sketch generated variants", () => {
  it("rotates and mirrors every curated board without changing its filled-cell count", () => {
    for (const puzzle of glyphPatterns) {
      const original = puzzle.pattern;
      const filled = original.flat().filter(Boolean).length;
      for (let seed = 1; seed <= 7; seed++) {
        const transformed = transformNonogram(original, seed);
        const quarterTurn = seed % 2 === 1;
        expect(transformed.length).toBe(quarterTurn ? original[0].length : original.length);
        expect(transformed[0].length).toBe(quarterTurn ? original.length : original[0].length);
        expect(transformed.every((row) => row.length === transformed[0].length)).toBe(true);
        expect(transformed.flat().filter(Boolean)).toHaveLength(filled);
        expect(transformed.flat().every((cell) => cell === 0 || cell === 1)).toBe(true);
        expect(transformNonogram(original, seed)).toEqual(transformed);
      }
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
  it("scores a flawless solo win against the questions actually faced, not the round limit", () => {
    // a perfect solo game ends when the sixth wedge completes, after as few as 18 questions
    expect(triviaRumbleResult([18], [18])).toEqual({ score: 1800, maxScore: 1800, perfect: true });
    expect(triviaRumbleResult([24], [24])).toEqual({ score: 2400, maxScore: 2400, perfect: true });
    expect(triviaRumbleResult([20], [24])).toEqual({ score: 2000, maxScore: 2400, perfect: false });
  });

  it("uses each player's actual turn count for pass-and-play", () => {
    // a correct answer keeps the turn, so one player can face far more questions than the other
    expect(triviaRumbleResult([18, 2], [18, 2])).toEqual({ score: 1800, maxScore: 1800, perfect: true });
    expect(triviaRumbleResult([12, 10], [20, 16])).toEqual({ score: 1200, maxScore: 2000, perfect: false });
    expect(triviaRumbleResult([30, 6], [30, 6])).toEqual({ score: 3000, maxScore: 3000, perfect: true });
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
    // The answer's position in the range must vary widely, so the midpoint is no clue.
    const fractions = Array.from({ length: 200 }, (_, seed) => { const { min, max } = labRange(14, seed, 1.5); return (14 - min) / (max - min); });
    expect(Math.min(...fractions)).toBeLessThan(0.25);
    expect(Math.max(...fractions)).toBeGreaterThan(0.75);
    const mids = Array.from({ length: 200 }, (_, seed) => { const { min, max } = labRange(126, seed, 3); return (min + max) / 2 - 126; });
    expect(Math.min(...mids)).toBeLessThan(-10);
    expect(Math.max(...mids)).toBeGreaterThan(10);
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

describe("Deep Scan generous matching", () => {
  const answers = [
    { answer: "Iron deficiency anemia", aliases: ["IDA"] },
    { answer: "Cushing syndrome" },
    { answer: "Hypokalemia" },
    { answer: "Hyperkalemia" },
    { answer: "Esophageal varices" },
    { answer: "Pheochromocytoma" }
  ];
  it("forgives swapped letters, longer-word slips and British spellings", () => {
    expect(matchAnswer("hyperkalemai", answers)?.match.answer).toBe("Hyperkalemia");
    expect(matchAnswer("pheochromocytomma", answers)?.match.answer).toBe("Pheochromocytoma");
    expect(matchAnswer("pheocromocitoma", answers)?.match.answer).toBe("Pheochromocytoma");
    expect(matchAnswer("iron deficiency anaemia", answers)).toMatchObject({ fuzzy: false });
    expect(matchAnswer("oesophageal varices", answers)?.match.answer).toBe("Esophageal varices");
  });
  it("accepts the short form of a syndrome and answers buried in a sentence", () => {
    expect(matchAnswer("Cushing", answers)?.match.answer).toBe("Cushing syndrome");
    expect(matchAnswer("i think it is hyperkalemia", answers)?.match.answer).toBe("Hyperkalemia");
  });
  it("still refuses to guess between siblings or accept unrelated text", () => {
    expect(matchAnswer("hypekalemia", answers)).toBeNull();
    expect(matchAnswer("potassium", answers)).toBeNull();
    expect(matchAnswer("abc", answers)).toBeNull();
  });
});

describe("Deep Scan matching with parenthetical answers", () => {
  it("accepts the name without the qualifier in brackets", () => {
    const answers = [{ answer: "Cushing syndrome (cortisol saturating renal 11β-HSD2)" }, { answer: "Hypercalcemia (nephrogenic DI)" }];
    expect(matchAnswer("cushing syndrome", answers)?.match.answer).toContain("Cushing");
    expect(matchAnswer("hypercalcemia", answers)).toMatchObject({ fuzzy: false });
  });
});


describe("generous answer matching", () => {
  const list = [{ answer: "Myocardial infarction" }, { answer: "Cardiac tamponade" }, { answer: "Type 2 diabetes mellitus" }, { answer: "Hyperkalemia" }, { answer: "Hypokalemia" }, { answer: "Pulmonary embolism" }, { answer: "Tuberculosis" }];
  const pick = (t: string) => matchAnswer(t, list)?.match.answer;
  it("accepts abbreviations and lay terms", () => {
    expect(pick("heart attack")).toBe("Myocardial infarction");
    expect(pick("MI")).toBe("Myocardial infarction");
    expect(pick("TB")).toBe("Tuberculosis");
    expect(pick("PE")).toBe("Pulmonary embolism");
    expect(pick("lung clot")).toBe("Pulmonary embolism");
    expect(pick("T2DM")).toBe("Type 2 diabetes mellitus");
  });
  it("accepts word order changes, roman numerals and the key word alone", () => {
    expect(pick("infarction myocardial")).toBe("Myocardial infarction");
    expect(pick("type II diabetes")).toBe("Type 2 diabetes mellitus");
    expect(pick("tamponade")).toBe("Cardiac tamponade");
    expect(pick("embolus pulmonary")).toBe("Pulmonary embolism");
  });
  it("forgives sound-alike spellings and bigger typos in long words", () => {
    expect(pick("miocardial infarkshun")).toBe("Myocardial infarction");
    expect(pick("tuburculosis")).toBe("Tuberculosis");
    expect(pick("cardiak tamponaid")).toBe("Cardiac tamponade");
  });
  it("still refuses to guess between siblings", () => {
    expect(pick("kalemia")).toBeUndefined();
  });
});

describe("matcher regressions found by the bug scan", () => {
  it("a typed name that is itself a listed answer beats a synonym of a sibling", () => {
    const list = [{ answer: "Thyrotoxicosis" }, { answer: "Hyperthyroidism" }, { answer: "Dermatomyositis" }, { answer: "Polymyositis" }];
    expect(matchAnswer("Hyperthyroidism", list)?.match.answer).toBe("Hyperthyroidism");
    expect(matchAnswer("Polymyositis", list)?.match.answer).toBe("Polymyositis");
  });
  it("stripping a generic tail never lets 'bladder cancer' match a urinary tract infection", () => {
    const list = [{ answer: "Urinary tract infection" }, { answer: "Bladder cancer" }, { answer: "Renal cell carcinoma" }];
    expect(matchAnswer("Bladder cancer", list)?.match.answer).toBe("Bladder cancer");
    expect(matchAnswer("kidney cancer", list)?.match.answer).toBe("Renal cell carcinoma");
    expect(matchAnswer("UTI", list)?.match.answer).toBe("Urinary tract infection");
  });
  it("a different known diagnosis is never accepted as a near-miss typo", () => {
    expect(matchAnswer("Myasthenia gravis", [{ answer: "Graves disease", aliases: ["Graves"] }], ["Myasthenia gravis"])).toBeNull();
    expect(matchAnswer("gravess disease", [{ answer: "Graves disease", aliases: ["Graves"] }], ["Myasthenia gravis"])).not.toBeNull();
  });
});
