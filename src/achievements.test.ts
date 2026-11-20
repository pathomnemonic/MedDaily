import { describe, expect, it } from "vitest";
import { computeTrophies, longestStreak } from "./achievements";
import type { PlayerData } from "./storage";

const base = (results: PlayerData["results"]): PlayerData => ({ results, bests: {}, sound: true, music: true, xp: 0, reducedMotion: false, hideStreaks: false });
const r = (date: string, game: string, extra: object = {}) => ({ date, game: game as never, scope: "general", score: 50, maxScore: 100, perfect: false, durationSeconds: 30, ...extra });
const LISTED_GAME_IDS = [
  "medle", "diagnosis", "trivia", "dive", "horses", "blackout", "cross", "branch", "scale", "connections",
  "trail", "crossword", "lettergrid", "hive", "riddle", "higher", "pairs", "mime", "casefile", "splice",
  "glyph", "labline", "ladder"
];

describe("trophies", () => {
  it("starts empty and unlocks with progress", () => {
    expect(computeTrophies(base([]), LISTED_GAME_IDS as never[]).every((t) => !t.earned)).toBe(true);
    const earned = (data: PlayerData) => computeTrophies(data, LISTED_GAME_IDS as never[]).filter((t) => t.earned).map((t) => t.id);
    expect(earned(base([r("2026-11-01", "medle", { perfect: true, score: 100 })]))).toEqual(expect.arrayContaining(["first", "perfect", "wordsmith"]));
    expect(earned(base([r("2026-11-01", "medle"), r("2026-11-01", "dive"), r("2026-11-01", "trivia")]))).toContain("three");
  });
  it("requires every listed game, not hidden or retired games, for Arcade Cleared", () => {
    const incomplete = LISTED_GAME_IDS.slice(0, -1).map((game) => r("2026-11-01", game));
    expect(computeTrophies(base(incomplete), LISTED_GAME_IDS as never[]).find((t) => t.id === "full")?.earned).toBe(false);
    const complete = LISTED_GAME_IDS.map((game) => r("2026-11-01", game));
    expect(computeTrophies(base(complete), LISTED_GAME_IDS as never[]).find((t) => t.id === "full")?.earned).toBe(true);
    expect(LISTED_GAME_IDS).toHaveLength(23);
    const withLegacy = [...incomplete, r("2026-11-01", "bodymap"), r("2026-11-01", "triage")];
    expect(computeTrophies(base(withLegacy), LISTED_GAME_IDS as never[]).find((t) => t.id === "full")?.earned).toBe(false);
  });
  it("counts the longest streak across gaps", () => {
    const days = ["2026-11-01", "2026-11-02", "2026-11-03", "2026-11-10", "2026-11-11"].map((d) => r(d, "medle"));
    expect(longestStreak(base(days))).toBe(3);
    expect(longestStreak(base([]))).toBe(0);
  });
});
