# MedDaily

**A little curiosity. A lot of medicine.**  
A mobile-first medical mini-game arcade built with React, TypeScript, and Vite.

## What is here

Sixteen playable formats span clinical deduction, word games, estimation, spatial logic, trivia, and party play. Every game has a daily round and an unlimited Free Play mode:

- **Medical and clinical:** Medle, DoctorDle, Connections, Word Hunt, Labline, Association Blitz, and Triage Order.
- **Puzzle and party:** Anagram Sprint, Cell Sketch, What Has More?, Word Ladder, Medical Spelling Hive, Casefile Logic, Deep Dive, Trivia Rumble, and Letter Lab.

The same UTC date + mode + specialty + game key yields the same daily seed, so groups in different time zones share the same puzzle. Open Arcade is the shared, balanced general mode and the default starting point. Specialty Dailies add shared daily sets across 26 clinical specialties and four foundational subjects. Neurology is one track like the other specialties; subspecialty topics belong inside the Neurology track rather than taking up multiple top-level slots.

## Gameplay principles\n\n- DoctorDle is a six-guess diagnosis puzzle with progressive clues; clinical multiple-choice drills are not presented as standalone games.\n- Word Hunt uses a themed word-search grid. Casefile Logic includes an on-screen pencil-mark grid.\n- Association Blitz uses a larger matching board. What Has More? favors surprising comparisons over sterile numeric drills.\n- Group rooms are limited to formats that support a shared challenge. One person enters a six-character code to start a room; everyone else enters the same code to join. Firebase credentials are still required for live cross-device multiplayer.\n- Completion is shown per game. MedDaily does not calculate a combined arcade score across games of different difficulty.\n- Dx Dash is permanently featured in the arcade and remains a separate game.\n\n## Privacy and accounts

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
