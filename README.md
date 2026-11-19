# MedDaily

A mobile-first medical mini-game arcade built with React, TypeScript, and Vite.

## Run locally

\`\`\`sh
npm install
npm run dev
\`\`\`

## Build and test

\`\`\`sh
npm test
npm run build
npm run preview
\`\`\`

## Product principles

- Games are short, distinct, replayable, and designed for touch screens.
- Daily puzzles are deterministic by local calendar date; practice runs never affect daily records.
- Progress is stored locally in the browser. No account or paid backend is required.
- Medical material is for education, not patient care. Verify clinical decisions against current guidance.

## Initial game modes

Medle, Connections, Mystery Case, Next Best Step, Microbe Hunt, Labline, Memory Match, and Triage Order.

## Content

Puzzle data lives independently from presentation code in \`src/data.ts\`. Each clinical case includes a brief rationale and a source note. Content is educational and should be independently reviewed before formal teaching or clinical use.

## Deployment

The included GitHub Actions workflow builds the PWA and deploys it to GitHub Pages. Enable Pages in the repository settings with GitHub Actions as the source.
