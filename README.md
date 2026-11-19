# MedDaily

**A little curiosity. A lot of medicine.**  
A mobile-first medical mini-game arcade built with React, TypeScript, and Vite.

## What is here

Sixteen playable formats span clinical deduction, word games, estimation, spatial logic, trivia, and party play. Every game has a daily round and an unlimited Free Play mode, selectable directly from the home screen:

- **Medical and clinical:** Medle, DoctorDle, Connections, Word Hunt, Labline, Association Blitz, and Triage Order.
- **Puzzle and party:** Anagram Sprint, Cell Sketch, What Has More?, Word Ladder, Medical Spelling Hive, Casefile Logic, Deep Dive, Trivia Rumble, and Letter Lab.

The same UTC date + mode + specialty + game key yields the same daily seed, so groups in different time zones share the same puzzle. Open Arcade is the shared, balanced general mode and the default starting point. Specialty Dailies add shared daily sets across 26 clinical specialties and four foundational subjects. Neurology is one track like the other specialties; subspecialty topics belong inside the Neurology track rather than taking up multiple top-level slots.

## Gameplay principles

- DoctorDle is a six-guess diagnosis puzzle with progressive clues; clinical multiple-choice drills are not presented as standalone games. Medle includes an on-screen Wordle-style keyboard.
- Word Hunt is an 8×10 Strands-style adjacent-path puzzle with a top-to-bottom spangram, found-word tracking, and earned hints. Casefile Logic includes an always-visible clue checklist, pencil marks, one-to-one elimination, and forced-assignment help; Cell Sketch includes in-game pencil marks. Casefile rotates between curated and seeded procedural daily cases, with verified unique solutions. Cell Sketch and Word Ladder also generate new Free Play variants.
- Association Blitz has Standard (12 pairs) and Expert (15 pairs) timed modes, combo scoring, and a time bonus. Medical Spelling Hive has 46 curated medical-themed boards and displays clinical definitions for relevant discovered terms. What Has More? draws from 116 comparisons, including 50 fun-first matchups such as propofol lipid calories versus bacon fat.
- Deep Dive has 80 timed multi-answer prompts with six editorial rarity tiers. Labline and Anagram Sprint use multi-round progression; Letter Lab is a Boggle-style adjacent-letter hunt; Connections adds one-away feedback and procedurally assembled Free Play boards. Shared-code rooms are offered only for formats that support same-puzzle score competition: Connections, Word Hunt, Association Blitz, Triage Order, Anagram Sprint, Labline, What Has More?, Casefile Logic, Deep Dive, Trivia Rumble, and Letter Lab. The first player chooses a game and starts a six-character code; everyone else only needs that code. The room determines the game and seed. Firebase credentials are still required for live cross-device multiplayer; see [the multiplayer setup guide](docs/MULTIPLAYER_SETUP.md).
- The Trophies page includes six locally calculated achievements; active friend rooms show a live ranked scoreboard. Achievement progress follows the selected study scope, and the hide-streaks preference also hides streak achievement progress.
- Completion is shown per game. Results have game-specific Wordle-style share summaries with separate Copy and Share actions. MedDaily does not calculate a combined arcade score across games of different difficulty.
- Dx Dash is permanently featured in the arcade and remains a separate game.

## Privacy and accounts

- Solo play, practice, and local progress work without an account.
- Progress is saved locally by default.
- Optional Google sign-in can back up and merge progress in the user's private Google Drive app-data folder.
- Optional multiplayer rooms use Firebase anonymous guest sessions; no Google login is required to join.
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
