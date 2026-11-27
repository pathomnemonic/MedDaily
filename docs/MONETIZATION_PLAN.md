# Monetization plan (decided by the owner; Pro built in November 2026, see the status note under Still open)

Model: Stat!'s. **Pro costs $0.99 per month or $9.99 per year. The daily round stays free.** (The annual plan works out to about $0.83 a month, roughly 16% cheaper than paying monthly.)

## Free forever (decided)
- The daily round of every game, with streaks, results, trophies, party rooms and the optional account backup.
- **Share cards** (the spoiler-free results), **daily reminders**, **accessibility settings**, and the basic stats already shipped (streak calendar, best streak, score distribution, game-family averages).
- No bonus daily round. Everything that is free today stays free; nothing shipped is taken away.

## Pro (final list, decided Nov 23, 2026): two features
Roundsy is a fun game, not a learning game, so Pro is about not losing your habit and playing what you missed. Deep stats and per-specialty breakdowns are **not** part of Pro (the owner's decision); the basic stats stay free.

### a) Full archive: play any past day's puzzles
- A calendar of past days; tap a day to play that day's puzzle for any game. The daily is a pure function of the date, so no new content is needed.
- **Free players** can open the calendar and see it (locked days show a Pro badge), and today's round is always free.
- **Rules (confirmed by the owner, Nov 23, 2026):**
  - **Archive plays do not change the streak and do not count toward the daily goal chest.** Otherwise the archive would be unlimited free streak repair and freezes would be pointless. They are recorded for the history, best scores and trophies, and marked as archive plays.
  - **Archive start date:** the store launch day (earlier days can be generated but would feel like filler).
  - The share text for an archive play says the date it was played for, so it cannot be mistaken for a daily.
- Build notes: `openGame` takes an explicit date (the seed is `hashSeed(date|scope|game)`); results get an `archive` flag; the cloud `results` table needs an `archive` boolean (one small migration); the Pro check is `meddaily.has_pro()` on the client plus a server check for any archive writes.

### b) Streak freezes: 2 per month, applied automatically
- A freeze bridges one missed day so a streak survives. Pro players get **2 per calendar month** (UTC, matching the daily rollover). Nothing to tap: it applies by itself.
- **Rules (confirmed by the owner, Nov 23, 2026):**
  - A freeze is used **only when it can save the streak**: after a gap of one or two missed days that the player's remaining freezes cover entirely. A longer gap breaks the streak and no freezes are wasted.
  - Applied at the next app open or round after the missed day, and **recorded** (`frozenDays` in the player data, synced with the account), so a later lapse of Pro never un-saves a streak already saved.
  - Unused freezes do not roll over.
  - The streak counts a frozen day as kept, not as played; the calendar shows it with a snowflake, and a notification says "A streak freeze saved your N-day streak".
- Build notes: `playStreak` and `bestStreak` take the frozen days; a pure `planFreezes(results, frozenDays, today, isPro)` decides what to apply, with unit tests for gap rules and month limits; one small addition to `player_state.settings` (or a column) to sync `frozenDays`.

### Removed from the earlier candidate list
Deeper stats and per-specialty stats (out of Pro, basic stats stay free), streak repair (replaced by automatic freezes), a Free Play cap (Free Play stays unlimited and free), cosmetic extras, any bonus daily round.

## Plumbing (already prepared)
- Database: `meddaily.entitlements` (plans `pro_monthly`, `pro_yearly`; the other plan values stay unused) is the summary the client reads; the payment paths write the per source grants in `meddaily.pro_grants`, and `meddaily.recompute_entitlement` rebuilds the summary from them; `meddaily.has_pro()` for checks.
- Web checkout: Stripe, with the roundsy-checkout and roundsy-stripe-webhook functions granting from the stripe source. Native: Apple and Google in-app purchase, verified by the roundsy-iap-verify function, with store changes learned by client polling verification (Dx Dash's approach; no aggregator, and no store notification handlers, like Dx).
- Product IDs: `roundsy_pro_monthly`, `roundsy_pro_yearly` (the IDs that exist in App Store Connect; Google Play uses the same IDs).
- App: a "Roundsy Pro" card in Settings with Subscribe, **Restore purchases** and **Manage subscription** (links to the store or Stripe portal), plus a soft paywall on the Pro features only. The daily round is never gated.
- Terms of Service: add a Paid features section (prices, renewal, cancellation, refunds) and update the guard test in `src/termsPage.test.ts` when this ships.

## Other decisions (Nov 23, 2026)
1. **Free trial: yes.** Following Dx Dash: **7 days of Pro, once per signed-in account, no card needed.** Dx Dash's setup is the standing guideline for the other apps.
2. **Pro requires an account.** Pro belongs to the signed-in account and follows the person across devices. Guests can see what Pro offers, but starting a trial or subscribing asks them to sign in first
   ("Sign in to start your free trial"). The daily round and everything already free work with no account, as before.
3. **Web address:** stays `/MedDaily/` (see `docs/RENAME_NOTES.md`).
4. **Trial timing:** the free trial is offered **immediately** to any signed-in account (no need to play first). Guests are asked to sign in to start it.
5. **Pro feature list:** archive and streak freezes only (above).
6. **Archive and freeze rules:** confirmed exactly as written above.

### What the account requirement means for the build
- **Trial:** a function `meddaily.start_trial()` (security definer, signed-in non-guest only) writes an entitlement with `source = 'trial'`, `status = 'trialing'`, `trial_ends_at = now() + 7 days`. It refuses if the person ever had a trial.
  To make "once" survive account deletion, record it in a small ledger table keyed by user id with no cascade from the MedDaily profile (so deleting the MedDaily account does not hand out another trial). Creating a fresh email can still get another trial; that is inherent to no-card trials and acceptable at this price.
- **Purchases are tied to the account:** the Supabase user id goes into every purchase: Stripe `client_reference_id`, Apple `appAccountToken`, Google `obfuscatedAccountId`. The payment webhooks use it to write `meddaily.entitlements` for that user.
- **Restore purchases:** for a signed-in user it simply re-reads the entitlement. For a store purchase made before sign-in, the store's restore call returns the transaction and the server links it to the signed-in account.
- **Expiry and downgrade:** `has_pro()` already treats a lapsed trial or period as free; no data is removed, Pro-only views just lock.
- **Terms and privacy:** the Terms need a Paid features section (prices, trial, renewal, cancellation, refunds through the store or Stripe) and the guard test updated when this ships; the privacy policy already covers purchase records.

## Still open
1. Regional pricing and tax handling (the stores handle tax; Stripe needs Stripe Tax or a decision).
2. Pro is built (issues 163 to 168 and the November 2026 pull request series): trial and entitlement plumbing, archive, freezes, the purchase layer and paywall, the server functions, and this Terms update. What remains is owner side setup: the ROUNDSY_ function secrets, the Stripe prices and webhook endpoint, the Google Play subscription products, and a real device purchase test.

## Tip jar (owner direction, Nov 23, 2026)
A quiet "Support Roundsy" card in Options links out to a Stripe payment link, set once in `src/tip.ts` (`TIP_URL`; the card is hidden while it is empty). Rules: voluntary, no nags or pop-ups, gates nothing, separate from Pro, and tracked per app. It is **web only**: the store apps do not show it, because Apple and Google restrict links to outside payments inside apps. The Ko-fi page is reserved for a different app and is refused by the code. Tips never convert to Pro.
