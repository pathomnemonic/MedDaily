import type { GameResult } from "./storage";

const DAY = 86400000;
const parseDay = (key: string): number => Date.parse(key + "T00:00:00Z");
const dayKey = (ms: number): string => new Date(ms).toISOString().slice(0, 10);

/** How many rounds were played on each calendar day. */
export function playsByDay(results: readonly GameResult[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const r of results) if (/^\d{4}-\d{2}-\d{2}$/.test(r.date)) map.set(r.date, (map.get(r.date) ?? 0) + 1);
  return map;
}

export interface CalendarDay { date: string; plays: number; future: boolean; today: boolean; frozen: boolean }
/** A grid of weeks (Monday first) ending with the week that contains `today`; each week is seven days. */
export function streakCalendar(results: readonly GameResult[], today: string, weeks = 12, frozenDays: readonly string[] = []): CalendarDay[][] {
  const plays = playsByDay(results);
  const frozen = new Set(frozenDays);
  const end = parseDay(today);
  const mondayOffset = (new Date(end).getUTCDay() + 6) % 7;
  const firstMonday = end - mondayOffset * DAY - (weeks - 1) * 7 * DAY;
  const grid: CalendarDay[][] = [];
  for (let w = 0; w < weeks; w++) {
    const week: CalendarDay[] = [];
    for (let d = 0; d < 7; d++) {
      const ms = firstMonday + (w * 7 + d) * DAY, date = dayKey(ms);
      week.push({ date, plays: plays.get(date) ?? 0, future: ms > end, today: date === today, frozen: frozen.has(date) });
    }
    grid.push(week);
  }
  return grid;
}

/** Longest run of consecutive kept days. Archive plays never count; a frozen day counts as kept. */
export function bestStreak(results: readonly GameResult[], frozenDays: readonly string[] = []): number {
  const kept = new Set<string>();
  for (const r of results) if (!r.archive && /^\d{4}-\d{2}-\d{2}$/.test(r.date)) kept.add(r.date);
  for (const day of frozenDays) kept.add(day);
  const days = [...kept].map(parseDay).sort((a, b) => a - b);
  let best = 0, run = 0, prev = -Infinity;
  for (const d of days) { run = d - prev === DAY ? run + 1 : 1; best = Math.max(best, run); prev = d; }
  return best;
}

/** Share of rounds finishing in each tenth of the possible score: [0-9%, 10-19%, ... 90-100%]. */
export function scoreDistribution(results: readonly GameResult[]): number[] {
  const buckets = Array<number>(10).fill(0);
  for (const r of results) {
    if (!(r.maxScore > 0)) continue;
    const pct = Math.max(0, Math.min(100, (r.score / r.maxScore) * 100));
    buckets[Math.min(9, Math.floor(pct / 10))]++;
  }
  return buckets;
}

/** Average score percentage per label (for example per game family) across the given results. */
export function averageByGroup(results: readonly GameResult[], groupOf: (game: string) => string | undefined): { group: string; rounds: number; average: number }[] {
  const acc = new Map<string, { n: number; sum: number }>();
  for (const r of results) {
    const g = groupOf(r.game);
    if (!g || !(r.maxScore > 0)) continue;
    const cur = acc.get(g) ?? { n: 0, sum: 0 };
    cur.n++; cur.sum += Math.max(0, Math.min(100, (r.score / r.maxScore) * 100));
    acc.set(g, cur);
  }
  return [...acc.entries()].map(([group, v]) => ({ group, rounds: v.n, average: Math.round(v.sum / v.n) })).sort((a, b) => b.average - a.average);
}
