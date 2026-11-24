# Roundsy iOS release (Codemagic cloud Mac, no Mac needed)

`codemagic.yaml` (repo root) defines the `ios-release` workflow, modeled on Dx Dash. **It has not been run.** There is no `triggering:` block, so it never starts on a push; start it by hand once the account is ready. The Xcode project is committed (Capacitor 8, Swift Package Manager, no CocoaPods), so unlike Dx the workflow syncs the existing project instead of creating one.

## What the workflow does
1. `npm ci` and `npm test`.
2. `npm run build` (type check and web build).
3. `npx cap sync ios` (copies the web build in and refreshes the Swift package list; checked locally, it changes no tracked file).
4. Sets the build number from Codemagic's `$BUILD_NUMBER` in the Xcode project settings.
5. Lints the plists and adds `ios-config/PrivacyInfo.xcprivacy` to the app target.
6. `xcode-project use-profiles` (automatic signing for `com.pathomnemonic.roundsy` through the App Store Connect integration).
7. `xcode-project build-ipa --project ios/App/App.xcodeproj --scheme App`, then uploads to TestFlight.

## Already in place
- Bundle id `com.pathomnemonic.roundsy` (Xcode project, Capacitor config, URL scheme `com.pathomnemonic.roundsy`, which matches the sign-in return link `com.pathomnemonic.roundsy://auth`).
- Display name Roundsy, 1024 px icon without alpha, splash images, iOS 15 minimum, iPhone and iPad.
- Export compliance (`ITSAppUsesNonExemptEncryption` false); iPhone portrait only, iPad all four ways; `arm64` device capability (was `armv7`).
- Privacy manifest for the app (email, display name, user id, gameplay results; no tracking).
- No outside-payment links on iOS: the tip card is web only, and there is no purchase flow yet.

## One-time setup (needs the active Apple account)
1. Apple Developer Program active. Register the identifier `com.pathomnemonic.roundsy`.
2. App Store Connect: New App, iOS, name `Roundsy - Daily Medical Games`, bundle id above, SKU `roundsy`.
3. App Store Connect API key (App Manager). Reuse the team key if it is already in Codemagic.
4. Codemagic: add the repository `pathomnemonic/MedDaily` (it finds `codemagic.yaml`). Under Teams > Integrations the App Store Connect key must be named `PathoMnemonic App Store Connect`, or change `integrations.app_store_connect` in the file.
5. Codemagic variable group `roundsy_build` (secure): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_GOOGLE_CLIENT_ID`, `VITE_ROOMS_PROVIDER`, same values as the GitHub Pages build.
6. Start `ios-release`. Expect to fix a line or two on the first run.

## Still blocks a first App Store submission (not the first TestFlight build)
- **Sign in with Apple is built but not switched on.** The button and flow are in the app (system-browser OAuth, so it works on web, iPhone and iPad). It stays hidden until `VITE_AUTH_APPLE=on` is set in the GitHub Pages variables and the Codemagic `roundsy_build` group, which should happen only after the steps in "Sign in with Apple setup" below. Without the button, expect rejection (guideline 4.8).
- Supabase must have `com.pathomnemonic.roundsy://auth` in its redirect allow-list (native Google sign-in cannot return to the app otherwise).
- App Store Connect: App Privacy answers (match the manifest: email, name, user id, gameplay content, all linked, none for tracking), age rating, category, support and privacy policy URLs, screenshots (iPhone 6.9 inch and iPad 13 inch, because the app is set to run on iPad; `node scripts/store-screenshots.mjs` makes phone shots), description, keywords, reviewer notes.
- The privacy policy (StudyBible site) needs the contribution, monitoring and analytics wording.

## Decisions for the owner
- **Monitoring is off in the iOS app.** Capacitor serves the app from `localhost`, which the monitoring code skips on purpose, so neither Sentry nor PostHog runs natively. Turning it on needs a small code change and a privacy manifest update (crash data, product interaction).
- **iPad.** The project targets iPhone and iPad, so Apple will want iPad screenshots. Setting `TARGETED_DEVICE_FAMILY` to `1` makes it iPhone only and skips them.

## Sign in with Apple setup (needs the active Apple account)
1. Apple Developer > Identifiers: create a Services ID (for example `com.pathomnemonic.roundsy.signin`), enable Sign in with Apple, set the domain to the Supabase project host and the return URL to `https://<project-ref>.supabase.co/auth/v1/callback`.
2. Keys: create a Sign in with Apple key (download the `.p8`, note the Key ID and Team ID).
3. Supabase > Authentication > Providers > Apple: enable, Client ID = the Services ID, secret = the signed token built from the key. **That secret expires after at most six months; put a renewal reminder in the calendar.**
4. Confirm the redirect allow-list holds the web address and `com.pathomnemonic.roundsy://auth`.
5. Set `VITE_AUTH_APPLE=on` (GitHub Pages variable and Codemagic group), redeploy, and test on a real iPhone.
- The app uses Apple's web flow in the system browser. A fully native Apple sheet (`signInWithIdToken` plus the Sign in with Apple capability and entitlement) is a possible later upgrade; it is not needed for review.
- **Known gap: token revocation.** Apple asks apps with Sign in with Apple to revoke the Apple token when the account is deleted. "Delete my Roundsy account" removes Roundsy data but leaves the shared PathoMnemonic sign-in, so no revocation happens. If review flags it, the fix is a small Edge Function that revokes the token when the shared sign-in is removed.
- The privacy answers should add "name" and "email" (Apple may hide the email behind a relay address; the display name is only shared on first sign-in).

## iPad and tablets
iPad support stays on (iPhone and iPad). Layouts were checked on tablet-sized screens (820x1180 and 1180x820); see the report for what was found. iPad screenshots are required for the listing.
