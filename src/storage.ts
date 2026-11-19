import type { GameId } from "./lib";
import { dailyDateKey } from "./lib";

export interface GameResult {
  date: string;
  game: GameId;
  scope: string;
  score: number;
  maxScore: number;
  perfect: boolean;
  durationSeconds: number;
}
export interface PlayerData {
  results: GameResult[];
  bests: Partial<Record<GameId, number>>;
  sound: boolean;
  reducedMotion: boolean;
  hideStreaks: boolean;
}
const KEY = "meddaily:player:v1";
const empty = (): PlayerData => ({ results: [], bests: {}, sound: false, reducedMotion: false, hideStreaks: false });
export function loadPlayer(): PlayerData {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "null") as Partial<PlayerData> | null;
    return { ...empty(), ...parsed, results: Array.isArray(parsed?.results) ? parsed.results.map((r) => ({ ...r, scope: r.scope ?? "general" })) : [], bests: parsed?.bests ?? {} };
  } catch { return empty(); }
}
export function savePlayer(data: PlayerData): void {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* Storage may be unavailable. */ }
}
export function recordResult(data: PlayerData, result: GameResult): PlayerData {
  if (data.results.some((r) => r.date === result.date && r.game === result.game && r.scope === result.scope)) return data;
  const best = Math.max(data.bests[result.game] ?? 0, result.score);
  const next = { ...data, results: [...data.results, result].slice(-1200), bests: { ...data.bests, [result.game]: best } };
  savePlayer(next); return next;
}
export function completedToday(data: PlayerData, scope = "general"): number {
  const today = dailyDateKey();
  return data.results.filter((r) => r.date === today && r.scope === scope).length;
}
export function playStreak(data: PlayerData, scope?: string): number {
  const days = new Set(data.results.filter((r) => !scope || r.scope === scope).map((r) => r.date));
  const cursor = new Date(); cursor.setUTCHours(0,0,0,0);
  if (!days.has(dailyDateKey(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1);
  let count = 0;
  while (days.has(dailyDateKey(cursor))) { count++; cursor.setUTCDate(cursor.getUTCDate() - 1); }
  return count;
}
export function totalPlays(data: PlayerData, scope?: string): number {
  return data.results.filter((r) => !scope || r.scope === scope).length;
}