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

## Decisions still needed from Mathews
1. The final Pro feature list (above).
2. Free trial: yes or no (Dx Dash gives 7 days to signed-in accounts). Stat!'s own approach was not verified.
3. Regional pricing and tax handling (the stores handle tax; Stripe needs Stripe Tax or a decision).
4. Whether Pro requires a signed-in account (recommended: yes, so it follows people across devices).
