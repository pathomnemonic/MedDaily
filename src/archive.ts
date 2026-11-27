import type { GameResult } from "./storage";

/**
 * The first day in the archive: the store launch day, since the archive
 * holds the daily rounds from launch onward. The app has not launched yet,
 * so this stands at the day the archive feature landed; move it to the
 * real launch day in the release change if launch slips past it.
 */
export const ARCHIVE_START_DAY = "2026-11-27";

const DAY = 86400000;
const parseDay = (key: string): number => Date.parse(key + "T00:00:00Z");
const dayKey = (ms: number): string => new Date(ms).toISOString().slice(0, 10);

/** Past days open in the archive, most recent first: from the launch day up to yesterday. Today is always the daily, never the archive. */
export function archiveDays(today: string): string[] {
  const start = parseDay(ARCHIVE_START_DAY);
  const end = parseDay(today);
  const days: string[] = [];
  for (let ms = end - DAY; ms >= start; ms -= DAY) days.push(dayKey(ms));
  return days;
}

/** Whether a day belongs to the archive on the given today: a past day, on or after the launch day. */
export const isArchiveDay = (date: string, today: string): boolean =>
  date >= ARCHIVE_START_DAY && date < today;

/** Results recorded for one day in one scope, daily and archive plays alike. */
export function resultsForDay(results: readonly GameResult[], date: string, scope: string): GameResult[] {
  return results.filter((r) => r.date === date && r.scope === scope);
}
