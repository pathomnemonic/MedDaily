import { describe, expect, it } from "vitest";
import { branchSets, microbeLeaves, drugLeaves } from "./dataBranch";
import { BRANCH_GUESSES, branchScore, branchSquare, candidatesUnder, pickBranchTarget, sharedDepth } from "./branchLogic";

describe("Branch Lab lineage maths", () => {
  it("counts shared ancestors", () => {
    const a = ["Bacteria", "Gram-positive", "Cocci", "Staphylococcus", "Staphylococcus aureus"];
    expect(sharedDepth(a, a)).toBe(5);
    expect(sharedDepth(a, ["Bacteria", "Gram-positive", "Rods", "Bacillus", "Bacillus cereus"])).toBe(2);
    expect(sharedDepth(a, ["Viruses", "DNA viruses", "Poxviridae", "Variola virus"])).toBe(0);
  });
  it("counts the answers left under a node", () => {
    expect(candidatesUnder("microbe", [])).toBe(branchSets.microbe.length);
    expect(candidatesUnder("microbe", ["Bacteria", "Gram-positive", "Cocci", "Staphylococcus"])).toBe(3);
    expect(candidatesUnder("drug", ["Hematology", "Antiplatelets"])).toBe(2);
  });
  it("scores wins by speed and misses by closeness", () => {
    expect(branchScore(true, 1, false, 5)).toBe(100);
    expect(branchScore(true, 8, false, 5)).toBe(30);
    expect(branchScore(true, 3, true, 5)).toBe(70);
    expect(branchScore(false, 8, false, 4)).toBe(28);
    expect(branchScore(false, 8, true, 9)).toBeLessThanOrEqual(35);
    expect(branchSquare(5, 6, true)).toBe("🟩");
    expect(branchSquare(0, 6, false)).toBe("⬛");
  });
});

describe("Branch Lab content", () => {
  for (const set of ["microbe", "drug"] as const) {
    const leaves = branchSets[set];
    it(set + ": unique answers, sensible lineages, and clues that do not name the answer", () => {
      expect(leaves.length).toBeGreaterThanOrEqual(80);
      expect(new Set(leaves.map((l) => l.name.toLowerCase())).size).toBe(leaves.length);
      for (const l of leaves) {
        expect(l.path.length, l.name).toBeGreaterThanOrEqual(3);
        expect(l.path.length, l.name).toBeLessThanOrEqual(6);
        expect(l.clue.length, l.name).toBeGreaterThan(20);
        for (const word of l.name.split(/[\s-]+/).filter((w) => w.length >= 5)) {
          expect(new RegExp("\\b" + word + "\\b", "i").test(l.clue), l.name + " clue contains " + word).toBe(false);
        }
      }
    });
    it(set + ": no group is named like an answer", () => {
      const answers = new Set(leaves.map((l) => l.name.toLowerCase()));
      for (const l of leaves) for (const group of l.path.slice(0, -1)) expect(answers.has(group.toLowerCase()), group).toBe(false);
    });
  }
  it("covers 365 consecutive daily seeds without repeating a target", () => {
    const seen = new Set<string>();
    for (let day = 0; day < 365; day++) {
      const pick = pickBranchTarget(day);
      expect(seen.has(pick.set + ":" + pick.target.name)).toBe(false);
      seen.add(pick.set + ":" + pick.target.name);
    }
    expect(seen.size).toBe(365);
  });
  it("always picks a valid target and is deterministic; both sets occur", () => {
    const seen = new Set<string>();
    for (let s = 0; s < 300; s++) { const a = pickBranchTarget(s); expect(a.target).toBeDefined(); seen.add(a.set); expect(pickBranchTarget(s).target.name).toBe(a.target.name); }
    expect(seen.size).toBe(2);
    expect(BRANCH_GUESSES).toBe(8);
    expect(drugLeaves.length + microbeLeaves.length).toBeGreaterThan(160);
    expect(branchSets.microbe.length).toBeGreaterThanOrEqual(180);
    expect(branchSets.drug.length).toBeGreaterThanOrEqual(180);
  });
});
