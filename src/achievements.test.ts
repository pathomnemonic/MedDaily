import { describe, expect, it } from "vitest";
import { computeTrophies, longestStreak } from "./achievements";
import type { PlayerData } from "./storage";

const base = (results: PlayerData["results"]): PlayerData => ({ results, bests: {}, sound: true, music: true, reducedMotion: false, hideStreaks: false });
const r = (date: string, game: string, extra: object = {}) => ({ date, game: game as never, scope: "general", score: 50, maxScore: 100, perfect: false, durationSeconds: 30, ...extra });

describe("trophies", () => {
  it("starts empty and unlocks with progress", () => {
    expect(computeTrophies(base([]), 16).every((t) => !t.earned)).toBe(true);
    const earned = (data: PlayerData) => computeTrophies(data, 16).filter((t) => t.earned).map((t) => t.id);
    expect(earned(base([r("2026-11-01", "medle", { perfect: true, score: 100 })]))).toEqual(expect.arrayContaining(["first", "perfect", "wordsmith"]));
    expect(earned(base([r("2026-11-01", "medle"), r("2026-11-01", "dive"), r("2026-11-01", "trivia")]))).toContain("three");
  });
  it("counts the longest streak across gaps", () => {
    const days = ["2026-11-01", "2026-11-02", "2026-11-03", "2026-11-10", "2026-11-11"].map((d) => r(d, "medle"));
    expect(longestStreak(base(days))).toBe(3);
    expect(longestStreak(base([]))).toBe(0);
  });
});
