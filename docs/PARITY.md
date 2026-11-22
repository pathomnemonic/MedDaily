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
| Hoofbeats (new) | Noillirk (name the most common answer) | n/a | n/a | **New, separate from Deep Scan**: clinical prompts with prevalence-weighted answers (ten points per percent), rebuilt after viewing the real Noillirk: a full-screen pixel pasture (grazing horses, a zebra, barn, path, pond) that deepens into sky and stars, a balloon capsule that rises with your score in metres, a cream prompt card, a cream dock (Pass, timer ring, input, amber arrow), "already tried" chips, and a reveal sheet listing every answer with its percentage and points. An earlier horse-day toggle inside Deep Scan and a first game-show-board layout were both replaced |
| Scale Lab (new) | Magnitude (daily size-estimation game) | n/a | n/a | **New**: medical version with five scales, log scoring, full-screen lab bench |
| Stat Word | Wordle | Flip reveals, coloured keyboard, share grid | Header pushed the keyboard below the fold | **Done**: compact play header, board and keyboard fit on one phone screen |
| Quad Squad | Connections | One-away message, mistakes, shuffle, solved bars | Header height only | **Done** (compact header) |
| Differential | Diagnosis guessers | Progressive clues, typed answer | Header height only | **Done** (compact header) |
| Theme Trail | Strands | Drag-to-spell, hint every 3 bonus words | No connecting lines | **Done**: live and found-word path lines |
| Seven Cells | Spelling Bee | Hexagon board, shuffle, pangram, rank bar | Rank bar sat below the entry box; bee-themed rank names | **Done**: rank bar moved to the top, medical ranks (Premed to Attending) |
| What Has More? | Higher or Lower | Two-way comparison, tie option | Small cards, no count-up, no streak | **Done**: full-screen split, count-up reveal, streak, per-round progress |
| Mime Time | Heads Up / charades | Turns, timer, got/skip | Card was a small box | **Done**: full-screen colour cards, ring timer, green/red flashes, giant buttons, and optional tilt-to-score (tip down for Got it, up to Skip; needs motion access on iOS) |
| Crossword Clinic | NYT Mini | Grid, clue bar, check/reveal | No solve timer; no custom keyboard | **Done**: full-screen "chart paper" world (cream ruled paper, serif ink type), clue bar with prev/next, on-screen keyboard, clue drawer, timer in share text |
| Letter Lab | Boggle (Wordshake) | Drag paths, timer, word list | Plain tiles, no shake intro, tap-only | **Done**: full-screen wooden dice tray (viewed Wordshake's physical-tile look), tumble-in shake to start, drag-to-trace with a gold path line, release to submit, sand-gauge clock |
| Association Blitz | Memory match | Flip, combo, timer | Single card-back design | **Done**: lab specimen board with six distinct card backs (pill stripes, ECG grid, helix, cells, bone, blood), 3D flips, glow on match, term cards tinted blue |
| Trivia Rumble | Trivia Crack | Wheel, six categories, crowns | Wheel art is plain; no avatars | **Done**: game-show stage with spotlight beams, bulb-ringed seven-wedge colour wheel with pointer, emoji avatars, wedge-pie progress, category-coloured question screens with four coloured answers |
| Riddle Lab | Guess-who riddles | Clue ladder, points decay | Plain cards | **Done**: detective dossier: evidence photo that sharpens as clues unlock, pinned sticky-note clues, point pips, SOLVED / UNSOLVED stamp |
| Casefile Logic | Logic-grid puzzles (Murdle) | Pencil marks, hints | Text-heavy clue list | **Done**: rebuilt as a clinical deduction game with flip cards, real notebook grid, pinned accusation button |
| Anagram Sprint | Word jumble (Jumble newsprint) | Shuffle, clue, skip | Tiles do not animate into place | **Done**: newsprint page with red masthead, circled-letter tiles that slide into the answer slots, ink-bar timer |
| Cell Sketch | Picross | Fill/cross/pencil, auto-cross, picture reveal with name | Pictures were 5x5 blobs and rotations made them unreadable | **Done**: 21 hand-drawn pictures on 10 to 12 cell grids, each with a unique solution (tested), no rotations, cells sized to the screen |
| Labline | Estimation games | Slider, band scoring | Plain reveal ruler | **Done**: bench analyzer with an LCD readout, fader, animated score ring and a reveal ruler where the pins slide into place |
| Letter Rungs | Word ladders | Valid-step checking, changed-letter highlight | No ladder visual | **Done**: wooden ladder with rails and rungs |

## Cross-cutting changes
- Play pages use a one-line header (back, badge, title, difficulty, mode switch). The description is on the home card.
- Full-screen games (Deep Scan, What Has More?, Mime Time, Crossword Clinic) render in a portal over the app shell and have an exit button where a mid-game exit makes sense.
- Pixel fonts (Pixelify Sans, Silkscreen) are bundled and cached offline; see `docs/THIRD_PARTY.md`.

## Open items
None. Every listed game has been rebuilt with its own look. The two survey ideas not built (layers-of-the-body ordering, a Fibble-style Stat Word twist) were vetoed and are not planned.

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
Checked 2026-11-22 against the new worlds, and left unchanged on that basis: NYT Spelling Bee and Strands (flat yellow and teal splash screens), Wordle Unlimited (plain tiles on white), puzzle-nonograms.com (bare grid with ads) and Weaver (flat cards). Their play screens are plainer than our themed worlds, so none were copied; the only borrowed ideas were behavioural (hard mode, high contrast).
No accessible reference was found for Trivia Rumble, Riddle Lab, Casefile Logic or Labline; those stay open until a good one is named.

## Ideas considered from the daily-games survey
Already covered: Wordle (Stat Word), Connections (Quad Squad), Strands (Theme Trail), Spelling Bee (Seven Cells), Krillion (Deep Scan), Murdle-style logic (Casefile Logic), Magnitude/Fermi (Scale Lab), Picross (Cell Sketch), word ladders (Letter Rungs).
Built from the survey: Branch Lab (Metazooa-style taxonomy tree), Crossmatch (PokeDoku-style grid), Blackout Chart (case-report Redactle) and Hoofbeats (Noillirk-style most-common-answer game, built as its own game with questions written for it).
Vetoed: a layers-of-the-body ordering puzzle and a Fibble-style "contaminated sample" twist on Stat Word.
Skipped as poor fits: fandom "-dle" clones, geography games, arcade titles and the novelty word-ladder games.

## Casefile wording rule
A condition's patient description, cause, decoding phrase and finding must share no content words, so a player cannot pair items by matching text. The rule is enforced by `src/clinicalCase.test.ts`, which also rejects shared word roots (for example "Cryptococcus" and "cryptococcal") and shared acronyms. All 75 conditions were additionally reviewed by hand for meaning-level giveaways (for example "after antibiotics" paired with "overgrows when gut flora is disrupted", or two conditions that would both fit one finding); those were rewritten. New conditions should get the same review.

## Typed answers
Free-text answers (Deep Scan, Hoofbeats, Blackout Chart, Differential, Branch Lab, Crossmatch) go through `matchAnswer`: abbreviation and lay-term synonym groups (`src/medSynonyms.ts`), any word order, roman numerals, sound-alike spellings, typos that grow with word length, and the one distinctive word on its own. It never resolves a typo to a sibling answer (hypo- vs hyperkalemia).

## Rooms
A party room's first code character names its game, so whoever makes the code picks the game and everyone joining plays it.

## Full-screen worlds
All 23 listed games open in their own full-screen world (a shared `World` shell for Stat Word, Quad Squad, Differential, Theme Trail, Seven Cells, Letter Rungs and Cell Sketch; bespoke screens for the rest). Phone-width worlds scale up with CSS `zoom` on wide desktop screens where the height allows it, and stay at 1x otherwise. The home page deliberately has no hero banner (only the Dx Dash promo).
