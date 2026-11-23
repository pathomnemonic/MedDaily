import { useState } from "react";
import type { AccountController } from "./useAccount";

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
      <div className="account-or"><span>or use email</span></div>
      {!account.emailSent ? <form className="account-row" onSubmit={(e) => { e.preventDefault(); void account.sendEmailCode(email); }}>
        <input type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email address" />
        <button className="button button-primary" type="submit" disabled={busy || !email.trim()}>{account.busy === "email" ? "Sending…" : "Email me a code"}</button>
      </form> : <form className="account-row" onSubmit={(e) => { e.preventDefault(); void account.verifyEmailCode(code); }}>
        <input inputMode="numeric" autoComplete="one-time-code" placeholder="Code from the email" value={code} onChange={(e) => setCode(e.target.value)} aria-label={"Code sent to " + account.emailSent} />
        <button className="button button-primary" type="submit" disabled={busy || !code.trim()}>{account.busy === "verify" ? "Checking…" : "Sign in"}</button>
        <button className="text-button" type="button" onClick={() => { setCode(""); account.cancelEmail(); }}>Use a different email</button>
      </form>}
      <p className="account-fine">By continuing you agree to the <a href={import.meta.env.BASE_URL + "terms.html"} target="_blank" rel="noopener noreferrer">terms of service</a> and the <a href={PRIVACY} target="_blank" rel="noopener noreferrer">privacy policy</a>. A MedDaily account is separate from any other app's, even with the same email.</p>
    </> : <>
      <p className="account-who"><b>{user.email ?? "Signed in"}</b><span>{user.provider === "google" ? "Google" : "Email"}</span></p>
      <form className="account-row" onSubmit={(e) => { e.preventDefault(); void account.saveName(name || account.displayName); }}>
        <input value={name || account.displayName} maxLength={20} onChange={(e) => setName(e.target.value)} placeholder="Name shown in party rooms" aria-label="Display name" />
        <button className="button button-quiet" type="submit" disabled={busy}>Save name</button>
      </form>
      <label className="setting-row"><span><b>Back up automatically</b><small>Sends results and progress to your MedDaily account after each round.</small></span>
        <input type="checkbox" checked={account.auto} onChange={(e) => account.setAuto(e.target.checked)} /></label>
      <div className="account-row">
        <button className="button button-primary" onClick={() => void account.syncNow()} disabled={busy}>{account.busy === "sync" ? "Syncing…" : "Back up now"}</button>
        <button className="button button-quiet" onClick={() => void account.signOut()} disabled={busy}>Sign out</button>
      </div>
      <p className="account-fine">{account.lastSynced ? "Last backed up " + new Date(account.lastSynced).toLocaleString() + "." : "Not backed up yet."}</p>
      <div className="account-danger">
        <h3>Delete MedDaily account</h3>
        <p>Removes your MedDaily profile, cloud progress and room history. Progress on this device stays until you erase it. Your sign-in itself is not removed here.</p>
        {!confirming ? <button className="button button-quiet" onClick={() => setConfirming(true)}>Delete my MedDaily account…</button> : <form className="account-row" onSubmit={(e) => { e.preventDefault(); if (typed.trim().toUpperCase() === "DELETE") { void account.deleteAccount(); setConfirming(false); setTyped(""); } }}>
          <input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder="Type DELETE to confirm" aria-label="Type DELETE to confirm" autoComplete="off" />
          <button className="button account-delete" type="submit" disabled={busy || typed.trim().toUpperCase() !== "DELETE"}>{account.busy === "delete" ? "Deleting…" : "Delete forever"}</button>
          <button className="text-button" type="button" onClick={() => { setConfirming(false); setTyped(""); }}>Cancel</button>
        </form>}
      </div>
    </>}
    {account.notice && <p className={"account-notice " + account.notice.kind} role="status" aria-live="polite" onClick={account.dismissNotice}>{account.notice.text}</p>}
  </section>;
}
