import * as firebase from "./firebase";
import { makeSupabaseRooms, createSupabaseClient } from "./supabaseRooms";
import type { JoinInput, RoomsBackend, RoomState, Unwatch } from "./roomTypes";

import { RoomError } from "./roomTypes";
export { RoomError };
export type { RoomInfo, RoomPlayer, RoomState } from "./roomTypes";
export { rankRoomPlayers } from "./firebase";

const env = import.meta.env;
const supabaseReady = Boolean(env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY);

/** Rooms stay on Firebase unless VITE_ROOMS_PROVIDER=supabase and the Supabase variables are present. */
export const roomsProvider: "firebase" | "supabase" = env.VITE_ROOMS_PROVIDER === "supabase" && supabaseReady ? "supabase" : "firebase";

let supabaseClient: Promise<Awaited<ReturnType<typeof createSupabaseClient>>> | null = null;
const backend: RoomsBackend = roomsProvider === "supabase"
  ? makeSupabaseRooms({
      configured: true,
      getClient: () => (supabaseClient ??= createSupabaseClient(env.VITE_SUPABASE_URL as string, env.VITE_SUPABASE_ANON_KEY as string))
    })
  : {
      configured: firebase.multiplayerConfigured,
      join: (code, input: JoinInput) => firebase.joinOrCreateRoom(code, input).catch((e: unknown) => {
        // Firebase already words these for the player; surface them instead of the generic "unavailable" notice
        throw e instanceof Error && /different game|room is full|six-character/i.test(e.message) ? new RoomError(e.message) : e;
      }),
      watch: (code, cb): Unwatch => firebase.watchRoom(code, cb),
      submitScore: firebase.submitRoomScore,
      leave: firebase.leaveRoom
    };

export const multiplayerConfigured = (): boolean => backend.configured();
export const joinOrCreateRoom = (code: string, input: JoinInput): Promise<RoomState> => backend.join(code, input);
export const watchRoom = (code: string, callback: (room: RoomState | null) => void): Unwatch => backend.watch(code, callback);
export const submitRoomScore = (code: string, score: number, maxScore: number, perfect: boolean): Promise<void> => backend.submitScore(code, score, maxScore, perfect);
export const leaveRoom = (code: string): Promise<void> => backend.leave(code);
