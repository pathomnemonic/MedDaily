# Clinical content review

> **Status (Nov 2026): deprioritized, not a launch blocker.** The owner decided Clinicle will rely on user reports of incorrect questions instead. These packages stay ready if that changes. The in-app report path is described in `docs/SUPPORT_AND_REPORTS.md`.

MedDaily is an education and entertainment app, not a clinical decision tool, but its games state many clinical facts. This folder packages every one of them
for specialist review before the app is promoted in the stores. Generated 2026-11-23 from the game data; **6673 items**, of which **863 are high-risk**.

## What is here
| File | Purpose |
|---|---|
| `REVIEWER_GUIDE.md` | One page to send to each reviewer: what to check, how to mark it, what to ignore |
| `PRIORITY-high-risk.csv` | The items most worth a specialist's time: numbers, treatments, drug groups, case causes and findings, step orders |
| `by-specialty/*.csv` | Every item, grouped by *suggested* specialty (see below), high-risk first |
| `summary.json` | Counts per specialty and game |

Regenerate after any content change: `npx tsx scripts/export-review.ts`.

## How the items are grouped
Specialty is a keyword-based **suggestion for routing**, not a clinical classification. Some items land in the wrong specialty and 1,000 or so are "General / unrouted";
a reviewer who sees an item outside their field should mark the Comment column, not spend time on it. Risk is by type of claim:
- **High** (numbers a learner may memorise, management steps and orders, drug-class membership, case causes and findings): Labline reference values, next-step cases, triage sequences, Hoofbeats prevalence, Casefile, Crossmatch, What Has More?
- **Medium** (a diagnosis or fact that must be right but is cued by clues): Differential, Trivia Rumble, Blackout Chart, Deep Scan, Riddle Lab, Branch Lab, Scale Lab
- **Low** (definitions, associations, groupings): Anagram Sprint, Association Blitz, Crossword Clinic, Quad Squad

## Suggested plan
1. **Pilot:** send `PRIORITY-high-risk.csv` rows for one specialty (for example cardiology, 59 items) to one reviewer and time it. Expect about one minute per item.
2. **Priority sweep:** the 863 high-risk items across specialties, roughly 14 hours of reviewer time in total, so about 1 hour per specialty, with two reviewers per
   high-stakes bank (Labline, next-step cases) if available.
3. **Medium risk:** Trivia Rumble, Differential and Blackout Chart in that order, as time allows. Low-risk items can wait or be spot-checked.
4. **Return:** reviewers save the sheet as CSV into `review/returned/`. Run `npx tsx scripts/check-review.ts`; it writes `returned-summary.md` listing every FIX and REMOVE
   with the reviewer's correction, flags sheets with bad verdicts or conflicting answers, and changes no game content. Corrections are then applied by hand and re-exported.

## By specialty
| Specialty (suggested) | File | Items | High-risk |
|---|---|---|---|
| General / unrouted | [`by-specialty/general-unrouted.csv`](by-specialty/general-unrouted.csv) | 1035 | 181 |
| Infectious disease | [`by-specialty/infectious-disease.csv`](by-specialty/infectious-disease.csv) | 767 | 51 |
| Gastroenterology & hepatology | [`by-specialty/gastroenterology-hepatology.csv`](by-specialty/gastroenterology-hepatology.csv) | 645 | 57 |
| Hematology & oncology | [`by-specialty/hematology-oncology.csv`](by-specialty/hematology-oncology.csv) | 522 | 63 |
| Cardiology | [`by-specialty/cardiology.csv`](by-specialty/cardiology.csv) | 517 | 59 |
| Pulmonology | [`by-specialty/pulmonology.csv`](by-specialty/pulmonology.csv) | 516 | 43 |
| Nephrology & urology | [`by-specialty/nephrology-urology.csv`](by-specialty/nephrology-urology.csv) | 493 | 73 |
| Pharmacology | [`by-specialty/pharmacology.csv`](by-specialty/pharmacology.csv) | 403 | 54 |
| Rheumatology, dermatology & musculoskeletal | [`by-specialty/rheumatology-dermatology-musculoskeletal.csv`](by-specialty/rheumatology-dermatology-musculoskeletal.csv) | 321 | 31 |
| Endocrinology & metabolism | [`by-specialty/endocrinology-metabolism.csv`](by-specialty/endocrinology-metabolism.csv) | 309 | 75 |
| Neurology | [`by-specialty/neurology.csv`](by-specialty/neurology.csv) | 284 | 22 |
| Anatomy, physiology & basic science | [`by-specialty/anatomy-physiology-basic-science.csv`](by-specialty/anatomy-physiology-basic-science.csv) | 244 | 23 |
| Obstetrics, gynecology & pediatrics | [`by-specialty/obstetrics-gynecology-pediatrics.csv`](by-specialty/obstetrics-gynecology-pediatrics.csv) | 241 | 59 |
| Psychiatry & toxicology | [`by-specialty/psychiatry-toxicology.csv`](by-specialty/psychiatry-toxicology.csv) | 200 | 23 |
| Emergency & critical care | [`by-specialty/emergency-critical-care.csv`](by-specialty/emergency-critical-care.csv) | 176 | 49 |

## Status
| Specialty | Reviewer | Sent | Returned | Applied |
|---|---|---|---|---|
| (none assigned yet) | | | | |

## Notes
- Reviewers are volunteers or paid by PathoMnemonic; recruiting and any payment are the owner's decisions. The guide asks for sources so corrections can be cited in the content audit.
- Reviewing a content item does not make the app a medical device. Keep the "not a clinical decision tool" wording in the app and the store listing regardless.
- Nothing here contains patient data. Cases are fictional teaching vignettes.
