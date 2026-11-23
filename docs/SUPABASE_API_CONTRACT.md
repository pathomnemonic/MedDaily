# MedDaily on the shared Supabase project: API contract

Status: the base migration (`20261122000000`) is **applied to the live project** (reviewed by Orion). The adapter ships in the app behind `VITE_ROOMS_PROVIDER`, which is not set, so Firebase stays the default. The hardening migration (`20261123000000`) is **proposed, not yet applied**.
Project: `https://replaqmcwynrxclunkck.supabase.co` (shared by all apps). MedDaily owns the `meddaily` schema only.

## 1. Account model (confirmed)

- One auth identity per email or Google account for the whole project (Supabase Auth allows one user per email).
- "Creating a MedDaily account" means calling `meddaily.ensure_profile()`, which inserts a row in `meddaily.profiles`.
- Every MedDaily table, entitlement and deletion is scoped to the `meddaily` schema. No other app's schema is read or written.
- Guests (anonymous sign-ins) can play party rooms but cannot own results, state, a profile or an entitlement.
- Deleting a MedDaily account (`meddaily.delete_my_account()`) removes MedDaily data only. Removing the shared `auth.users` row is a
  cross-app decision for the project owner: do it only when no app schema still holds a profile for that user.

## 2. Files in this change

| File | Purpose |
|---|---|
| `supabase/migrations/20261122000000_meddaily_schema.sql` | Creates the schema, tables, row-level security, functions, grants and the Realtime publication entries. Re-runnable. |
| `supabase/migrations/20261122000001_meddaily_rollback.sql` | `drop schema meddaily cascade` plus publication cleanup. Destroys MedDaily data only. |
| `supabase/migrations/20261123000000_meddaily_hardening.sql` (+ `...000001_..._rollback.sql`) | From Orion's review: `delete_my_account()` now removes only empty rooms the caller belonged to, and every security-definer function runs with an empty `search_path`. Re-runnable. |
| `supabase/tests/meddaily_rls.sql` | Behavioural checks (run in a rolled-back transaction). It covers guests, room rules, privacy between users, entitlements and deletion. |

Verified locally on Postgres 18 (PGlite) with stand-ins for `auth.users`, `auth.uid()`, `auth.jwt()` and the Supabase roles: apply, apply again,
the full test file, rollback and re-apply all pass. It has **not** been run against the live project.

## 3. Tables

| Table | Who can read | Who can write |
|---|---|---|
| `profiles` | owner | owner updates `display_name`; inserts only via `ensure_profile()` (non-guests) |
| `player_state` (xp, bests, settings) | owner | owner insert/update (xp is capped 0 to 1e9) |
| `results` (one row per user, day, game, scope) | owner | owner insert only (immutable), requires a profile |
| `entitlements` | owner | **service role only** (payment webhooks) |
| `rooms`, `room_players` | members of that room | **nobody directly**; only the functions in section 5 |

No policy exists for `anon`; every client call uses the `authenticated` role (guests included).

## 4. Client configuration

```
VITE_SUPABASE_URL=https://replaqmcwynrxclunkck.supabase.co
VITE_SUPABASE_ANON_KEY=<publishable key>   # public by design, still routed via the vault into GitHub Actions variables
VITE_ROOMS_PROVIDER=supabase               # "firebase" keeps the current behaviour; unset = rooms off
```

Client: `createClient(url, key, { db: { schema: "meddaily" } })`. `multiplayerConfigured()` becomes true when the URL and key are present
and the provider is `supabase`. The five exported functions of `src/firebase.ts` keep their signatures and `RoomState` shape, so `App.tsx` does not change.

## 5. Rooms (replaces Firestore `rooms` and `players`)

Implemented in `src/supabaseRooms.ts` (adapter), `src/rooms.ts` (picks the backend) and `src/roomTypes.ts` (shared types). The Supabase library is loaded on
first use, so it is not in the startup bundle, and no network call is made until a player joins a room. Tests: `src/supabaseRooms.test.ts` (scripted client).

To switch on: set the repo variable `VITE_ROOMS_PROVIDER=supabase` (the URL and key variables already exist) and redeploy. To switch back: clear it.
When CAPTCHA is enabled for anonymous sign-ins, `signInAnonymously` will need a `captchaToken`; the adapter has a single place to add it.

