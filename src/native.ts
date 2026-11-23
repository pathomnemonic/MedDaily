import { Capacitor } from "@capacitor/core";

/** True inside the iOS or Android app shell, false in a normal browser or installed web app. */
export const isNative = (): boolean => { try { return Capacitor.isNativePlatform(); } catch { return false; } };
export const nativePlatform = (): "ios" | "android" | "web" => { try { return Capacitor.getPlatform() as "ios" | "android" | "web"; } catch { return "web"; } };

/** Custom URL scheme the system browser returns to after Google sign-in. Must be on the Supabase redirect allow-list. */
export const NATIVE_AUTH_REDIRECT = "com.pathomnemonic.meddaily://auth";

/** Reads a sign-in return link such as `com.pathomnemonic.meddaily://auth?code=abc` (or `#error=...`). Other links return null. */
export function parseAuthCallback(url: string): { code?: string; error?: string } | null {
  if (!url.startsWith(NATIVE_AUTH_REDIRECT)) return null;
  try {
    const u = new URL(url);
    const hash = new URLSearchParams(u.hash.replace(/^#/, ""));
    const code = u.searchParams.get("code") ?? hash.get("code") ?? undefined;
    const error = u.searchParams.get("error_description") ?? u.searchParams.get("error") ?? hash.get("error_description") ?? hash.get("error") ?? undefined;
    return code || error ? { code, error } : {};
  } catch { return null; }
}

/** Opens a page in the system browser sheet (Google refuses sign-in inside an embedded web view). */
export async function openInSystemBrowser(url: string): Promise<void> {
  const { Browser } = await import("@capacitor/browser");
  await Browser.open({ url });
}
export async function closeSystemBrowser(): Promise<void> {
  try { const { Browser } = await import("@capacitor/browser"); await Browser.close(); } catch { /* not open on this platform */ }
}

/** Calls `handler` for every link that opens the app (sign-in returns). Returns a function that stops listening. */
export async function onAppUrl(handler: (url: string) => void): Promise<() => void> {
  if (!isNative()) return () => undefined;
  const { App } = await import("@capacitor/app");
  const sub = await App.addListener("appUrlOpen", (event) => handler(event.url));
  return () => { void sub.remove(); };
}

/** One-time shell setup: status bar colours and hiding the launch screen once the app is ready. */
export async function initNative(): Promise<void> {
  if (!isNative()) return;
  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setStyle({ style: Style.Dark });
    if (nativePlatform() === "android") await StatusBar.setBackgroundColor({ color: "#100b2e" });
  } catch { /* plugin unavailable */ }
  try { const { SplashScreen } = await import("@capacitor/splash-screen"); await SplashScreen.hide(); } catch { /* plugin unavailable */ }
}

/** System share sheet in the app; the browser's own share otherwise. Returns false when nothing was shared. */
export async function shareText(text: string, title = "MedDaily result"): Promise<boolean> {
  if (isNative()) {
    try { const { Share } = await import("@capacitor/share"); await Share.share({ title, text, dialogTitle: title }); return true; } catch { return false; }
  }
  if (typeof navigator !== "undefined" && navigator.share) { try { await navigator.share({ title, text }); return true; } catch { return false; } }
  return false;
}

export interface Reminder { on: boolean; hour: number; minute: number }
const REMINDER_KEY = "meddaily:reminder";
export const defaultReminder = (): Reminder => ({ on: false, hour: 19, minute: 0 });
export function loadReminder(): Reminder {
  try {
    const parsed = JSON.parse(localStorage.getItem(REMINDER_KEY) ?? "null") as Partial<Reminder> | null;
    const hour = Number(parsed?.hour), minute = Number(parsed?.minute);
    return { on: parsed?.on === true, hour: Number.isInteger(hour) && hour >= 0 && hour < 24 ? hour : 19, minute: Number.isInteger(minute) && minute >= 0 && minute < 60 ? minute : 0 };
  } catch { return defaultReminder(); }
}
/** Turns the daily "puzzles are ready" notification on or off. Returns whether it is on (false if permission was refused). */
export async function applyReminder(next: Reminder): Promise<boolean> {
  if (!isNative()) return false;
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  await LocalNotifications.cancel({ notifications: [{ id: 1 }] });
  let on = next.on;
  if (on) {
    const perm = await LocalNotifications.requestPermissions();
    on = perm.display === "granted";
    if (on) {
      await LocalNotifications.schedule({ notifications: [{
        id: 1, title: "MedDaily", body: "Today's puzzles are ready. Keep your streak going.",
        schedule: { on: { hour: next.hour, minute: next.minute } }
      }] });
    }
  }
  try { localStorage.setItem(REMINDER_KEY, JSON.stringify({ ...next, on })); } catch { /* storage unavailable */ }
  return on;
}
