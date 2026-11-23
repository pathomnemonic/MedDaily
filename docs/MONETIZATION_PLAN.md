# Monetization plan (decided by Mathews; nothing is built yet)

Model: Stat!'s. **Pro costs $0.99 per month or $9.99 per year. The daily round stays free.** (The annual plan works out to about $0.83 a month, roughly 16% cheaper than paying monthly.)

## Free forever
- Today's daily round of every game, with streaks, results, trophies, the share button, party rooms and the optional account backup.
- Everything that is free today stays free. Nothing already shipped is taken away.

## Pro (new things only, so no one loses what they have)
Candidates, in the order I would build them. Mathews picks the final list.
1. **Archive:** play any past daily (a calendar of past days). Natural fit for the model and cheap to build because the daily is already a pure function of the date.
2. **Streak freezes and streak repair.**
3. **Deeper stats:** score distribution, per-specialty breakdown, full history charts.
4. **Unlimited extra Free Play beyond a generous daily allowance** (today Free Play is unlimited and free, so any cap would be a new limit; recommend not capping it at launch).
5. Cosmetic extras: extra palettes and trophy pins.

## Plumbing (already prepared)
- Database: `meddaily.entitlements` (plans `pro_monthly`, `pro_yearly`; the other plan values stay unused), written only by the payment webhook; `meddaily.has_pro()` for checks.
- Web checkout: Stripe, webhook to a Supabase Edge Function that upserts the entitlement. Native: Apple and Google in-app purchase, with server notifications mapped the same way (Dx Dash's approach; no aggregator).
- Product IDs: `com.pathomnemonic.clinicle.pro.monthly`, `com.pathomnemonic.clinicle.pro.yearly`.
- App: a "Clinicle Pro" card in Settings with Subscribe, **Restore purchases** and **Manage subscription** (links to the store or Stripe portal), plus a soft paywall on the Pro features only. The daily round is never gated.
- Terms of Service: add a Paid features section (prices, renewal, cancellation, refunds) and update the guard test in `src/termsPage.test.ts` when this ships.

## Decided (Nov 23, 2026)
1. **Free trial: yes.** Following Dx Dash: **7 days of Pro, once per signed-in account, no card needed.** Dx Dash's setup is the standing guideline for the other apps.
2. **Pro requires an account.** Pro belongs to the signed-in account and follows the person across devices. Guests can see what Pro offers, but starting a trial or subscribing asks them to sign in first
   ("Sign in to start your free trial"). The daily round and everything already free work with no account, as before.
3. **Web address:** stays `/MedDaily/` (see `docs/RENAME_NOTES.md`).

### What the account requirement means for the build
- **Trial:** a function `meddaily.start_trial()` (security definer, signed-in non-guest only) writes an entitlement with `source = 'trial'`, `status = 'trialing'`, `trial_ends_at = now() + 7 days`. It refuses if the person ever had a trial.
  To make "once" survive account deletion, record it in a small ledger table keyed by user id with no cascade from the MedDaily profile (so deleting the MedDaily account does not hand out another trial). Creating a fresh email can still get another trial; that is inherent to no-card trials and acceptable at this price.
- **Purchases are tied to the account:** the Supabase user id goes into every purchase: Stripe `client_reference_id`, Apple `appAccountToken`, Google `obfuscatedAccountId`. The payment webhooks use it to write `meddaily.entitlements` for that user.
- **Restore purchases:** for a signed-in user it simply re-reads the entitlement. For a store purchase made before sign-in, the store's restore call returns the transaction and the server links it to the signed-in account.
- **Expiry and downgrade:** `has_pro()` already treats a lapsed trial or period as free; no data is removed, Pro-only views just lock.
- **Terms and privacy:** the Terms need a Paid features section (prices, trial, renewal, cancellation, refunds through the store or Stripe) and the guard test updated when this ships; the privacy policy already covers purchase records.

## Still open for Mathews
1. The final Pro feature list (archive, streak freezes/repair, deeper stats, extras).
2. Whether the trial should also be offered to a person who signs in only to start it, or only after they have played (recommend: allow it right away; the daily is already free, so there is no reason to delay).
3. Regional pricing and tax handling (the stores handle tax; Stripe needs Stripe Tax or a decision).
