import { describe, expect, it } from "vitest";
import { connectionPuzzles, medleWords, diagnosisCases, nextStepCases, labPrompts, triageCases, pairsBank, microbePacks } from "./data";
import { deductionCases, glyphPatterns, ladderDictionary, spellingHivePuzzles, wordLadders, scrambleWordsExtended, higherLowerPairs } from "./dataExtra";
import { PARTY_GAMES, LISTED_GAME_IDS, normalizeRoomCode, randomRoomCode, roomGame, roomSeed, withRoomGame, hashSeed, lineCells, dailyDateKey, makeWordSearch, nonogramRuns, scoreWord, seeded, shuffle } from "./lib";
import { deepDiveExtras, deepDivePromptsExpanded } from "./dataDeepDiveExtra";
import { deepDivePrompts, triviaCategories, triviaQuestions } from "./dataArcade";

describe("room game choice", () => {
  it("lets the room creator pick the game through the code", () => {
    for (const game of PARTY_GAMES) expect(roomGame(randomRoomCode(seeded(3), game))).toBe(game);
    expect(roomGame(withRoomGame("ZZZZZZ", "blackout"))).toBe("blackout");
    expect(withRoomGame("K7MQ2X", "medle").slice(1)).toBe("7MQ2X");
  });
});

describe("visible game catalog", () => {
  it("contains 23 unique playable game IDs and excludes the hidden body-map game", () => {
    expect(LISTED_GAME_IDS).toHaveLength(23);
    expect(new Set(LISTED_GAME_IDS).size).toBe(23);
    expect(LISTED_GAME_IDS).not.toContain("bodymap");
  });
});

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
    expect(medleWords).toHaveLength(365);
    expect(new Set(medleWords).size).toBe(365);
    expect(medleWords.every((word) => /^[A-Z]{5}$/.test(word))).toBe(true);
  });

  it("keeps the 365-board Quad Squad bank at four groups of four unique tiles", () => {
    expect(connectionPuzzles).toHaveLength(365);
    for (const board of connectionPuzzles) {
      expect(board).toHaveLength(4);
      expect(new Set(board.map((group) => group.category.toLowerCase())).size, JSON.stringify(board)).toBe(4);
      const words = board.flatMap((group) => group.words);
      expect(words).toHaveLength(16);
      expect(new Set(words.map((word) => word.toLowerCase())).size, JSON.stringify(board)).toBe(16);
    }
  });
});

