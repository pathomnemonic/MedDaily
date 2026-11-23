import { describe, expect, it } from "vitest";
import { GIVE_UP_MAX, giveUpPoints } from "./sketchScore";

const pattern = Array.from({ length: 10 }, (_, r) => Array.from({ length: 10 }, (_, c) => ((r + c) % 3 === 0 ? 1 : 0)));
const blank = pattern.map((row) => row.map(() => 0));

describe("Cell Sketch give-up credit", () => {
  it("is zero when the player gives up before touching anything", () => {
    expect(giveUpPoints(pattern, blank)).toBe(0);
  });
  it("counts only cells the player set correctly, scaled to the real cell count", () => {
    const half = blank.map((row, r) => row.map((_, c) => (r < 5 ? (pattern[r][c] === 1 ? 1 : 2) : 0)));
    expect(giveUpPoints(pattern, half)).toBe(Math.round(0.5 * GIVE_UP_MAX));
  });
  it("does not credit wrong cells and never exceeds the cap or the solved floor", () => {
    const wrong = pattern.map((row) => row.map((v) => (v === 1 ? 2 : 1)));
    expect(giveUpPoints(pattern, wrong)).toBe(0);
    const perfect = pattern.map((row) => row.map((v) => (v === 1 ? 1 : 2)));
    expect(giveUpPoints(pattern, perfect)).toBe(GIVE_UP_MAX);
    expect(GIVE_UP_MAX).toBeLessThan(40);
  });
});
