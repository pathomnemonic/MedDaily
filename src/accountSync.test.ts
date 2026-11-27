import { describe, expect, it } from "vitest";
import { fromResultRows, mergePlayerData, toResultRows, toStateRow } from "./accountSync";
import type { GameResult, PlayerData } from "./storage";

const r = (date: string, game: string, score = 50, scope = "general"): GameResult => ({ date, game: game as GameResult["game"], scope, score, maxScore: 100, perfect: false, durationSeconds: 30 });
const player = (over: Partial<PlayerData> = {}): PlayerData => ({ results: [], bests: {}, sound: true, music: true, xp: 0, reducedMotion: false, hideStreaks: false, ...over });

describe("cloud progress", () => {
  it("rounds and clamps values the database would reject, and drops malformed rows", () => {
    const rows = toResultRows([{ ...r("2026-11-23", "medle"), score: 79.6, maxScore: -4, durationSeconds: 1e9 }, { ...r("not a date", "medle") }, { ...r("2026-11-23", "") }]);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ day: "2026-11-23", game_id: "medle", score: 80, max_score: 0, duration_seconds: 86400 });
  });
  it("round-trips rows", () => {
    const back = fromResultRows(toResultRows([r("2026-11-22", "hive", 70)]));
    expect(back[0]).toMatchObject({ date: "2026-11-22", game: "hive", score: 70, maxScore: 100 });
  });
  it("merges two devices without losing anything", () => {
    const local = player({ results: [r("2026-11-22", "medle", 80), r("2026-11-23", "hive", 60)], bests: { medle: 80 }, xp: 120 });
    const remote = { state: { xp: 300, bests: { medle: 95, hive: 70 }, settings: {} }, results: [r("2026-11-22", "medle", 10), r("2026-11-21", "trail", 40)] };
    const { merged, changedLocal } = mergePlayerData(local, remote);
    expect(merged.results.map((x) => x.date + x.game).sort()).toEqual(["2026-11-21trail", "2026-11-22medle", "2026-11-23hive"]);
    expect(merged.results.find((x) => x.game === "medle")!.score).toBe(80); // the local copy of a shared day wins; results never change once written
    expect(merged.bests).toEqual({ medle: 95, hive: 70 });
    expect(merged.xp).toBe(300);
    expect(changedLocal).toBe(true);
  });
  it("reports no change when the cloud has nothing new", () => {
    const local = player({ results: [r("2026-11-22", "medle")], bests: { medle: 80 }, xp: 50 });
    expect(mergePlayerData(local, { state: { xp: 40, bests: { medle: 70 }, settings: {} }, results: [r("2026-11-22", "medle")] }).changedLocal).toBe(false);
  });
  it("only takes preferences from the cloud on a device with no history", () => {
    const remote = { state: { xp: 0, bests: {}, settings: { sound: false, theme: { preset: "ember" } } }, results: [] };
    expect(mergePlayerData(player(), remote).merged.sound).toBe(false);
    expect(mergePlayerData(player({ results: [r("2026-11-22", "medle")], xp: 40 }), remote).merged.sound).toBe(true);
  });
  it("builds a state row", () => {
    expect(toStateRow(player({ xp: 1e12, bests: { medle: 88.4 } }))).toMatchObject({ xp: 1_000_000_000, bests: { medle: 88 } });
  });
  it("round-trips the archive flag on results", () => {
    const rows = toResultRows([{ ...r("2026-11-20", "medle"), archive: true }, r("2026-11-21", "hive")]);
    expect(rows[0].archive).toBe(true);
    expect(rows[1].archive).toBe(false);
    const back = fromResultRows(rows);
    expect(back[0].archive).toBe(true);
    expect(back[1].archive).toBeUndefined();
  });
  it("carries frozen days in the state row and unions them on merge", () => {
    expect(toStateRow(player({ frozenDays: ["2026-11-20", "2026-11-20", "junk", "2026-11-18"] })).settings.frozenDays).toEqual(["2026-11-18", "2026-11-20"]);
    const local = player({ results: [r("2026-11-22", "medle")], frozenDays: ["2026-11-21"] });
    const remote = { state: { xp: 0, bests: {}, settings: { frozenDays: ["2026-11-19", "2026-11-21"] } }, results: [] };
    const { merged, changedLocal } = mergePlayerData(local, remote);
    expect(merged.frozenDays).toEqual(["2026-11-19", "2026-11-21"]);
    expect(changedLocal).toBe(true);
    expect(mergePlayerData(merged, remote).changedLocal).toBe(false);
  });
});
