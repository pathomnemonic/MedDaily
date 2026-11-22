import { describe, expect, it } from "vitest";
import { diagnosisCases } from "./data";

describe("DoctorDle year bank", () => {
  it("has at least 365 distinct clinical cases", () => {
    expect(diagnosisCases.length).toBeGreaterThanOrEqual(365);
    expect(new Set(diagnosisCases.map((item) => item.id)).size).toBe(diagnosisCases.length);
  });

  it("can serve 365 consecutive daily seeds without repeating a case", () => {
    const seen = new Set<string>();
    for (let day = 0; day < 365; day++) {
      const item = diagnosisCases[Math.abs(Math.trunc(day)) % diagnosisCases.length];
      expect(seen.has(item.id)).toBe(false);
      seen.add(item.id);
    }
    expect(seen.size).toBe(365);
  });

  it("keeps every generated organism case playable", () => {
    for (const item of diagnosisCases.filter((entry) => entry.id.startsWith("microbe-"))) {
      expect(item.clues.length).toBeGreaterThanOrEqual(3);
      expect(item.clues[0].length).toBeGreaterThan(10);
      expect(item.clues[1].length).toBeGreaterThan(item.clues[0].length);
      expect(item.clues[2].length).toBeGreaterThanOrEqual(item.clues[1].length);
      expect(item.options).toHaveLength(4);
      expect(new Set(item.options).size).toBe(4);
      expect(item.options).toContain(item.answer);
    }
  });
});
