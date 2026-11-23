import { describe, expect, it } from "vitest";
import { averageByGroup, bestStreak, scoreDistribution, streakCalendar } from "./statsInsights";
import type { GameResult } from "./storage";

const r = (date: string, game = "medle", score = 50, maxScore = 100): GameResult => ({ date, game: game as GameResult["game"], scope: "general", score, maxScore, perfect: false, durationSeconds: 10 });

describe("stats insights", () => {
  it("finds the best streak across gaps", () => {
    expect(bestStreak([r("2026-11-01"), r("2026-11-02"), r("2026-11-03"), r("2026-11-05"), r("2026-11-06")])).toBe(3);
    expect(bestStreak([])).toBe(0);
    expect(bestStreak([r("2026-11-01"), r("2026-11-01", "hive")])).toBe(1);
  });
  it("builds a Monday-first calendar ending this week, marking today and the future", () => {
    const grid = streakCalendar([r("2026-11-23"), r("2026-11-23", "hive"), r("2026-11-17")], "2026-11-25", 3); // Wednesday
    expect(grid).toHaveLength(3);
    expect(grid.every((w) => w.length === 7)).toBe(true);
    const flat = grid.flat();
    expect(flat.find((d) => d.date === "2026-11-23")).toMatchObject({ plays: 2, future: false });
    expect(flat.find((d) => d.date === "2026-11-25")?.today).toBe(true);
    expect(flat.find((d) => d.date === "2026-11-26")?.future).toBe(true);
    expect(grid[2][0].date).toBe("2026-11-23"); // Monday of the current week
  });
  it("buckets scores by tenth, including a perfect round", () => {
    const d = scoreDistribution([r("2026-11-01", "medle", 100), r("2026-11-02", "medle", 95), r("2026-11-03", "medle", 5), r("2026-11-04", "medle", 50, 0)]);
    expect(d[9]).toBe(2);
    expect(d[0]).toBe(1);
    expect(d.reduce((a, b) => a + b, 0)).toBe(3);
  });
  it("averages by group", () => {
    const rows = averageByGroup([r("2026-11-01", "medle", 80), r("2026-11-02", "medle", 60), r("2026-11-03", "hive", 30)], (g) => (g === "medle" ? "Word" : "Logic"));
    expect(rows).toEqual([{ group: "Word", rounds: 2, average: 70 }, { group: "Logic", rounds: 1, average: 30 }]);
  });
});
