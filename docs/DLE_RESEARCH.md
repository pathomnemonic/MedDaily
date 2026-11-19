# Daily-game format research

**Checked:** November 19, 2026  
**Purpose:** Identify established daily-game mechanics that translate into a medical-themed arcade without turning every activity into a test question.

## Directory scan

Checked November 19, 2026. These are discovery directories and editorial roundups, not endorsements; directory totals vary as sites add and remove entries.

| Directory / guide | Snapshot |
|---|---|
| [my dailydle](https://mydailydle.com/) | 851 listed daily web games across word, logic, geography, trivia, estimation, and more |
| [Seekdle](https://seekdle.com/) | A 1,000-entry Wordle-style daily-game directory, including word, geography, film, and music variants |
| [PlayItDaily](https://playitdaily.com/) | 222 catalog entries grouped into word, logic, trivia, visual, card, math, geography, gaming, sports, film, music, history, art, science, language, food, and pop-culture categories; its page explicitly labels play-count ranking data as a demo |
| [The Daily Game Index](https://dailygameindex.com/) | Category index showing 627 word/logic, 101 trivia/knowledge, 81 geography/place, 194 visual/culture, and 301 brief-game entries |
| [Last Minute Productions daily-games guide](https://stranded.run/daily-games/) | 23 manually checked formats, including creative-answer, word, semantic, logic, geography, visual, and music games |
| [Brisk daily puzzle guide](https://briskpuzzles.com/best-daily-puzzle-games) | Wordle, Connections, Spelling Bee, Quordle, Waffle, Nerdle, Sumplete, Sudoku, Strands, Mini Crossword, Worldle, Globle, Tradle, Framed, and mixed-skill puzzles |
| [Reno Labs 2026 guide](https://renolabshq.com/decade/guides/best-daily-puzzle-games) | NYT games, LinkedIn Queens/Tango/Zip, Puzzmo, Nerdle, Minute Cryptic, and quick logic puzzles |
| [Daily Holmes non-word guide](https://www.dailyholmes.com/learn/games-like-wordle-not-word-games) | Framed, Artle, Hexcodle, Worldle, Globle, Travle, TimeGuessr, Nerdle, Mathler, Tradle, Pips, Queens, Memoku, Bandle, Murdle, and Clues by Sam |

A particularly useful design principle from the current daily-puzzle guides is to mix skills rather than stacking several word games. There are strong daily formats that require almost no vocabulary: number logic, spatial reasoning, picture recognition, deduction, and creative answers.

## Format decisions

| Format family | Medical translation | Decision |
|---|---|---|
| Wordle / Quordle | Medical term, drug, anatomy, pathogen, or diagnosis guessing | **Live: Medle** |
| Connections | Group medications, findings, organisms, anatomy, and mechanisms | **Live: Connections** |
| Progressive clue guessing | Reveal clinical or scientific clues one at a time | **Live: Mystery Case** and **Next Best Step** |
| Themed word search / Strands | Find terms hidden through a grid; add a theme-spanning word in a future version | **Live: Microbe Hunt** |
| Spelling Bee / 18 Words / 23 Words | Unscramble medical terms or build many valid words from a letter set | **Live: Anagram Sprint** |
| Nonogram / Picross | Reveal a cell, organ, neuron, or instrument silhouette from row/column clues | **Live: Cell Sketch** |
| More/Less / Fermi | Compare anatomy, physiology, quantities, or harmless everyday estimates | **Live: Higher or Lower** and **Labline** |
| Word ladders | Change one letter at a time to reach a target | **Live: Word Ladder** |
| Memory / matching | Match drugs to mechanisms, signs to diagnoses, or just-for-fun pairs | **Live: Memory Match** |
| Ordering / sequence puzzles | Put resuscitation, labor, or procedural steps in order | **Live: Triage Order** |
| Waffle / crossing words | Swap letters in a small crossing-word board | Strong next addition; needs a verified word bank and carefully tested board generation |
| Murdle / logic grids | Solve a fictional mystery using people, places, objects, and constraints | Strong next addition; keep it clearly fictional, not a clinical decision tool |
| Framed / image reveal | Reveal an original anatomy illustration, ECG, radiograph, or histology image progressively | Strong fit; requires original/licensed imagery and specialist review |
| Worldle / Globle / map games | Locate structures, dermatomes, vascular territories, or organs on original diagrams | Strong fit; requires accurate diagrams |
| Contexto / Semantle | Find a target concept by semantic similarity | Medium fit; requires a reliable local synonym/embedding bank |
| Krillion / Echomost / long-tail recall | Name many valid answers and score rare responses | Strong fit for specialty groups; requires curated answer lists and transparent rarity bands |
| Bandle / Heardle | Identify original heart/lung sounds or clinical audio | Medium fit; audio sourcing and recording quality must be addressed |
| Sudoku / Queens / Pips / Sumplete | Pure logic puzzles with medical visual dressing | Strong fit; no medical facts need be asserted |

## Release inventory

The tracks are intentionally broad and balanced. Neurology is represented as one specialty track rather than several top-level neuro subspecialties; other specialties and foundational subjects have the same first-level status. Open Arcade remains the all-comers daily mode. All players share a UTC daily date key, so a specialty group across time zones receives the same puzzle seed.\n\nTwelve distinct mechanics are currently wired into the arcade:

1. Medle — five-letter guessing.
2. Connections — four hidden groups of four.
3. Mystery Case — progressive diagnosis clues.
4. Next Best Step — clinical decision selection.
5. Microbe Hunt — word search.
6. Labline — numeric estimation.
7. Memory Match — association matching.
8. Triage Order — sequence reconstruction.
9. Anagram Sprint — letter unscrambling.
10. Cell Sketch — nonogram.
11. Higher or Lower — comparative estimation.
12. Word Ladder — one-letter transformations.
13. Spelling Hive — seven-letter word puzzle with a center-letter rule and pangram bonus.
14. Casefile Logic — fictional deduction grid using people, locations, objects, and clues.

The first eight are medical-knowledge-forward. The latter four are deliberately lighter puzzle formats. The list is intentionally mixed: a medical game collection should contain games that are simply fun.

## Guardrails for future additions

- A mechanic is not accepted merely because its title is popular; it must play well on a phone.
- Do not create near-duplicates to inflate the game count.
- A daily puzzle needs a deterministic seed and a real, curated content bank.
- Medical image/audio games require original or appropriately licensed assets and content review.
- Long-tail games need many legitimate answers and transparent scoring; never pretend rarity is measured from a player population unless it actually is.
- Purely recreational games do not need contrived medical facts.
