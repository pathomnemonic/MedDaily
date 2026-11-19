# Setup and deployment

## Local development

Requirements: Node.js 24 or newer (Vitest's current release line requires Node 24.12+).

\`\`\`sh
npm install
npm run dev
\`\`\`

Build and test:

\`\`\`sh
npm test
npm run build
npm run preview
\`\`\`

## GitHub Pages

The repository includes a GitHub Actions workflow that builds and deploys the site from \`main\`.

In GitHub:
1. Open **Settings → Pages**.
2. Set the source to **GitHub Actions**.
3. Push to \`main\`; the workflow builds and deploys the PWA.

The build works without Firebase or Google credentials. The corresponding buttons remain disabled until credentials are configured.

## Optional Google sign-in and private Drive sync

Google Drive sync is intentionally optional. Guests can use every solo game, daily challenge, practice game, and local progress without signing in.

To enable it:

1. Create a Google Cloud project.
2. Enable the **Google Drive API**.
3. Configure the OAuth consent screen and create an OAuth 2.0 **Web application** client.
4. Add your production site origin and local development origin to **Authorized JavaScript origins**.
5. Set \`VITE_GOOGLE_CLIENT_ID\` in the GitHub Actions repository variables or deployment environment.
6. Deploy again.

MedDaily requests \`openid\`, \`email\`, \`profile\`, and the narrow \`drive.appdata\` scope. The progress file is stored in Google's private application-data folder; it is not placed in a user's ordinary visible Drive folder, and the app does not request access to other Drive files. Sync merges local and remote result records. The user must explicitly choose to connect and sync.

For local testing, copy \`.env.example\` to \`.env.local\` and set the same variables.

## Optional multiplayer rooms

Room play uses Firebase Authentication (anonymous guest sign-in) and Cloud Firestore. It does **not** require Google login.

1. Create a Firebase project.
2. Register a Web app and copy its Firebase config into the \`VITE_FIREBASE_*\` environment variables.
3. Enable **Authentication → Sign-in method → Anonymous**.
4. Create a Cloud Firestore database.
5. Publish the included \`firestore.rules\` rules to the project.
6. Set the Firebase variables in GitHub Actions and redeploy.

Rooms use short codes, nicknames, the game id, the selected general/specialty scope, date, and deterministic seed. Player records live in a subcollection: each guest can update only their own score, and a room member cannot overwrite another player's result. Scores update in real time as players submit them. The initial multiplayer model is asynchronous same-puzzle competition (not a shared simultaneous board). Rooms are limited to eight players.

Configure Firebase App Check and appropriate production quotas before inviting a large public audience. Never store patient information in MedDaily.

## Environment variables

See \`.env.example\`. Firebase config values are public client configuration, not server secrets. Protect data with Auth, Firestore rules, App Check, and Firebase quotas. Do not commit real credentials.
