import { describe, expect, it } from "vitest";
import { freezesLeft, planFreezes } from "./freezes";
import type { GameResult } from "./storage";

const play = (date: string, archive = false): GameResult => ({
  date, game: "medle", scope: "general", score: 50, maxScore: 100, perfect: false, durationSeconds: 30,
  ...(archive ? { archive: true } : {})
});

const TODAY = "2026-11-24";

describe("streak freeze planning", () => {
  it("does nothing for a free player", () => {
    expect(planFreezes([play("2026-11-22")], [], TODAY, false)).toEqual([]);
  });
  it("does nothing with no plays or when yesterday was played", () => {
    expect(planFreezes([], [], TODAY, true)).toEqual([]);
    expect(planFreezes([play("2026-11-23")], [], TODAY, true)).toEqual([]);
    expect(planFreezes([play(TODAY)], [], TODAY, true)).toEqual([]);
  });
  it("covers a single missed day", () => {
    expect(planFreezes([play("2026-11-22")], [], TODAY, true)).toEqual(["2026-11-23"]);
  });
  it("covers two missed days when two freezes remain", () => {
    expect(planFreezes([play("2026-11-21")], [], TODAY, true)).toEqual(["2026-11-22", "2026-11-23"]);
  });
  it("spends nothing on a gap of three or more days", () => {
    expect(planFreezes([play("2026-11-20")], [], TODAY, true)).toEqual([]);
    expect(planFreezes([play("2026-11-01")], [], TODAY, true)).toEqual([]);
  });
  it("spends nothing when the month grant is partly used and cannot cover the gap", () => {
    expect(planFreezes([play("2026-11-21")], ["2026-11-05"], TODAY, true)).toEqual([]);
  });
  it("only covers the days no earlier freeze already covered", () => {
    expect(planFreezes([play("2026-11-21")], ["2026-11-22"], TODAY, true)).toEqual(["2026-11-23"]);
  });
  it("does not let last month frozen days eat this month grant", () => {
    expect(freezesLeft(["2026-10-30", "2026-10-31"], TODAY)).toBe(2);
    expect(planFreezes([play("2026-11-21")], ["2026-10-30", "2026-10-31"], TODAY, true)).toEqual(["2026-11-22", "2026-11-23"]);
  });
  it("ignores archive plays when finding the last played day", () => {
    const results = [play("2026-11-21"), play("2026-11-23", true)];
    expect(planFreezes(results, [], TODAY, true)).toEqual(["2026-11-22", "2026-11-23"]);
  });
  it("counts the month grant by the frozen days inside the current month", () => {
    expect(freezesLeft([], TODAY)).toBe(2);
    expect(freezesLeft(["2026-11-02"], TODAY)).toBe(1);
    expect(freezesLeft(["2026-11-02", "2026-11-09", "2026-11-16"], TODAY)).toBe(0);
  });
});
