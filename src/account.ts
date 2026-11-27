import type { SupabaseClient } from "./supabaseClient";
import type { ResultRow, StateRow } from "./accountSync";
import { NATIVE_AUTH_REDIRECT, closeSystemBrowser, isNative, openInSystemBrowser } from "./native";

export interface AccountUser { id: string; email: string | null; provider: string }
export interface RemoteProgress { state: StateRow | null; results: ResultRow[] }
export interface EntitlementRow { plan: string; source: string; status: string; trial_ends_at: string | null; current_period_end: string | null }

/** A failure whose message is safe to show to the player. */
export class AccountError extends Error {
  constructor(message: string) { super(message); this.name = "AccountError"; }
}

export function friendlyAccountError(error: unknown): AccountError {
  const text = String((error as { message?: string; code?: string } | null)?.message ?? error ?? "");
  const code = String((error as { code?: string } | null)?.code ?? "");
  if (error instanceof AccountError) return error;
  if (/over_email_send_rate_limit|email rate limit|rate limit/i.test(text + code)) return new AccountError("Too many sign-in emails right now. Wait a little and try again, or use another sign-in option.");
  if (/otp_expired|token has expired|invalid.*(token|otp|code)|otp.*invalid/i.test(text + code)) return new AccountError("That code didn't work or has expired. Request a new one.");
  if (/invalid.*email|unable to validate email|email_address_invalid/i.test(text + code)) return new AccountError("That email address doesn't look right.");
  if (/cancel_subscription_first/.test(text)) return new AccountError("Cancel your active subscription with its provider first, then delete the account.");
  if (/trial_already_used/.test(text)) return new AccountError("This account has already had its free trial.");
  if (/guest_cannot_start_trial/.test(text)) return new AccountError("Sign in to start your free trial.");
  if (/already_subscribed/.test(text)) return new AccountError("This account already has Pro.");
  if (/guest_cannot_create_account|not_signed_in/.test(text)) return new AccountError("Sign in to use an account.");
  if (/provider is not enabled|unsupported provider/i.test(text)) return new AccountError("That sign-in option isn't available right now. Try the email option.");
  if (/failed to fetch|network|load failed/i.test(text)) return new AccountError("No connection right now. Your progress is safe on this device.");
  return new AccountError("Something went wrong. Please try again.");
}

interface RawUser { id: string; email?: string | null; is_anonymous?: boolean; app_metadata?: { provider?: string }; identities?: { provider?: string; last_sign_in_at?: string | null }[] | null }

/** Reads the payload of a JWT without verifying it (display only; the server verifies tokens on every request). */
export function jwtPayload(token: string | undefined | null): Record<string, unknown> | null {
  try {
    const part = String(token ?? "").split(".")[1];
    if (!part) return null;
    const json = atob(part.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(part.length / 4) * 4, "="));
    return JSON.parse(json) as Record<string, unknown>;
  } catch { return null; }
}

/**
 * How the person signed in for THIS session. The access token's `amr` claim records the method that created the session
 * ("otp" for an emailed code, "oauth" for Google, "password"), so it stays right for accounts that have several linked identities.
 * Without that claim, fall back to the identity that signed in most recently, then to the account's first provider.
 */
export function signInProvider(u: RawUser, accessToken?: string | null): string {
  const amr = jwtPayload(accessToken)?.amr;
  const method = Array.isArray(amr) && amr.length ? String((amr[0] as { method?: string })?.method ?? amr[0]) : "";
  if (method === "otp" || method === "magiclink" || method === "password" || method === "email" || method === "email_change") return "email";
  if (method === "oauth" || method === "sso/saml") {
    // take the most recently used non-email identity (Google or Apple)
    const social = [...(u.identities ?? [])].filter((i) => i.provider && i.provider !== "email")
      .sort((a, b) => Date.parse(b.last_sign_in_at ?? "") - Date.parse(a.last_sign_in_at ?? ""))[0];
    return social?.provider ?? "google";
  }
  const recent = [...(u.identities ?? [])]
    .filter((i) => i.provider)
    .sort((a, b) => Date.parse(b.last_sign_in_at ?? "") - Date.parse(a.last_sign_in_at ?? ""))[0];
  return recent?.provider ?? u.app_metadata?.provider ?? "email";
}

