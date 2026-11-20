# Content inventory and expansion priorities

**Snapshot:** November 20, 2026 (gameplay parity iteration)

MedDaily exposes **23 playable game formats** in the home catalog. Body Map Blitz remains implemented but hidden; the retired Triage Order and Next Best Step banks remain in the repository for reference and are not presented as standalone games. Labline, Stat Word, Quad Squad, Trivia Rumble, Mime Time, Crossword Clinic, and Seven Cells now each have 365 unique source prompts/boards/questions; the other games still rely on smaller curated banks, procedural variation, or both, so the entire arcade is not yet a 365-day set of unique content for every game.

## Curated content currently included

| Game | Current bank | Notes |
|---|---:|---|
| Stat Word | 365 unique five-letter answers (all real words; any ENABLE dictionary word is a valid guess) | Medical terms; one answer per daily seed |
| Quad Squad | 365 boards | 160 curated source boards plus 205 deterministic, collision-checked category combinations; every board has four unique categories and 16 unique tiles |
| Differential | 416 cases: 220 original clinical cases plus 196 organism-identification cases | Six-guess typed diagnosis puzzle with progressive clues, common clinical aliases, explanations, and source notes; the daily UTC rotation selects a new case for 365 consecutive days before repeating |
| Labline | 365 unique prompts | Five-round estimation challenge with cumulative scoring and reference explanations |
| Association Blitz | 208 unique pairs | 24-card, twelve-pair timed memory board with combo streaks, a 75-second clock, and a time bonus |
| Anagram Sprint | 111 terms | Five-word, 75-second timed scramble with hints and attempt-based scoring |
| Cell Sketch | 24 hand-drawn 10–12-cell boards, each with eight orientation states (192 individual picture variants); three pictures are played per session | The three-picture combinations provide well over 365 distinct daily sessions; row and column run clues; tests verify curated board dimensions and that all seven non-identity transforms preserve each board's filled-cell count |
| What Has More? | 116 comparisons (50 fun-first rounds) | Surprising clinical, food, medication, anatomy, and everyday comparisons; values are explicitly approximate where appropriate |
| Letter Rungs | Generated medical ladders (both ends are medical words, 3–5 steps, verified across 120 seeds) | Curated everyday-word ladders were replaced; intermediate steps still use ordinary dictionary words |
| Seven Cells | 365 playable seven-letter boards (50 curated playable bases, 234 enriched center-letter variants, 81 new pangram sets) | Center-letter word hunt with pangram bonus; every board has at least eight valid words and a pangram |
| Casefile Logic | 11 clinical themes of look-alike conditions (75 conditions): cough, meningitis, food-borne diarrhea, fever with rash, anemia, endocrine, toxidromes, stroke localization, chest pain, liver, kidney biopsy | Each case picks three conditions from a theme and asks the player to match patients to causes and clinching findings; clues describe items by clinical features (decodable with (?) at a small cost); a generator guarantees exactly one solution (verified over 400 seeds); one accusation; teaching note per patient. The wording of every condition is checked so that its patient, cause, descriptor and finding share no content words (so nothing can be matched without medical knowledge). The earlier everyday-objects logic puzzle code remains in the repo but is no longer used. Clinical content should get specialty review. |
| Deep Scan | 79 prompts; nine long-tail banks (60 answers each) plus synonym/abbreviation aliases (`src/dataDeepDiveExtra.ts`) | Modeled on the one-answer-per-question rarity-dive format (see the Krillion clones): seven questions, 25 seconds each, one typed answer; typo-tolerant and space/hyphen-insensitive matching; unlisted answers are retried, not called wrong; tiers are named for tissue layers (skin to marrow) and are editorial, not measured |
| Scale Lab | 110+ estimation items across five scales (weight, size, volume, count, time) | Four rounds a day (weight, size, time, and a volume-or-count wildcard), two items per round on a fixed log ruler; scoring is log-based with a 25% bullseye window; values are typical adult figures, checked by range and no-leak tests |
| Branch Lab | 196 unique microbes and 226 unique drugs (422 total), each with a lineage path and a clue | Daily mystery microbe or drug (varies by day); eight guesses; every guess grows a lineage tree and shows shared ancestry and candidates left; the expanded pools exceed 365 total unique targets and each mode has at least 180; tests check unique answers, lineage shape and that clues never name the answer; lineages and clues were written from standard references and should get specialty review |
| Crossmatch | 41 drug groups and properties (20 groups, 40+ properties) covering about 130 drugs; any three across and three down, always solvable with every drug used once | Rarity bonus uses how many lists mention a drug (editorial, not player data); membership lists follow standard pharmacology teaching and need pharmacist or physician review |
| Blackout Chart | 483 case files: 43 original reports plus 220 diagnosis cases and 220 management cases, with answer terms redacted | One hidden diagnosis or next action per day; a sequential UTC-day rotation guarantees 365 distinct case files before any repeat; tests check answer-word leakage, case length, and 365-day uniqueness; derived cases retain the source vignettes and require clinical review |
| Hoofbeats | 53 clinical prompts, each with 6 to 16 valid answers weighted by approximate real-world prevalence (ten points per percent) | A separate game from Deep Scan: name the most common answer. Weights are editorial teaching estimates of typical epidemiology, not a poll or live player data, and cover most but not all causes. Tests check that shares add to 100 or less, every prompt has a clear leader and a long tail, answers and aliases never collide, and no prompt contains an answer. Needs specialty review. |
| Trivia Rumble | 365+ questions | Six-category wheel with solo and local pass-and-play modes; 20-second timer; a correct answer keeps the wheel in pass-and-play |