describe("additional daily puzzle packs", () => {
  it("keeps the playable Spelling Hive pool medical-focused and title-unique", () => {
    const playable = spellingHivePuzzles.filter((puzzle) => !["Practice Round", "Capture the Clue", "Tricone Terms"].includes(puzzle.title));
    expect(playable.length).toBeGreaterThanOrEqual(365);
    expect(playable.every((puzzle) => puzzle.words.length >= 8)).toBe(true);
    expect(new Set(playable.map((puzzle) => puzzle.title)).size).toBe(playable.length);
    const signatures = playable.map((puzzle) => [...puzzle.letters].sort().join("") + "|" + puzzle.center + "|" + [...puzzle.words].sort().join(","));
    expect(new Set(signatures).size).toBe(playable.length);
  });
  it("keeps every Seven Cells bank internally valid", () => {
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
      expect(new Set(puzzle.pangram.split("")).size).toBe(7);
      expect(puzzle.letters.every((letter) => puzzle.pangram.includes(letter))).toBe(true);
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

  it("gives each hidden picture exactly one solution from its row and column runs", () => {
    expect(glyphPatterns.length).toBeGreaterThanOrEqual(24);
    expect(new Set(glyphPatterns.map((puzzle) => JSON.stringify(puzzle.pattern))).size).toBe(glyphPatterns.length);
    expect(new Set(glyphPatterns.map((puzzle) => puzzle.name)).size).toBe(glyphPatterns.length);
    for (const puzzle of glyphPatterns) {
      const pattern = puzzle.pattern;
      const width = pattern[0].length;
      expect(width).toBeGreaterThanOrEqual(10);
      expect(width).toBeLessThanOrEqual(12);
      expect(pattern.every((row) => row.length === width && row.every((cell) => cell === 0 || cell === 1)), puzzle.name).toBe(true);
      const rowClues = pattern.map(runs);
      const colClues = pattern[0].map((_, c) => runs(pattern.map((row) => row[c])));
      const rowOptions = rowClues.map((clue) =>
        Array.from({ length: 1 << width }, (_, mask) => Array.from({ length: width }, (_, c) => (mask >> c) & 1))
          .filter((row) => JSON.stringify(runs(row)) === JSON.stringify(clue))
      );
      // a partial column is viable when its finished runs match the clue's start and its open run still fits the next number
      const viable = (col: number[], clue: number[]) => {
        const all = runs(col);
        const closed = col[col.length - 1] ? all.slice(0, -1) : all;
        if (closed.length > clue.length || closed.some((n, i) => n !== clue[i])) return false;
        return col[col.length - 1] ? all[all.length - 1] <= (clue[closed.length] ?? 0) : true;
      };
      let solutions = 0;
      const rows: number[][] = [];
      const visit = (r: number) => {
        if (solutions > 1) return;
        if (r === pattern.length) {
          if (colClues.every((clue, c) => JSON.stringify(runs(rows.map((row) => row[c]))) === JSON.stringify(clue))) solutions++;
          return;
        }
        for (const candidate of rowOptions[r]) {
          rows[r] = candidate;
          if (colClues.every((clue, c) => viable(rows.slice(0, r + 1).map((row) => row[c]), clue))) visit(r + 1);
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
    expect(wordLadders).toHaveLength(50);
    expect(new Set(wordLadders.map((item) => item.start + "→" + item.end)).size).toBe(wordLadders.length);
    for (const ladder of wordLadders) {
      expect(ladder.path[0]).toBe(ladder.start);
      expect(ladder.path[ladder.path.length - 1]).toBe(ladder.end);
      expect(new Set(ladder.path).size).toBe(ladder.path.length);
      expect(ladder.path.every((word) => ladderDictionary.has(word))).toBe(true);
      for (let i = 1; i < ladder.path.length; i++) {
        expect([...ladder.path[i - 1]].filter((letter, index) => letter !== ladder.path[i][index])).toHaveLength(1);
      }
    }
    expect(deductionCases.length).toBeGreaterThanOrEqual(15);
    expect(labPrompts).toHaveLength(365);
    expect(pairsBank.length).toBeGreaterThanOrEqual(365);
    expect(microbePacks.length).toBeGreaterThanOrEqual(68);
    expect(triageCases.length).toBeGreaterThanOrEqual(42);
    expect(medleWords.length).toBeGreaterThanOrEqual(365);
    expect(scrambleWordsExtended.length).toBeGreaterThanOrEqual(365);
    expect(higherLowerPairs.length).toBeGreaterThanOrEqual(40);
    expect(higherLowerPairs.every((item) => "fun" in item)).toBe(true);
    expect(new Set(higherLowerPairs.map((item) => item.a)).size).toBe(higherLowerPairs.length);
    expect(higherLowerPairs.filter((item) => item.av === item.bv).length).toBeLessThanOrEqual(Math.floor(higherLowerPairs.length * 0.1));
    expect(new Set(labPrompts.map((item) => item.id)).size).toBe(labPrompts.length);
    expect(new Set(labPrompts.map((item) => item.prompt.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim())).size).toBe(labPrompts.length);
    expect(new Set(pairsBank.map(([term]) => term)).size).toBe(pairsBank.length);
    const memoryBoards = new Set(Array.from({ length: 365 }, (_, day) =>
      shuffle(pairsBank, seeded(day + 11)).slice(0, 12).map(([term]) => term).sort().join("|")
    ));
    expect(memoryBoards.size).toBe(365);
    expect(new Set(microbePacks.map((pack) => pack.name)).size).toBe(microbePacks.length);
    expect(microbePacks.every((pack) => pack.words.every((word) => word.length <= 14))).toBe(true);
    expect(new Set(triageCases.map((item) => item.id)).size).toBe(triageCases.length);
    expect(medleWords.every((word) => /^[A-Z]{5}$/.test(word))).toBe(true);
    expect(new Set(medleWords).size).toBe(medleWords.length);
    expect(new Set(scrambleWordsExtended.map(([word]) => word)).size).toBe(scrambleWordsExtended.length);
    const anagramDailyDecks = new Set(Array.from({ length: 365 }, (_, day) =>
      shuffle(scrambleWordsExtended, seeded(day + 51))
        .filter(([word]) => word.length >= 5 && word.length <= 11)
        .slice(0, 5).map(([word]) => word).sort().join("|")
    ));
    expect(anagramDailyDecks.size).toBe(365);
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
    expect(labPrompts.every((item) => item.prompt.trim().length > 10 && item.context.trim().length > 10 && item.source.trim().length > 5)).toBe(true);
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
      expect(ladder.path.every((word) => ladderDictionary.has(word)), ladder.path.join(" → ")).toBe(true);
      expect(ladder.path[0]).toBe(ladder.start);
      expect(ladder.path[ladder.path.length - 1]).toBe(ladder.end);
      expect(new Set(ladder.path).size).toBe(ladder.path.length);
      expect(ladder.path.every((word) => /^[A-Z]{4,6}$/.test(word))).toBe(true);
      for (let i = 1; i < ladder.path.length; i++) {
        expect([...ladder.path[i - 1]].filter((letter, index) => letter !== ladder.path[i][index]), ladder.path.join(" → ")).toHaveLength(1);
      }
    }
  });
});


describe("new arcade content banks", () => {
  it("keeps the daily deep-dive prompts broad, unique, and tiered", () => {
    expect(deepDivePrompts).toHaveLength(79);
    expect(new Set(deepDivePrompts.map((prompt) => prompt.id)).size).toBe(deepDivePrompts.length);
    for (const prompt of deepDivePrompts) {
      expect(prompt.prompt.length, prompt.id).toBeGreaterThan(12);
      expect(prompt.answers.length, prompt.id).toBeGreaterThanOrEqual(6);
      const accepted = prompt.answers.flatMap((item) => [item.answer, ...(item.aliases ?? [])]);
      const normalized = accepted.map((answer) => answer.toLowerCase().replace(/[^a-z0-9]/g, ""));
      expect(new Set(normalized).size, prompt.id).toBe(normalized.length);
      expect(prompt.answers.every((item) => item.answer.length > 1 && Number.isInteger(item.tier) && item.tier >= 1 && item.tier <= 6), prompt.id).toBe(true);
    }
  });

  it("keeps expanded Deep Scan aliases collision-free after editorial enrichment", () => {
    expect(deepDivePromptsExpanded).toHaveLength(79);
    for (const prompt of deepDivePromptsExpanded) {
      const accepted = prompt.answers.flatMap((item) => [item.answer, ...(item.aliases ?? [])]);
      const normalized = accepted.map((answer) => answer.toLowerCase().replace(/[^a-z0-9]/g, ""));
      expect(new Set(normalized).size, prompt.id).toBe(normalized.length);
    }
  });

  it("keeps dedicated Deep Scan long-tail prompts genuinely open-ended", () => {
    const longTail = deepDivePrompts.filter((prompt) => prompt.longTail);
    expect(longTail).toHaveLength(9);
    for (const prompt of longTail) {
      expect(prompt.answers.length, prompt.id).toBeGreaterThanOrEqual(60);
      const accepted = prompt.answers.flatMap((item) => [item.answer, ...(item.aliases ?? [])]);
      const normalized = accepted.map((answer) => answer.toLowerCase().replace(/[^a-z0-9]/g, ""));
      expect(new Set(normalized).size, prompt.id).toBe(normalized.length);
      expect([1,2,3,4,5,6].map((tier) => prompt.answers.filter((item) => item.tier === tier).length), prompt.id).toEqual([10,10,10,10,10,10]);
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


import { generateMedicalLadder } from "./arcadeLogic";
import { medicalRungWords, rungDictionary } from "./dataRungs";
describe("medical Letter Rungs", () => {
  it("builds valid ladders with medical words at both ends for many seeds", () => {
    const dictionary = [...rungDictionary];
    const uniquePaths = new Set<string>();
    for (let seed = 0; seed < 365; seed++) {
      const puzzle = generateMedicalLadder(seed, dictionary, medicalRungWords);
      expect(puzzle, "seed " + seed).not.toBeNull();
      expect(medicalRungWords).toContain(puzzle!.start);
      expect(medicalRungWords).toContain(puzzle!.end);
      expect(puzzle!.path.length).toBeGreaterThanOrEqual(4);
      expect(puzzle!.path.length).toBeLessThanOrEqual(6);
      uniquePaths.add(puzzle!.path.join(">"));
      puzzle!.path.forEach((word, i) => {
        expect(rungDictionary.has(word), word).toBe(true);
        if (i > 0) expect([...word].filter((c, k) => c !== puzzle!.path[i - 1][k])).toHaveLength(1);
      });
    }
    expect(uniquePaths.size).toBe(365);
    expect(generateMedicalLadder(7, dictionary, medicalRungWords)).toEqual(generateMedicalLadder(7, dictionary, medicalRungWords));
  });
});

describe("party room codes", () => {
  it("maps the same code to the same party-friendly game and puzzle on every device", () => {
    expect(PARTY_GAMES).toHaveLength(15);
    expect(new Set(PARTY_GAMES).size).toBe(PARTY_GAMES.length);
    expect(PARTY_GAMES).not.toContain("bodymap");
    expect(PARTY_GAMES.every((game) => LISTED_GAME_IDS.includes(game))).toBe(true);
    expect(roomGame("abc 123")).toBe(roomGame("ABC123"));
    expect(roomSeed("abc123")).toBe(roomSeed("ABC-123"));
    expect(PARTY_GAMES).toContain(roomGame("K7MQ2X"));
    expect(PARTY_GAMES).not.toContain("trivia");
    expect(PARTY_GAMES).not.toContain("casefile");
  });
  it("spreads codes across several games and generates valid codes", () => {
    const games = new Set(Array.from({ length: 200 }, (_, i) => roomGame(randomRoomCode(seeded(i + 1)))));
    expect(games.size).toBeGreaterThanOrEqual(4);
    expect(normalizeRoomCode(randomRoomCode())).toHaveLength(6);
  });
});


describe("Deep Scan supplement", () => {
  it("targets only real prompts and answers, and merges without collisions", () => {
    for (const [id, extra] of Object.entries(deepDiveExtras)) {
      const base = deepDivePrompts.find((p) => p.id === id);
      expect(base, id).toBeDefined();
      for (const target of Object.keys(extra.alias ?? {})) {
        expect(base!.answers.some((a) => a.answer.toLowerCase() === target.toLowerCase()), id + " alias target " + target).toBe(true);
      }
    }
    for (const prompt of deepDivePromptsExpanded) {
      const forms = prompt.answers.flatMap((a) => [a.answer, ...(a.aliases ?? [])].map((f) => f.toLowerCase().replace(/[^a-z0-9]/g, "")));
      expect(new Set(forms).size, prompt.id + " has a duplicate accepted form").toBe(forms.length);
      expect(prompt.answers.every((a) => a.tier >= 1 && a.tier <= 6), prompt.id).toBe(true);
    }
  });
  it("widens every prompt's accepted set substantially", () => {
    const base = deepDivePrompts.reduce((n, p) => n + p.answers.length, 0);
    const grown = deepDivePromptsExpanded.reduce((n, p) => n + p.answers.length, 0);
    expect(grown).toBeGreaterThan(base * 1.5);
    expect(deepDivePromptsExpanded.every((p) => p.answers.length >= 12)).toBe(true);
  });
});