const toUser = (u: RawUser | null | undefined, accessToken?: string | null): AccountUser | null =>
  u && !u.is_anonymous ? { id: u.id, email: u.email ?? null, provider: signInProvider(u, accessToken) } : null;

/** Sign-in, the Roundsy profile, cloud progress and account deletion, against the shared Supabase project's `meddaily` schema. */
export function makeAccounts(getClient: () => Promise<SupabaseClient>, redirectTo: () => string) {
  const need = async () => {
    const c = await getClient();
    const { data } = await c.auth.getSession();
    const user = toUser(data.session?.user, data.session?.access_token);
    if (!user) throw new AccountError("Sign in to use an account.");
    return { c, user };
  };
  return {
    async current(): Promise<AccountUser | null> {
      const c = await getClient();
      const { data } = await c.auth.getSession();
      return toUser(data.session?.user, data.session?.access_token);
    },
    /** Subscribes to sign-in and sign-out. Guest sessions are reported as signed out. */
    async onChange(cb: (user: AccountUser | null) => void): Promise<() => void> {
      const c = await getClient();
      const { data } = c.auth.onAuthStateChange((_event, session) => cb(toUser(session?.user, session?.access_token)));
      return () => data.subscription.unsubscribe();
    },
    /** Sign-in with a social provider. In the native apps it runs in the system browser and returns through the app's own link. */
    async signInWith(provider: "google" | "apple"): Promise<void> {
      const c = await getClient();
      if (isNative()) {
        // Google refuses embedded web views, and Apple's web flow also runs best in the system browser
        const { data, error } = await c.auth.signInWithOAuth({ provider, options: { redirectTo: NATIVE_AUTH_REDIRECT, skipBrowserRedirect: true } });
        if (error || !data?.url) throw friendlyAccountError(error ?? new Error("no url"));
        await openInSystemBrowser(data.url);
        return;
      }
      const { error } = await c.auth.signInWithOAuth({ provider, options: { redirectTo: redirectTo() } });
      if (error) throw friendlyAccountError(error);
    },
    signInGoogle(): Promise<void> { return this.signInWith("google"); },
    signInApple(): Promise<void> { return this.signInWith("apple"); },
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
    /** Creates the Roundsy profile on first sign-in (no-op afterwards) and returns the display name. */
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
        c.from("results").select("day,game_id,scope,score,max_score,perfect,duration_seconds,archive").order("day", { ascending: false }).limit(1200)
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
    /** Whether the signed in account currently has Pro, decided on the server by meddaily.has_pro(). */
    async hasPro(): Promise<boolean> {
      const { c } = await need();
      const { data, error } = await c.rpc("has_pro");
      if (error) throw friendlyAccountError(error);
      return data === true;
    },
    /** The account entitlement row, for showing plan and period dates. Null when the account has never had one. */
    async entitlement(): Promise<EntitlementRow | null> {
      const { c, user } = await need();
      const { data, error } = await c.from("entitlements").select("plan,source,status,trial_ends_at,current_period_end").eq("user_id", user.id).maybeSingle();
      if (error) throw friendlyAccountError(error);
      return (data as EntitlementRow | null) ?? null;
    },
    /** Starts the one time 7 day free trial. The server refuses guests, second trials and accounts that already have Pro. */
    async startTrial(): Promise<void> {
      const { c } = await need();
      const { error } = await c.rpc("start_trial");
      if (error) throw friendlyAccountError(error);
    },
    /** Removes the Roundsy profile and everything stored for it. The shared sign-in identity is left to the platform (other apps may use it). */
    async deleteAccount(): Promise<void> {
      const { c } = await need();
      const { error } = await c.rpc("delete_my_account");
      if (error) throw friendlyAccountError(error);
      await c.auth.signOut({ scope: "local" });
    }
  };
}
export type Accounts = ReturnType<typeof makeAccounts>;
