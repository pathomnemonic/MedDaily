import { dailyDateKey, LISTED_GAME_IDS, type GameId } from "./lib";
import type { ThemeSettings } from "./theme";

export interface GameResult {
  date: string;
  game: GameId;
  scope: string;
  score: number;
  maxScore: number;
  perfect: boolean;
  durationSeconds: number;
  /** True when this result came from archive play (a past day replayed under Pro). Archive results never move the streak or the daily goal. */
  archive?: boolean;
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
  /** Days a streak freeze has covered, as date keys. A frozen day counts as kept for the streak, never as played. */
  frozenDays?: string[];
}
const KEY = "meddaily:player:v1";
const empty = (): PlayerData => ({ results: [], bests: {}, sound: true, music: true, xp: 0, reducedMotion: false, hideStreaks: false });
export function loadPlayer(): PlayerData {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "null") as Partial<PlayerData> | null;
    const legacy = parsed != null && parsed.music === undefined; // saves from before music existed never chose sound
    const loaded = { ...empty(), ...parsed, ...(legacy ? { sound: true, music: true } : {}), results: Array.isArray(parsed?.results) ? parsed.results.filter((r) => r && typeof r === "object" && typeof r.date === "string" && typeof r.game === "string").map((r) => ({ ...r, scope: r.scope ?? "general" })) : [], bests: parsed?.bests && typeof parsed.bests === "object" && !Array.isArray(parsed.bests) ? parsed.bests : {} };
    loaded.xp = Number.isFinite(Number(loaded.xp)) ? Math.max(0, Math.min(Number(loaded.xp), 1e9)) : 0;
    loaded.frozenDays = Array.isArray(parsed?.frozenDays) ? [...new Set(parsed.frozenDays.filter((d): d is string => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)))].sort() : [];
    return loaded;
  } catch { return empty(); }
}
export function savePlayer(data: PlayerData): void {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* Storage may be unavailable. */ }
}
export function recordResult(data: PlayerData, result: GameResult): PlayerData {
  const best = Math.max(data.bests[result.game] ?? 0, result.score);
  if (data.results.some((r) => r.date === result.date && r.game === result.game && r.scope === result.scope)) {
    // Already recorded: the standing result stands, but a better replay (for
    // example an archive replay) still raises the best score, as the plan asks.
    if (best === (data.bests[result.game] ?? 0)) return data;
    const raised = { ...data, bests: { ...data.bests, [result.game]: best } };
    savePlayer(raised); return raised;
  }
  const next = { ...data, results: [...data.results, result].slice(-1200), bests: { ...data.bests, [result.game]: best } };
  savePlayer(next); return next;
}
export function completedToday(data: PlayerData, scope = "general", listedGames: readonly GameId[] = LISTED_GAME_IDS): number {
  const today = dailyDateKey();
  const listed = new Set(listedGames);
  return data.results.filter((r) => r.date === today && r.scope === scope && !r.archive && listed.has(r.game)).length;
}
export function playStreak(data: PlayerData, scope?: string): number {
  const listed = new Set(LISTED_GAME_IDS);
  const days = new Set(data.results.filter((r) => !r.archive && listed.has(r.game) && (!scope || r.scope === scope)).map((r) => r.date));
  for (const day of data.frozenDays ?? []) days.add(day);
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

export function achievementsFor(data: PlayerData, scope: string, streak: number): AchievementProgress[] {
  const listed = new Set(LISTED_GAME_IDS);
  const results = data.results.filter((result) => result.scope === scope && listed.has(result.game));
  const perfect = results.filter((result) => result.perfect).length;
  const uniqueGames = new Set(results.map((result) => result.game)).size;
  const targets = [
    { name: "First Run", detail: "Complete your first game.", value: results.length, target: 1 },
    { name: "Curious Mind", detail: "Try five different game formats.", value: uniqueGames, target: 5 },
    { name: "Full Arcade", detail: "Play every visible game in the arcade.", value: uniqueGames, target: LISTED_GAME_IDS.length },
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
