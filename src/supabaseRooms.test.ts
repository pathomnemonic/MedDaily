import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { friendlyRoomError, makeSupabaseRooms } from "./supabaseRooms";
import { RoomError } from "./roomTypes";

type Handler = () => void;
/** A scripted stand-in for the parts of the Supabase client the adapter uses. */
function fakeClient(opts: { session?: boolean; rpc?: (fn: string, args: Record<string, unknown>) => { data?: unknown; error?: { message: string } } } = {}) {
  const calls: { fn: string; args: Record<string, unknown> }[] = [];
  const handlers: Handler[] = [];
  const removed: unknown[] = [];
  const signIn = vi.fn(async () => ({ error: null }));
  const channel: { on: (...a: unknown[]) => typeof channel; subscribe: () => typeof channel; handlers: Handler[] } = {
    handlers,
    on(_type, _filter, cb) { handlers.push(cb as Handler); return channel; },
    subscribe() { return channel; }
  };
  const client = {
    auth: { getSession: async () => ({ data: { session: opts.session === false ? null : { user: { id: "u1" } } } }), signInAnonymously: signIn },
    rpc: async (fn: string, args: Record<string, unknown>) => { calls.push({ fn, args }); return opts.rpc ? opts.rpc(fn, args) : { data: null }; },
    channel: vi.fn(() => channel),
    removeChannel: vi.fn(async (c: unknown) => { removed.push(c); })
  } as unknown as SupabaseClient;
  return { client, calls, handlers, removed, signIn };
}
const state = { code: "ABC123", gameId: "medle", scope: "party", specialty: "general", date: "2026-11-23", seed: 7, hostUid: "u1", status: "waiting", players: [] };

