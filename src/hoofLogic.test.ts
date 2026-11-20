import { describe, expect, it } from "vitest";
import { hoofPrompts } from "./dataHoofbeats";
import { hoofPoints, hoofRank, hoofScore, matchHoof, pickHoofPrompts, promptMax, sortedAnswers, HOOF_ROUNDS } from "./hoofLogic";

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

describe("Hoofbeats content", () => {
  it("has plenty of prompts with unique ids", () => {
    expect(hoofPrompts.length).toBeGreaterThanOrEqual(52);
    expect(new Set(hoofPrompts.map((p) => p.id)).size).toBe(hoofPrompts.length);
    expect(new Set(hoofPrompts.map((p) => p.prompt)).size).toBe(hoofPrompts.length);
  });
  it("has sensible weighted answer boards: shares add to at most 100, a clear horse, and at least one zebra", () => {
    for (const p of hoofPrompts) {
      const total = p.answers.reduce((n, a) => n + a.pct, 0);
      expect(total, p.id + " " + p.prompt).toBeLessThanOrEqual(100.5);
      expect(total, p.id).toBeGreaterThanOrEqual(50);
      expect(p.answers.length, p.id).toBeGreaterThanOrEqual(6);
      expect(p.answers.length, p.id).toBeLessThanOrEqual(16);
      expect(sortedAnswers(p)[0].pct, p.id + " top answer").toBeGreaterThanOrEqual(12);
      expect(Math.min(...p.answers.map((a) => a.pct)), p.id + " needs a long tail").toBeLessThanOrEqual(5);
      expect(p.note.length, p.id).toBeGreaterThan(20);
    }
  });
  it("never repeats an answer or alias inside a prompt, and the prompt never contains an answer", () => {
    for (const p of hoofPrompts) {
      const seen = new Map<string, string>();
      for (const a of p.answers) for (const key of [a.name, ...a.aliases].map(norm)) {
        expect(seen.has(key) && seen.get(key) !== a.name, p.id + " duplicate '" + key + "'").toBe(false);
        seen.set(key, a.name);
      }
      for (const a of p.answers) if (norm(a.name).length >= 6) expect(new RegExp("\\b" + norm(a.name) + "\\b").test(norm(p.prompt)), p.id + " prompt contains " + a.name).toBe(false);
    }
  });
});

describe("Hoofbeats scoring and matching", () => {
  it("scores ten points per percent, so zebras score almost nothing", () => {
    expect(hoofPoints(45)).toBe(450);
    expect(hoofPoints(35)).toBe(350);
    expect(hoofPoints(0.1)).toBe(1);
    expect(hoofPoints(0.7)).toBe(7);
  });
  it("normalizes a day's total against the best possible total", () => {
    const day = pickHoofPrompts(1);
    const max = day.reduce((n, p) => n + promptMax(p), 0);
    expect(hoofScore(max, max)).toBe(100);
    expect(hoofScore(max / 2, max)).toBe(50);
    expect(hoofScore(0, max)).toBe(0);
  });
  it("ranks answers from horse to zebra", () => {
    expect(hoofRank(45).icon).toBe("🐴");
    expect(hoofRank(8).label).toBe("A pony");
    expect(hoofRank(2).label).toBe("A donkey");
    expect(hoofRank(0.1).icon).toBe("🦓");
  });
  it("matches typed answers, aliases and small typos", () => {
    const pancreatitis = hoofPrompts[0];
    expect(matchHoof("gallstones", pancreatitis)?.answer.name).toBe("Gallstones");
    expect(matchHoof("Biliary", pancreatitis)?.answer.name).toBe("Gallstones");
    expect(matchHoof("hypertriglyceridemai", pancreatitis)?.answer.name).toBe("Hypertriglyceridemia");
    expect(matchHoof("tityus trinitatis", pancreatitis)?.answer.name).toBe("Scorpion sting");
    expect(matchHoof("a banana", pancreatitis)).toBeNull();
  });
  it("picks seven distinct prompts per day, deterministically", () => {
    for (let s = 0; s < 100; s++) { const day = pickHoofPrompts(s); expect(day).toHaveLength(HOOF_ROUNDS); expect(new Set(day.map((p) => p.id)).size).toBe(HOOF_ROUNDS); }
    expect(pickHoofPrompts(9).map((p) => p.id)).toEqual(pickHoofPrompts(9).map((p) => p.id));
  });
});
