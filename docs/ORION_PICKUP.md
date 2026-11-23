# Orion pickup list

Well-scoped work that can be done without architectural decisions. Each item names the files, the change and how to verify. Push small, low-risk changes to a branch and leave a summary here; I review when I resume.

## 1. Add the new native sign-in return link to the Supabase allow-list (platform)
- Add `com.pathomnemonic.clinicle://auth`; remove `com.pathomnemonic.meddaily://auth`.
- Verify: Auth settings list shows the new entry. (Native sign-in itself can only be tested on a device.)

## 2. Privacy policy name (StudyBible site)
- Replace "MedDaily" with "Clinicle" (keep "formerly MedDaily" once).
- Verify: `https://pathomnemonic.github.io/StudyBible/privacy.html` shows Clinicle.

## 3. Extra milestone trophies
- File: `src/achievements.ts`. Look at how existing trophies are defined (`computeTrophies`) and add: first perfect round, 7-day and 30-day streak (`playStreak`/`bestStreak` in `src/statsInsights.ts`), all 23 games played once.
- Add a unit test next to the existing achievements tests.
- Verify: `npx vitest run`; Trophies page shows the new locked/earned pins.

## 4. Re-run the live checks after each deploy (no code)
- Two-session room check: `scratchpad` scripts are not in the repo; use two browsers on `https://pathomnemonic.github.io/MedDaily/`, Party, pick a game, join with the code in the second, confirm both lists show two players, finish a round in one, confirm the other sees "Finished".
- Fresh-address email-code sign-in once (see `docs/SUPABASE_API_CONTRACT.md`, Accounts UI).

## 5. Store assets
- Rebuild icon, feature graphic and social image with the Clinicle name. In-app icon sources are in `assets/` (`npm run native:icons` regenerates the native sizes and restores the web manifest). Screenshots: `node scripts/store-screenshots.mjs` after `npx vite preview --port 4180`.

## 6. Support inbox
- Reports arrive at patho.mnemonic1@gmail.com with the game, date and puzzle seed. To find a puzzle from a report, open the game in Free Play is not enough; the seed is the UTC day number for branch, blackout, trail, diagnosis, ladder, crossword, medle, connections and hive (the puzzle is then `permutedIndex(seed, poolSize)` in `src/lib.ts`), and `hashSeed(date + "|" + scope + "|" + game)` for the others (see `seedFor` in `src/App.tsx`).
- Suggested: keep a running list of reports and fixes in `docs/CONTENT_AUDIT.md`.

## 7. Apply the rooms lifecycle migration (B-06)
- `supabase/migrations/20261123000002_meddaily_rooms_lifecycle.sql` (rollback alongside). Adds `room_players.last_seen_at`, `touch_room`, `room_is_over`, updated `room_state_json`/`join_room`/`submit_score`/`cleanup_rooms`, and an hourly pg_cron job when the extension exists.
- Verify: run `supabase/tests/meddaily_rls.sql` (section 9); then the two-browser check in item 4, closing one tab and waiting 5 minutes: that player disappears from the other's list; after both finish, a third join returns "round is already over".

## 8. Verification and housekeeping batch (no architecture needed)
- After each deploy: confirm footer version matches `APP_VERSION` in `src/support.ts`; run the two-browser Party check (item 4) on the live build, including Random code keeping the game, closing one tab and waiting 5 minutes (player disappears), and a third join to a finished room (message "round is already over").
- Apply `supabase/migrations/20261123000003_...` is done; confirm no other pending migrations: `supabase migration list` against production.
- Re-run `supabase/tests/meddaily_rls.sql` after any migration.
- Name rule: never put the owner's personal name in any repo file. Before each PR, `grep -rniI` the repo for personal names and fix hits (use "PathoMnemonic" or "the owner").
- Content batches (ChatGPT/Gemini panels): new Hive boards (pool is only 24 to 46, so puzzles repeat within a year), more Medle words and Connections puzzles, riddle text spot-check. Deliver as data files following the shapes in `src/dataHive*.ts`, `src/data*.ts`; send to me for review before merge.
- CI: if the Pages deploy or tests fail, read the log and fix only mechanical causes (lint, snapshot, timeout); anything else, write it here for me.

## Not for pickup (needs my judgement)
Pro/payments build, guided first round, archive, image share card, anything touching game logic or the database schema.
