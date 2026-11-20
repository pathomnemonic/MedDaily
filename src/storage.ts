import type { GameId } from "./lib";
import { dailyDateKey } from "./lib";
import type { ThemeSettings } from "./theme";

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
  music: boolean;
  xp: number;
  haptics?: boolean;
  theme?: ThemeSettings;
  reducedMotion: boolean;
  hideStreaks: boolean;
}
const KEY = "meddaily:player:v1";
const empty = (): PlayerData => ({ results: [], bests: {}, sound: true, music: true, xp: 0, reducedMotion: false, hideStreaks: false });
export function loadPlayer(): PlayerData {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "null") as Partial<PlayerData> | null;
    const legacy = parsed != null && parsed.music === undefined; // saves from before music existed never chose sound
    return { ...empty(), ...parsed, ...(legacy ? { sound: true, music: true } : {}), results: Array.isArray(parsed?.results) ? parsed.results.map((r) => ({ ...r, scope: r.scope ?? "general" })) : [], bests: parsed?.bests ?? {} };
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
export function completedToday(data: PlayerData, scope = "general", listedGames?: readonly GameId[]): number {
  const today = dailyDateKey();
  const listed = listedGames ? new Set(listedGames) : null;
  return data.results.filter((r) => r.date === today && r.scope === scope && (!listed || listed.has(r.game))).length;
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

export interface AchievementProgress {
  name: string;
  detail: string;
  earned: boolean;
  progress: string;
}

export function achievementsFor(data: PlayerData, scope: string, streak: number, totalGames: number): AchievementProgress[] {
  const results = data.results.filter((result) => result.scope === scope);
  const perfect = results.filter((result) => result.perfect).length;
  const uniqueGames = new Set(results.map((result) => result.game)).size;
  const targets = [
    { name: "First Run", detail: "Complete your first game.", value: results.length, target: 1 },
    { name: "Curious Mind", detail: "Try five different game formats.", value: uniqueGames, target: 5 },
    { name: "Full Arcade", detail: "Play every game in the arcade.", value: uniqueGames, target: totalGames },
    { name: "Perfect Five", detail: "Earn five perfect rounds.", value: perfect, target: 5 },
    { name: "Century Club", detail: "Complete 100 rounds.", value: results.length, target: 100 },
    { name: "Seven-Day Signal", detail: "Maintain a seven-day daily streak.", value: streak, target: 7 }
  ];
  return targets.map(({ name, detail, value, target }) => ({
    name,
    detail,
    earned: value >= target,
    progress: Math.min(value, target) + "/" + target
  }));
}
