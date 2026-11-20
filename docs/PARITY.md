# Reference-parity review

For each game, the best-known game it is modelled on, what already matched, the gap found on 2026-11-20, and what was done.
Visual references: Krillion-style clones for Deep Scan (see `docs/NAMING.md` for naming rules); the others are format references only, and no
art, text or code is copied from any of them.

| Game | Reference format | Already matched | Gap found | Status |
|---|---|---|---|---|
| Deep Scan | Krillion and clones (rarity dive) | One typed answer, rarity tiers, 25 s timer | Small gauge, no scene, no reveal drama, strict matching | **Done**: full-screen pixel descent, glitch reveal, generous matching, Go-deeper gamble |
| Body Map Blitz | Anatomy tap-quizzes | Tap targets | Organs only, all-or-nothing | **Done** (muscle maps, proximity scoring), then **unlisted** until a licensed 3D model is found |
| Branch Lab (new) | Metazooa taxonomy-tree guessing | n/a | n/a | **New**, then re-laid out after viewing the real game: a vertical trunk of proven ancestors ending in a "???" box with wrong guesses branching off where they diverge. Metazooa's pastel styling is plainer than ours, so only its structure was adopted |
| Crossmatch (new) | PokeDoku and Immaculate Grid style 3x3 | n/a | n/a | **New**: drugs by group and property, specimen-tube headers, close-miss hints, rarity bonus. PokeDoku's look is a plain grey grid with type badges; ours is themed |
| Blackout Chart (new) | Redactle | n/a | n/a | **New**: original case reports with the diagnosis blacked out; manila folder and patient chart look. Redactle's dark plain UI was not copied |
| Deep Scan horse day (new) | Noillirk (most-common-answer twist, balloon ascent) | n/a | n/a | **New** for about one day in three: mirrored scoring, rising balloon capsule |
| Scale Lab (new) | Magnitude (daily size-estimation game) | n/a | n/a | **New**: medical version with five scales, log scoring, full-screen lab bench |
| Stat Word | Wordle | Flip reveals, coloured keyboard, share grid | Header pushed the keyboard below the fold | **Done**: compact play header, board and keyboard fit on one phone screen |
| Quad Squad | Connections | One-away message, mistakes, shuffle, solved bars | Header height only | **Done** (compact header) |
| Differential | Diagnosis guessers | Progressive clues, typed answer | Header height only | **Done** (compact header) |
| Theme Trail | Strands | Drag-to-spell, hint every 3 bonus words | No connecting lines | **Done**: live and found-word path lines |
| Seven Cells | Spelling Bee | Hexagon board, shuffle, pangram, rank bar | Rank bar sat below the entry box; bee-themed rank names | **Done**: rank bar moved to the top, medical ranks (Premed to Attending) |
| What Has More? | Higher or Lower | Two-way comparison, tie option | Small cards, no count-up, no streak | **Done**: full-screen split, count-up reveal, streak, per-round progress |
| Mime Time | Heads Up / charades | Turns, timer, got/skip | Card was a small box | **Done**: full-screen colour cards, ring timer, green/red flashes, giant buttons |
| Crossword Clinic | NYT Mini | Grid, clue bar, check/reveal | No solve timer; no custom keyboard | **Done**: full-screen "chart paper" world (cream ruled paper, serif ink type), clue bar with prev/next, on-screen keyboard, clue drawer, timer in share text |
| Letter Lab | Boggle | Drag paths, timer, word list | No dice-shake intro; plain tiles | Open |
| Association Blitz | Memory match | Flip, combo, timer | Single card-back design | Open |
| Trivia Rumble | Trivia Crack | Wheel, six categories, crowns | Wheel art is plain; no avatars | Open |
| Riddle Lab | Guess-who riddles | Clue ladder, points decay | Plain cards | Open |
| Casefile Logic | Logic-grid puzzles | Pencil marks, hints | Text-heavy clue list | Open |
| Anagram Sprint | Word jumble | Shuffle, clue, skip | Tiles do not animate into place | Open |
| Cell Sketch | Picross | Fill/cross/pencil, auto-cross, picture reveal with name | Already at parity on review | No change needed |
| Labline | Estimation games | Slider, band scoring | Plain reveal ruler | Open |
| Letter Rungs | Word ladders | Valid-step checking, changed-letter highlight | No ladder visual | **Done**: wooden ladder with rails and rungs |

## Cross-cutting changes
- Play pages use a one-line header (back, badge, title, difficulty, mode switch). The description is on the home card.
- Full-screen games (Deep Scan, What Has More?, Mime Time, Crossword Clinic) render in a portal over the app shell and have an exit button where a mid-game exit makes sense.
- Pixel fonts (Pixelify Sans, Silkscreen) are bundled and cached offline; see `docs/THIRD_PARTY.md`.

## Suggested order for the open items
1. Trivia Rumble wheel art and Association Blitz card backs.
2. Remaining plain-card games (Riddle Lab, Casefile, Labline reveal).

## Method for the remaining games
Render the best existing free version in a headless browser, study the screens, then give the game its own colour world instead of the shared teal card:
Deep Scan is a pixel-art dive, What Has More? is a bold split-screen, Mime Time is a party card, Crossword Clinic is chart paper. Paywalled references (NYT Games) only show a
landing page, so use free playable ones (Puzzmo, Weaver) or published screenshots for those formats.

## Rule: never downgrade
If the best existing version of a game looks worse than ours, keep ours and note it here instead of copying the reference.
Checked on 2026-11-20 and left unchanged on that basis:
- Association Blitz vs Memozor memory games: Memozor is a plain card grid on a content page; ours has the animated board, combo and timer HUD.
- Cell Sketch vs puzzle-nonograms.com: a bare grid with an ad slot; ours has pens, auto-marking and a picture reveal.
- Letter Rungs vs Weaver: Weaver is clean but flat tiles; ours is a themed ladder.
- Stat Word vs free Wordle clones (wordlegame.org): plain tiles; ours already has flips and a coloured keyboard.
No accessible reference was found for Trivia Rumble, Riddle Lab, Casefile Logic or Labline; those stay open until a good one is named.

## Ideas considered from the daily-games survey
Already covered: Wordle (Stat Word), Connections (Quad Squad), Strands (Theme Trail), Spelling Bee (Seven Cells), Krillion (Deep Scan), Murdle-style logic (Casefile Logic), Magnitude/Fermi (Scale Lab), Picross (Cell Sketch), word ladders (Letter Rungs).
Built from the survey: Branch Lab (Metazooa-style taxonomy tree), Crossmatch (PokeDoku-style grid), Blackout Chart (case-report Redactle) and Deep Scan horse day (Noillirk-style mirrored scoring).
Good candidates for later: a layers-of-the-body ordering puzzle and a Fibble-style "contaminated sample" twist on Stat Word.
Skipped as poor fits: fandom "-dle" clones, geography games, arcade titles and the novelty word-ladder games.
