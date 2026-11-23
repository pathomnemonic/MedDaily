import { isNative } from "./native";

let enabled = true;
export const setHapticsEnabled = (on: boolean) => { enabled = on; };
/** Short vibration pulses on phones that support it (a no-op elsewhere). */
export function vibrate(pattern: number | number[]) {
  if (!enabled) return;
  if (isNative()) {
    // iOS has no web vibration; the app shell uses the system haptic engine instead
    const long = Array.isArray(pattern) ? pattern.reduce((a, b) => a + b, 0) > 40 : pattern > 20;
    void import("@capacitor/haptics").then(({ Haptics, ImpactStyle }) => Haptics.impact({ style: long ? ImpactStyle.Medium : ImpactStyle.Light })).catch(() => undefined);
    return;
  }
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  try { navigator.vibrate(pattern); } catch { /* unsupported */ }
}
