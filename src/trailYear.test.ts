import { describe, expect, it } from "vitest";
import { getThemeTrailYearPacks } from "./dataTrailExpansion";
import { makeTrailPuzzle, trailPackOk } from "./trailLogic";

describe("Theme Trail year bank", () => {
  it("has 365 distinct, generator-verified themed boards", () => {
    const packs = getThemeTrailYearPacks();
    expect(packs).toHaveLength(365);
    expect(new Set(packs.map((pack) => pack.name)).size).toBe(365);
    expect(new Set(packs.map((pack) => pack.words.map((word) => word.toUpperCase().replace(/[^A-Z]/g, "")).sort().join("|"))).size).toBe(365);
    for (const pack of packs) expect(trailPackOk(pack), pack.name).toBe(true);
  });

  it("rotates through 365 different packs on 365 consecutive daily seeds", () => {
    const packs = getThemeTrailYearPacks();
    const daily = Array.from({ length: 365 }, (_, day) => packs[day % packs.length].name);
    expect(new Set(daily).size).toBe(365);
  });

  it("can generate playable boards at early, middle and late positions in the rotation", () => {
    const packs = getThemeTrailYearPacks();
    for (const day of [0, 91, 182, 273, 364]) {
      const puzzle = makeTrailPuzzle(packs[day], day + 1);
      expect(puzzle.words.length).toBeGreaterThanOrEqual(4);
      expect(puzzle.trail.length).toBeGreaterThanOrEqual(5);
    }
  });
});