Guests sign in once with `supabase.auth.signInAnonymously()` (same experience as today's anonymous Firebase auth).

| Adapter function | Supabase call | Notes |
|---|---|---|
| `joinOrCreateRoom(code, info)` | `rpc("join_room", { p_code, p_game_id, p_scope, p_specialty, p_day, p_seed, p_name })` | Creates the room if missing, refuses a different game/date/track, enforces 8 players. Returns the `RoomState` JSON. |
| `watchRoom(code, cb)` | `rpc("get_room_state", { p_code })` once, then a Realtime channel `room:CODE` listening to `postgres_changes` on `meddaily.room_players` (filter `room_code=eq.CODE`) and `meddaily.rooms` (filter `code=eq.CODE`); on any event call `get_room_state` again and `cb()` | Re-fetching keeps one source of truth and avoids merging partial rows. |
| `submitRoomScore(code, s, max, perfect)` | `rpc("submit_score", { p_code, p_score, p_max, p_perfect })` | One submission per player. "Perfect" is stored only when score equals max. |
| `leaveRoom(code)` | `rpc("leave_room", { p_code })` | Reassigns the host; deletes the room when empty. |

`RoomState` JSON returned by the functions: `{ code, gameId, scope, specialty, date, seed, hostUid, status, players: [{ uid, name, score, maxScore, finished, perfect }] }`,
identical to the existing TypeScript type.

Error strings raised by the functions (map to the existing messages):
`room_mismatch` (different game/date/track), `room_full`, `bad_room_code`, `bad_score`, `already_submitted`, `not_in_room`, `not_signed_in`.

Cleanup: rooms are ephemeral. Enable `pg_cron` and run
`select cron.schedule('meddaily-room-cleanup', '17 * * * *', 'select meddaily.cleanup_rooms()');` (deletes rooms idle for 24 hours).

## 6. Accounts and sync (later phase, optional in the UI)

- Sign-in options in Settings: email code or magic link, and "Continue with Google". Signing in from a guest session uses
  `updateUser({ email })` / `linkIdentity({ provider: "google" })` so the user id, and therefore room history, is kept.
- After first sign-in, call `rpc("ensure_profile", { p_name })`.
- Cloud progress: `upsert` into `player_state` and `insert ... on conflict do nothing` into `results`. The client merges by taking the higher
  XP and the union of results, so localStorage stays the offline source of truth and the game works with no account.
- In-app account deletion calls `rpc("delete_my_account")`. It refuses while a store or Stripe subscription is active
  (`cancel_subscription_first`); lifetime and Ko-fi entitlements do not block it.

## 7. Entitlements (payments plumbing only; pricing and free/Pro split are not decided)

- Table `meddaily.entitlements`: `plan` (`free`, `pro_monthly`, `pro_quarterly`, `pro_yearly`, `pro_lifetime`), `source` (`stripe`, `apple`, `google`,
  `kofi`, `trial`, `promo`, `manual`), `status`, `trial_ends_at`, `current_period_end`, provider ids.
- The client reads its own row, or calls `rpc("has_pro")`, which returns true for an active or trialing plan that has not expired (lifetime never expires).
- Only the service role writes. A Stripe webhook (and later store notifications) upserts the row. The schema is provider-neutral, so it works whether
  payments run directly (Dx Dash's approach) or through an aggregator.
- Free gating is a client concern plus a server check through `has_pro()`; nothing in the game depends on it yet.

## 8. Dashboard settings Orion needs to apply (project-wide, so they affect every app)

1. Run the migration, then add `meddaily` to **Settings > API > Exposed schemas**.
2. **Authentication > Providers**: enable Anonymous sign-ins; enable Google. Add the redirect URL `https://pathomnemonic.github.io/MedDaily/`
   (native deep links later).
3. Turn on CAPTCHA (for example Cloudflare Turnstile) for anonymous sign-ins; their default limit is per IP.
4. Enable the `pg_cron` extension for the cleanup job above.
5. Realtime is already enabled in the migration for the two room tables.

## 9. Things to flag (these cut across apps)

- **Auth emails are shared.** The email templates (confirm, magic link, reset) are project-wide, not per app, so the wording must be app-neutral or
  a send-email hook must pick a template by app. The Google sign-in consent screen is likewise branded by the single OAuth client.
- **Gmail SMTP.** A personal Gmail account has a low daily send limit (about 500 recipients a day), needs an app password, and gives no control over
  SPF/DKIM for the sending domain, so deliverability can suffer. It is fine for launch testing; a custom domain sender is the usual next step.
- **Free plan.** Free projects pause after about a week of inactivity and have no backups. Move to the paid plan before any store launch.
- **Payments divergence.** Dx Dash uses direct Stripe plus store in-app purchase. That is the standing guideline, so MedDaily should follow it unless
  Mathews decides otherwise. The cost of the direct route is validating Apple and Google notifications ourselves; an aggregator such as RevenueCat
  would remove that work at a revenue-share cost. The `entitlements` table supports both.
- **Apple.** Offering Google sign-in on iOS requires also offering Sign in with Apple. Account deletion must be possible inside the app.

## 10. Rollout

1. Review and apply the migration (Orion). Add the schema to the exposed list.
2. Add the Supabase adapter behind `VITE_ROOMS_PROVIDER`, keeping Firebase as the default. Cutover is a variable flip; rollback is flipping it back.
   No data moves, because rooms are ephemeral.
3. Optional accounts UI and cloud sync.
4. Entitlements, paywall and store packaging, after Mathews decides pricing and the free/Pro split.
