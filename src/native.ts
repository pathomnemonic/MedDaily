import { Capacitor } from "@capacitor/core";

/** True inside the iOS or Android app shell, false in a normal browser or installed web app. */
export const isNative = (): boolean => { try { return Capacitor.isNativePlatform(); } catch { return false; } };
export const nativePlatform = (): "ios" | "android" | "web" => { try { return Capacitor.getPlatform() as "ios" | "android" | "web"; } catch { return "web"; } };

/** Custom URL scheme the system browser returns to after Google sign-in. Must be on the Supabase redirect allow-list. */
export const NATIVE_AUTH_REDIRECT = "com.pathomnemonic.clinicle://auth";

/** Reads a sign-in return link such as `com.pathomnemonic.clinicle://auth?code=abc` (or `#error=...`). Other links return null. */
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
export async function shareText(text: string, title = "Clinicle result"): Promise<boolean> {
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

export interface ReminderContext {
  /** Dates (YYYY-MM-DD, the app's UTC daily key) on which the player already finished a round. */
  playedDays: ReadonlySet<string>;
  /** Current daily streak in days. */
  streak: number;
}
export interface PlannedReminder { id: number; at: Date; title: string; body: string }

/**
 * One notification per upcoming day at the chosen local time, for the next week. A day on which the player has already played is skipped,
 * and the first reminder mentions the streak when there is one worth protecting. The plan is rebuilt whenever the app opens or a round
 * finishes, so a reminder never nags someone who already played.
 */
export function planReminders(now: Date, reminder: Reminder, ctx: ReminderContext, days = 7): PlannedReminder[] {
  if (!reminder.on) return [];
  const out: PlannedReminder[] = [];
  for (let d = 0; d < days + 1 && out.length < days; d++) {
    const at = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, reminder.hour, reminder.minute, 0, 0);
    if (at.getTime() <= now.getTime() + 30000) continue;
    if (ctx.playedDays.has(at.toISOString().slice(0, 10))) continue;
    const first = out.length === 0;
    const atRisk = first && ctx.streak >= 2;
    out.push({ id: out.length + 1, at, title: "Clinicle", body: atRisk ? "Keep your " + ctx.streak + "-day streak alive. Today's puzzles are waiting." : "Today's puzzles are ready." });
  }
  return out;
}

/** Replaces the scheduled reminders with a fresh plan (native only). Returns whether reminders are on. */
export async function refreshReminders(ctx: ReminderContext, reminder: Reminder = loadReminder()): Promise<boolean> {
  if (!isNative()) return false;
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  await LocalNotifications.cancel({ notifications: Array.from({ length: 8 }, (_, i) => ({ id: i + 1 })) });
  if (!reminder.on) return false;
  const plan = planReminders(new Date(), reminder, ctx);
  if (plan.length) await LocalNotifications.schedule({ notifications: plan.map((p) => ({ id: p.id, title: p.title, body: p.body, schedule: { at: p.at } })) });
  return true;
}

/** Turns the daily reminder on or off. Asks for notification permission only when switching on. Returns whether it is on. */
export async function applyReminder(next: Reminder, ctx: ReminderContext = { playedDays: new Set(), streak: 0 }): Promise<boolean> {
  if (!isNative()) return false;
  let on = next.on;
  if (on) {
    const { LocalNotifications } = await import("@capacitor/local-notifications");
    on = (await LocalNotifications.requestPermissions()).display === "granted";
  }
  const saved = { ...next, on };
  try { localStorage.setItem(REMINDER_KEY, JSON.stringify(saved)); } catch { /* storage unavailable */ }
  await refreshReminders(ctx, saved);
  return on;
}
