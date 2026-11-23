# Rename: MedDaily to Clinicle

Decided by Mathews (final). Store title at publishing: **Clinicle - Daily Medical Games**.

## Changed
- Everything a player sees: wordmark and title screen, page title, installed-app name (`manifest.webmanifest`), footer, share text, notifications, Settings and account text, Terms of Service, store docs, README.
- Native app: name `Clinicle`, identifier **`com.pathomnemonic.clinicle`** (was the provisional `com.pathomnemonic.meddaily`). Changed in `capacitor.config.ts`, `android/` (applicationId, namespace, package folder of `MainActivity`, strings, intent filter), `ios/` (bundle identifier, URL scheme, display name). This was safe because nothing has been uploaded to either store.
- Sign-in return link: `com.pathomnemonic.clinicle://auth`.

## Deliberately NOT changed (internal names; renaming them would break things)
| Item | Why it stays `meddaily` |
|---|---|
| localStorage keys (`meddaily:player:v1`, `meddaily:hardmode`, ...) | Renaming would make existing players lose their progress on the web |
| Supabase schema `meddaily`, its tables and functions | Live in the shared project and called by the app; renaming needs a new migration and a coordinated app change. Players never see it. Can be done later if wanted |
| Web address `https://pathomnemonic.github.io/MedDaily/` | It is the GitHub repository name. It is in the Supabase redirect list, the Terms and share links. Moving to a new repo name or domain is a separate decision |
| Service worker cache name, icon file name `meddaily-icon.svg`, supabase migration file names | Not user-visible |

## What this breaks or needs from others
1. **Supabase redirect allow-list (Orion):** add `com.pathomnemonic.clinicle://auth`. Until then, native Google sign-in will not return to the app. The old `...meddaily://auth` entry can be removed.
2. **Privacy policy (StudyBible site) lists "MedDaily":** update the name there.
3. **Marketing assets (Orion):** icon, feature graphic and social image need the new name. The in-app icon art itself has no text.
4. **Store developer consoles:** create the apps with the new identifier from the start.
5. **Web users:** the installed web app picks up the new name on the next update; no action. A link or bookmark to `/MedDaily/` keeps working.
6. **Dx Dash promo banner and any cross-links** are unaffected.
