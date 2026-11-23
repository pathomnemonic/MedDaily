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

## Web address: /MedDaily/ is staying (decided Nov 23, 2026)
Mathews asked for `/Clinicle/` only if it was clean. It is not, so the address stays `https://pathomnemonic.github.io/MedDaily/`. Reasons:
1. **GitHub does not redirect Pages addresses after a repository rename.** The old `/MedDaily/` address would return 404 the moment the repo is renamed. Installed web apps (scoped to `/MedDaily/`), bookmarks and every share link already sent
   (they contain the old address) would stop working, and the service worker would serve the error page instead of the cached app when a player is online.
2. **Sign-in returns would break** until the Supabase redirect allow-list, the Google consent configuration and the privacy and terms links were all switched at the same moment.
3. **Tooling is scoped to the repository name** (deploy workflow, the access this assistant and Orion use, the GitHub Actions variables), so a rename risks a gap where nothing can deploy.
4. It buys little: the name players see everywhere is already Clinicle.

**If a branded address is wanted later**, do it once, properly: register a domain (for example a clinicle address; this costs money, so it is Mathews's call), point GitHub Pages at it, add it to the Supabase redirect list and the Terms/privacy links, and keep
`/MedDaily/` working through a redirect page until old links have faded. The app needs no code change beyond the share-link constant in `src/App.tsx`. A cheaper partial option is a tiny separate repository named `Clinicle` whose Pages site only redirects to `/MedDaily/`, giving a pretty
`pathomnemonic.github.io/Clinicle/` link for marketing without moving the real app.

**URLs that did not change:** everything. No allow-list or privacy-policy change is needed for the web address; the only platform change from the rename is the native return link `com.pathomnemonic.clinicle://auth` (already listed above).
