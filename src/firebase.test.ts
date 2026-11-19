import { describe, expect, it } from "vitest";
import { rankRoomPlayers, type RoomPlayer } from "./firebase";

const player = (uid: string, score: number | null, finished: boolean, perfect = false): RoomPlayer => ({
  uid,
  name: uid,
  score,
  maxScore: 100,
  finished,
  perfect
});

describe("friend-room leaderboard", () => {
  it("ranks completed runs before unfinished players, then by score", () => {
    const ranked = rankRoomPlayers([
      player("still-playing", 99, false),
      player("bronze", 65, true),
      player("gold", 95, true),
      player("silver", 80, true)
    ]);
    expect(ranked.map((item) => item.uid)).toEqual(["gold", "silver", "bronze", "still-playing"]);
  });

  it("uses a perfect-run tiebreaker without mutating the room snapshot", () => {
    const source = [
      player("ordinary", 90, true, false),
      player("perfect", 90, true, true)
    ];
    const ranked = rankRoomPlayers(source);
    expect(ranked.map((item) => item.uid)).toEqual(["perfect", "ordinary"]);
    expect(source.map((item) => item.uid)).toEqual(["ordinary", "perfect"]);
  });
});
