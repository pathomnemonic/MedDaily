# Content inventory and expansion priorities

**Snapshot:** November 19, 2026 (gameplay parity iteration)

MedDaily exposes twenty playable game formats. The retired Next Best Step bank remains in the repository for reference but is not presented as a standalone game. The current banks are not yet a 365-day set of unique puzzles for every game.

## Curated content currently included

| Game | Current bank | Notes |
|---|---:|---|
| Medle | 142 unique five-letter answers | Medical terms and abbreviations; one answer per daily seed |
| Quad Squad | 122 boards | Four groups of four per board; 20 new cross-specialty boards |
| DoctorDle | 220 cases | Six-guess typed diagnosis puzzle with progressive clues, common clinical aliases, explanations, and source notes |
| Specimen Search | 71 unique medical theme packs | 14×14 drag-to-select word-search grids; themes span organisms, anatomy, organ systems, and pharmacology |
| Labline | 100 prompts | Five-round estimation challenge with cumulative scoring and reference explanations |
| Association Blitz | 208 unique pairs | 20-card, ten-pair timed memory board with combo streaks and a time bonus |
| Triage Order | 42 sequences | Clinical sequence reconstruction with optional scored position hints |
| Anagram Sprint | 111 terms | Five-word, 75-second timed scramble with hints and attempt-based scoring |
| Cell Sketch | 31 unique-named 5×5 nonograms (19 original patterns plus 12 rotations/reflections) | Row and column run clues; CI verifies one valid solution per board |
| What Has More? | 90 comparisons (24 fun-first rounds) | Surprising clinical, food, medication, anatomy, and everyday comparisons; values are explicitly approximate where appropriate |
| Letter Rungs | 26 ladders | Each intended solution path uses real words and one-letter changes |
| Hexicon | 42 medical-themed seven-letter boards | Center-letter word hunt with pangram bonus; generic boards are excluded from play |
| Casefile Logic | 15 cases | Fictional deduction puzzles with tri-state pencil marks, one-to-one assignments, and scored progressive hints |
| Deep Dive | 70 prompts | Timed open-answer prompts with curated long-tail rarity tiers; typo-tolerant matching (a typo is forgiven only when it identifies exactly one accepted answer). Accepted answers per prompt were roughly doubled (every prompt has 12+ answers) with synonyms and abbreviations (`src/dataDeepDiveExtra.ts`); the set is still curated and closed, and rarity tiers are editorial, not measured |
| Trivia Rumble | 365+ questions | Six-category wheel with solo and local pass-and-play modes; 20-second question timer; in pass-and-play a correct answer keeps the wheel and a miss or timeout passes it |
| Mime Time | 135 act-it-out prompts (procedures, symptoms, ward life, instruments, specialties, patients) | Pass-the-phone charades for 1–6 players; 45-second turns, skip/got-it scoring; every prompt can be acted without props or speech |
| Riddle Lab | 52 first-person riddles (12 microbes, 12 drugs, 10 organs, 8 molecules, 10 syndromes) | Four clues from cryptic to obvious; four options with same-kind distractors; 4/3/2/1 points by clues used |
| Body Map Blitz | 14 organs on an original SVG body diagram | Ten timed targets per round, speed-scored, with a short fact after each; patient's right is on the viewer's left |
| Crossword Clinic | 100+ clue/answer pairs; a fresh 6–7 word grid per seed | Generated crossing grids verified so every letter run is exactly one clued word (120 seeds tested); check, reveal, and direction toggle |
| Letter Lab | Generated 4×4 dice boards | Boggle-style adjacent-letter path building; dictionary assembled from the curated medical banks |

## What this means for daily longevity

Daily puzzle selection is deterministic and shared by all players in the same UTC date/scope. The current counts above describe the curated source banks, not the number of unique calendar days supported. Daily and unlimited Free Play are both available; Free Play re-seeds or reshuffles existing content and does not manufacture new questions. Several smaller banks will need further expansion before the arcade can claim a full year of unique daily content.

The architecture deliberately separates game engines from content datasets so banks can grow without rewriting the UI or scoring systems. However, **do not describe the current release as having 365 unique daily puzzles**.

## Specialty and subject tracks

The app currently has 30 tracks: 26 clinical specialties and four foundational subjects (Anatomy, Pathology, Pharmacology, and Biostatistics/Epidemiology). Neurology is one top-level track, like the other specialties.

Clinical cases are filtered toward specialties where curated mappings exist, including newly expanded pediatric, nephrology, pulmonary, gastroenterology, infectious-disease, neurology, cardiology, endocrine, emergency, obstetric/gynecologic, dermatology, allergy/immunology, urology, orthopedic, geriatric, and ophthalmology tracks. Some general-purpose mechanics—such as word games, nonograms, and estimation—draw from shared banks. Track-specific daily seeds are still separate, so friends in the same track share a puzzle while different tracks have distinct daily seeds. The specialty content banks are a first-pass mapping, not a complete curriculum for every discipline.

## Recommended next content work

Prioritize the smallest banks first:
1. Expand Casefile Logic and Hexicon to at least 50 distinct daily sets each; continue replacing generic word boards with medically meaningful sets.
2. Expand Cell Sketch and Letter Rungs while preserving one-solution and valid-path checks (Cell Sketch now has 19 original patterns; Letter Rungs has 26 paths).
3. Add specialty-reviewed Quad Squad boards and clinical cases for tracks whose current content falls back to general banks.
4. Add original/licensed visual material for Framed-style ECG, imaging, histology, gross pathology, and anatomy recognition.
5. Add a long-tail, open-answer party game where scoring rarity is based on an explicit curated weighting system—not a fabricated player-population statistic.

## Accuracy and review standard

Clinical case explanations include source signposts, but not every item has been independently rechecked against the latest guideline at this snapshot. Before using MedDaily for formal teaching or clinical decisions, obtain specialty review and record the review date and the exact guideline version. The app is an educational game, not a clinical decision-support tool.

## Provenance

The research notes in [DLE_RESEARCH.md](./DLE_RESEARCH.md) record the daily-game directories and formats that informed the selection. MedDaily uses original game content and implementations; it does not copy commercial question-bank questions or third-party game artwork.

## Visual system (November 19, 2026)

The arcade home is now games-first: a compact HUD (streak, cleared count, Daily/Free Play and Open Arcade/Specialties toggles), an "Up next" featured game, then the 16-game grid, with Dx Dash below. Every game has original SVG cover art (`src/components/GameArt.tsx`) used on its card, the featured slot, and its play-page header, and each play page takes on its game's accent colour. Still open: bespoke in-game art (boards, completion animations, sound/haptics) and Dx Dash-style atmospheric backgrounds, which need that repository to be accessible.

## Sound and music

All audio is synthesized in the browser (`src/audio.ts`); there are no audio files. Sound effects and music are on by default (the top bar has mute buttons and Options has toggles), and the engine only starts after the first tap or key press because browsers require it. Each game seeds its own key, scale, tempo, and melody. A stage observer (`src/juice.ts`) plays right/wrong sounds and particle bursts from state classes, and games with their own timing opt out with `data-own-sfx`.

## PWA and offline

The service worker now precaches the built JS and CSS on install (so the first offline visit works), matches cached files regardless of `Vary` headers, and the manifest ships 192/512 PNG icons plus an Apple touch icon. Verified in Chromium: install, go offline, reload, and play a game. Google Fonts are not cached, so offline the display fonts fall back to system fonts. Progress is stored in `localStorage` (with JSON export/import); it has not been migrated to IndexedDB.
