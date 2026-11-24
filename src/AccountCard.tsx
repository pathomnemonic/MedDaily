import { useState } from "react";
import type { AccountController } from "./useAccount";
import { appleSignInEnabled } from "./useAccount";

const PRIVACY = "https://pathomnemonic.github.io/StudyBible/privacy.html";

/** Settings card: optional sign-in, cloud backup and account deletion. Nothing in the game requires it. */
export default function AccountCard({ account }: { account: AccountController }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [typed, setTyped] = useState("");
  if (!account.available) return null;
  const busy = account.busy !== null;
  const { user } = account;

  return <section className="settings-card account-card" aria-label="Account">
    <h2>Account <small>optional</small></h2>
    {!user ? <>
      <p>Play with no account at all. Sign in only if you want your progress backed up and available on another device.</p>
      <button className="button account-google" onClick={() => void account.signInGoogle()} disabled={busy}>
        <span aria-hidden="true" className="g-mark">G</span>{account.busy === "google" ? "Opening Google…" : "Continue with Google"}
      </button>
      {appleSignInEnabled && <button className="button account-apple" onClick={() => void account.signInApple()} disabled={busy}>
        <svg aria-hidden="true" className="a-mark" viewBox="0 0 384 512" width="18" height="22"><path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>{account.busy === "apple" ? "Opening Apple…" : "Sign in with Apple"}
      </button>}
      <div className="account-or"><span>or use email</span></div>
      {!account.emailSent ? <form className="account-row" onSubmit={(e) => { e.preventDefault(); void account.sendEmailCode(email); }}>
        <input type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email address" />
        <button className="button button-primary" type="submit" disabled={busy || !email.trim()}>{account.busy === "email" ? "Sending…" : "Email me a code"}</button>
      </form> : <form className="account-row" onSubmit={(e) => { e.preventDefault(); void account.verifyEmailCode(code); }}>
        <input inputMode="numeric" autoComplete="one-time-code" placeholder="Code from the email" value={code} onChange={(e) => setCode(e.target.value)} aria-label={"Code sent to " + account.emailSent} />
        <button className="button button-primary" type="submit" disabled={busy || !code.trim()}>{account.busy === "verify" ? "Checking…" : "Sign in"}</button>
        <button className="text-button" type="button" onClick={() => { setCode(""); account.cancelEmail(); }}>Use a different email</button>
      </form>}
      <p className="account-fine">By continuing you agree to the <a href={import.meta.env.BASE_URL + "terms.html"} target="_blank" rel="noopener noreferrer">terms of service</a> and the <a href={PRIVACY} target="_blank" rel="noopener noreferrer">privacy policy</a>. A Roundsy account is separate from any other app's, even with the same email.</p>
    </> : <>
      <p className="account-who"><b>{user.email ?? "Signed in"}</b><span>{user.provider === "google" ? "Google" : user.provider === "apple" ? "Apple" : "Email"}</span></p>
      <form className="account-row" onSubmit={(e) => { e.preventDefault(); void account.saveName(name || account.displayName); }}>
        <input value={name || account.displayName} maxLength={20} onChange={(e) => setName(e.target.value)} placeholder="Name shown in party rooms" aria-label="Display name" />
        <button className="button button-quiet" type="submit" disabled={busy}>Save name</button>
      </form>
      <label className="setting-row"><span><b>Back up automatically</b><small>Sends results and progress to your Roundsy account after each round.</small></span>
        <input type="checkbox" checked={account.auto} onChange={(e) => account.setAuto(e.target.checked)} /></label>
      <div className="account-row">
        <button className="button button-primary" onClick={() => void account.syncNow()} disabled={busy}>{account.busy === "sync" ? "Syncing…" : "Back up now"}</button>
        <button className="button button-quiet" onClick={() => void account.signOut()} disabled={busy}>Sign out</button>
      </div>
      <p className="account-fine">{account.lastSynced ? "Last backed up " + new Date(account.lastSynced).toLocaleString() + "." : "Not backed up yet."}</p>
      <div className="account-danger">
        <h3>Delete Roundsy account</h3>
        <p>Removes your Roundsy profile, cloud progress and room history. Progress on this device stays until you erase it. Your sign-in itself is not removed here.</p>
        {!confirming ? <button className="button button-quiet" onClick={() => setConfirming(true)}>Delete my Roundsy account…</button> : <form className="account-row" onSubmit={(e) => { e.preventDefault(); if (typed.trim().toUpperCase() === "DELETE") { void account.deleteAccount(); setConfirming(false); setTyped(""); } }}>
          <input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="Type DELETE to confirm" aria-label="Type DELETE to confirm" autoComplete="off" />
          <button className="button account-delete" type="submit" disabled={busy || typed.trim().toUpperCase() !== "DELETE"}>{account.busy === "delete" ? "Deleting…" : "Delete forever"}</button>
          <button className="text-button" type="button" onClick={() => { setConfirming(false); setTyped(""); }}>Cancel</button>
        </form>}
      </div>
    </>}
    {account.notice && <p className={"account-notice " + account.notice.kind} role="status" aria-live="polite" onClick={account.dismissNotice}>{account.notice.text}</p>}
  </section>;
}
