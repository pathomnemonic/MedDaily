import type { AccountController } from "./useAccount";
import type { PurchasesController } from "./usePurchases";
import { PRO_PRODUCTS, type PlanPrice } from "./purchases";
import Icon from "./components/Icon";

const PRIVACY = "https://pathomnemonic.github.io/StudyBible/privacy.html";
const TERMS = import.meta.env.BASE_URL + "terms.html";

const PLAN_NAMES: Record<string, string> = { pro_monthly: "Monthly", pro_yearly: "Yearly", pro_lifetime: "Lifetime" };

/** The price line for a plan: the store price with its period, e.g. "$9.99 / year". */
export function planLine(price: { priceText: string; period: string }): string {
  return price.priceText + (price.period === "P1Y" ? " / year" : price.period === "P1M" ? " / month" : "");
}

/** The per month equivalent for a yearly price, e.g. "$0.83 / month", or null when it does not apply. */
export function perMonthLine(price: { priceMicros: number; currency: string; period: string }): string | null {
  if (price.period !== "P1Y" || !price.priceMicros) return null;
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: price.currency || "USD" }).format(price.priceMicros / 12 / 1_000_000) + " / month";
  } catch { return null; }
}

const dateText = (iso: string | null): string =>
  iso ? new Date(iso).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }) : "";

/** The Roundsy Pro paywall: benefits, the account trial, both plans with store prices, restore, and the legal links. */
export default function PaywallPage({ account, purchases, onSignIn }: { account: AccountController; purchases: PurchasesController; onSignIn: () => void }) {
  const priceFor = (id: string): PlanPrice | null => purchases.prices.find((p) => p.id === id) ?? null;
  const ent = account.entitlement;
  const busy = purchases.busy !== null || account.busy !== null;
  return <div className="paywall-page page-enter">
    <div className="friends-hero"><span className="eyebrow">ROUNDSY PRO</span><h1>More rounds. Safer streaks.</h1><p>The daily round is free forever, and it always will be. Pro adds new things on top, and takes nothing away.</p></div>

    <section className="settings-card paywall-benefits">
      <div className="paywall-benefit"><span className="paywall-benefit-icon"><Icon name="calendar" size={30} /></span><span><b>The full archive</b><small>Play any past daily round since launch, any time. Archive plays count toward your history, best scores and trophies, and never touch your streak.</small></span></div>
      <div className="paywall-benefit"><span className="paywall-benefit-icon snow">❄</span><span><b>Streak freezes</b><small>Two freezes a month, spent automatically only when one would save your streak. Miss a day or two and the streak survives.</small></span></div>
    </section>

    {account.pro ? <section className="settings-card paywall-active">
      <span className="eyebrow">YOUR PLAN</span>
      <h2>Pro is on{ent ? " · " + (PLAN_NAMES[ent.plan] ?? "Pro") : ""}</h2>
      <p>{ent?.status === "trialing" || ent?.source === "trial"
        ? "Your free trial runs until " + dateText(ent.trial_ends_at) + ". Enjoy the archive and the freezes."
        : ent?.current_period_end
          ? "Your plan stays active until " + dateText(ent.current_period_end) + ". Manage or cancel it any time in your store account."
          : "Pro is active on this account. Manage or cancel it any time in your store account."}</p>
      <div className="account-row">
        <button className="button button-primary" onClick={() => void purchases.manage()} disabled={busy}>{purchases.busy === "manage" ? "Opening…" : "Manage subscription"}</button>
        {purchases.native && <button className="button button-quiet" onClick={() => void purchases.restore()} disabled={busy}>Restore purchases</button>}
      </div>
    </section> : <>
      {!account.user ? <section className="settings-card paywall-join">
        <span className="eyebrow">FREE ACCOUNT NEEDED</span>
        <h2>Pro lives on your account</h2>
        <p>So a purchase follows you across devices, Pro needs the free Roundsy account. Sign in from Options, then come back here.</p>
        <button className="button button-primary" onClick={onSignIn}>Sign in from Options</button>
      </section> : account.trialAvailable ? <section className="settings-card paywall-trial">
        <span className="eyebrow">TRY IT FIRST</span>
        <h2>7 days of Pro, free</h2>
        <p>No card. Nothing to cancel. The trial simply ends after 7 days unless you subscribe.</p>
        <button className="button button-primary paywall-trial-button" onClick={() => void account.startTrial()} disabled={busy}>{account.busy === "trial" ? "Starting…" : "Start your 7 day free trial"}</button>
      </section> : null}

      <section className="settings-card paywall-plans">
        <span className="eyebrow">PICK A PLAN</span>
        <div className="paywall-plan-list">
          {PRO_PRODUCTS.map((p) => {
            const price = priceFor(p.id) ?? { id: p.id, priceText: p.listPrice, priceMicros: p.listMicros, currency: "USD", period: p.period, trialDays: 0 };
            const per = perMonthLine(price);
            return <button key={p.id} className="paywall-plan" onClick={() => void purchases.buy(p.id)} disabled={busy || !account.user}>
              <span className="paywall-plan-head"><b>{p.label}</b>{p.blurb && <span className="paywall-badge">{p.blurb}</span>}{price.trialDays > 0 && <span className="paywall-badge">{price.trialDays} DAY FREE TRIAL</span>}</span>
              <span className="paywall-plan-price">{planLine(price)}</span>
              <small>{per ?? (p.id === "roundsy_pro_yearly" ? "The whole year, one payment" : "Renew or cancel any month")}</small>
              <span className="paywall-plan-cta">{purchases.busy === p.id ? "Opening…" : "Subscribe"}</span>
            </button>;
          })}
        </div>
        {purchases.native && <button className="text-button" onClick={() => void purchases.restore()} disabled={busy}>{purchases.busy === "restore" ? "Restoring…" : "Restore purchases"}</button>}
        {purchases.note && <p className="account-fine">{purchases.note}</p>}
      </section>
    </>}

    <p className="account-fine paywall-fine">Subscriptions renew automatically until cancelled, and can be cancelled any time in your store account settings. The free trial is once per account and needs no card. Prices are in US dollars; your store may show a local price. By subscribing you agree to the <a href={TERMS} target="_blank" rel="noopener noreferrer">terms of service</a> and the <a href={PRIVACY} target="_blank" rel="noopener noreferrer">privacy policy</a>.</p>
  </div>;
}
