import { describe, expect, it } from "vitest";
import { tipLink } from "./tip";

describe("tip jar link", () => {
  it("stays hidden until a real https link is configured", () => {
    expect(tipLink("")).toBeNull();
    expect(tipLink("http://example.com")).toBeNull();
    expect(tipLink("https://buy.stripe.com/abc123")).toBe("https://buy.stripe.com/abc123");
  });
  it("never shows in the native store apps", () => {
    expect(tipLink("https://buy.stripe.com/abc123", true)).toBeNull();
  });
  it("refuses the Ko-fi page, which belongs to another app", () => {
    expect(tipLink("https://ko-fi.com/pathomnemonic")).toBeNull();
  });
});
