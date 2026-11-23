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
- Reports arrive at patho.mnemonic1@gmail.com with the game, date and puzzle seed. To find a puzzle from a report, open the game in Free Play is not enough; the seed is `hashSeed(date + "|" + scope + "|" + game)` for dailies (see `seedFor` in `src/App.tsx`).
- Suggested: keep a running list of reports and fixes in `docs/CONTENT_AUDIT.md`.

## Not for pickup (needs my judgement)
Pro/payments build, guided first round, archive, image share card, anything touching game logic or the database schema.
