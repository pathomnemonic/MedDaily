# Content inventory and expansion priorities

**Snapshot:** November 19, 2026 (content expansion batch 15)

MedDaily has fourteen playable game formats. This is a functioning first release with a broad specialty structure, not yet a 365-day set of unique content for every game.

## Curated content currently included

| Game | Current bank | Notes |
|---|---:|---|
| Medle | 140 unique five-letter answers | Medical terms and abbreviations; one answer per daily seed |
| Connections | 122 boards | Four groups of four per board; 20 new cross-specialty boards |
| DoctorDle | 220 cases | Six-guess typed diagnosis puzzle with progressive clues, explanations, and source notes |
| Word Hunt | 68 organism packs | Each pack generates a deterministic word-search grid |
| Labline | 100 prompts | Reference values, thresholds, and a few vital-sign estimates; normal ranges vary by laboratory and patient |
| Association Blitz | 208 pairs | Expanded eight-pair association board; still needs more varied mechanics and timed/combo modes |
| Triage Order | 42 sequences | Clinical and emergency sequence-reconstruction puzzles |
| Anagram Sprint | 111 terms | Three-guess word scramble |
| Cell Sketch | 31 unique-named 5×5 nonograms (19 original patterns plus 12 rotations/reflections) | Row and column run clues; CI verifies one valid solution per board |
| What Has More? | 82 comparisons (16 fun-first rounds) | Clinical quantities plus playful food, medication, and everyday comparisons; values are explicitly approximate where appropriate |
| Word Ladder | 26 ladders | Each intended solution path uses real words and one-letter changes |
| Medical Spelling Hive | 28 seven-letter boards | 28 themed boards with an expanded medical vocabulary; generic filler should continue to be replaced |
| Casefile Logic | 15 cases | Fictional deduction puzzles; one-to-one assignment rules |

## What this means for daily longevity

Daily puzzle selection is deterministic and shared by all players in the same UTC date/scope. Across the clinical expansion batches to date, 110 Connections boards, 200 diagnosis cases, and 200 next-step cases have been added beyond the original banks, 40 Labline prompts, 116 memory pairs, 40 organism packs, 19 Spelling Hive boards, 20 Word Ladders, 13 original nonogram patterns plus 12 transformations, 12 fictional logic cases, 59 new Medle answers, 20 triage sequences, 30 quantitative comparisons, and 51 Anagram Sprint terms. Several games still have far fewer than 365 unique days, and the smallest puzzle formats remain the immediate priority. Practice mode draws from the same available content; it does not create new questions.

The architecture deliberately separates game engines from content datasets so banks can grow without rewriting the UI or scoring systems. However, **do not describe the current release as having 365 unique daily puzzles**.

## Specialty and subject tracks

The app currently has 30 tracks: 26 clinical specialties and four foundational subjects (Anatomy, Pathology, Pharmacology, and Biostatistics/Epidemiology). Neurology is one top-level track, like the other specialties.

Clinical cases are filtered toward specialties where curated mappings exist, including newly expanded pediatric, nephrology, pulmonary, gastroenterology, infectious-disease, neurology, cardiology, endocrine, emergency, obstetric/gynecologic, dermatology, allergy/immunology, urology, orthopedic, geriatric, and ophthalmology tracks. Some general-purpose mechanics—such as word games, nonograms, and estimation—draw from shared banks. Track-specific daily seeds are still separate, so friends in the same track share a puzzle while different tracks have distinct daily seeds. The specialty content banks are a first-pass mapping, not a complete curriculum for every discipline.

## Recommended next content work

Prioritize the smallest banks first:
1. Expand Casefile Logic and Medical Spelling Hive to at least 50 distinct daily sets each; continue replacing generic word boards with medically meaningful sets.
2. Expand Cell Sketch and Word Ladder while preserving one-solution and valid-path checks (Cell Sketch now has 19 original patterns; Word Ladder has 26 paths).
3. Add specialty-reviewed Connections boards and clinical cases for tracks whose current content falls back to general banks.
4. Add original/licensed visual material for Framed-style ECG, imaging, histology, gross pathology, and anatomy recognition.
5. Add a long-tail, open-answer party game where scoring rarity is based on an explicit curated weighting system—not a fabricated player-population statistic.

## Accuracy and review standard

Clinical case explanations include source signposts, but not every item has been independently rechecked against the latest guideline at this snapshot. Before using MedDaily for formal teaching or clinical decisions, obtain specialty review and record the review date and the exact guideline version. The app is an educational game, not a clinical decision-support tool.

## Provenance

The research notes in [DLE_RESEARCH.md](./DLE_RESEARCH.md) record the daily-game directories and formats that informed the selection. MedDaily uses original game content and implementations; it does not copy commercial question-bank questions or third-party game artwork.
