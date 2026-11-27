import type { GameResult } from "./storage";

/** Streak freezes per calendar month (UTC), as the monetization plan records: 2, granted fresh each month, never rolling over. */
export const FREEZES_PER_MONTH = 2;

const DAY = 86400000;
const parseDay = (key: string): number => Date.parse(key + "T00:00:00Z");
const dayKey = (ms: number): string => new Date(ms).toISOString().slice(0, 10);
const isDayKey = (value: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(value);

/** Freezes left this calendar month: the monthly grant minus the frozen days already inside this month. */
export function freezesLeft(frozenDays: readonly string[], today: string): number {
  const month = today.slice(0, 7);
  const used = frozenDays.filter((d) => d.startsWith(month)).length;
  return Math.max(0, FREEZES_PER_MONTH - used);
}

/**
 * Decides which missed days a streak freeze covers, following the plan
 * exactly. A freeze is spent only when it can save the streak: the gap of
 * missed days between the last played day and today is one or two days and
 * the freezes left this month cover it in full. A longer gap breaks the
 * streak and spends nothing. Archive plays never count as a played day.
 * Returns the days to record as frozen (in order), or an empty list.
 */
export function planFreezes(results: readonly GameResult[], frozenDays: readonly string[], today: string, isPro: boolean): string[] {
  if (!isPro) return [];
  const played = new Set<string>();
  for (const r of results) if (!r.archive && isDayKey(r.date)) played.add(r.date);
  if (played.size === 0) return [];
  const frozen = new Set(frozenDays.filter(isDayKey));
  const todayMs = parseDay(today);
  let lastPlayed = -Infinity;
  for (const d of played) {
    const ms = parseDay(d);
    if (ms <= todayMs && ms > lastPlayed) lastPlayed = ms;
  }
  if (lastPlayed === -Infinity) return [];
  // Missed days strictly between the last played day and today that no
  // freeze covers yet. Today is the day the player came back, so it is
  // never itself a missed day.
  const uncovered: string[] = [];
  for (let ms = lastPlayed + DAY; ms < todayMs; ms += DAY) {
    const key = dayKey(ms);
    if (!frozen.has(key)) uncovered.push(key);
  }
  if (uncovered.length === 0 || uncovered.length > 2) return [];
  if (uncovered.length > freezesLeft(frozenDays, today)) return [];
  return uncovered;
}
