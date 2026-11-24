import { describe, expect, it } from "vitest";
import { APP_TAG, SENTRY_DSN, monitoringEnabled, scrubUrl } from "./monitoring";

describe("monitoring", () => {
  it("runs only in production builds, never on localhost", () => {
    expect(monitoringEnabled(true, "pathomnemonic.github.io")).toBe(true);
    expect(monitoringEnabled(false, "pathomnemonic.github.io")).toBe(false);
    expect(monitoringEnabled(true, "localhost")).toBe(false);
    expect(monitoringEnabled(true, "127.0.0.1")).toBe(false);
  });
  it("strips room codes, tokens and fragments from URLs", () => {
    expect(scrubUrl("https://x.io/MedDaily/?room=ABC123")).toBe("https://x.io/MedDaily/");
    expect(scrubUrl("https://x.io/MedDaily/#access_token=secret")).toBe("https://x.io/MedDaily/");
    expect(scrubUrl(undefined)).toBeUndefined();
  });
  it("tags events as Roundsy and points at the shared ingest", () => {
    expect(APP_TAG).toBe("roundsy");
    expect(SENTRY_DSN).toMatch(/^https:\/\/[0-9a-f]+@o\d+\.ingest\.us\.sentry\.io\/\d+$/);
  });
});

import { monitoringPreference, setMonitoringPreference } from "./monitoring";
describe("monitoring switch", () => {
  const store = () => { const m = new Map<string, string>(); return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), removeItem: (k: string) => void m.delete(k) }; };
  it("is on by default and remembers being switched off and on again", () => {
    const st = store();
    expect(monitoringPreference(st)).toBe(true);
    setMonitoringPreference(false, st);
    expect(monitoringPreference(st)).toBe(false);
    setMonitoringPreference(true, st);
    expect(monitoringPreference(st)).toBe(true);
  });
  it("falls back to on when storage is blocked", () => {
    expect(monitoringPreference({ getItem: () => { throw new Error("blocked"); } })).toBe(true);
  });
});
