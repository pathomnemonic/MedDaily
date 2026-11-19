let enabled = true;
export const setHapticsEnabled = (on: boolean) => { enabled = on; };
/** Short vibration pulses on phones that support it (a no-op elsewhere). */
export function vibrate(pattern: number | number[]) {
  if (!enabled || typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  try { navigator.vibrate(pattern); } catch { /* unsupported */ }
}
