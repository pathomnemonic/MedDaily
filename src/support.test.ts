import { describe, expect, it } from "vitest";
import { APP_VERSION, SUPPORT_EMAIL, reportMailto } from "./support";

describe("report a problem", () => {
  it("addresses the support inbox and carries what is needed to reproduce the puzzle", () => {
    const url = reportMailto({ game: "Trivia Rumble", date: "2026-11-23", seed: 12345, mode: "daily" }, "ios");
    expect(url.startsWith("mailto:" + SUPPORT_EMAIL + "?")).toBe(true);
    const body = decodeURIComponent(url.split("&body=")[1]);
    expect(body).toContain("Game: Trivia Rumble");
    expect(body).toContain("Puzzle seed: 12345");
    expect(body).toContain("Date: 2026-11-23");
    expect(body).toContain("Mode: daily");
    expect(body).toContain("App version: " + APP_VERSION + " (ios)");
    expect(decodeURIComponent(url.split("subject=")[1].split("&")[0])).toBe("Roundsy: problem with Trivia Rumble");
  });
});
