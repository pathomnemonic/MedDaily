import { makeSupabaseRooms, createSupabaseClient } from "./supabaseRooms";
import type { JoinInput, RoomsBackend, RoomState, Unwatch } from "./roomTypes";

import { RoomError } from "./roomTypes";
export { RoomError };
export type { RoomInfo, RoomPlayer, RoomState } from "./roomTypes";
export { rankRoomPlayers } from "./roomRank";

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
  : makeFirebaseRooms();

/** Firebase loads only when a room is used, so its library is out of the startup bundle. */
function makeFirebaseRooms(): RoomsBackend {
  const fb = () => import("./firebase");
  return {
    configured: () => Boolean(env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_PROJECT_ID && env.VITE_FIREBASE_APP_ID),
    join: async (code, input: JoinInput) => {
      try { return await (await fb()).joinOrCreateRoom(code, input); }
      catch (e) {
        // Firebase already words these for the player; surface them instead of the generic "unavailable" notice
        throw e instanceof Error && /different game|room is full|six-character/i.test(e.message) ? new RoomError(e.message) : e;
      }
    },
    watch: (code, cb): Unwatch => {
      let stop: Unwatch | null = null, stopped = false;
      void fb().then((m) => { if (!stopped) stop = m.watchRoom(code, cb); }).catch(() => { if (!stopped) cb(null); });
      return () => { stopped = true; stop?.(); };
    },
    submitScore: async (code, score, maxScore, perfect) => (await fb()).submitRoomScore(code, score, maxScore, perfect),
    leave: async (code) => (await fb()).leaveRoom(code)
  };
}

export const multiplayerConfigured = (): boolean => backend.configured();
export const joinOrCreateRoom = (code: string, input: JoinInput): Promise<RoomState> => backend.join(code, input);
export const watchRoom = (code: string, callback: (room: RoomState | null) => void): Unwatch => backend.watch(code, callback);
export const submitRoomScore = (code: string, score: number, maxScore: number, perfect: boolean): Promise<void> => backend.submitScore(code, score, maxScore, perfect);
export const leaveRoom = (code: string): Promise<void> => backend.leave(code);
