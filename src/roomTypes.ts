import type { GameId } from "./lib";

/** Shared shapes for party rooms, independent of which backend stores them. */
export interface RoomInfo {
  code: string;
  gameId: GameId;
  scope: string;
  specialty: string;
  date: string;
  seed: number;
}
export interface RoomPlayer {
  uid: string;
  name: string;
  score: number | null;
  maxScore: number | null;
  finished: boolean;
  perfect: boolean;
}
export interface RoomState extends RoomInfo {
  hostUid: string;
  players: RoomPlayer[];
  status: "waiting" | "playing";
}
export type JoinInput = Omit<RoomInfo, "code"> & { name: string };
export type Unwatch = () => void;

/** An error whose message is safe and useful to show to the player. */
export class RoomError extends Error {
  constructor(message: string) { super(message); this.name = "RoomError"; }
}
export interface RoomsBackend {
  configured(): boolean;
  join(code: string, input: JoinInput): Promise<RoomState>;
  watch(code: string, callback: (room: RoomState | null) => void): Unwatch;
  submitScore(code: string, score: number, maxScore: number, perfect: boolean): Promise<void>;
  leave(code: string): Promise<void>;
}
