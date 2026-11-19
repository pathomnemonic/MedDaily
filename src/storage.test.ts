import { describe, expect, it } from "vitest";
import { achievementsFor, recordResult, type GameResult, type PlayerData } from "./storage";
import type { GameId } from "./lib";

const emptyPlayer = (): PlayerData => ({
  results: [],
  bests: {},
  sound: false,
  music: false,
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
    const achievements = achievementsFor(emptyPlayer(), "general", 0, 16);
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
      result("microbe", 3),
      result("labline", 4)
    ];
    const achievements = achievementsFor(player, "general", 2, 16);
    expect(achievements.find((item) => item.name === "Curious Mind")?.earned).toBe(true);
    expect(achievements.find((item) => item.name === "Full Arcade")?.earned).toBe(false);
  });

  it("unlocks milestones only from the selected study scope", () => {
    const player = emptyPlayer();
    player.results = [result("medle", 0, "general"), result("connections", 1, "specialty")];
    expect(achievementsFor(player, "general", 0, 16)[0].earned).toBe(true);
    expect(achievementsFor(player, "specialty", 0, 16)[0].earned).toBe(true);
    expect(achievementsFor(player, "general", 0, 16)[1].earned).toBe(false);
  });

  it("unlocks the veteran, perfect-run, full-arcade, and streak milestones at their thresholds", () => {
    const player = emptyPlayer();
    const games: GameId[] = ["medle","connections","diagnosis","microbe","labline","pairs","triage","splice","glyph","higher","ladder","hive","casefile","dive","trivia","lettergrid"];
    player.results = Array.from({ length: 100 }, (_, index) => result(games[index % games.length], index, "general", index < 5));
    const achievements = achievementsFor(player, "general", 7, games.length);
    expect(achievements.every((item) => item.earned)).toBe(true);
    expect(achievements.map((item) => item.progress)).toEqual(["1/1","5/5","16/16","5/5","100/100","7/7"]);
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
});
