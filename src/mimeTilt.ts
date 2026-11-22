/**
 * Heads-Up style tilt control for Mime Time. The phone is held upright against the forehead (beta about 90 degrees).
 * Tipping the screen toward the floor scores the card, tipping it toward the ceiling skips it. After each action the
 * phone must come back near upright before the next one can fire, so one tip never counts twice.
 */
export type TiltAction = "got" | "skip" | null;
export interface TiltState { armed: boolean }
export const TILT_TRIGGER = 38, TILT_REARM = 18;

export function tiltStep(beta: number | null, state: TiltState): { action: TiltAction; state: TiltState } {
  if (beta === null || !Number.isFinite(beta)) return { action: null, state };
  const dip = beta - 90;
  if (!state.armed) return { action: null, state: { armed: Math.abs(dip) <= TILT_REARM } };
  if (dip >= TILT_TRIGGER) return { action: "got", state: { armed: false } };
  if (dip <= -TILT_TRIGGER) return { action: "skip", state: { armed: false } };
  return { action: null, state };
}

/** iOS needs a user gesture to grant motion access; other browsers allow it outright. Resolves true when readable. */
export async function requestTiltAccess(): Promise<boolean> {
  const ctor = (typeof window !== "undefined" ? (window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } }).DeviceOrientationEvent : undefined);
  if (!ctor) return false;
  if (typeof ctor.requestPermission === "function") {
    try { return (await ctor.requestPermission()) === "granted"; } catch { return false; }
  }
  return true;
}
