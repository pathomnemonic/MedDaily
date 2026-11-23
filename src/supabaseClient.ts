import type { SupabaseClient as BaseClient } from "@supabase/supabase-js";

/** The client is scoped to the `meddaily` schema, which the generic default ("public") does not know about. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SupabaseClient = BaseClient<any, any, any>;

const env = import.meta.env;
export const supabaseConfigured = Boolean(env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY);

/** Real client: loaded on first use so the Supabase library never ships in the startup path. */
export async function createSupabaseClient(url: string, anonKey: string): Promise<SupabaseClient> {
  const { createClient } = await import("@supabase/supabase-js");
  return createClient(url, anonKey, {
    db: { schema: "meddaily" },
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "pkce" }
  });
}

let shared: Promise<SupabaseClient> | null = null;
/** One client for rooms and accounts, so a signed-in player uses their own session everywhere. */
export function getSupabase(): Promise<SupabaseClient> {
  shared ??= createSupabaseClient(env.VITE_SUPABASE_URL as string, env.VITE_SUPABASE_ANON_KEY as string);
  return shared;
}

/** True when a stored Supabase session (guest or account) or a sign-in redirect is present, so the client should start now. */
export function hasStoredSupabaseSession(): boolean {
  try {
    if (/[?&#](code|access_token|error_description)=/.test(window.location.href)) return true;
    return Object.keys(localStorage).some((k) => k.startsWith("sb-") && k.endsWith("-auth-token"));
  } catch { return false; }
}
