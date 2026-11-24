import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const page = readFileSync("public/terms.html", "utf8");
const text = page.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/g, " ");

describe("Terms of Service page", () => {
  it("covers the standard clauses and the app's actual features", () => {
    for (const id of ["education", "guest", "account", "rooms", "names", "contribute", "use", "delete", "ip", "liability", "changes", "law", "contact"]) expect(page).toContain('id="' + id + '"');
    expect(text).toMatch(/not medical advice/i);
    expect(text).toMatch(/Delete my Roundsy account/);
    expect(text).toMatch(/six-character code/);
    expect(text).toMatch(/20 characters/);
    expect(page).toContain("https://pathomnemonic.github.io/StudyBible/privacy.html");
    expect(text).toMatch(/between you and PathoMnemonic/);
    expect(text).toMatch(/State of Arizona/);
  });
  it("covers user contributions with the key protections", () => {
    expect(text).toMatch(/own original work/);
    expect(text).toMatch(/no information that identifies a real patient/);
    expect(text).toMatch(/18 or older/);
    expect(text).toMatch(/worldwide, perpetual, royalty-free/);
    expect(text).toMatch(/AI tools/);
    expect(text).toMatch(/do not publish it/);
    expect(text).toMatch(/before it is published/);
  });
  it("keeps the protective wording a lawyer would look for", () => {
    expect(text).toMatch(/All sales are final, except where the app store or applicable law requires a refund/);
    expect(text).toMatch(/refunded by them under their policies/);
    expect(text).toMatch(/not a substitute for professional medical or clinical judgment/);
    expect(text).toMatch(/not affiliated with, endorsed by or sponsored by any examination board/);
    expect(text).toMatch(/"as is" and "as available"/);
    expect(text).toMatch(/Sentry/);
    expect(text).toMatch(/PostHog/);
    expect(text).toMatch(/turn them off at any time in Options/);
    expect(text).toMatch(/Copyright complaints/);
    expect(text).toMatch(/iPhone and Android apps do not send crash reports or analytics/);
    expect(text).toMatch(/never be lost, reset or changed/);
    expect(text).toMatch(/take effect when we post them/);
    expect(text).toMatch(/operating and promoting Roundsy/);
    expect(text).not.toMatch(/no refunds?/i);
    expect(text).not.toMatch(/arbitrat|class action|\bjury\b/i);
    expect(text).not.toMatch(/sole proprietor|LLC|incorporated/i);
    expect(page).toContain("patho.mnemonic1@gmail.com");
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
