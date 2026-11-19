import { describe, expect, it } from "vitest";
import { riddleOptions, riddles } from "./dataRiddles";
import { mimeDeck } from "./dataMime";
import { seeded } from "./lib";

describe("Riddle Lab content", () => {
  it("has unique answers, four substantive clues, and enough same-kind distractors", () => {
    expect(riddles.length).toBeGreaterThanOrEqual(50);
    expect(new Set(riddles.map((r) => r.answer)).size).toBe(riddles.length);
    expect(new Set(riddles.map((r) => r.id)).size).toBe(riddles.length);
    for (const riddle of riddles) {
      expect(riddle.clues).toHaveLength(4);
      expect(riddle.clues.every((c) => c.length > 8), riddle.id).toBe(true);
      // The answer must not be spelled out in the early clues.
      const head = riddle.answer.toLowerCase().split(/\s+/)[0];
      if (head.length > 5) expect(riddle.clues[0].toLowerCase().includes(head), riddle.id + " clue 1 leaks the answer").toBe(false);
      expect(riddles.filter((r) => r.kind === riddle.kind).length, riddle.kind).toBeGreaterThanOrEqual(8);
    }
  });
  it("offers four unique options including the answer", () => {
    for (const riddle of riddles) {
      const options = riddleOptions(riddle, seeded(7));
      expect(options).toHaveLength(4);
      expect(new Set(options).size).toBe(4);
      expect(options).toContain(riddle.answer);
    }
  });
});

describe("Mime Time deck", () => {
  it("is large, unique, and has no empty prompts", () => {
    expect(mimeDeck.length).toBeGreaterThanOrEqual(100);
    expect(new Set(mimeDeck.map((m) => m.term.toLowerCase())).size).toBe(mimeDeck.length);
    expect(mimeDeck.every((m) => m.term.trim().length > 3)).toBe(true);
  });
});

import { crosswordBank } from "./dataCrossword";
import { isValid, makeCrossword } from "./crosswordGen";

describe("Mini Crossword", () => {
  it("has a clean clue bank", () => {
    expect(crosswordBank.length).toBeGreaterThanOrEqual(100);
    const words = crosswordBank.map(([w]) => w);
    expect(new Set(words).size).toBe(words.length);
    for (const [word, clue] of crosswordBank) {
      expect(word, word).toMatch(/^[A-Z]{4,8}$/);
      expect(clue.length, word).toBeGreaterThan(5);
      expect(clue.toUpperCase().includes(word), word + " clue contains its answer").toBe(false);
    }
  });
  it("generates valid, deterministic grids for many seeds", () => {
    for (let seed = 1; seed <= 120; seed++) {
      const cw = makeCrossword(seed);
      expect(isValid(cw), "seed " + seed).toBe(true);
      expect(cw.words.length).toBeGreaterThanOrEqual(6);
      expect(new Set(cw.words.map((w) => w.word)).size).toBe(cw.words.length);
    }
    expect(JSON.stringify(makeCrossword(5))).toBe(JSON.stringify(makeCrossword(5)));
  });
});

import { microbePacks } from "./data";
import { makeTrailPuzzle, trailPackOk } from "./trailLogic";

describe("Theme Trail boards", () => {
  it("lays out every word pack with adjacent, non-overlapping paths and a board-spanning trail word", () => {
    const packs = microbePacks.filter(trailPackOk);
    expect(packs.length).toBeGreaterThanOrEqual(25);
    for (const pack of packs) {
      for (const seed of [1, 2, 3]) {
        const puzzle = makeTrailPuzzle(pack, seed);
        const used = new Set<number>();
        for (const word of puzzle.words) {
          const path = puzzle.paths[word];
          expect(path, pack.name + " " + word).toBeDefined();
          expect(path).toHaveLength(word.length);
          path.forEach((cell, i) => {
            expect(used.has(cell), pack.name + " overlap " + word).toBe(false);
            used.add(cell);
            expect(puzzle.grid[Math.floor(cell / puzzle.columns)][cell % puzzle.columns]).toBe(word[i]);
            if (i > 0) {
              const prev = path[i - 1];
              expect(Math.abs(Math.floor(cell / puzzle.columns) - Math.floor(prev / puzzle.columns))).toBeLessThanOrEqual(1);
              expect(Math.abs((cell % puzzle.columns) - (prev % puzzle.columns))).toBeLessThanOrEqual(1);
            }
          });
        }
        const rows = puzzle.paths[puzzle.trail].map((c) => Math.floor(c / puzzle.columns));
        expect(rows).toContain(0);
        expect(rows).toContain(puzzle.rows - 1);
        expect(makeTrailPuzzle(pack, seed).grid).toEqual(puzzle.grid);
      }
    }
  });
});
