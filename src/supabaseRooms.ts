import type { SupabaseClient } from "./supabaseClient";
import { RoomError, type JoinInput, type RoomsBackend, type RoomState, type Unwatch } from "./roomTypes";

/** What the database functions raise (see supabase/migrations) mapped to messages a player can act on. */
export function friendlyRoomError(error: unknown): Error {
  const text = String((error as { message?: string } | null)?.message ?? error ?? "");
  if (text.includes("room_mismatch")) return new RoomError("That room belongs to a different game, date, or study track. Check the game and mode before joining.");
  if (text.includes("room_full")) return new RoomError("This room is full (maximum eight players).");
  if (text.includes("bad_room_code")) return new RoomError("Room codes are six letters or numbers.");
  if (text.includes("already_submitted")) return new RoomError("Your score for this room is already in.");
  if (text.includes("not_in_room")) return new RoomError("You are no longer in this room.");
  return error instanceof Error ? error : new Error(text || "Room request failed.");
}

const normalizeCode = (code: string) => code.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);

export interface SupabaseRoomsOptions {
  configured: boolean;
  /** Resolves the (lazily created) client. Kept injectable so the adapter can be tested without a network. */
  getClient: () => Promise<SupabaseClient>;
  /** Fallback refresh in case a realtime message is missed. */
  refreshMs?: number;
  /** Coalesces bursts of realtime events into one fetch. */
  debounceMs?: number;
}

/** Party rooms on the shared Supabase project, using the `meddaily` schema's functions. */
export function makeSupabaseRooms({ configured, getClient, refreshMs = 8000, debounceMs = 120 }: SupabaseRoomsOptions): RoomsBackend {
  /**
   * Guests sign in anonymously, exactly like the Firebase flow; a signed-in account keeps its own session.
   * The sign-in is shared: joining and watching start together, and two parallel anonymous sign-ins would create two
   * different users, leaving the watcher outside the room the joiner just entered.
   */
  let ready: Promise<SupabaseClient> | null = null;
  function client(): Promise<SupabaseClient> {
    ready ??= (async () => {
      const c = await getClient();
      const { data } = await c.auth.getSession();
      if (!data.session) {
        const { error } = await c.auth.signInAnonymously();
        if (error) throw new RoomError("Could not create a guest multiplayer session.");
      }
      return c;
    })().catch((error) => { ready = null; throw error; });
    return ready;
  }
  /**
   * Calls a database function. If the stored guest session is no longer valid (for example the guest user was removed by a
   * stale-account cleanup), drop it, sign in as a fresh guest once, and retry.
   */
  const call = async (fn: string, args: Record<string, unknown>): Promise<{ data: unknown; error: { message: string } | null }> => {
    let c = await client();
    let result = await c.rpc(fn, args);
    if (result.error && /jwt|session|not_signed_in|sub claim|invalid claim|401/i.test(String(result.error.message))) {
      ready = null;
      await c.auth.signOut({ scope: "local" }).catch(() => undefined);
      c = await client();
      result = await c.rpc(fn, args);
    }
    return result as { data: unknown; error: { message: string } | null };
  };
  const fetchState = async (c: SupabaseClient, code: string): Promise<RoomState | null> => {
    void c;
    const { data, error } = await call("get_room_state", { p_code: code });
    if (error) throw friendlyRoomError(error);
    return (data as RoomState | null) ?? null;
  };

  return {
    configured: () => configured,

    async join(codeInput, input: JoinInput) {
      const code = normalizeCode(codeInput);
      if (code.length !== 6) throw new RoomError("Enter a six-character room code.");
      const { data, error } = await call("join_room", {
        p_code: code, p_game_id: input.gameId, p_scope: input.scope, p_specialty: input.specialty,
        p_day: input.date, p_seed: input.seed, p_name: input.name
      });
      if (error) throw friendlyRoomError(error);
      return data as RoomState;
    },

    watch(codeInput, callback): Unwatch {
      const code = normalizeCode(codeInput);
      let stopped = false;
      let timer: ReturnType<typeof setTimeout> | null = null;
      let poll: ReturnType<typeof setInterval> | null = null;
      let cleanup: (() => void) | null = null;
      const refresh = async (c: SupabaseClient) => {
        try { const state = await fetchState(c, code); if (!stopped) callback(state); }
        catch { if (!stopped) callback(null); }
      };
      void (async () => {
        try {
          const c = await client();
          if (stopped) return;
          await refresh(c);
          const schedule = () => { if (timer) clearTimeout(timer); timer = setTimeout(() => void refresh(c), debounceMs); };
          const channel = c.channel("meddaily-room-" + code)
            .on("postgres_changes", { event: "*", schema: "meddaily", table: "room_players", filter: "room_code=eq." + code }, schedule)
            .on("postgres_changes", { event: "*", schema: "meddaily", table: "rooms", filter: "code=eq." + code }, schedule)
            // anything that changed between the first fetch and the subscription going live would otherwise be missed
            .subscribe((status: string) => { if (status === "SUBSCRIBED") schedule(); });
          poll = setInterval(() => void refresh(c), refreshMs);
          cleanup = () => { void c.removeChannel(channel); };
          if (stopped) cleanup();
        } catch { if (!stopped) callback(null); }
      })();
      return () => {
        stopped = true;
        if (timer) clearTimeout(timer);
        if (poll) clearInterval(poll);
        cleanup?.();
      };
    },

    async submitScore(codeInput, score, maxScore, perfect) {
      const { error } = await call("submit_score", { p_code: normalizeCode(codeInput), p_score: Math.round(score), p_max: Math.round(maxScore), p_perfect: perfect });
      if (error) throw friendlyRoomError(error);
    },

    async leave(codeInput) {
      const { error } = await call("leave_room", { p_code: normalizeCode(codeInput) });
      if (error) throw friendlyRoomError(error);
    }
  };
}
