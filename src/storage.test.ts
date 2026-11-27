import { describe, expect, it } from "vitest";
import { achievementsFor, completedToday, playStreak, recordResult, type GameResult, type PlayerData } from "./storage";
import { dailyDateKey, LISTED_GAME_IDS } from "./lib";
import type { GameId } from "./lib";

const emptyPlayer = (): PlayerData => ({
  results: [],
  bests: {},
  sound: false,
  music: false,
  xp: 0,
  reducedMotion: false,
  hideStreaks: false
});

const result = (game: GameId, index: number, scope = "general", perfect = false): GameResult => ({
  date: "2026-11-" + String(index % 28 + 1).padStart(2, "0"),
  game,
  scope,
  score: perfect ? 100 : 60,
  maxScore: 100,
  perfect,
  durationSeconds: 90
});

describe("local achievement progression", () => {
  it("keeps every achievement locked for a new player", () => {
    const achievements = achievementsFor(emptyPlayer(), "general", 0);
    expect(achievements).toHaveLength(6);
    expect(achievements.every((item) => !item.earned)).toBe(true);
    expect(achievements[0].progress).toBe("0/1");
  });

  it("unlocks variety without confusing it with full-arcade completion", () => {
    const player = emptyPlayer();
    player.results = [
      result("medle", 0),
      result("connections", 1),
      result("diagnosis", 2),
      result("pairs", 3),
      result("labline", 4)
    ];
    const achievements = achievementsFor(player, "general", 2);
    expect(achievements.find((item) => item.name === "Curious Mind")?.earned).toBe(true);
    expect(achievements.find((item) => item.name === "Full Arcade")?.earned).toBe(false);
  });

  it("unlocks milestones only from the selected study scope", () => {
    const player = emptyPlayer();
    player.results = [result("medle", 0, "general"), result("connections", 1, "specialty")];
    expect(achievementsFor(player, "general", 0)[0].earned).toBe(true);
    expect(achievementsFor(player, "specialty", 0)[0].earned).toBe(true);
    expect(achievementsFor(player, "general", 0)[1].earned).toBe(false);
  });

  it("does not unlock Full Arcade using a hidden game's historical result", () => {
    const player = emptyPlayer();
    player.results = [
      ...LISTED_GAME_IDS.slice(0, -1).map((game, index) => result(game, index)),
      result("bodymap", 99)
    ];
    expect(achievementsFor(player, "general", 0).find((item) => item.name === "Full Arcade")?.earned).toBe(false);
    player.results.push(result(LISTED_GAME_IDS[LISTED_GAME_IDS.length - 1], 100));
    expect(achievementsFor(player, "general", 0).find((item) => item.name === "Full Arcade")?.earned).toBe(true);
  });

  it("unlocks the veteran, perfect-run, full-arcade, and streak milestones at their thresholds", () => {
    const player = emptyPlayer();
    const games: GameId[] = [...LISTED_GAME_IDS];
    player.results = Array.from({ length: 100 }, (_, index) => result(games[index % games.length], index, "general", index < 5));
    const achievements = achievementsFor(player, "general", 7);
    expect(achievements.every((item) => item.earned)).toBe(true);
    expect(achievements.map((item) => item.progress)).toEqual(["1/1","5/5",games.length + "/" + games.length,"5/5","100/100","7/7"]);
  });
});

describe("result recording", () => {
  it("does not double-count the same daily game and scope", () => {
    const player = emptyPlayer();
    const first = recordResult(player, result("medle", 0));
    const duplicate = recordResult(first, result("medle", 0));
    expect(duplicate.results).toHaveLength(1);
  });

  it("tracks the best score per game", () => {
    const player = emptyPlayer();
    const first = recordResult(player, { ...result("medle", 0), score: 55 });
    const second = recordResult(first, { ...result("connections", 1), score: 70 });
    expect(second.bests.medle).toBe(55);
    expect(second.bests.connections).toBe(70);
  });

  it("lets a replay of a recorded day raise the best without adding a result", () => {
    const player = emptyPlayer();
    const first = recordResult(player, { ...result("medle", 0), score: 55 });
    const replay = recordResult(first, { ...result("medle", 0), score: 90, archive: true });
    expect(replay.results).toHaveLength(1);
    expect(replay.bests.medle).toBe(90);
  });
});

describe("daily catalog progress", () => {
  it("does not let hidden-game results maintain the daily streak", () => {
    const player = emptyPlayer();
    const today = dailyDateKey();
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    player.results = [
      { ...result("bodymap", 0), date: today },
      { ...result("bodymap", 1), date: dailyDateKey(yesterday) }
    ];
    expect(playStreak(player)).toBe(0);
    player.results.push(
      { ...result("medle", 2), date: today },
      { ...result("connections", 3), date: dailyDateKey(yesterday) }
    );
    expect(playStreak(player)).toBe(2);
  });

  it("can exclude hidden and retired game results from the visible completion count", () => {
    const player = emptyPlayer();
    const today = dailyDateKey();
    player.results = [
      { ...result("medle", 0), date: today },
      { ...result("bodymap", 1), date: today }
    ];
    expect(completedToday(player, "general")).toBe(1);
    expect(completedToday(player, "general", ["medle"])).toBe(1);
  });
});

import { levelFor } from "./levels";
describe("level maths survives corrupted xp", () => {
  it("never loops forever or returns NaN", () => {
    for (const xp of [Number.NaN, -50, 1e308, Infinity]) {
      const lv = levelFor(xp);
      expect(Number.isFinite(lv.level)).toBe(true);
      expect(lv.pct).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("streak rules for archive plays and frozen days", () => {
  const dayKey = (daysAgo: number): string => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - daysAgo);
    return dailyDateKey(d);
  };
  it("counts a frozen day as kept and bridges a one day gap", () => {
    const player = emptyPlayer();
    player.results = [{ ...result("medle", 0), date: dayKey(2) }];
    expect(playStreak(player)).toBe(0);
    player.frozenDays = [dayKey(1)];
    expect(playStreak(player)).toBe(2);
  });
  it("never lets an archive play hold or extend a streak", () => {
    const player = emptyPlayer();
    player.results = [
      { ...result("medle", 0), date: dayKey(0) },
      { ...result("medle", 1), date: dayKey(1), archive: true },
      { ...result("medle", 2), date: dayKey(2) }
    ];
    expect(playStreak(player)).toBe(1);
    expect(completedToday(player)).toBe(1);
  });
});
