import type { RoomPlayer } from "./roomTypes";

/** Finished players first, then by score, then perfect runs ahead of equal scores. */
export function rankRoomPlayers(players: readonly RoomPlayer[]): RoomPlayer[] {
  return [...players].sort((a, b) => {
    if (a.finished !== b.finished) return Number(b.finished) - Number(a.finished);
    const scoreDifference = (b.score ?? -1) - (a.score ?? -1);
    if (scoreDifference !== 0) return scoreDifference;
    return Number(b.perfect) - Number(a.perfect);
  });
}

