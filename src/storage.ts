import type { GameId } from "./lib";
import { localDateKey } from "./lib";

export interface GameResult {
  date: string;
  game: GameId;
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

const empty = (): PlayerData => ({
  results: [],
  bests: {},
  sound: false,
  reducedMotion: false,
  hideStreaks: false
});

export function loadPlayer(): PlayerData {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "null") as Partial<PlayerData> | null;
    return {
      ...empty(),
      ...parsed,
      results: Array.isArray(parsed?.results) ? parsed.results : [],
      bests: parsed?.bests ?? {}
    };
  } catch {
    return empty();
  }
}

export function savePlayer(data: PlayerData): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Storage may be unavailable in private browsing or under a restrictive browser policy.
  }
}

export function recordResult(data: PlayerData, result: GameResult): PlayerData {
  if (data.results.some((r) => r.date === result.date && r.game === result.game)) return data;
  const best = Math.max(data.bests[result.game] ?? 0, result.score);
  const next = {
    ...data,
    results: [...data.results, result].slice(-1200),
    bests: { ...data.bests, [result.game]: best }
  };
  savePlayer(next);
  return next;
}

export function completedToday(data: PlayerData, game?: GameId): number {
  const today = localDateKey();
  return data.results.filter((r) => r.date === today && (!game || r.game === game)).length;
}

export function playStreak(data: PlayerData): number {
  const days = new Set(data.results.map((r) => r.date));
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  const today = localDateKey(cursor);
  if (!days.has(today)) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (days.has(localDateKey(cursor))) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return count;
}

export function totalPlays(data: PlayerData): number {
  return data.results.length;
}