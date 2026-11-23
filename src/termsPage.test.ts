import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const page = readFileSync("public/terms.html", "utf8");
const text = page.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/g, " ");

describe("Terms of Service page", () => {
  it("covers the standard clauses and the app's actual features", () => {
    for (const id of ["education", "guest", "account", "rooms", "names", "use", "delete", "ip", "liability", "changes", "law", "contact"]) expect(page).toContain('id="' + id + '"');
    expect(text).toMatch(/not medical advice/i);
    expect(text).toMatch(/Delete my Clinicle account/);
    expect(text).toMatch(/six-character code/);
    expect(text).toMatch(/20 characters/);
    expect(page).toContain("https://pathomnemonic.github.io/StudyBible/privacy.html");
    expect(text).toMatch(/Mathews Sajan/);
    expect(text).toMatch(/State of Arizona/);
  });
  it("makes no promise about paid tiers or prices while monetization is undecided", () => {
    expect(text).not.toMatch(/\bPro\b/);
    expect(text).not.toMatch(/subscription|per month|per year|lifetime|free trial|\$\s?\d/i);
    expect(text).toMatch(/currently free/i);
  });
});

describe("Help page", () => {
  const help = readFileSync("public/help.html", "utf8");
  it("tells players how to report a wrong question and where support goes", () => {
    expect(help).toMatch(/Report a problem with this puzzle/);
    expect(help).toContain("patho.mnemonic1@gmail.com");
    for (const id of ["daily", "streak", "account", "delete", "rooms", "wrong", "medical", "offline"]) expect(help).toContain('id="' + id + '"');
    expect(help).not.toMatch(/\bPro\b|\$\s?\d/);
  });
});
