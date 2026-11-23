import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "./supabaseClient";
import { AccountError, friendlyAccountError, makeAccounts, signInProvider } from "./account";

function fake(user: unknown, handlers: Record<string, (args?: unknown) => { data?: unknown; error?: { message: string } | null }> = {}) {
  const log: string[] = [];
  const chain = (table: string) => {
    const api: Record<string, unknown> = {};
    for (const m of ["select", "order", "limit", "eq", "update", "upsert", "maybeSingle"]) {
      api[m] = (...a: unknown[]) => { log.push(table + "." + m + "(" + JSON.stringify(m === "upsert" ? [JSON.stringify(Array.isArray(a[0]) ? "rows" : a[0]), a[1]] : a).slice(0, 200) + ")"); return api; };
    }
    api.then = (res: (v: unknown) => unknown) => Promise.resolve((handlers[table] ?? (() => ({ data: null, error: null })))()).then(res);
    return api;
  };
  const client = {
    auth: {
      getSession: async () => ({ data: { session: user ? { user } : null } }),
      signInWithOAuth: vi.fn(async () => ({ error: null })), signInWithOtp: vi.fn(async () => ({ error: null })), verifyOtp: vi.fn(async () => ({ error: null })),
      signOut: vi.fn(async () => ({ error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
    },
    rpc: vi.fn(async (fn: string) => (handlers[fn] ?? (() => ({ data: null, error: null })))()),
    from: (t: string) => chain(t)
  } as unknown as SupabaseClient;
  return { client, log };
}
const account = { id: "u1", email: "a@b.co", app_metadata: { provider: "google" }, is_anonymous: false };

describe("sign-in method label", () => {
  it("shows the identity used most recently, not the account's first method", () => {
    expect(signInProvider({ id: "u", app_metadata: { provider: "email" }, identities: [
      { provider: "email", last_sign_in_at: "2026-11-01T10:00:00Z" }, { provider: "google", last_sign_in_at: "2026-11-23T09:00:00Z" }] })).toBe("google");
    expect(signInProvider({ id: "u", app_metadata: { provider: "google" }, identities: [
      { provider: "google", last_sign_in_at: "2026-11-01T10:00:00Z" }, { provider: "email", last_sign_in_at: "2026-11-23T09:00:00Z" }] })).toBe("email");
  });
  it("uses the session's own sign-in method (amr claim) even when the account has several identities", () => {
    const token = (method: string) => "h." + btoa(JSON.stringify({ amr: [{ method, timestamp: 1 }] })).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_") + ".s";
    const both = { id: "u", app_metadata: { provider: "email" }, identities: [
      { provider: "email", last_sign_in_at: "2026-11-23T02:53:43Z" }, { provider: "google", last_sign_in_at: "2026-11-23T01:01:00Z" }] };
    // the real case from the live test: Google was linked earlier, then the person signed in with an emailed code
    expect(signInProvider({ ...both, identities: [{ provider: "email", last_sign_in_at: "2026-10-05T00:00:00Z" }, { provider: "google", last_sign_in_at: "2026-11-23T02:53:43Z" }] }, token("otp"))).toBe("email");
    expect(signInProvider(both, token("oauth"))).toBe("google");
    expect(signInProvider(both, token("password"))).toBe("email");
  });
  it("falls back to the account provider when identities are missing", () => {
    expect(signInProvider({ id: "u", app_metadata: { provider: "google" } })).toBe("google");
    expect(signInProvider({ id: "u" })).toBe("email");
  });
});

describe("accounts", () => {
  it("treats guest sessions as signed out", async () => {
    const f = fake({ id: "g", is_anonymous: true });
    expect(await makeAccounts(async () => f.client, () => "https://x/").current()).toBeNull();
    expect(await makeAccounts(async () => fake(account).client, () => "https://x/").current()).toEqual({ id: "u1", email: "a@b.co", provider: "google" });
  });
  it("starts Google and email sign-in with the redirect URL", async () => {
    const f = fake(null);
    const a = makeAccounts(async () => f.client, () => "https://pathomnemonic.github.io/MedDaily/");
    await a.signInGoogle();
    expect(f.client.auth.signInWithOAuth).toHaveBeenCalledWith({ provider: "google", options: { redirectTo: "https://pathomnemonic.github.io/MedDaily/" } });
    await a.sendEmailCode("  Ann@Example.com ");
    expect(f.client.auth.signInWithOtp).toHaveBeenCalledWith({ email: "ann@example.com", options: { shouldCreateUser: true, emailRedirectTo: "https://pathomnemonic.github.io/MedDaily/" } });
    await expect(a.sendEmailCode("nope")).rejects.toBeInstanceOf(AccountError);
    await a.verifyEmailCode("ann@example.com", "123 456");
    expect(f.client.auth.verifyOtp).toHaveBeenCalledWith({ email: "ann@example.com", token: "123456", type: "email" });
    await expect(a.verifyEmailCode("ann@example.com", "abc")).rejects.toThrow(/numeric code/);
  });
  it("creates the profile through ensure_profile and refuses without a session", async () => {
    const f = fake(account, { ensure_profile: () => ({ data: { display_name: "Ann" } }) });
    expect(await makeAccounts(async () => f.client, () => "").ensureProfile("Ann")).toBe("Ann");
    expect(f.client.rpc).toHaveBeenCalledWith("ensure_profile", { p_name: "Ann" });
    await expect(makeAccounts(async () => fake(null).client, () => "").ensureProfile()).rejects.toThrow(/Sign in/);
  });
  it("pulls progress and pushes state and results in chunks, never overwriting existing results", async () => {
    const f = fake(account, { player_state: () => ({ data: { xp: 5, bests: {}, settings: {} } }), results: () => ({ data: [] }) });
    const a = makeAccounts(async () => f.client, () => "");
    expect((await a.pull()).state?.xp).toBe(5);
    const rows = Array.from({ length: 450 }, (_, i) => ({ day: "2026-11-23", game_id: "g" + i, scope: "general", score: 1, max_score: 2, perfect: false, duration_seconds: 3 }));
    await a.push({ xp: 9, bests: {}, settings: {} }, rows);
    expect(f.log.filter((l) => l.startsWith("results.upsert"))).toHaveLength(3); // 200 + 200 + 50
    expect(f.log.some((l) => l.includes("ignoreDuplicates") && l.includes("user_id,day,game_id,scope"))).toBe(true);
    expect(f.log.some((l) => l.startsWith("player_state.upsert") && l.includes("user_id") && l.includes("u1"))).toBe(true);
  });
  it("deletes the Roundsy account through delete_my_account and signs out locally", async () => {
    const f = fake(account);
    await makeAccounts(async () => f.client, () => "").deleteAccount();
    expect(f.client.rpc).toHaveBeenCalledWith("delete_my_account");
    expect(f.client.auth.signOut).toHaveBeenCalledWith({ scope: "local" });
  });
  it("maps provider errors to plain messages", () => {
    expect(friendlyAccountError({ message: "email rate limit exceeded" }).message).toMatch(/Too many sign-in emails/);
    expect(friendlyAccountError({ message: "Token has expired or is invalid" }).message).toMatch(/code didn't work/);
    expect(friendlyAccountError({ message: "cancel_subscription_first" }).message).toMatch(/Cancel your active subscription/);
    expect(friendlyAccountError({ message: "Failed to fetch" }).message).toMatch(/No connection/);
  });
});