| Theme Trail | 365 validated, distinct word-set packs (original microbiology packs plus seeded taxonomy-family combinations) | Daily UTC rotation selects a different pack for 365 consecutive days; each pack is checked by the board generator at two seeds and regression-tested at representative daily positions; drag or tap to trace terms and bonus words earn hints |
| Letter Lab | Generated 4×4 dice boards | Boggle-style adjacent-letter path building; dictionary assembled from the curated medical banks |
| Crossword Clinic | 365 unique clue-and-answer entries | Procedurally generated mini-crosswords; tests validate clue hygiene, unique entries, and deterministic valid grids across 120 seeds |
| Riddle Lab | 460 unique clue ladders: original riddles plus diagnosis and next-step cases reframed as progressive clues; duplicate answers are excluded | Five rounds per game; each entry has four progressive clues and four distinct same-kind answer choices; generated case clues redact the answer; tests check bank size, unique IDs, clue shape and distractor availability |
| Mime Time | 365 unique act-it-out prompts | Pass-the-phone charades across procedures, symptoms, ward life, instruments, specialties, and patient scenarios |

The retired Triage Order bank (42 sequences) and Next Best Step bank remain in source control for reference; neither is exposed as a playable home-catalog game.

## What this means for daily longevity

Daily puzzle selection is deterministic and shared by all players in the same UTC date/scope. The single-target daily games now have year-sized no-repeat rotations: DoctorDle (416 cases), Branch Lab (422 organism/drug targets alternating across days), Blackout Chart (483 case files), and Theme Trail (365 validated boards). Riddle Lab has 460 unique clue ladders after duplicate answers are excluded. Multi-round games use several prompts per session, so their combinations support at least 365 daily sessions even when the raw source bank is smaller: Deep Scan uses seven of 79 prompts, Cell Sketch uses three of 192 picture variants, and games such as Hoofbeats, What Has More, Association Blitz, Anagram Sprint, and Scale Lab also draw multiple items per session. Daily and unlimited Free Play are both available.

The architecture deliberately separates game engines from content datasets so banks can grow without rewriting the UI or scoring systems. However, **the current content inventory supports at least 365 distinct daily sessions across the listed games**, with the caveat that several banks reuse existing clinical source vignettes in a different game format and should continue to receive editorial review.

## Specialty and subject tracks

The app currently has 30 tracks: 26 clinical specialties and four foundational subjects (Anatomy, Pathology, Pharmacology, and Biostatistics/Epidemiology). Neurology is one top-level track, like the other specialties.

