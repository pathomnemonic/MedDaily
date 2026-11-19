import type { GameId } from "./lib";
import type { PlayerData } from "./storage";

export interface Trophy { id: string; icon: string; name: string; hint: string; earned: boolean }

const dayNumber = (date: string) => Math.floor(Date.parse(date + "T00:00:00Z") / 86400000);

/** Longest run of consecutive calendar days with at least one saved daily result. */
export function longestStreak(data: PlayerData): number {
  const days = [...new Set(data.results.map((r) => dayNumber(r.date)))].sort((a, b) => a - b);
  let best = 0, run = 0, prev = -Infinity;
  for (const day of days) { run = day === prev + 1 ? run + 1 : 1; best = Math.max(best, run); prev = day; }
  return best;
}

export function computeTrophies(data: PlayerData, totalGames: number): Trophy[] {
  const results = data.results;
  const games = new Set<GameId>(results.map((r) => r.game));
  const perDay = new Map<string, Set<GameId>>();
  for (const r of results) perDay.set(r.date + "|" + r.scope, (perDay.get(r.date + "|" + r.scope) ?? new Set()).add(r.game));
  const bestDay = Math.max(0, ...[...perDay.values()].map((s) => s.size));
  const streak = longestStreak(data);
  const best = (game: GameId) => Math.max(0, ...results.filter((r) => r.game === game).map((r) => r.score));
  const t = (id: string, icon: string, name: string, hint: string, earned: boolean): Trophy => ({ id, icon, name, hint, earned });
  return [
    t("first", "🎮", "First Quarter", "Finish any daily game", results.length >= 1),
    t("perfect", "✨", "Flawless", "Get a perfect run", results.some((r) => r.perfect)),
    t("three", "🎯", "Hat Trick", "Finish 3 games in one day", bestDay >= 3),
    t("sampler", "🧩", "Sampler Platter", "Try 8 different games", games.size >= 8),
    t("full", "🏆", "Arcade Cleared", "Finish every game in one day", bestDay >= totalGames),
    t("streak3", "🔥", "Warming Up", "3-day streak", streak >= 3),
    t("streak7", "🌋", "On Fire", "7-day streak", streak >= 7),
    t("streak30", "☄️", "Unstoppable", "30-day streak", streak >= 30),
    t("rounds25", "🎲", "Regular", "Finish 25 daily rounds", results.length >= 25),
    t("rounds100", "👑", "High Roller", "Finish 100 daily rounds", results.length >= 100),
    t("diver", "🩻", "Marrow Master", "Score 400+ in Deep Scan", best("dive") >= 400),
    t("wordsmith", "🔤", "Quick Study", "Solve Stat Word in three guesses or fewer", results.some((r) => r.game === "medle" && r.score >= 76)),
    t("sleuth", "🕵️", "Case Closed", "Crack a Casefile with no hints", results.some((r) => r.game === "casefile" && r.perfect)),
    t("specialist", "🩺", "Specialist", "Finish a daily in a specialty track", results.some((r) => r.scope.startsWith("specialty:")))
  ];
}
