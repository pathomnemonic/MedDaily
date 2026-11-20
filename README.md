# MedDaily

**A little curiosity. A lot of medicine.**  
A mobile-first medical mini-game arcade built with React, TypeScript, and Vite.

## What is here

Twenty-three playable formats span clinical deduction, word games, estimation, spatial logic, trivia, and party play. Every listed game has a daily round and a Free Play mode, selectable directly from the home screen:

- **Clinical reasoning and knowledge:** Differential, Deep Scan, Hoofbeats, Blackout Chart, Crossmatch, Branch Lab, Scale Lab, Casefile Logic, Labline, Trivia Rumble, and Quad Squad.
- **Word, visual, and logic puzzles:** Stat Word, Theme Trail, Crossword Clinic, Letter Lab, Seven Cells, Riddle Lab, What Has More?, Association Blitz, Letter Rungs, Anagram Sprint, and Cell Sketch.
- **Party play:** Mime Time and Trivia Rumble (which also appears in the clinical knowledge group).

Body Map Blitz remains implemented but hidden from the home screen. The retired Triage Order and Next Best Step formats are not part of the current playable catalog.

The same UTC date + mode + specialty + game key yields the same daily seed, so groups in different time zones share the same puzzle. Open Arcade is the shared, balanced general mode and the default starting point. Specialty Dailies add shared daily sets across 26 clinical specialties and four foundational subjects. Neurology is one track like the other specialties; subspecialty topics belong inside the Neurology track rather than taking up multiple top-level slots.

## Gameplay principles

- Differential is a six-guess diagnosis puzzle with progressive clues; clinical multiple-choice drills are not presented as standalone games. Stat Word includes an on-screen Wordle-style keyboard.
- Theme Trail is a Strands-style adjacent-letter path puzzle with a board-spanning trail word; Letter Lab is a separate 4×4 Boggle-style dice-grid hunt. Crossword Clinic now has 365 unique answer-safe clues for its generated mini-crosswords. Casefile Logic and Cell Sketch include in-game pencil-mark systems. Casefile Logic generates seeded procedural daily and Free Play cases, each with a verified unique solution. Cell Sketch and Letter Rungs also generate new Free Play variants.
- Association Blitz is a timed 24-card memory game with twelve pairs, combo streaks, and a 75-second clock. Seven Cells now includes 50 playable seven-letter boards with validated center-letter rules and pangrams. What Has More? draws from 116 comparisons, including 50 fun-first matchups such as propofol lipid calories versus bacon fat.
- Labline now has 365 unique reference-value prompts and Anagram Sprint uses multi-round progression; Letter Lab is a playable Boggle-style adjacent-letter hunt; Quad Squad adds one-away feedback and reliable reshuffling. Shared-code rooms support fifteen deterministic formats: Stat Word, Differential, Quad Squad, Labline, Association Blitz, Anagram Sprint, What Has More?, Seven Cells, Deep Scan, Letter Lab, Scale Lab, Branch Lab, Crossmatch, Blackout Chart, and Hoofbeats. One person enters a six-character code to start a room; everyone else enters the same code to join. Firebase credentials are still required for live cross-device multiplayer.
- The Trophies page has a 14-trophy cabinet calculated from saved results; room codes need no setup, and an optional Firebase scoreboard adds live ranking.
- Quad Squad has 160 curated boards. Cell Sketch alternates curated daily boards with seeded generated variants.
- Completion is shown per game. MedDaily does not calculate a combined arcade score across games of different difficulty.
- Dx Dash is permanently featured in the arcade and remains a separate game.

## Privacy and accounts

- Solo play, practice, and local progress work without an account.
- Progress is saved locally by default.
- Optional Google sign-in can back up and merge progress in the user's private Google Drive app-data folder.
- Party rooms need no setup: a six-character code deterministically picks a group-friendly game and its puzzle, so everyone typing the same code plays the same thing, and results are compared with Wordle-style share text. Optional Firebase adds a live scoreboard.
- Do not enter patient-identifiable information.

## Run locally

\`\`\`sh
npm install
npm run dev
\`\`\`

## Test and build

\`\`\`sh
npm test
npm run build
npm run preview
\`\`\`

## Deployment and optional services

See [Setup](docs/SETUP.md). The site can build and deploy without Google or Firebase credentials. Google Drive sync and multiplayer are optional.

## Content inventory

See [Content inventory and expansion priorities](docs/CONTENT_AUDIT.md) for the exact current bank sizes, daily longevity limitations, specialty coverage, and next content priorities.

## Format research

See [Daily-game format research](docs/DLE_RESEARCH.md) for the directory scan, mechanic selection, and future game candidates.

## Medical content note

Medical material is for education and entertainment, not patient care or a clinical decision tool. Clinical questions include short explanations and source notes, but some source notes are reference signposts rather than live guideline verification. Verify clinical decisions against current authoritative guidance. Content should receive ongoing specialist review before formal teaching or clinical use.

## Home screen and rewards

- Filter shelves (All, Quick, Brain, Words, Clinical, Party), a Surprise me button, and a rotating featured slot that alternates Deep Scan and Trivia Rumble each UTC day. Dx Dash is always featured.
- A 14-trophy cabinet computed from saved results (`src/achievements.ts`).
- Mime Time is a pass-the-phone charades game with a balanced 365-prompt deck across six categories.

- Every game is medical-themed: Deep Scan descends through tissue layers, Letter Rungs ladders start and end on medical words, and Theme Trail packs are medical word themes.

## Game feel

Title screen with the mascot Pip (also unlocks audio), a player level and XP bar, 1–3 star ratings with confetti on every finish, synthesized music and sound effects per game, chunky tile and key styling, and per-game cover art. See `docs/ADDING_A_GAME.md` to add a game.

## Look & feel options

The default palette is Scrub Teal. Options > Look & feel offers seven palettes (Scrub Teal, Deep Ocean, Midnight Violet, Berry Crush, Forest Ward, Ember, Graphite), a base-color slider, a vibrancy slider, chunky or soft depth, round or sharp corners, three interface sizes, and toggles for floating icons, twinkling stars, and the mascot. A palette button in the top bar cycles presets. Colors are driven by two CSS variables (`--hue`, `--sat`) in `src/styles.css`, so new presets are one line in `src/theme.ts`. Fonts (Fredoka, Lilita One, Manrope, Space Grotesk, DM Mono, all SIL OFL) are self-hosted and precached for offline use.

## Controls and habit loops

- Type straight into Stat Word's tiles (physical keyboard or on-screen keys), with shake on invalid words and a flip reveal. Differential suggests diagnoses as you type. Cell Sketch has Fill, Cross, and Cycle pens (plus right-click for a cross) and drag-painting.
- Shortcuts: Enter or Space continues past a Next button; 1–4 (or A–D in Trivia) pick answers; the left and right arrows pick in What Has More?; Esc closes the finish screen and Enter plays the suggested next game.
- Combos raise the pitch of correct-answer chimes and show a ×N badge next to Pip. Phones get short haptic pulses (toggle in Options).
- A daily goal of three games pays a bonus XP chest, and the finish screen offers a one-tap "Next up" game.
