import { describe, expect, it } from "vitest";
import { blackoutCases } from "./dataBlackout";
import { blackoutScore, isStop, pickBlackoutCase, stem, titleWords, tokenize } from "./blackoutLogic";

const GENERIC = new Set(["syndrome", "disease", "chronic", "pulmonary", "pregnancy", "failure", "acute"]);

describe("Blackout Chart content", () => {
  it("has enough cases with unique titles and a sensible length", () => {
    expect(blackoutCases.length).toBeGreaterThanOrEqual(36);
    expect(new Set(blackoutCases.map((c) => c.title.toLowerCase())).size).toBe(blackoutCases.length);
    for (const c of blackoutCases) {
      const words = tokenize(c.text).filter((t) => t.kind === "word").length;
      expect(words, c.title).toBeGreaterThanOrEqual(50);
      expect(words, c.title).toBeLessThanOrEqual(130);
    }
  });
  it("never uses the diagnosis's distinctive words in the case text", () => {
    for (const c of blackoutCases) {
      const body = new Set(tokenize(c.text).filter((t) => t.kind === "word").map((t) => stem(t.text)));
      for (const w of titleWords(c.title)) {
        if (w.length < 6 || GENERIC.has(w.toLowerCase())) continue;
        expect(body.has(stem(w)), c.title + " leaks '" + w + "'").toBe(false);
      }
    }
  });
});

describe("Blackout Chart logic", () => {
  it("tokenizes words, numbers and punctuation without losing text", () => {
    const text = "A 52-year-old man had 9 kg loss, (SpO2 84%) and cough.";
    expect(tokenize(text).map((t) => t.text).join("")).toBe(text);
    expect(tokenize("cough, 9 kg").filter((t) => t.kind === "num").map((t) => t.text)).toEqual(["9"]);
  });
  it("stems plurals and verb endings so related forms reveal together", () => {
    expect(stem("cavities")).toBe(stem("cavity"));
    expect(stem("nodes")).toBe(stem("node"));
    expect(stem("swelling")).toBe(stem("swell"));
    expect(stem("treated")).toBe(stem("treat"));
    expect(isStop("The")).toBe(true);
    expect(isStop("cavity")).toBe(false);
  });
  it("scores by guesses and hints and picks deterministically", () => {
    expect(blackoutScore(5, 0)).toBe(100);
    expect(blackoutScore(12, 0)).toBe(88);
    expect(blackoutScore(12, 2)).toBe(72);
    expect(blackoutScore(80, 5)).toBe(15);
    expect(pickBlackoutCase(9).title).toBe(pickBlackoutCase(9).title);
  });
});
