import { describe, expect, it } from "vitest";
import { nextDailyLabel } from "./dailyTime";

describe("next daily puzzle time", () => {
  it("is 5:00 PM today in Phoenix, since the daily changes at midnight UTC", () => {
    const l = nextDailyLabel(new Date("2026-11-23T20:00:00Z"), "America/Phoenix"); // 1 PM in Phoenix
    expect(l.when).toBe("today");
    expect(l.time).toMatch(/5:00\s?PM/i);
  });
  it("says tomorrow when the change has already passed locally", () => {
    const l = nextDailyLabel(new Date("2026-11-24T01:30:00Z"), "America/Phoenix"); // 6:30 PM Phoenix, day already flipped at 5 PM
    expect(l.when).toBe("tomorrow");
    expect(l.text).toMatch(/^tomorrow at 5:00\s?PM/i);
  });
});
