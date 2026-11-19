# Content inventory and expansion priorities

**Snapshot:** November 19, 2026 (gameplay parity iteration)

MedDaily exposes sixteen playable game formats. The retired Next Best Step bank remains in the repository for reference but is not presented as a standalone game. The current banks are not yet a 365-day set of unique puzzles for every game.

## Curated content currently included

| Game | Current bank | Notes |
|---|---:|---|
| Medle | 142 unique five-letter answers | Medical terms and abbreviations; one answer per daily seed |
| Connections | 122 boards | Four groups of four per board; 20 new cross-specialty boards |
| DoctorDle | 220 cases | Six-guess typed diagnosis puzzle with progressive clues, common clinical aliases, explanations, and source notes |
| Word Hunt | 71 unique medical theme packs | 14×14 drag-to-select word-search grids; themes span organisms, anatomy, organ systems, and pharmacology |
| Labline | 100 prompts | Five-round estimation challenge with cumulative scoring and reference explanations |
| Association Blitz | 208 unique pairs | 24-card, twelve-pair timed memory board with combo streaks, a 75-second clock, and a time bonus |
| Triage Order | 42 sequences | Clinical sequence reconstruction with optional scored position hints |
| Anagram Sprint | 111 terms | Five-word, 75-second timed scramble with hints and attempt-based scoring |
| Cell Sketch | 36 curated 5×5 patterns + 8 seeded transformations each in Free Play | Row and column run clues; CI verifies one valid solution per board |
| What Has More? | 116 comparisons (50 fun-first rounds) | Surprising clinical, food, medication, anatomy, and everyday comparisons; values are explicitly approximate where appropriate |
| Word Ladder | 26 curated ladders + procedural Free Play | Each intended solution path uses real words and one-letter changes |
| Medical Spelling Hive | 50 medical-themed seven-letter boards | Center-letter word hunt with pangram bonus; generic boards are excluded from play |
| Casefile Logic | 30 curated cases + seeded procedural daily rotation and Free Play | Alternates curated cases with generated, uniquely solvable 3×3 deduction grids; both modes include pencil marks and scored hints |
| Deep Dive | 70 prompts | Timed open-answer prompts with curated long-tail rarity tiers |
| Trivia Rumble | 365+ questions | Six-category wheel with solo and local pass-and-play modes |
| Letter Lab | Generated 4×4 dice boards | Boggle-style adjacent-letter path building; dictionary assembled from the curated medical banks |

## What this means for daily longevity

Daily puzzle selection is deterministic and shared by all players in the same UTC date/scope. The current counts above describe the curated source banks, not the number of unique calendar days supported. Daily and unlimited Free Play are both available. Most clinical knowledge games re-seed or reshuffle curated banks; Word Hunt, Letter Lab, Casefile Logic, Word Ladder, and Cell Sketch also use procedural generation or seeded transformations. Procedural variety does not replace the need to keep expanding curated clinical content. Several smaller banks will need further expansion before the arcade can claim a full year of unique daily content.

The architecture deliberately separates game engines from content datasets so banks can grow without rewriting the UI or scoring systems. However, **do not describe the current release as having 365 unique daily puzzles**.

## Specialty and subject tracks

The app currently has 30 tracks: 26 clinical specialties and four foundational subjects (Anatomy, Pathology, Pharmacology, and Biostatistics/Epidemiology). Neurology is one top-level track, like the other specialties.

Clinical cases are filtered toward specialties where curated mappings exist, including newly expanded pediatric, nephrology, pulmonary, gastroenterology, infectious-disease, neurology, cardiology, endocrine, emergency, obstetric/gynecologic, dermatology, allergy/immunology, urology, orthopedic, geriatric, and ophthalmology tracks. Some general-purpose mechanics—such as word games, nonograms, and estimation—draw from shared banks. Track-specific daily seeds are still separate, so friends in the same track share a puzzle while different tracks have distinct daily seeds. The specialty content banks are a first-pass mapping, not a complete curriculum for every discipline.

## Recommended next content work

Remaining content priorities:
1. Continue replacing generic Spelling Hive entries with clinically meaningful, dictionary-verified words; the playable bank now has 50 boards.
2. Expand Cell Sketch and Word Ladder while preserving one-solution and valid-path checks (Cell Sketch now has 19 original patterns; Word Ladder has 26 paths).
3. Add specialty-reviewed Connections boards and clinical cases for tracks whose current content falls back to general banks.
4. Add original/licensed visual material for ECG, imaging, histology, gross pathology, and anatomy recognition.
5. Continue expanding Deep Dive's long-tail answer sets with clinically defensible aliases and explicit editorial rarity weights—not fabricated player-population statistics.

## Accuracy and review standard

Clinical case explanations include source signposts, but not every item has been independently rechecked against the latest guideline at this snapshot. Before using MedDaily for formal teaching or clinical decisions, obtain specialty review and record the review date and the exact guideline version. The app is an educational game, not a clinical decision-support tool.

## Provenance

The research notes in [DLE_RESEARCH.md](./DLE_RESEARCH.md) record the daily-game directories and formats that informed the selection. MedDaily uses original game content and implementations; it does not copy commercial question-bank questions or third-party game artwork.