describe("Supabase rooms adapter", () => {
  it("signs guests in anonymously, then joins through the join_room function", async () => {
    const f = fakeClient({ session: false, rpc: () => ({ data: state }) });
    const rooms = makeSupabaseRooms({ configured: true, getClient: async () => f.client });
    const joined = await rooms.join("abc-123", { gameId: "medle", scope: "party", specialty: "general", date: "2026-11-23", seed: 7, name: "Ann" });
    expect(f.signIn).toHaveBeenCalledOnce();
    expect(f.calls[0]).toEqual({ fn: "join_room", args: { p_code: "ABC123", p_game_id: "medle", p_scope: "party", p_specialty: "general", p_day: "2026-11-23", p_seed: 7, p_name: "Ann" } });
    expect(joined.code).toBe("ABC123");
  });
  it("signs in once even when joining and watching start at the same moment", async () => {
    const f = fakeClient({ session: false, rpc: () => ({ data: state }) });
    const rooms = makeSupabaseRooms({ configured: true, getClient: async () => f.client });
    const stop = rooms.watch("ABC123", () => undefined);
    await rooms.join("ABC123", { gameId: "medle", scope: "party", specialty: "general", date: "2026-11-23", seed: 7, name: "Ann" });
    stop();
    expect(f.signIn).toHaveBeenCalledOnce();
  });
  it("recovers when the stored guest session was removed server-side", async () => {
    let first = true;
    const f = fakeClient({ rpc: () => { if (first) { first = false; return { error: { message: "JWT: User from sub claim in JWT does not exist" } }; } return { data: state }; } });
    let signedIn = true;
    const auth = f.client.auth as unknown as { signOut: () => Promise<unknown>; getSession: () => Promise<unknown> };
    const signOut = vi.fn(async () => { signedIn = false; return { error: null }; });
    auth.signOut = signOut;
    auth.getSession = async () => ({ data: { session: signedIn ? { user: { id: "u1" } } : null } });
    const rooms = makeSupabaseRooms({ configured: true, getClient: async () => f.client });
    const joined = await rooms.join("ABC123", { gameId: "medle", scope: "party", specialty: "general", date: "2026-11-23", seed: 7, name: "Ann" });
    expect(signOut).toHaveBeenCalledOnce();
    expect(f.signIn).toHaveBeenCalledOnce(); // a fresh guest after the stale one was dropped
    expect(f.calls.map((c) => c.fn)).toEqual(["join_room", "join_room"]);
    expect(joined.code).toBe("ABC123");
  });
  it("keeps an existing session instead of signing in again", async () => {
    const f = fakeClient({ rpc: () => ({ data: state }) });
    const rooms = makeSupabaseRooms({ configured: true, getClient: async () => f.client });
    await rooms.join("ABC123", { gameId: "medle", scope: "party", specialty: "general", date: "2026-11-23", seed: 7, name: "Ann" });
    expect(f.signIn).not.toHaveBeenCalled();
  });
  it("rejects malformed codes before any network call", async () => {
    const f = fakeClient();
    const rooms = makeSupabaseRooms({ configured: true, getClient: async () => f.client });
    await expect(rooms.join("abc", { gameId: "medle", scope: "party", specialty: "general", date: "2026-11-23", seed: 7, name: "A" })).rejects.toBeInstanceOf(RoomError);
    expect(f.calls).toHaveLength(0);
  });
  it("turns database errors into messages a player can act on", async () => {
    const f = fakeClient({ rpc: () => ({ error: { message: "room_mismatch" } }) });
    const rooms = makeSupabaseRooms({ configured: true, getClient: async () => f.client });
    await expect(rooms.join("ABC123", { gameId: "hive", scope: "party", specialty: "general", date: "2026-11-23", seed: 7, name: "A" })).rejects.toThrow(/different game, date, or study track/);
    expect(friendlyRoomError({ message: "room_full" }).message).toMatch(/full/);
    expect(friendlyRoomError({ message: "already_submitted" })).toBeInstanceOf(RoomError);
  });
  it("submits rounded scores and leaves through the functions", async () => {
    const f = fakeClient();
    const rooms = makeSupabaseRooms({ configured: true, getClient: async () => f.client });
    await rooms.submitScore("abc123", 79.6, 100, false);
    await rooms.leave("abc123");
    expect(f.calls.map((c) => c.fn)).toEqual(["submit_score", "leave_room"]);
    expect(f.calls[0].args).toEqual({ p_code: "ABC123", p_score: 80, p_max: 100, p_perfect: false });
  });
  it("watches a room: initial state, refetch on realtime events, and clean unsubscribe", async () => {
    vi.useFakeTimers();
    let players = 1;
    const f = fakeClient({ rpc: () => ({ data: { ...state, players: Array.from({ length: players }, (_, i) => ({ uid: "u" + i })) } }) });
    const rooms = makeSupabaseRooms({ configured: true, getClient: async () => f.client, debounceMs: 50, refreshMs: 60000 });
    const seen: (RoomState | null)[] = [];
    type RoomState = { players: unknown[] };
    const stop = rooms.watch("abc123", (r) => seen.push(r as RoomState | null));
    await vi.advanceTimersByTimeAsync(0);
    expect(seen).toHaveLength(1);
    expect((seen[0] as RoomState).players).toHaveLength(1);
    expect(f.handlers).toHaveLength(2); // room_players and rooms subscriptions
    players = 2;
    f.handlers[0](); f.handlers[0](); f.handlers[1](); // a burst of events
    await vi.advanceTimersByTimeAsync(60);
    expect(seen).toHaveLength(2); // coalesced into one refresh
    expect((seen[1] as RoomState).players).toHaveLength(2);
    stop();
    expect(f.removed).toHaveLength(1);
    f.handlers[0](); await vi.advanceTimersByTimeAsync(200);
    expect(seen).toHaveLength(2); // nothing after unsubscribe
    vi.useRealTimers();
  });
  it("reports null to the watcher when the room can no longer be read", async () => {
    const f = fakeClient({ rpc: () => ({ error: { message: "boom" } }) });
    const rooms = makeSupabaseRooms({ configured: true, getClient: async () => f.client });
    const seen: unknown[] = [];
    const stop = rooms.watch("abc123", (r) => seen.push(r));
    await new Promise((r) => setTimeout(r, 10));
    stop();
    expect(seen[0]).toBeNull();
  });
});
