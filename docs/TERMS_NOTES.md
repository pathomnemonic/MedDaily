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
