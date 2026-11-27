import type { AccountController } from "./useAccount";
import type { PurchasesController } from "./usePurchases";

/** Settings card for Roundsy Pro: status when active, the trial and the way to the paywall when not. */
export default function ProCard({ account, purchases, onOpenPaywall }: { account: AccountController; purchases: PurchasesController; onOpenPaywall: () => void }) {
  if (!account.available) return null;
  const busy = purchases.busy !== null || account.busy !== null;
  return <section className="settings-card account-card" aria-label="Roundsy Pro">
    <h2>Roundsy Pro <small>{account.pro ? "active" : "optional"}</small></h2>
    {account.pro ? <>
      <p>Pro is on for this account: the full archive is open and streak freezes are standing by.</p>
      <div className="account-row">
        <button className="button button-primary" onClick={() => void purchases.manage()} disabled={busy}>{purchases.busy === "manage" ? "Opening…" : "Manage subscription"}</button>
        <button className="button button-quiet" onClick={onOpenPaywall}>Pro details</button>
      </div>
    </> : <>
      <p>Play past rounds in the archive and keep your streak safe with two freezes a month. The daily round stays free forever.</p>
      <div className="account-row">
        {account.user && account.trialAvailable && <button className="button button-primary" onClick={() => void account.startTrial()} disabled={busy}>{account.busy === "trial" ? "Starting…" : "Start 7 day free trial"}</button>}
        <button className="button button-soft" onClick={onOpenPaywall}>See Roundsy Pro</button>
      </div>
      {purchases.native && <button className="text-button" onClick={() => void purchases.restore()} disabled={busy}>{purchases.busy === "restore" ? "Restoring…" : "Restore purchases"}</button>}
    </>}
    {purchases.note && <p className="account-fine">{purchases.note}</p>}
  </section>;
}
