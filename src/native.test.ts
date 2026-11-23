import { describe, expect, it } from "vitest";
import { NATIVE_AUTH_REDIRECT, loadReminder, parseAuthCallback, planReminders } from "./native";

describe("native sign-in return link", () => {
  it("reads the code from the query or the fragment", () => {
    expect(parseAuthCallback(NATIVE_AUTH_REDIRECT + "?code=abc123")).toEqual({ code: "abc123", error: undefined });
    expect(parseAuthCallback(NATIVE_AUTH_REDIRECT + "#code=xyz")?.code).toBe("xyz");
  });
  it("surfaces a provider error and ignores unrelated links", () => {
    expect(parseAuthCallback(NATIVE_AUTH_REDIRECT + "?error=access_denied&error_description=User+cancelled")?.error).toBe("User cancelled");
    expect(parseAuthCallback("https://example.com/?code=1")).toBeNull();
    expect(parseAuthCallback("com.pathomnemonic.roundsy://other?code=1")).toBeNull();
  });
  it("falls back to a sensible reminder when nothing valid is stored", () => {
    expect(loadReminder()).toEqual({ on: false, hour: 19, minute: 0 });
  });
});

describe("daily reminder plan", () => {
  const on = { on: true, hour: 19, minute: 0 };
  const now = new Date(2026, 10, 23, 10, 0); // Monday 10:00 local
  it("is empty when reminders are off", () => {
    expect(planReminders(now, { ...on, on: false }, { playedDays: new Set(), streak: 5 })).toEqual([]);
  });
  it("plans one notification per day for a week at the chosen time", () => {
    const plan = planReminders(now, on, { playedDays: new Set(), streak: 0 });
    expect(plan).toHaveLength(7);
    expect(plan.every((p) => p.at.getHours() === 19 && p.at.getMinutes() === 0)).toBe(true);
    expect(new Set(plan.map((p) => p.id)).size).toBe(7);
    expect(plan[0].body).toMatch(/ready/);
  });
  it("mentions the streak on the first reminder when one is worth protecting", () => {
    expect(planReminders(now, on, { playedDays: new Set(), streak: 6 })[0].body).toMatch(/6-day streak/);
    expect(planReminders(now, on, { playedDays: new Set(), streak: 6 })[1].body).not.toMatch(/streak/);
  });
  it("skips a day the player already played and a time that has passed", () => {
    const first = planReminders(now, on, { playedDays: new Set(), streak: 0 })[0].at.toISOString().slice(0, 10);
    const plan = planReminders(now, on, { playedDays: new Set([first]), streak: 4 });
    expect(plan[0].at.toISOString().slice(0, 10)).not.toBe(first);
    const late = planReminders(new Date(2026, 10, 23, 20, 0), on, { playedDays: new Set(), streak: 0 });
    expect(late[0].at.getDate()).toBe(24);
  });
});
