import { describe, expect, it } from "vitest";
import { clinicalThemes } from "./dataClinicalCases";
import { countClinicalSolutions, generateClinicalCase } from "./clinicalCase";

describe("clinical case content", () => {
  it("has enough themes and conditions, with unique look-alike items inside each theme", () => {
    expect(clinicalThemes.length).toBeGreaterThanOrEqual(10);
    for (const t of clinicalThemes) {
      expect(t.conditions.length, t.id).toBeGreaterThanOrEqual(6);
      for (const key of ["patient", "cause", "finding"] as const) expect(new Set(t.conditions.map((c) => c[key].toLowerCase())).size, t.id + " " + key).toBe(t.conditions.length);
      for (const c of t.conditions) { expect(c.alt.length).toBeGreaterThan(8); expect(c.why.length).toBeGreaterThan(20); }
    }
  });
  it("never names the cause or the finding inside the patient presentation", () => {
    for (const t of clinicalThemes) for (const c of t.conditions) {
      const p = c.patient.toLowerCase();
      for (const word of [...c.cause.split(/[\s-]+/), ...c.finding.split(/[\s-]+/)].filter((w) => w.length >= 9)) expect(p.includes(word.toLowerCase()), t.id + ": '" + c.patient + "' contains '" + word + "'").toBe(false);
    }
  });
});

describe("clinical case generator", () => {
  it("builds a case with exactly one solution and a sensible number of clues, for many seeds", () => {
    const themes = new Set<string>();
    for (let seed = 0; seed < 400; seed++) {
      const kase = generateClinicalCase(seed);
      themes.add(kase.id);
      expect(countClinicalSolutions(kase.constraints), "seed " + seed).toBe(1);
      expect(kase.clues.length).toBeGreaterThanOrEqual(4);
      expect(kase.clues.length).toBeLessThanOrEqual(9);
      expect(new Set(kase.causes).size).toBe(3);
      expect(new Set(kase.findings).size).toBe(3);
      expect(kase.solution).toHaveLength(3);
      for (const c of kase.clues) expect(c.text.length).toBeGreaterThan(20);
    }
    expect(themes.size).toBe(clinicalThemes.length);
  });
  it("is deterministic and the solution is consistent with every clue", () => {
    const a = generateClinicalCase(123), b = generateClinicalCase(123);
    expect(a.clues.map((c) => c.text)).toEqual(b.clues.map((c) => c.text));
    expect(a.solution).toEqual(b.solution);
  });
  it("sometimes describes items by clinical shorthand and offers a decoding", () => {
    let decoded = 0;
    for (let seed = 0; seed < 100; seed++) decoded += generateClinicalCase(seed).clues.filter((c) => c.decode).length;
    expect(decoded).toBeGreaterThan(40);
  });
});

/** Anything a player could match without medical knowledge: shared words between the texts of one condition. */
describe("clinical case wording gives nothing away", () => {
  const STOP = new Set("with without after before from that than this their there were they have been into onto over under also very more most some such only each both other which while where when what whose positive negative elevated raised high higher low lower level levels test tests serum urine patient pattern finding found light disease syndrome caused cause illness".split(" "));
  const stem = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "").replace(/(ies)$/, "y").replace(/(ing|ed|es|s)$/, "");
  const words = (s: string) => new Set(s.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length >= 4 && !STOP.has(w)).map(stem));
  const GENERIC_CAUSE_ALT = new Set(["viru", "virus", "artery", "arteri", "cerebral", "adrenal", "immune", "complex", "deposition", "duct", "tumor", "autoantibody", "autoantibodie", "chain", "wall", "aneurysm", "coronary", "bacterial", "bacteria", "organism", "glycosylation", "strain", "pattern", "tricyclic", "antidepressant", "drug", "cell"]);
  it("shares no content words between a condition's patient, cause, descriptor and finding", () => {
    const bad: string[] = [];
    for (const t of clinicalThemes) for (const c of t.conditions) {
      const parts: [string, string][] = [["patient", c.patient], ["cause", c.cause], ["alt", c.alt], ["finding", c.finding]];
      for (let i = 0; i < parts.length; i++) for (let j = i + 1; j < parts.length; j++) {
        const pair = parts[i][0] + "~" + parts[j][0];
        const shared = [...words(parts[i][1])].filter((w) => words(parts[j][1]).has(w) && !(pair === "cause~alt" && GENERIC_CAUSE_ALT.has(w)));
        if (shared.length) bad.push(t.id + " | " + c.cause + " | " + pair + ": " + shared.join(","));
      }
    }
    expect(bad).toEqual([]);
  });
});
