# Parity roadmap: Clinicle vs Stat!, Doctordle, Symptoms: Daily Diagnosis, NYT Games

Status as of Nov 23, 2026 (app version 1.2). "Done" means shipped on main. Comparable apps were not re-surveyed here beyond Orion's list.

| # | Parity area | Status | What exists / what is missing | Next step | Lane |
|---|---|---|---|---|---|
| 1 | Daily reminders (user time, streak-at-risk) | **Done (native app)** | Optional reminder at a chosen time, rebuilt on every open and after every round for the next 7 days: skips days already played, first one mentions the streak. Web has no reminder (browsers need push infrastructure) | Web push later if wanted | Claude |
| 2 | Streak freezes / repair; streak calendar | **Calendar done** | Calendar (12 weeks), current and best streak on Trophies. Streak freezes are not built (Pro feature: 2 per month, automatic; repair dropped) | Freezes after Pro exists; needs a `frozenDays` record synced in `player_state`; confirmed rules in `docs/MONETIZATION_PLAN.md` | Claude |
| 3 | Shareable, spoiler-free result cards (solo and multiplayer) | **Partly** | Every game already shares a spoiler-free emoji summary as text. Missing: an image card (square, branded) and a multiplayer variant listing all players' scores | Render a card to a canvas/PNG and share it; add room scores to the party share text | Claude |
| 4 | First run: playable in 30 seconds, tutorial woven into round one, no sign-in wall | **Partly** | No sign-in wall; title screen then home, one tap into a game. Missing: a guided first round and per-game "how to play" overlays | Add a one-time coach overlay per game (what to do, one example), skippable | Claude (design review by Mathews) |
| 5 | Stats depth: distribution, personal bests, per-specialty | **Done, and staying free** | Score distribution, per-game best, per-family averages. "Per specialty" is by game family. Mathews decided deeper stats are **not** a Pro feature and per-specialty stats are not planned (Clinicle is a fun game, not a learning game) | None; the basic stats stay free | Claude |
| 6 | Achievements and badges | **Done** | Trophy cabinet exists with milestones | Add a few more milestone trophies (first perfect, 30-day streak) | Orion-able |
| 7 | Sound/haptics toggles, dark mode, reduced motion | **Done** | Sound, music, haptics, reduced-motion settings; palettes; system reduced-motion respected | None | |
| 8 | Restore purchases / manage-subscription links | **Not started** | No payments yet | Part of the Pro build (`docs/MONETIZATION_PLAN.md`) | Claude, after payments |
| 9 | In-app support / FAQ; report a question | **Done (phase 1)** | Help and FAQ page, Help card in Settings, "Report a problem" link on every result card (prefilled email with game, date, seed). Phase 2 (in-game button + table) in `docs/SUPPORT_AND_REPORTS.md` | Phase 2 migration | Claude + Orion applies migration |
| 10 | Ratings prompt after a positive moment | **Not started** | None | Native only: after a perfect round or a 7-day streak, once, never at launch or mid-round, using the system review API (needs a Capacitor plugin and a Mac build to verify) | Claude |
| 11 | Offline tolerance | **Done** | App and today's round work offline (service worker and bundled native app); results saved locally; cloud backup now retries when the connection returns | None | |
| 12 | Accessibility pass (dynamic type, contrast, screen reader labels) | **Partly** | Automated contrast scan done earlier, focus styles, reduced motion. Not done: user-scalable text sizes, screen-reader walkthrough of every game | Add a text-size setting; VoiceOver/TalkBack pass on a device | Mathews (device testing) + Claude |
| 13 | Archive calendar for past dailies; multiplayer rematch | **Rematch done** | "Rematch" after a party round opens a new room for the same game. Archive is not built | Archive: open any past date's puzzle (the daily is a pure function of the date, so this is small); a Pro feature, archive plays do not affect streaks (rules in `docs/MONETIZATION_PLAN.md`) | Claude |

## Suggested order
1. Guided first round (4), the biggest effect on new-player retention.
2. Image share card (3), the growth loop.
3. Pro build (feature list is final: archive and streak freezes) with restore purchases (2, 8, 13), with the archive and freeze rules already confirmed in `docs/MONETIZATION_PLAN.md`.
4. Ratings prompt (10) and the accessibility device pass (12) before the store submission.
