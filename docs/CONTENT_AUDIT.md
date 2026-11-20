# Content inventory and expansion priorities

**Snapshot:** November 20, 2026 (gameplay parity iteration)

MedDaily exposes **23 playable game formats** in the home catalog. Body Map Blitz remains implemented but hidden; the retired Triage Order and Next Best Step banks remain in the repository for reference and are not presented as standalone games. Labline, Stat Word, Quad Squad, Trivia Rumble, Mime Time, Crossword Clinic, and Seven Cells now each have 365 unique source prompts/boards/questions; the other games still rely on smaller curated banks, procedural variation, or both, so the entire arcade is not yet a 365-day set of unique content for every game.

## Curated content currently included

| Game | Current bank | Notes |
|---|---:|---|
| Stat Word | 365 unique five-letter answers (all real words; any ENABLE dictionary word is a valid guess) | Medical terms; one answer per daily seed |
| Quad Squad | 365 boards | 160 curated source boards plus 205 deterministic, collision-checked category combinations; every board has four unique categories and 16 unique tiles |
| Differential | 220 cases | Six-guess typed diagnosis puzzle with progressive clues, common clinical aliases, explanations, and source notes |
| Labline | 365 unique prompts | Five-round estimation challenge with cumulative scoring and reference explanations |
| Association Blitz | 208 unique pairs | 24-card, twelve-pair timed memory board with combo streaks, a 75-second clock, and a time bonus |
| Anagram Sprint | 111 terms | Five-word, 75-second timed scramble with hints and attempt-based scoring |
| Cell Sketch | 24 hand-drawn 10–12-cell boards, with seeded rotations/reflections for generated daily and Free Play sets | Row and column run clues; tests verify one valid solution per curated board and that all seven non-identity transforms preserve each board's filled-cell count |
| What Has More? | 116 comparisons (50 fun-first rounds) | Surprising clinical, food, medication, anatomy, and everyday comparisons; values are explicitly approximate where appropriate |
| Letter Rungs | Generated medical ladders (both ends are medical words, 3–5 steps, verified across 120 seeds) | Curated everyday-word ladders were replaced; intermediate steps still use ordinary dictionary words |
| Seven Cells | 365 playable seven-letter boards (50 curated bases, 234 enriched center-letter variants, 81 new pangram sets) | Center-letter word hunt with pangram bonus; every board has at least eight valid words and a pangram |
| Casefile Logic | 11 clinical themes of look-alike conditions (75 conditions): cough, meningitis, food-borne diarrhea, fever with rash, anemia, endocrine, toxidromes, stroke localization, chest pain, liver, kidney biopsy | Each case picks three conditions from a theme and asks the player to match patients to causes and clinching findings; clues describe items by clinical features (decodable with (?) at a small cost); a generator guarantees exactly one solution (verified over 400 seeds); one accusation; teaching note per patient. The wording of every condition is checked so that its patient, cause, descriptor and finding share no content words (so nothing can be matched without medical knowledge). The earlier everyday-objects logic puzzle code remains in the repo but is no longer used. Clinical content should get specialty review. |
| Deep Scan | 79 prompts; nine long-tail banks (60 answers each) plus synonym/abbreviation aliases (`src/dataDeepDiveExtra.ts`) | Modeled on the one-answer-per-question rarity-dive format (see the Krillion clones): seven questions, 25 seconds each, one typed answer; typo-tolerant and space/hyphen-insensitive matching; unlisted answers are retried, not called wrong; tiers are named for tissue layers (skin to marrow) and are editorial, not measured |
| Scale Lab | 110+ estimation items across five scales (weight, size, volume, count, time) | Four rounds a day (weight, size, time, and a volume-or-count wildcard), two items per round on a fixed log ruler; scoring is log-based with a 25% bullseye window; values are typical adult figures, checked by range and no-leak tests |
| Branch Lab | 102 microbes and 89 drugs, each with a lineage path and a clue | Daily mystery microbe or drug (varies by day); eight guesses; every guess grows a lineage tree and shows shared ancestry and candidates left; tests check unique answers, lineage shape and that clues never name the answer; lineages and clues were written from standard references and should get specialty review |
| Crossmatch | 41 drug groups and properties (20 groups, 40+ properties) covering about 130 drugs; any three across and three down, always solvable with every drug used once | Rarity bonus uses how many lists mention a drug (editorial, not player data); membership lists follow standard pharmacology teaching and need pharmacist or physician review |
| Blackout Chart | 43 original case reports (about 60 to 110 words each) | The diagnosis's distinctive words never appear in the text (tested); words tried reveal every matching word, with light stemming; case content needs clinical review |
| Hoofbeats | 53 clinical prompts, each with 6 to 16 valid answers weighted by approximate real-world prevalence (ten points per percent) | A separate game from Deep Scan: name the most common answer. Weights are editorial teaching estimates of typical epidemiology, not a poll or live player data, and cover most but not all causes. Tests check that shares add to 100 or less, every prompt has a clear leader and a long tail, answers and aliases never collide, and no prompt contains an answer. Needs specialty review. |
| Trivia Rumble | 365+ questions | Six-category wheel with solo and local pass-and-play modes; 20-second timer; a correct answer keeps the wheel in pass-and-play |

