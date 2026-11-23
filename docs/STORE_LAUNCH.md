# Taking MedDaily to the App Store and Google Play

The native shell is a Capacitor wrapper around the same web app. The web build is bundled inside the app, so it works offline. Nothing about the web
deployment changes.

## What is in the repo
| Item | Where |
|---|---|
| Capacitor config (app id, name, splash, status bar) | `capacitor.config.ts` |
| Android project | `android/` (sign-in return link and notification permission already added to the manifest) |
| iOS project | `ios/` (sign-in URL scheme and export-compliance flag already added to `Info.plist`) |
| Icon and splash sources, generated store icons | `assets/`, outputs inside `android/` and `ios/` |
| Native helpers (system browser sign-in, share sheet, haptics, daily reminder) | `src/native.ts`, `src/ReminderCard.tsx` |
| Store screenshots (iPhone 6.7in and Android phone) | `store/screenshots/`, regenerate with `node scripts/store-screenshots.mjs` |

Inside the app shell the web-only pieces switch off or change: no service worker (the files are already local), Google sign-in opens the system browser and returns
through `com.pathomnemonic.meddaily://auth`, results use the system share sheet, taps use the system haptic engine, and Settings gains an optional **Daily reminder**
(one local notification, permission asked only when switched on). The reminder and the native-feel touches also help with Apple's "more than a website" review rule.

## What needs you (these cannot be done from a build server)
1. **Developer accounts:** Apple Developer Program (US$99 a year) and Google Play Console (US$25 once).
2. **A Mac with Xcode** for the iOS build and signing; Android Studio for Android. Neither is available in the cloud environment used so far, so **neither native build has been compiled yet.**
3. **The final app identifier.** `com.pathomnemonic.meddaily` is provisional. It must be fixed before the first upload and cannot change afterwards.
4. **Sign in with Apple.** Apple requires it whenever another social sign-in (Google) is offered. It needs the Apple provider set up in the shared Supabase project (Orion) and a
   button in the Account card (small change once the provider exists).
5. **Supabase redirect allow-list:** add `com.pathomnemonic.meddaily://auth`.

## Build steps (on the Mac / with Android Studio)
```bash
npm ci
npm run native:icons     # only if assets/ changed
npm run native:ios       # builds the web app, syncs, opens Xcode  (set the team, then Product > Archive)
npm run native:android   # builds the web app, syncs, opens Android Studio  (Build > Generate Signed Bundle)
```
Run `npm run native:sync` after any web change. `npm run native:icons` rewrites the web manifest as a side effect; the script restores it.

## Store listing draft
- **Name:** MedDaily
- **Subtitle (iOS, 30 chars):** Daily medical mini-games
- **Short description (Play, 80 chars):** Daily medical word, logic and trivia games. Quick rounds, no account needed.
- **Category:** Games > Word (secondary: Trivia). Not "Medical", which invites the regulated-health-app review track.
- **Keywords:** medical, trivia, word game, puzzle, daily, quiz, anatomy, pharmacology, nursing student, med student
- **Full description:**
  MedDaily is a pocket arcade of daily medical mini-games. Every day brings a fresh puzzle in each game, so there is always something quick to play.
  Name a diagnosis from clues, unscramble medical terms, spin the trivia wheel, race a friend in a party room, or dive for rare answers.
  No account is needed to play. Sign in only if you want your progress backed up across devices.
  MedDaily is for education and entertainment only. It is not a clinical decision tool and never asks for patient information.
- **Age rating:** 4+ / Everyone (no violence, gambling or user-generated content; contains medical terminology).
- **Support, privacy and terms URLs:** privacy policy `https://pathomnemonic.github.io/StudyBible/privacy.html`; terms of service `https://pathomnemonic.github.io/MedDaily/terms.html` (see `docs/TERMS_NOTES.md`); a support page or email is still needed.

## Privacy answers (to confirm against the privacy policy before submitting)
- **Without an account:** nothing is collected. Progress stays on the device.
- **With an account:** email address and an account identifier, used for sign-in and backup; game progress. No tracking, no advertising identifiers, no data sold.
- **Party rooms:** a nickname, a room code and scores, kept for about a day.
- **No patient or health data** is collected or requested.
- In-app account deletion exists (Settings > Account), as both stores require; it removes the MedDaily profile and cloud data and states that the shared sign-in itself is handled separately.

## Review notes (paste into the submission)
No login is required; every feature except optional backup works signed out. The game content is general medical education, not diagnosis or treatment advice, and the
app says so in the footer and store text. Notifications are optional and off by default.

## Risks to know about
- **Apple 4.2 (minimum functionality):** reviewers reject thin website wrappers. This app has 23 original games, offline play, haptics, share sheet and a notification option, which is
  a strong case, but not a guarantee.
- **Medical-content scrutiny:** keep the "not a clinical decision tool" wording in the listing, and have the clinical content reviewed by a specialist before launch (already on the list).
- **Payments:** none are wired. When pricing is decided, digital subscriptions in the apps must use the stores' in-app purchase; this is separate work.
- **Android back button and keyboard:** not yet exercised on a device. Plan a pass on a real phone for the back button, keyboard-covered inputs and notches before submitting.
