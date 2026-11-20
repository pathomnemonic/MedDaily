import { describe, expect, it } from "vitest";
import { SCALE_CATEGORIES, scaleItems, type ScaleCategory } from "./dataScale";
import { formatScale, pickScaleRounds, scaleFactor, scaleScore, tickLabel } from "./scaleLogic";

describe("Scale Lab scoring", () => {
  it("gives full marks within 25% and nothing at 20x off", () => {
    expect(scaleScore(100, 100)).toBe(100);
    expect(scaleScore(120, 100)).toBe(100);
    expect(scaleScore(80, 100)).toBe(100);
    expect(scaleScore(2000, 100)).toBe(0);
    expect(scaleScore(5, 100)).toBe(0);
  });
  it("falls steadily as the guess gets worse, in both directions", () => {
    const up = [1.5, 2, 5, 10, 15].map((k) => scaleScore(100 * k, 100));
    const down = [1.5, 2, 5, 10, 15].map((k) => scaleScore(100 / k, 100));
    for (const row of [up, down]) for (let i = 1; i < row.length; i++) expect(row[i]).toBeLessThan(row[i - 1]);
    expect(scaleScore(200, 100)).toBe(scaleScore(50, 100));
  });
  it("rejects invalid guesses", () => {
    expect([scaleScore(0, 5), scaleScore(-3, 5), scaleScore(NaN, 5), scaleScore(5, 0)]).toEqual([0, 0, 0, 0]);
    expect(scaleFactor(50, 100)).toBe(2);
  });
});

describe("Scale Lab formatting", () => {
  it("uses natural units", () => {
    expect(formatScale("mass", 0.003)).toBe("3 mg");
    expect(formatScale("mass", 1500)).toBe("1.5 kg");
    expect(formatScale("length", 7.5e-6)).toBe("7.5 µm");
    expect(formatScale("volume", 0.15)).toBe("150 mL");
    expect(formatScale("count", 8.6e10)).toBe("86 billion");
    expect(formatScale("time", 0.8)).toBe("800 ms");
    expect(formatScale("time", 7200)).toBe("2 hours");
    expect(tickLabel("count", 1e6)).toBe("1M");
  });
});

describe("Scale Lab content", () => {
  const cats = Object.keys(SCALE_CATEGORIES) as ScaleCategory[];
  it("has unique ids, enough items per category, and every value inside its fixed ruler", () => {
    expect(new Set(scaleItems.map((x) => x.id)).size).toBe(scaleItems.length);
    for (const cat of cats) {
      const items = scaleItems.filter((x) => x.cat === cat);
      expect(items.length, cat).toBeGreaterThanOrEqual(20);
      const { min, max } = SCALE_CATEGORIES[cat];
      for (const x of items) { expect(x.value, x.id).toBeGreaterThanOrEqual(min); expect(x.value, x.id).toBeLessThanOrEqual(max); expect(x.fact.length, x.id).toBeGreaterThan(8); }
    }
  });
  it("keeps landmarks on the ruler and never reveals an answer in the pre-answer text", () => {
    for (const cat of cats) {
      const { min, max, landmarks } = SCALE_CATEGORIES[cat];
      for (const l of landmarks) { expect(l.value).toBeGreaterThanOrEqual(min); expect(l.value).toBeLessThanOrEqual(max); }
    }
    // The item name is shown before answering, so it must not contain the answer's own number.
    for (const x of scaleItems) {
      const num = formatScale(x.cat, x.value).split(" ")[0];
      expect(new RegExp("(^|[^0-9.])" + num.replace(".", "\\.") + "([^0-9]|$)").test(x.name), x.id + " name leaks " + num).toBe(false);
    }
  });
  it("builds four rounds of two distinct items per seed, with items well apart", () => {
    for (let seed = 0; seed < 200; seed++) {
      const rounds = pickScaleRounds(seed);
      expect(rounds.map((r) => r.cat).slice(0, 3)).toEqual(["mass", "length", "time"]);
      for (const r of rounds) {
        expect(r.items[0].id).not.toBe(r.items[1].id);
        expect(Math.abs(Math.log10(r.items[0].value / r.items[1].value)), r.cat + seed).toBeGreaterThanOrEqual(0.5);
      }
    }
    expect(pickScaleRounds(7)).toEqual(pickScaleRounds(7));
  });
});
