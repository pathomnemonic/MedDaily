# MedDaily

**A little curiosity. A lot of medicine.**  
A mobile-first medical mini-game arcade built with React, TypeScript, and Vite.

## What is here

Fourteen distinct game formats span both educational and just-for-fun play:

- **Medical knowledge:** Medle, Connections, Mystery Case, Next Best Step, Microbe Hunt, Labline, Memory Match, and Triage Order.
- **Pure puzzle fun:** Anagram Sprint, Cell Sketch (nonogram), Higher or Lower, Word Ladder, Spelling Hive, and Casefile Logic.

The same UTC date + mode + specialty + game key yields the same daily seed, so groups in different time zones share the same puzzle. Open Arcade is the shared, balanced general mode and the default starting point. Specialty Dailies add shared daily sets across 26 clinical specialties and four foundational subjects. Neurology is one track like the other specialties; subspecialty topics belong inside the Neurology track rather than taking up multiple top-level slots.

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

## Format research

See [Daily-game format research](docs/DLE_RESEARCH.md) for the directory scan, mechanic selection, and future game candidates.

## Medical content note

Medical material is for education and entertainment, not patient care or a clinical decision tool. Clinical questions include short explanations and source notes, but some source notes are reference signposts rather than live guideline verification. Verify clinical decisions against current authoritative guidance. Content should receive ongoing specialist review before formal teaching or clinical use.
