# Multiplayer room setup

MedDaily's room-code flow uses Firebase Authentication (anonymous guest sessions) and Cloud Firestore. The first player to enter a new six-character code starts the room. Anyone else can enter that same code to join the existing game; the room's saved game, study track, date, and seed are authoritative.

## 1. Configure Firebase

1. Create a Firebase project.
2. Add a Web App and copy its Firebase web configuration.
3. In **Authentication → Sign-in method**, enable **Anonymous**.
4. Create a **Cloud Firestore** database.
5. From the repository root, deploy the included rules:
   `firebase deploy --only firestore:rules`

The rules are in `firestore.rules` and are referenced by `firebase.json`. They restrict room membership to eight players and allow players to update only their own result.

## 2. Add GitHub repository variables

In the MedDaily GitHub repository, open **Settings → Secrets and variables → Actions → Variables** and add these repository variables (the Pages workflow reads them through `vars`, not `secrets`):

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`

These are the public web-app configuration values, not an Admin SDK key or service-account credential. Never put a Firebase service-account private key in the client build.

## 3. Deploy and test

1. Trigger the **Build and deploy MedDaily** workflow (or push a change to `main`).
2. Open the deployed site and visit **Friends / Rooms**.
3. Enter a six-character code and choose the game. The first player creates the room automatically.
4. On another device, enter the exact same code. The existing room determines the game and seed, even if the joining player's local study-track settings differ.

If the Join / start button is disabled, the deployed build does not contain the Firebase variables. If the button is enabled but joining fails, check that Anonymous Authentication is enabled and the deployed Firestore rules match `firestore.rules`.

A room code is an invitation: anyone who knows it can join while the room is active. Share it only with the intended group. Rooms support up to eight players and are deleted when the last player leaves.
