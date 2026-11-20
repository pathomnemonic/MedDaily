import { describe, expect, it } from "vitest";
import { crossAliases, crossCriteria, crossDrugs } from "./dataCrossmatch";
import { cellAnswers, crossCellPoints, generateCrossPuzzle, hasDistinctFill } from "./crossLogic";

describe("Crossmatch content", () => {
  it("has enough groups and properties, with sensible sizes and canonical names", () => {
    expect(crossCriteria.filter((c) => c.kind === "class").length).toBeGreaterThanOrEqual(18);
    expect(crossCriteria.filter((c) => c.kind === "property").length).toBeGreaterThanOrEqual(24);
    for (const c of crossCriteria) { expect(c.members.length, c.id).toBeGreaterThanOrEqual(3); expect(new Set(c.members).size, c.id).toBe(c.members.length); }
    expect(crossDrugs.length).toBeGreaterThan(120);
  });
  it("aliases point at real drugs (or are a known non-drug synonym)", () => {
    for (const [alias, target] of Object.entries(crossAliases)) if (alias !== "Epinephrine" && alias !== "Vitamin K antagonist") expect(crossDrugs.includes(target), alias + " -> " + target).toBe(true);
  });
});

describe("Crossmatch puzzles", () => {
  it("always builds a solvable 3x3 with at least one valid drug per cell and good variety", () => {
    const rowSets = new Set<string>();
    for (let seed = 0; seed < 300; seed++) {
      const { rows, cols } = generateCrossPuzzle(seed);
      expect(new Set(rows.map((r) => r.id)).size).toBe(3);
      expect(new Set(cols.map((c) => c.id)).size).toBe(3);
      for (const r of rows) for (const c of cols) expect(cellAnswers(r, c).length, seed + " " + r.id + "x" + c.id).toBeGreaterThanOrEqual(1);
      expect(hasDistinctFill(rows, cols)).toBe(true);
      rowSets.add(rows.map((r) => r.id).sort().join());
    }
    expect(rowSets.size).toBeGreaterThan(150);
  });
  it("scores correct cells and gives a rarity bonus for less familiar answers", () => {
    const { rows, cols } = generateCrossPuzzle(5);
    const answers = cellAnswers(rows[0], cols[0]);
    expect(answers.length).toBeGreaterThanOrEqual(1);
    const pts = answers.map((a) => crossCellPoints(rows[0], cols[0], a));
    expect(Math.min(...pts)).toBe(6);
    expect(Math.max(...pts)).toBeLessThanOrEqual(10);
    expect(crossCellPoints(rows[0], cols[0], "Not a drug")).toBe(0);
  });
});
