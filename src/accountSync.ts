import type { GameId } from "./lib";
import type { GameResult, PlayerData } from "./storage";

/** Row shapes of meddaily.results and meddaily.player_state. */
export interface ResultRow { day: string; game_id: string; scope: string; score: number; max_score: number; perfect: boolean; duration_seconds: number }
export interface StateRow { xp: number; bests: Record<string, number>; settings: Record<string, unknown> }

const clampInt = (value: unknown, max = 1_000_000): number => {
  const n = Math.round(Number(value));
  return Number.isFinite(n) ? Math.min(max, Math.max(0, n)) : 0;
};

export const resultKey = (r: { date: string; game: string; scope: string }): string => r.date + "|" + r.game + "|" + r.scope;

/** Local results as database rows. The database stores whole, non-negative numbers, so values are rounded and clamped. */
export function toResultRows(results: readonly GameResult[]): ResultRow[] {
  return results
    .filter((r) => r && /^\d{4}-\d{2}-\d{2}$/.test(r.date) && typeof r.game === "string" && r.game.length > 0 && r.game.length <= 32)
    .map((r) => ({
      day: r.date, game_id: r.game, scope: String(r.scope || "general").slice(0, 32),
      score: clampInt(r.score), max_score: clampInt(r.maxScore), perfect: Boolean(r.perfect), duration_seconds: clampInt(r.durationSeconds, 86400)
    }));
}
export const fromResultRows = (rows: readonly ResultRow[]): GameResult[] =>
  rows.map((r) => ({ date: r.day, game: r.game_id as GameId, scope: r.scope, score: r.score, maxScore: r.max_score, perfect: r.perfect, durationSeconds: r.duration_seconds }));

/** The preferences worth carrying to another device. */
export function toStateRow(player: PlayerData): StateRow {
  const bests: Record<string, number> = {};
  for (const [game, value] of Object.entries(player.bests ?? {})) if (typeof value === "number" && Number.isFinite(value)) bests[game] = clampInt(value);
  return {
    xp: clampInt(player.xp, 1_000_000_000), bests,
    settings: { sound: player.sound, music: player.music, haptics: player.haptics, reducedMotion: player.reducedMotion, hideStreaks: player.hideStreaks, theme: player.theme }
  };
}

/**
 * Combine this device with the cloud copy without losing anything: results are the union (one per user, day, game and scope),
 * XP and each best score take the higher value. Preferences only come from the cloud on a device with no history of its own,
 * so signing in never overwrites a look someone just chose.
 */
export function mergePlayerData(local: PlayerData, remote: { state: StateRow | null; results: readonly GameResult[] }): { merged: PlayerData; changedLocal: boolean } {
  const byKey = new Map<string, GameResult>();
  for (const r of local.results) byKey.set(resultKey(r), r);
  let added = 0;
  for (const r of remote.results) if (!byKey.has(resultKey(r))) { byKey.set(resultKey(r), r); added++; }
  const results = [...byKey.values()].sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0)).slice(-1200);

  const bests: PlayerData["bests"] = { ...local.bests };
  let bestsChanged = false;
  for (const [game, value] of Object.entries(remote.state?.bests ?? {})) {
    if (typeof value === "number" && value > ((bests as Record<string, number>)[game] ?? 0)) { (bests as Record<string, number>)[game] = value; bestsChanged = true; }
  }
  const xp = Math.max(local.xp ?? 0, remote.state?.xp ?? 0);

  let merged: PlayerData = { ...local, results, bests, xp };
  const freshDevice = local.results.length === 0 && (local.xp ?? 0) === 0;
  let settingsAdopted = false;
  if (freshDevice && remote.state?.settings) {
    const s = remote.state.settings as Partial<PlayerData>;
    merged = {
      ...merged,
      sound: typeof s.sound === "boolean" ? s.sound : merged.sound,
      music: typeof s.music === "boolean" ? s.music : merged.music,
      haptics: typeof s.haptics === "boolean" ? s.haptics : merged.haptics,
      reducedMotion: typeof s.reducedMotion === "boolean" ? s.reducedMotion : merged.reducedMotion,
      hideStreaks: typeof s.hideStreaks === "boolean" ? s.hideStreaks : merged.hideStreaks,
      theme: s.theme && typeof s.theme === "object" ? s.theme : merged.theme
    };
    settingsAdopted = true;
  }
  return { merged, changedLocal: added > 0 || bestsChanged || xp !== (local.xp ?? 0) || settingsAdopted };
}
