import { describe, expect, it } from "vitest";
import { ARCHIVE_START_DAY, archiveDays, isArchiveDay, resultsForDay } from "./archive";
import type { GameResult } from "./storage";

const r = (date: string, game: string, scope = "general", archive = false): GameResult => ({
  date, game: game as GameResult["game"], scope, score: 50, maxScore: 100, perfect: false, durationSeconds: 30,
  ...(archive ? { archive: true } : {})
});

describe("the round archive", () => {
  it("is empty on the launch day itself, because today is always the daily", () => {
    expect(archiveDays(ARCHIVE_START_DAY)).toEqual([]);
  });
  it("opens the launch day the day after, most recent first", () => {
    expect(archiveDays("2026-11-28")).toEqual(["2026-11-27"]);
    expect(archiveDays("2026-11-30")).toEqual(["2026-11-29", "2026-11-28", "2026-11-27"]);
  });
  it("never offers today or a future day, and never a day before launch", () => {
    const days = archiveDays("2026-12-02");
    expect(days).not.toContain("2026-12-02");
    expect(days[days.length - 1]).toBe(ARCHIVE_START_DAY);
    expect(isArchiveDay("2026-11-26", "2026-12-02")).toBe(false);
    expect(isArchiveDay("2026-12-02", "2026-12-02")).toBe(false);
    expect(isArchiveDay("2026-12-01", "2026-12-02")).toBe(true);
  });
  it("collects a day results in one scope, archive plays included", () => {
    const results = [r("2026-11-28", "medle"), r("2026-11-28", "hive", "general", true), r("2026-11-28", "trail", "specialty:internal"), r("2026-11-27", "medle")];
    expect(resultsForDay(results, "2026-11-28", "general").map((x) => x.game)).toEqual(["medle", "hive"]);
  });
});
