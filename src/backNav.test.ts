import { describe, expect, it } from "vitest";
import { backAction } from "./backNav";

describe("back button routing", () => {
  it("peels one layer at a time and only exits from the arcade home", () => {
    expect(backAction({ activeGame: true, completion: true, screen: "home" })).toBe("close-completion");
    expect(backAction({ activeGame: true, completion: false, screen: "home" })).toBe("close-game");
    expect(backAction({ activeGame: false, completion: false, screen: "settings" })).toBe("go-home");
    expect(backAction({ activeGame: false, completion: false, screen: "home" })).toBe("exit");
  });
});
