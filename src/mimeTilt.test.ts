import { describe, expect, it } from "vitest";
import { tiltStep } from "./mimeTilt";

describe("Mime Time tilt control", () => {
  it("scores when the screen tips toward the floor and skips toward the ceiling", () => {
    expect(tiltStep(140, { armed: true }).action).toBe("got");
    expect(tiltStep(40, { armed: true }).action).toBe("skip");
    expect(tiltStep(95, { armed: true }).action).toBeNull();
  });
  it("needs the phone back upright before firing again", () => {
    const first = tiltStep(145, { armed: true });
    expect(tiltStep(150, first.state).action).toBeNull();
    const mid = tiltStep(115, first.state);
    expect(mid.state.armed).toBe(false);
    const upright = tiltStep(92, mid.state);
    expect(upright.state.armed).toBe(true);
    expect(tiltStep(140, upright.state).action).toBe("got");
  });
  it("ignores missing sensor readings", () => {
    expect(tiltStep(null, { armed: true }).action).toBeNull();
  });
});
