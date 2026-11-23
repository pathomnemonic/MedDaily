# Sketch: cleaning up stale anonymous users in the shared project

Status: **design sketch only, nothing built or applied.** It is project-wide, so it belongs to the platform side (Orion), with a small contract each app implements.

## Why it matters
Every guest session creates a row in `auth.users` (`is_anonymous = true`). Guests are created per browser and per origin, so the same
guest can be shared by every app hosted on `pathomnemonic.github.io` (the Supabase session lives in that origin's localStorage). Without cleanup the
table fills with abandoned guests, which costs monthly-active-user quota and clutters the dashboard.

## What "safe to delete" means
A guest is deletable only when **all** of these hold:
1. `is_anonymous` is true. A guest who linked an email or Google flips to false and is never touched.
2. Inactive for 30 days or more. Use the latest of `last_sign_in_at` and the newest `auth.sessions.refreshed_at` / `updated_at` for that user.
   (30 days is generous: MedDaily rooms live 24 hours.)
3. **No app holds data for them.** Each app answers one question about a user id (below). Deletion requires every registered app to say "no data".
4. Not currently in a room or hosting one (covered by 3 for MedDaily).

## The per-app contract
Each app schema exposes `<schema>.anon_user_has_data(p_user uuid) returns boolean` (stable, security definer, empty `search_path`, execute granted to the
cleanup role only). MedDaily's version would be:

```sql
select exists (select 1 from meddaily.profiles       where user_id = p_user)
    or exists (select 1 from meddaily.results        where user_id = p_user)
    or exists (select 1 from meddaily.player_state   where user_id = p_user)
    or exists (select 1 from meddaily.entitlements   where user_id = p_user)
    or exists (select 1 from meddaily.room_players   where user_id = p_user)
    or exists (select 1 from meddaily.rooms          where host_id = p_user);
```

## The job (platform side)
- A small registry table lists the apps (`schema`, `function`, `enabled`). The job **fails closed**: if any non-system schema that has an `auth.users`
  foreign key is missing from the registry, it does nothing and logs why. A new app cannot lose data because someone forgot to register it.
- `platform.cleanup_stale_anonymous_users(p_days int default 30, p_limit int default 500, p_dry_run boolean default true)`:
  selects candidates as above, checks every registered app function, writes each candidate and its verdict to an audit table
  (`platform.anon_cleanup_log`: user id, created, last active, decided, deleted), and only when `p_dry_run` is false deletes up to `p_limit`
  with `delete from auth.users where id = any(...)` (or the admin API from an Edge Function). Foreign keys cascade app rows, which are empty by definition.
- Schedule weekly with `pg_cron`.

## Rollout
1. Ship the per-app functions (MedDaily's is a tiny migration I can write on request).
2. Run in dry-run mode for two weeks and compare the logged candidates against reality (spot-check a few by hand).
3. Enable deletion with a low cap (for example 100 per run), watch the log, then raise it.
4. Kill switch: set the job's `enabled` flag false, or unschedule the cron entry.

## Client behaviour (already handled in MedDaily)
A returning device may hold a refresh token for a guest that was removed. The MedDaily adapter now detects the resulting auth error, drops the stale local
session, signs in as a fresh guest once and retries (tested). Other apps using anonymous sign-in need the same handling before deletion is switched on.

## Risks and mitigations
- Deleting a guest someone still uses: the 30-day inactivity window plus the data check make this very unlikely; the retry above makes it harmless.
- A missing app registration: the job fails closed.
- Bulk deletion mistakes: dry run first, a per-run cap and an audit log.
- Abuse (a script minting thousands of guests): CAPTCHA on anonymous sign-ins is the real fix; cleanup only handles the aftermath.
