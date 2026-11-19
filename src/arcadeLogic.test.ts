import { describe, expect, it } from "vitest";
import { editDistance, letterWordPoints, makeLetterGrid, matchAnswer, rumbleNextTurn, traceGridWord } from "./arcadeLogic";

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
