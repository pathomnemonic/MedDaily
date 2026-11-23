import type { SupabaseClient } from "./supabaseClient";
import type { ResultRow, StateRow } from "./accountSync";
import { NATIVE_AUTH_REDIRECT, closeSystemBrowser, isNative, openInSystemBrowser } from "./native";

export interface AccountUser { id: string; email: string | null; provider: string }
export interface RemoteProgress { state: StateRow | null; results: ResultRow[] }

/** A failure whose message is safe to show to the player. */
export class AccountError extends Error {
  constructor(message: string) { super(message); this.name = "AccountError"; }
}

export function friendlyAccountError(error: unknown): AccountError {
  const text = String((error as { message?: string; code?: string } | null)?.message ?? error ?? "");
  const code = String((error as { code?: string } | null)?.code ?? "");
  if (error instanceof AccountError) return error;
  if (/over_email_send_rate_limit|email rate limit|rate limit/i.test(text + code)) return new AccountError("Too many sign-in emails right now. Wait a little and try again, or continue with Google.");
  if (/otp_expired|token has expired|invalid.*(token|otp|code)|otp.*invalid/i.test(text + code)) return new AccountError("That code didn't work or has expired. Request a new one.");
  if (/invalid.*email|unable to validate email|email_address_invalid/i.test(text + code)) return new AccountError("That email address doesn't look right.");
  if (/cancel_subscription_first/.test(text)) return new AccountError("Cancel your active subscription with its provider first, then delete the account.");
  if (/guest_cannot_create_account|not_signed_in/.test(text)) return new AccountError("Sign in to use an account.");
  if (/provider is not enabled|unsupported provider/i.test(text)) return new AccountError("Google sign-in isn't available right now. Try the email option.");
  if (/failed to fetch|network|load failed/i.test(text)) return new AccountError("No connection right now. Your progress is safe on this device.");
  return new AccountError("Something went wrong. Please try again.");
}

interface RawUser { id: string; email?: string | null; is_anonymous?: boolean; app_metadata?: { provider?: string }; identities?: { provider?: string; last_sign_in_at?: string | null }[] | null }

/**
 * The method used for the current sign-in. `app_metadata.provider` is only the account's first method, so a person who
 * signed up by email and later used Google would be mislabelled; the identity that signed in most recently is the one to show.
 */
export function signInProvider(u: RawUser): string {
  const recent = [...(u.identities ?? [])]
    .filter((i) => i.provider)
    .sort((a, b) => Date.parse(b.last_sign_in_at ?? "") - Date.parse(a.last_sign_in_at ?? ""))[0];
  return recent?.provider ?? u.app_metadata?.provider ?? "email";
}

const toUser = (u: RawUser | null | undefined): AccountUser | null =>
  u && !u.is_anonymous ? { id: u.id, email: u.email ?? null, provider: signInProvider(u) } : null;

