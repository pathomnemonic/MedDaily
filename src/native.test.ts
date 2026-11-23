import { describe, expect, it } from "vitest";
import { NATIVE_AUTH_REDIRECT, loadReminder, parseAuthCallback } from "./native";

describe("native sign-in return link", () => {
  it("reads the code from the query or the fragment", () => {
    expect(parseAuthCallback(NATIVE_AUTH_REDIRECT + "?code=abc123")).toEqual({ code: "abc123", error: undefined });
    expect(parseAuthCallback(NATIVE_AUTH_REDIRECT + "#code=xyz")?.code).toBe("xyz");
  });
  it("surfaces a provider error and ignores unrelated links", () => {
    expect(parseAuthCallback(NATIVE_AUTH_REDIRECT + "?error=access_denied&error_description=User+cancelled")?.error).toBe("User cancelled");
    expect(parseAuthCallback("https://example.com/?code=1")).toBeNull();
    expect(parseAuthCallback("com.pathomnemonic.meddaily://other?code=1")).toBeNull();
  });
  it("falls back to a sensible reminder when nothing valid is stored", () => {
    expect(loadReminder()).toEqual({ on: false, hour: 19, minute: 0 });
  });
});
