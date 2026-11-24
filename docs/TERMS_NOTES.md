# Terms of Service: decisions and open points

The terms live at `public/terms.html`, published at `https://pathomnemonic.github.io/Roundsy/terms.html`. They are linked from the footer, Settings ("Your data") and the sign-in card.
`src/termsPage.test.ts` fails the build if a paid tier or price is ever mentioned before monetization is decided, or if a core section disappears.

**This is a draft written by an AI assistant, not legal advice. Have a lawyer read it before the store launch.**

## Decisions made while drafting
- **Operator:** PathoMnemonic (a trade name; sole proprietor, not formally registered), operating the apps. Contact address is `patho.mnemonic1@gmail.com`, the address the privacy policy uses.
- **Minimum age for an account:** 13 (higher where local law requires), with a parent or guardian's permission for minors. The privacy policy says children do not create accounts; if the stores' age rating or the other apps require a stricter rule, raise it here.
- **Pricing:** the terms still state no prices. Pro is decided ($0.99/month or $9.99/year, daily round free; see `docs/MONETIZATION_PLAN.md`) but not built, so the terms say the app is "currently free" and that terms will be updated before anyone is asked to pay. When Pro ships, add a Paid features section with these prices, renewal and cancellation, refunds via the stores or Stripe, and update the guard test.
- **Governing law:** State of Arizona, with Arizona state and federal courts, consumers keeping their local rights (decided by the owner).
- **Liability cap:** US$50, with the usual carve-outs and a statement that mandatory consumer rights are not removed. Adjust to taste.
- **No indemnity clause:** left out to keep the terms friendly for a free consumer app. Easy to add.
- **Rooms:** describes what the app does today: six-character code, up to eight players, no chat, scores and nicknames visible to the room, rooms removed after about a day idle, scores unverified.
- **Display names:** up to 20 characters, conduct rules, right to reset a name.
- **Store clauses:** Apple and Google are not parties and Apple is a third-party beneficiary, as the stores expect.

## Mismatch to resolve (platform)
The privacy policy says every app has an "Also remove my sign-in" option that deletes the shared sign-in and all app data. Roundsy has only "Delete my Roundsy account", which leaves the shared sign-in in place.
The terms describe what the app really does (contact us to remove the shared sign-in). Either the platform adds a delete-sign-in function that Roundsy can call (it must be a server-side function with the service role), or the privacy policy wording should be softened for now.

## Also for the store listing
Use the terms URL above as the Terms of Use / EULA link. Apple will accept a custom EULA; otherwise its standard one applies.

## Contributions clause (Nov 24, 2026)
Section 7 covers user-submitted questions and content for the crowd-sourced pipeline: own work, no copied material, no patient identifiers, accuracy in good faith, age 18+, worldwide perpetual royalty-free licence to PathoMnemonic, no payment, acceptance at our discretion, AI checking disclosed, email used only for review and contact, withdrawal honored before publication. Modeled on the Dx Dash Terms section 6. The privacy policy is hosted on the StudyBible site, not in this repo, so its matching paragraph (contributor email used only for review and contact, never published) must be added there.

## Terms hardening without a lawyer (Nov 24, 2026)
Checklist applied: refund wording (all sales final except where the app store or law requires a refund; Apple and Google refund their own purchases); no legal-status claim (no "sole proprietorship", "PathoMnemonic" is a trade name); educational-only and not-a-substitute-for-professional-judgment; as is, liability limited to what the law allows, mandatory rights untouched; contribution licence scoped to operating and promoting the apps; crash reports (Sentry) and analytics (PostHog) disclosed as running in the web app without a consent switch and not in the iPhone and Android apps; no arbitration or class-action waiver; Arizona law and the contact address unchanged; changes take effect when posted with a new date; no promise of lasting features or of never losing progress. Keep this page and the privacy policy in step with what ships: if native monitoring is ever turned on, change section 11 and the privacy policy first.