Clinical cases are filtered toward specialties where curated mappings exist, including newly expanded pediatric, nephrology, pulmonary, gastroenterology, infectious-disease, neurology, cardiology, endocrine, emergency, obstetric/gynecologic, dermatology, allergy/immunology, urology, orthopedic, geriatric, and ophthalmology tracks. Some general-purpose mechanics—such as word games, nonograms, and estimation—draw from shared banks. Track-specific daily seeds are still separate, so friends in the same track share a puzzle while different tracks have distinct daily seeds. The specialty content banks are a first-pass mapping, not a complete curriculum for every discipline.

## Recommended next content work

Remaining content priorities:
1. Continue editorial review of Seven Cells answer frequency and difficulty. The 365-board rotation now has at least eight accepted words per board, with 50 curated playable bases, 234 enriched center variants, and 81 additional pangram sets.
2. Continue adding original Cell Sketch art and Letter Rungs vocabulary while preserving board validity and path checks (Cell Sketch currently has 24 original patterns plus seeded transforms; Letter Rungs has 50 curated paths plus procedural medical ladders verified across 365 seeds).
3. Continue specialty review of Quad Squad and clinical-case mappings. Coverage was broadened for ENT, ophthalmology, allergy, pulmonology, rheumatology, orthopedics, urology, geriatrics, obstetrics, radiology, and other lower-volume tracks; the mappings now draw on more of the curated source bank, but some specialties still need additional original cases.
4. Add original/licensed visual material for ECG, imaging, histology, gross pathology, and anatomy recognition.
5. Maintain Deep Scan's clinical review standard: nine dedicated long-tail prompts currently carry at least 60 answers each, with ten editorially tiered answers per tier and collision-checked aliases. Tiers are editorial judgments, not fabricated player-population statistics.

## Accuracy and review standard

Clinical case explanations include source signposts, but not every item has been independently rechecked against the latest guideline at this snapshot. Before using MedDaily for formal teaching or clinical decisions, obtain specialty review and record the review date and the exact guideline version. The app is an educational game, not a clinical decision-support tool.

## Provenance

The research notes in [DLE_RESEARCH.md](./DLE_RESEARCH.md) record the daily-game directories and formats that informed the selection. MedDaily uses original game content and implementations; it does not copy commercial question-bank questions or third-party game artwork.

## Visual system (November 19, 2026)

The arcade home is now games-first: a compact HUD (streak, cleared count, Daily/Free Play and Open Arcade/Specialties toggles), an "Up next" featured game, then the 23-game grid, with Dx Dash below. Every game has original SVG cover art (`src/components/GameArt.tsx`) used on its card, the featured slot, and its play-page header, and each play page takes on its game's accent colour. StageScene now includes original library, clinic, lab, anatomy, party, ECG, imaging, histology, and gross-pathology line art; the ECG trace has a restrained motion loop. Game stages now have per-game atmospheric color fields in addition to the ECG/imaging/histology/gross-pathology line art. Still open: bespoke per-game board illustrations, richer completion animations, haptic feedback on more interactions, and the full Dx Dash-style background treatment.

## Sound and music

All audio is synthesized in the browser (`src/audio.ts`); there are no audio files. Sound effects and music are on by default (the top bar has mute buttons and Options has toggles), and the engine only starts after the first tap or key press because browsers require it. Each game seeds its own key, scale, tempo, and melody. A stage observer (`src/juice.ts`) plays right/wrong sounds and particle bursts from state classes, and games with their own timing opt out with `data-own-sfx`.

## PWA and offline

The service worker now precaches the built JS and CSS on install (so the first offline visit works), matches cached files regardless of `Vary` headers, and the manifest ships 192/512 PNG icons plus an Apple touch icon. Verified in Chromium: install, go offline, reload, and play a game. Google Fonts are not cached, so offline the display fonts fall back to system fonts. Progress is stored in `localStorage` (with JSON export/import); it has not been migrated to IndexedDB.


## Unlisted games
Body Map Blitz is unlisted (`hidden: true` in `src/App.tsx`): the code, tests and data stay, it still opens by id, and it is not shown in the grid, Surprise me, "next up", the game shelf or trophy totals. Remove the flag to bring it back. It was unlisted because a 3D model for it could not be sourced under a clear licence.
