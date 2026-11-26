import { describe, expect, it } from "vitest";
import { pluralize, pointsText, ptsText } from "./lib";
import { hoofPoints } from "./hoofLogic";

describe("points labels (issue 122)", () => {
  it("renders exactly 1 as singular", () => {
    expect(ptsText(1)).toBe("1 pt");
    expect(pointsText(1)).toBe("1 point");
    expect(pluralize(1, "pt", "pts")).toBe("pt");
  });
  it("renders every other count as plural", () => {
    expect(ptsText(0)).toBe("0 pts");
    expect(ptsText(2)).toBe("2 pts");
    expect(pointsText(0)).toBe("0 points");
    expect(pointsText(10)).toBe("10 points");
  });
  it("covers the reported Hoofbeats row: a 0.1 percent answer is worth 1 pt", () => {
    expect(hoofPoints(0.1)).toBe(1);
    expect(ptsText(hoofPoints(0.1))).toBe("1 pt");
    expect(ptsText(hoofPoints(0.2))).toBe("2 pts");
  });
});
