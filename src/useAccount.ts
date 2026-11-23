import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { friendlyAccountError, makeAccounts, type AccountUser } from "./account";
import { fromResultRows, mergePlayerData, resultKey, toResultRows, toStateRow } from "./accountSync";
import { getSupabase, hasStoredSupabaseSession, supabaseConfigured } from "./supabaseClient";
import { savePlayer, type PlayerData } from "./storage";
import { isNative, onAppUrl, parseAuthCallback } from "./native";

/** Accounts appear when the Supabase variables are set; VITE_ACCOUNTS=off hides them without a code change. */
export const accountsEnabled: boolean = supabaseConfigured && import.meta.env.VITE_ACCOUNTS !== "off";

type Busy = "google" | "email" | "verify" | "sync" | "delete" | "name" | null;
export interface Notice { kind: "ok" | "error"; text: string }

const read = (key: string): string | null => { try { return localStorage.getItem(key); } catch { return null; } };
const write = (key: string, value: string) => { try { localStorage.setItem(key, value); } catch { /* storage unavailable */ } };
const FLAG_AUTO = "meddaily:cloudsync", FLAG_LAST = "meddaily:lastsync";

/** Sign-in, profile, optional cloud backup and account deletion for the Settings page. Everything stays optional: signed out, nothing changes. */
export function useAccount(player: PlayerData, setPlayer: Dispatch<SetStateAction<PlayerData>>) {
  const accounts = useMemo(() => (accountsEnabled ? makeAccounts(getSupabase, () => window.location.origin + window.location.pathname) : null), []);
  const [user, setUser] = useState<AccountUser | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [busy, setBusy] = useState<Busy>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [emailSent, setEmailSent] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<string | null>(() => read(FLAG_LAST));
  const [auto, setAutoState] = useState<boolean>(() => read(FLAG_AUTO) !== "0");
  const playerRef = useRef(player);
  playerRef.current = player;
  const syncing = useRef(false);
  const signedInFor = useRef<string | null>(null);
  const listening = useRef<Promise<void> | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fail = (e: unknown) => setNotice({ kind: "error", text: friendlyAccountError(e).message });

  /** Merge with the cloud copy, then upload what the cloud lacks. A failure leaves local progress untouched. */
  const sync = useCallback(async (quiet = false) => {
    if (!accounts || syncing.current) return;
    syncing.current = true;
    if (!quiet) setBusy("sync");
    try {
      const remote = await accounts.pull();
      const { merged, changedLocal } = mergePlayerData(playerRef.current, { state: remote.state, results: fromResultRows(remote.results) });
      if (changedLocal) { savePlayer(merged); setPlayer(() => merged); playerRef.current = merged; }
      const have = new Set(remote.results.map((r) => resultKey({ date: r.day, game: r.game_id, scope: r.scope })));
      await accounts.push(toStateRow(merged), toResultRows(merged.results.filter((r) => !have.has(resultKey(r)))));
      const stamp = new Date().toISOString();
      write(FLAG_LAST, stamp); setLastSynced(stamp);
      if (!quiet) setNotice({ kind: "ok", text: "Progress backed up." });
    } catch (e) { if (!quiet) fail(e); }
    finally { syncing.current = false; setBusy((b) => (b === "sync" ? null : b)); }
  }, [accounts, setPlayer]);

  const handleSignedIn = useCallback(async (u: AccountUser) => {
    if (!accounts || signedInFor.current === u.id) return;
    signedInFor.current = u.id;
    try {
      const name = await accounts.ensureProfile();
      setDisplayName(name);
      setNotice({ kind: "ok", text: "Signed in as " + (u.email ?? "your account") + "." });
      await sync(true);
    } catch (e) { signedInFor.current = null; fail(e); }
  }, [accounts, sync]);

  /** Start watching sign-in state (once). The Supabase library loads here, not at startup. */
  const listen = useCallback(() => {
    if (!accounts) return Promise.resolve();
    listening.current ??= (async () => {
      const current = await accounts.current();
      setUser(current);
      if (current) void handleSignedIn(current);
      await accounts.onChange((u) => {
        setUser(u);
        if (u) void handleSignedIn(u);
        else { signedInFor.current = null; setDisplayName(""); }
      });
    })().catch(() => { listening.current = null; });
    return listening.current;
  }, [accounts, handleSignedIn]);

  // A result recorded while offline is uploaded as soon as the connection comes back
  useEffect(() => {
    if (!accounts) return;
    const onOnline = () => { if (signedInFor.current && read(FLAG_AUTO) !== "0") void sync(true); };
    window.addEventListener("online", onOnline);
    return () => window.removeEventListener("online", onOnline);
  }, [accounts, sync]);

  // In the app shell, the system browser hands the sign-in code back through a link that opens the app
  useEffect(() => {
    if (!accounts || !isNative()) return;
    let stop: (() => void) | null = null, gone = false;
    void onAppUrl(async (url) => {
      const back = parseAuthCallback(url);
      if (!back) return;
      if (back.error) { fail(new Error(back.error)); return; }
      if (back.code) { await listen(); try { await accounts.completeNativeSignIn(back.code); } catch (e) { fail(e); } }
    }).then((off) => { if (gone) off(); else stop = off; });
    return () => { gone = true; stop?.(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts, listen]);

  // Returning visitors (a stored session) and sign-in redirects start the client straight away; everyone else never loads it.
  useEffect(() => {
    if (!accounts || !hasStoredSupabaseSession()) return;
    void listen().then(() => {
      // tidy the sign-in parameters out of the address bar after a redirect
      try {
        const url = new URL(window.location.href);
        let changed = false;
        for (const key of ["code", "error", "error_code", "error_description"]) if (url.searchParams.has(key)) { url.searchParams.delete(key); changed = true; }
        if (url.hash.includes("access_token") || url.hash.includes("error")) { url.hash = ""; changed = true; }
        if (changed) window.history.replaceState({}, "", url.pathname + url.search + url.hash);
      } catch { /* not critical */ }
    });
  }, [accounts, listen]);

  const run = async (kind: Exclude<Busy, null>, work: () => Promise<void>) => {
    if (!accounts) return;
    setBusy(kind); setNotice(null);
    try { await listen(); await work(); } catch (e) { fail(e); } finally { setBusy((b) => (b === kind ? null : b)); }
  };

  return {
    available: Boolean(accounts),
    user, displayName, busy, notice, emailSent, lastSynced, auto,
    dismissNotice: () => setNotice(null),
    signInGoogle: () => run("google", () => accounts!.signInGoogle()),
    sendEmailCode: (email: string) => run("email", async () => { await accounts!.sendEmailCode(email); setEmailSent(email.trim().toLowerCase()); setNotice({ kind: "ok", text: "Check your email for a sign-in code." }); }),
    verifyEmailCode: (code: string) => run("verify", async () => { if (!emailSent) return; await accounts!.verifyEmailCode(emailSent, code); setEmailSent(null); }),
    cancelEmail: () => { setEmailSent(null); setNotice(null); },
    signOut: () => run("sync", async () => { await accounts!.signOut(); setUser(null); signedInFor.current = null; setNotice({ kind: "ok", text: "Signed out. Your progress stays on this device." }); }),
    saveName: (name: string) => run("name", async () => { await accounts!.setDisplayName(name); setDisplayName(name.trim().slice(0, 20)); setNotice({ kind: "ok", text: "Name saved." }); }),
    syncNow: () => sync(false),
    setAuto: (on: boolean) => { write(FLAG_AUTO, on ? "1" : "0"); setAutoState(on); },
    /** Call after a result is recorded: backs up shortly afterwards when signed in and automatic backup is on. */
    afterResult: () => {
      if (!accounts || !user || !auto) return;
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void sync(true), 2500);
    },
    deleteAccount: () => run("delete", async () => {
      await accounts!.deleteAccount();
      setUser(null); signedInFor.current = null; setDisplayName(""); setLastSynced(null);
      try { localStorage.removeItem(FLAG_LAST); } catch { /* ignore */ }
      setNotice({ kind: "ok", text: "Your Roundsy account and cloud progress were deleted. Progress on this device is still here." });
    })
  };
}
export type AccountController = ReturnType<typeof useAccount>;
