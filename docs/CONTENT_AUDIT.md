# Content inventory and expansion priorities

**Snapshot:** November 19, 2026 (gameplay parity iteration)

MedDaily exposes twenty playable game formats. The retired Next Best Step bank remains in the repository for reference but is not presented as a standalone game. The current banks are not yet a 365-day set of unique puzzles for every game.

## Curated content currently included

| Game | Current bank | Notes |
|---|---:|---|
| Stat Word | 365 unique five-letter answers (all real words; any ENABLE dictionary word is a valid guess) | Medical terms; one answer per daily seed |
| Quad Squad | 365 boards | 160 curated source boards plus 205 deterministic, collision-checked category combinations; every board has four unique categories and 16 unique tiles |
| Differential | 220 cases | Six-guess typed diagnosis puzzle with progressive clues, common clinical aliases, explanations, and source notes |
| Labline | 100 prompts | Five-round estimation challenge with cumulative scoring and reference explanations |
| Association Blitz | 208 unique pairs | 24-card, twelve-pair timed memory board with combo streaks, a 75-second clock, and a time bonus |
| Triage Order | 42 sequences | Clinical sequence reconstruction with optional scored position hints |
| Anagram Sprint | 111 terms | Five-word, 75-second timed scramble with hints and attempt-based scoring |
| Cell Sketch | 44 named 5×5 boards (36 distinct shapes, including symmetry variants) + seeded generated daily and Free Play transforms | Row and column run clues; CI verifies one valid solution per board |
| What Has More? | 116 comparisons (50 fun-first rounds) | Surprising clinical, food, medication, anatomy, and everyday comparisons; values are explicitly approximate where appropriate |
| Letter Rungs | Generated medical ladders (both ends are medical words, 3–5 steps, verified across 120 seeds) | Curated everyday-word ladders were replaced; intermediate steps still use ordinary dictionary words |
| Seven Cells | 50 medical-themed seven-letter boards | Center-letter word hunt with pangram bonus; generic boards are excluded from play |
| Casefile Logic | 11 clinical themes of look-alike conditions (75 conditions): cough, meningitis, food-borne diarrhea, fever with rash, anemia, endocrine, toxidromes, stroke localization, chest pain, liver, kidney biopsy | Each case picks three conditions from a theme and asks the player to match patients to causes and clinching findings; clues describe items by clinical features (decodable with (?) at a small cost); a generator guarantees exactly one solution (verified over 400 seeds); one accusation; teaching note per patient. The earlier everyday-objects logic puzzle code remains in the repo but is no longer used. Clinical content should get specialty review. |
| Deep Scan | 79 prompts; nine long-tail banks (60 answers each) plus synonym/abbreviation aliases (`src/dataDeepDiveExtra.ts`) | Modeled on the one-answer-per-question rarity-dive format (see the Krillion clones): seven questions, 25 seconds each, one typed answer; typo-tolerant and space/hyphen-insensitive matching; unlisted answers are retried, not called wrong; tiers are named for tissue layers (skin to marrow) and are editorial, not measured |
| Scale Lab | 110+ estimation items across five scales (weight, size, volume, count, time) | Four rounds a day (weight, size, time, and a volume-or-count wildcard), two items per round on a fixed log ruler; scoring is log-based with a 25% bullseye window; values are typical adult figures, checked by range and no-leak tests |
| Branch Lab | 102 microbes and 89 drugs, each with a lineage path and a clue | Daily mystery microbe or drug (varies by day); eight guesses; every guess grows a lineage tree and shows shared ancestry and candidates left; tests check unique answers, lineage shape and that clues never name the answer; lineages and clues were written from standard references and should get specialty review |
| Trivia Rumble | 365+ questions | Six-category wheel with solo and local pass-and-play modes; 20-second timer; a correct answer keeps the wheel in pass-and-play |

| Theme Trail | 30 themed word packs, each laid out as a bending adjacent-letter board with a board-spanning trail word | Drag or tap to trace terms; bonus words earn hints; generator ported from ChatGPT's Strands-style prototype and tested on every qualifying pack |
| Letter Lab | Generated 4×4 dice boards | Boggle-style adjacent-letter path building; dictionary assembled from the curated medical banks |

## What this means for daily longevity

Daily puzzle selection is deterministic and shared by all players in the same UTC date/scope. The current counts above describe the curated source banks, not the number of unique calendar days supported. Daily and unlimited Free Play are both available. Most clinical knowledge games re-seed or reshuffle curated banks; Word Hunt, Letter Lab, Casefile Logic, Word Ladder, and Cell Sketch also use procedural generation or seeded transformations. Procedural variety does not replace the need to keep expanding curated clinical content. Several smaller banks will need further expansion before the arcade can claim a full year of unique daily content.

The architecture deliberately separates game engines from content datasets so banks can grow without rewriting the UI or scoring systems. However, **do not describe the current release as having 365 unique daily puzzles**.

## Specialty and subject tracks

The app currently has 30 tracks: 26 clinical specialties and four foundational subjects (Anatomy, Pathology, Pharmacology, and Biostatistics/Epidemiology). Neurology is one top-level track, like the other specialties.

Clinical cases are filtered toward specialties where curated mappings exist, including newly expanded pediatric, nephrology, pulmonary, gastroenterology, infectious-disease, neurology, cardiology, endocrine, emergency, obstetric/gynecologic, dermatology, allergy/immunology, urology, orthopedic, geriatric, and ophthalmology tracks. Some general-purpose mechanics—such as word games, nonograms, and estimation—draw from shared banks. Track-specific daily seeds are still separate, so friends in the same track share a puzzle while different tracks have distinct daily seeds. The specialty content banks are a first-pass mapping, not a complete curriculum for every discipline.

## Recommended next content work

Remaining content priorities:
1. Continue replacing generic Seven Cells entries with clinically meaningful, dictionary-verified words; the playable bank now has 50 boards.
2. Expand Cell Sketch and Letter Rungs while preserving one-solution and valid-path checks (Cell Sketch now has 24 original patterns plus 12 transformed variants; Letter Rungs now has 36 curated paths).
3. Add specialty-reviewed Quad Squad boards and clinical cases for tracks whose current content falls back to general banks.
4. Add original/licensed visual material for ECG, imaging, histology, gross pathology, and anatomy recognition.
5. Continue expanding Deep Scan's long-tail answer sets with clinically defensible aliases and explicit editorial rarity weights—not fabricated player-population statistics.

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


## Unlisted games
Body Map Blitz is unlisted (`hidden: true` in `src/App.tsx`): the code, tests and data stay, it still opens by id, and it is not shown in the grid, Surprise me, "next up", the game shelf or trophy totals. Remove the flag to bring it back. It was unlisted because a 3D model for it could not be sourced under a clear licence.
