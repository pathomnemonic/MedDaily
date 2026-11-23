# Support and "report a question"

Mathews's decision: instead of a specialist review before launch, Clinicle relies on players reporting incorrect questions.

## Built now (phase 1)
- **Report a problem** link on every round-complete card, and **Help and feedback** in Settings. Each opens the player's email app with a message already addressed to
  patho.mnemonic1@gmail.com that includes the game, the date, the puzzle seed, whether it was a daily or Free Play, the app version and platform, so any puzzle can be reproduced from the seed.
- **Help and FAQ** page (`public/help.html`): how the daily works, streaks, accounts and backup, deleting data, party rooms, and how to report a mistake.

## Why email first
It works with no server changes and no new data collection. The cost is that reports arrive as unstructured email.

## Phase 2 (backlog, needs a migration that Orion applies)
- `meddaily.question_reports` table: game, puzzle key (date, scope, seed), optional item id, free-text note, app version, user id when signed in (guests allowed), created time.
  Insert-only for players through a function with a simple rate limit; read by the service role only.
- In-game "Report this question" button on the reveal screens of the question-based games (Trivia Rumble, Differential, Deep Scan, Hoofbeats, Labline, Riddle Lab, What Has More?), which attaches the exact item id.
- A small triage view (a Supabase table view is enough) and a convention for fixing: correct the data, add a regression test where the item had a leak or a wrong key, and list the fix in the content audit.