/** Sign-in, the MedDaily profile, cloud progress and account deletion, against the shared Supabase project's `meddaily` schema. */
export function makeAccounts(getClient: () => Promise<SupabaseClient>, redirectTo: () => string) {
  const need = async () => {
    const c = await getClient();
    const { data } = await c.auth.getSession();
    const user = toUser(data.session?.user);
    if (!user) throw new AccountError("Sign in to use an account.");
    return { c, user };
  };
  return {
    async current(): Promise<AccountUser | null> {
      const c = await getClient();
      const { data } = await c.auth.getSession();
      return toUser(data.session?.user);
    },
    /** Subscribes to sign-in and sign-out. Guest sessions are reported as signed out. */
    async onChange(cb: (user: AccountUser | null) => void): Promise<() => void> {
      const c = await getClient();
      const { data } = c.auth.onAuthStateChange((_event, session) => cb(toUser(session?.user)));
      return () => data.subscription.unsubscribe();
    },
    async signInGoogle(): Promise<void> {
      const c = await getClient();
      if (isNative()) {
        // Google refuses embedded web views: run sign-in in the system browser and come back through the app's own link
        const { data, error } = await c.auth.signInWithOAuth({ provider: "google", options: { redirectTo: NATIVE_AUTH_REDIRECT, skipBrowserRedirect: true } });
        if (error || !data?.url) throw friendlyAccountError(error ?? new Error("no url"));
        await openInSystemBrowser(data.url);
        return;
      }
      const { error } = await c.auth.signInWithOAuth({ provider: "google", options: { redirectTo: redirectTo() } });
      if (error) throw friendlyAccountError(error);
    },
    /** Finishes a native sign-in from the code in the return link. */
    async completeNativeSignIn(code: string): Promise<void> {
      const c = await getClient();
      const { error } = await c.auth.exchangeCodeForSession(code);
      await closeSystemBrowser();
      if (error) throw friendlyAccountError(error);
    },
    async sendEmailCode(email: string): Promise<void> {
      const clean = email.trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(clean)) throw new AccountError("That email address doesn't look right.");
      const c = await getClient();
      const { error } = await c.auth.signInWithOtp({ email: clean, options: { shouldCreateUser: true, emailRedirectTo: isNative() ? NATIVE_AUTH_REDIRECT : redirectTo() } });
      if (error) throw friendlyAccountError(error);
    },
    async verifyEmailCode(email: string, code: string): Promise<void> {
      const token = code.replace(/\s+/g, "");
      if (!/^\d{4,10}$/.test(token)) throw new AccountError("Enter the numeric code from the email.");
      const c = await getClient();
      const { error } = await c.auth.verifyOtp({ email: email.trim().toLowerCase(), token, type: "email" });
      if (error) throw friendlyAccountError(error);
    },
    async signOut(): Promise<void> {
      const c = await getClient();
      await c.auth.signOut({ scope: "local" });
    },
    /** Creates the MedDaily profile on first sign-in (no-op afterwards) and returns the display name. */
    async ensureProfile(name = ""): Promise<string> {
      const { c } = await need();
      const { data, error } = await c.rpc("ensure_profile", { p_name: name });
      if (error) throw friendlyAccountError(error);
      return String((data as { display_name?: string } | null)?.display_name ?? "");
    },
    async setDisplayName(name: string): Promise<void> {
      const { c, user } = await need();
      const { error } = await c.from("profiles").update({ display_name: name.trim().slice(0, 20) }).eq("user_id", user.id);
      if (error) throw friendlyAccountError(error);
    },
    async pull(): Promise<RemoteProgress> {
      const { c } = await need();
      const [state, results] = await Promise.all([
        c.from("player_state").select("xp,bests,settings").maybeSingle(),
        c.from("results").select("day,game_id,scope,score,max_score,perfect,duration_seconds").order("day", { ascending: false }).limit(1200)
      ]);
      if (state.error) throw friendlyAccountError(state.error);
      if (results.error) throw friendlyAccountError(results.error);
      return { state: (state.data as StateRow | null) ?? null, results: (results.data as ResultRow[] | null) ?? [] };
    },
    async push(state: StateRow, rows: readonly ResultRow[]): Promise<void> {
      const { c, user } = await need();
      const { error } = await c.from("player_state").upsert({ user_id: user.id, ...state }, { onConflict: "user_id" });
      if (error) throw friendlyAccountError(error);
      for (let i = 0; i < rows.length; i += 200) {
        const chunk = rows.slice(i, i + 200).map((r) => ({ user_id: user.id, ...r }));
        const res = await c.from("results").upsert(chunk, { onConflict: "user_id,day,game_id,scope", ignoreDuplicates: true });
        if (res.error) throw friendlyAccountError(res.error);
      }
    },
    /** Removes the MedDaily profile and everything stored for it. The shared sign-in identity is left to the platform (other apps may use it). */
    async deleteAccount(): Promise<void> {
      const { c } = await need();
      const { error } = await c.rpc("delete_my_account");
      if (error) throw friendlyAccountError(error);
      await c.auth.signOut({ scope: "local" });
    }
  };
}
export type Accounts = ReturnType<typeof makeAccounts>;
