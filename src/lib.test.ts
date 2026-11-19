import { describe, expect, it } from "vitest";
import { connectionPuzzles, medleWords, diagnosisCases, nextStepCases, labPrompts, triageCases, pairsBank, microbePacks } from "./data";
import { deductionCases, glyphPatterns, spellingHivePuzzles, wordLadders, scrambleWordsExtended, higherLowerPairs } from "./dataExtra";
import { hashSeed, lineCells, dailyDateKey, makeWordSearch, nonogramRuns, scoreWord, seeded, shuffle } from "./lib";
import { deepDivePrompts, triviaCategories, triviaQuestions } from "./dataArcade";

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
      expect(new Set(words.map((word) => word.toLowerCase())).size, JSON.stringify(board)).toBe(16);
    }
  });
});

describe("additional daily puzzle packs", () => {
  it("keeps the playable Spelling Hive pool medical-focused and title-unique", () => {
    const playable = spellingHivePuzzles.filter((puzzle) => !["Practice Round", "Capture the Clue", "Tricone Terms"].includes(puzzle.title));
    expect(playable).toHaveLength(42);
    expect(new Set(playable.map((puzzle) => puzzle.title)).size).toBe(playable.length);
  });
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
    expect(glyphPatterns.length).toBeGreaterThanOrEqual(31);
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


describe("expanded content integrity", () => {
  it("keeps the expanded daily banks large and distributes answer positions", () => {
    expect(connectionPuzzles.length).toBeGreaterThanOrEqual(120);
    expect(spellingHivePuzzles.length).toBeGreaterThanOrEqual(24);
    expect(wordLadders.length).toBeGreaterThanOrEqual(26);
    expect(deductionCases.length).toBeGreaterThanOrEqual(15);
    expect(labPrompts.length).toBeGreaterThanOrEqual(100);
    expect(pairsBank.length).toBeGreaterThanOrEqual(200);
    expect(microbePacks.length).toBeGreaterThanOrEqual(68);
    expect(triageCases.length).toBeGreaterThanOrEqual(42);
    expect(medleWords.length).toBeGreaterThanOrEqual(140);
    expect(scrambleWordsExtended.length).toBeGreaterThanOrEqual(110);
    expect(higherLowerPairs.length).toBeGreaterThanOrEqual(110);
    expect(higherLowerPairs.filter((item) => "fun" in item)).toHaveLength(50);
    expect(new Set(labPrompts.map((item) => item.id)).size).toBe(labPrompts.length);
    expect(new Set(pairsBank.map(([term]) => term)).size).toBe(pairsBank.length);
    expect(new Set(microbePacks.map((pack) => pack.name)).size).toBe(microbePacks.length);
    expect(microbePacks.every((pack) => pack.words.every((word) => word.length <= 14))).toBe(true);
    expect(new Set(triageCases.map((item) => item.id)).size).toBe(triageCases.length);
    expect(medleWords.every((word) => /^[A-Z]{5}$/.test(word))).toBe(true);
    expect(new Set(medleWords).size).toBe(medleWords.length);
    expect(new Set(scrambleWordsExtended.map(([word]) => word)).size).toBe(scrambleWordsExtended.length);
    expect(triageCases.every((item) => item.steps.length === 4)).toBe(true);
    expect(diagnosisCases.length).toBeGreaterThanOrEqual(220);
    expect(nextStepCases.length).toBeGreaterThanOrEqual(220);
    const latestAnswers = nextStepCases.slice(-20).map((item) => item.answer);
    expect([0, 1, 2, 3].map((position) => latestAnswers.filter((answer) => answer === position).length)).toEqual([5, 5, 5, 5]);
    const latestDiagnosis = diagnosisCases.slice(-20).map((item) => item.options.indexOf(item.answer));
    expect([0, 1, 2, 3].map((position) => latestDiagnosis.filter((answer) => answer === position).length)).toEqual([5, 5, 5, 5]);
  });

  it("keeps clinical case IDs unique and answer keys valid", () => {
    expect(new Set(diagnosisCases.map((item) => item.id)).size).toBe(diagnosisCases.length);
    expect(new Set(nextStepCases.map((item) => item.id)).size).toBe(nextStepCases.length);
    for (const item of diagnosisCases) {
      expect(item.clues.length).toBeGreaterThanOrEqual(2);
      expect(item.options).toContain(item.answer);
      expect(item.source.length).toBeGreaterThan(0);
    }
    for (const item of nextStepCases) {
      expect(item.options[item.answer]).toBeDefined();
      expect(item.source.length).toBeGreaterThan(0);
    }
  });

  it("keeps lab, triage, memory, and microbe records usable", () => {
    expect(new Set(labPrompts.map((item) => item.id)).size).toBe(labPrompts.length);
    expect(labPrompts.every((item) => Number.isFinite(item.value) && item.tolerance >= 0)).toBe(true);
    expect(new Set(triageCases.map((item) => item.id)).size).toBe(triageCases.length);
    expect(triageCases.every((item) => item.steps.length >= 3)).toBe(true);
    expect(new Set(pairsBank.map((item) => item[0])).size).toBe(pairsBank.length);
    expect(new Set(microbePacks.map((item) => item.name)).size).toBe(microbePacks.length);
  });

  it("keeps added word and comparison banks structurally valid", () => {
    expect(new Set(scrambleWordsExtended.map((item) => item[0])).size).toBe(scrambleWordsExtended.length);
    expect(scrambleWordsExtended.every((item) => item[0].length >= 4 && item[1].length > 0)).toBe(true);
    expect(higherLowerPairs.every((item) => Number.isFinite(item.av) && Number.isFinite(item.bv))).toBe(true);
    for (const ladder of wordLadders) {
      expect(ladder.path[0]).toBe(ladder.start);
      expect(ladder.path[ladder.path.length - 1]).toBe(ladder.end);
      for (let i = 1; i < ladder.path.length; i++) {
        expect([...ladder.path[i - 1]].filter((letter, index) => letter !== ladder.path[i][index]), ladder.path.join(" → ")).toHaveLength(1);
      }
    }
  });
});


describe("new arcade content banks", () => {
  it("keeps the daily deep-dive prompts broad, unique, and tiered", () => {
    expect(deepDivePrompts.length).toBeGreaterThanOrEqual(70);
    expect(new Set(deepDivePrompts.map((prompt) => prompt.id)).size).toBe(deepDivePrompts.length);
    for (const prompt of deepDivePrompts) {
      expect(prompt.prompt.length, prompt.id).toBeGreaterThan(12);
      expect(prompt.answers.length, prompt.id).toBeGreaterThanOrEqual(6);
      const normalized = prompt.answers.map((item) => item.answer.toLowerCase().trim());
      expect(new Set(normalized).size, prompt.id).toBe(normalized.length);
      expect(prompt.answers.every((item) => item.answer.length > 1 && item.tier >= 1 && item.tier <= 6), prompt.id).toBe(true);
    }
  });

  it("keeps Trivia Rumble balanced across six categories with valid choices", () => {
    expect(triviaCategories).toHaveLength(6);
    expect(triviaQuestions.length).toBeGreaterThanOrEqual(365);
    expect(new Set(triviaCategories.map((category) => category.id)).size).toBe(6);
    expect(new Set(triviaQuestions.map((question) => question.id)).size).toBe(triviaQuestions.length);
    for (const category of triviaCategories) {
      expect(triviaQuestions.filter((question) => question.category === category.id).length, category.id).toBeGreaterThanOrEqual(8);
    }
    for (const question of triviaQuestions) {
      expect(question.options).toHaveLength(4);
      expect(new Set(question.options).size, question.id).toBe(4);
      expect(question.answer, question.id).toBeGreaterThanOrEqual(0);
      expect(question.answer, question.id).toBeLessThan(4);
      expect(question.explanation.length, question.id).toBeGreaterThan(15);
    }
  });
});