| Theme Trail | 60+ qualifying themed word packs, each laid out as a bending adjacent-letter board with a board-spanning trail word | Drag or tap to trace terms; bonus words earn hints; generator ported from ChatGPT's Strands-style prototype and tested on every qualifying pack |
| Letter Lab | Generated 4×4 dice boards | Boggle-style adjacent-letter path building; dictionary assembled from the curated medical banks |
| Crossword Clinic | 365 unique clue-and-answer entries | Procedurally generated mini-crosswords; tests validate clue hygiene, unique entries, and deterministic valid grids across 120 seeds |
| Riddle Lab | 50+ riddles | Four-stage progressive clues with four answer choices; tests check clue leakage, unique answers, and distractor availability |
| Mime Time | 365 unique act-it-out prompts | Pass-the-phone charades across procedures, symptoms, ward life, instruments, specialties, and patient scenarios |

The retired Triage Order bank (42 sequences) and Next Best Step bank remain in source control for reference; neither is exposed as a playable home-catalog game.

## What this means for daily longevity

Daily puzzle selection is deterministic and shared by all players in the same UTC date/scope. The current counts above describe the curated source banks, not the number of unique calendar days supported. Daily and unlimited Free Play are both available. Most clinical knowledge games re-seed or reshuffle curated banks; Theme Trail, Letter Lab, Casefile Logic, Letter Rungs, and Cell Sketch also use procedural generation or seeded transformations. Procedural variety does not replace the need to keep expanding curated clinical content. Several smaller banks will need further expansion before the arcade can claim a full year of unique daily content.

The architecture deliberately separates game engines from content datasets so banks can grow without rewriting the UI or scoring systems. However, **do not describe the current release as having 365 unique daily puzzles**.

## Specialty and subject tracks

The app currently has 30 tracks: 26 clinical specialties and four foundational subjects (Anatomy, Pathology, Pharmacology, and Biostatistics/Epidemiology). Neurology is one top-level track, like the other specialties.

Clinical cases are filtered toward specialties where curated mappings exist, including newly expanded pediatric, nephrology, pulmonary, gastroenterology, infectious-disease, neurology, cardiology, endocrine, emergency, obstetric/gynecologic, dermatology, allergy/immunology, urology, orthopedic, geriatric, and ophthalmology tracks. Some general-purpose mechanics—such as word games, nonograms, and estimation—draw from shared banks. Track-specific daily seeds are still separate, so friends in the same track share a puzzle while different tracks have distinct daily seeds. The specialty content banks are a first-pass mapping, not a complete curriculum for every discipline.

## Recommended next content work

Remaining content priorities:
1. Continue editorial review of Seven Cells answer frequency and difficulty. The 365-board rotation now has at least eight accepted words per board, with 50 curated bases, 224 enriched center variants, and 91 additional pangram sets.
2. Continue expanding Cell Sketch and Letter Rungs while preserving one-solution and valid-path checks (Cell Sketch has 24 original patterns plus seeded transforms; Letter Rungs has 50 curated paths plus procedural medical ladders verified across 120 seeds).
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
