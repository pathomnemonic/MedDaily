# Adding a game to MedDaily

A game is a React component plus a content dataset. Nothing else needs rewriting.

1. **Id.** Add the id to the `GameId` union in `src/lib.ts`.
2. **Content.** Put the data in its own `src/data*.ts` file (keep mechanics and content separate) and add a test in `src/*.test.ts` that checks size, uniqueness, and any validity rules (see `newgames.test.ts` for examples).
3. **Component.** Write `function MyGame({ seed, onDone, specialty, practice }: Props)` in `src/Games.tsx`. Derive everything from `seed` (use `seeded`, `shuffle`, `hashSeed`) so a given day gives every player the same puzzle. Call `onDone(score, maxScore, perfect, share?)` exactly once when the round ends; `share` is the game's own Wordle-style result text. Use `reward(good, el, label)` and `sfx(name)` for feedback; wrap the root in `data-own-sfx` if you play your own effects.
4. **Wire it.** Add a `case` in `GameBoard`, an entry in `GAMES` in `src/App.tsx` (title, subtitle, description, `wash` colour, shelf membership in `SHELF_OF`), and cover art in `src/components/GameArt.tsx`.
5. **Rooms.** Add the id to `PARTY_GAMES` in `src/lib.ts` only if racing the same puzzle makes sense.
6. **Checks.** `npm test`, `npm run build`, then play it once daily and once in Free Play on a phone-sized screen. Names should be original: see `docs/NAMING.md`.

Daily seeds come from the UTC date, scope, and game id. Free Play uses a fresh seed and is never recorded. XP, stars, trophies, and the completion screen are applied by `finishGame` in `App.tsx`; a new game gets them automatically.
