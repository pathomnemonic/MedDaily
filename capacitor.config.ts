import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Native shell for the App Store and Play Store. The web build in `dist` is bundled into the app, so it works offline.
 * The bundle identifier is final (renamed from the provisional meddaily id before any store upload); it cannot change after the first upload.
 */
const config: CapacitorConfig = {
  appId: "com.pathomnemonic.roundsy",
  appName: "Roundsy",
  webDir: "dist",
  backgroundColor: "#100b2e",
  ios: { contentInset: "never", limitsNavigationsToAppBoundDomains: false },
  android: { allowMixedContent: false },
  plugins: {
    SplashScreen: { launchShowDuration: 600, launchAutoHide: true, backgroundColor: "#100b2e", showSpinner: false },
    StatusBar: { style: "DARK", backgroundColor: "#100b2e" }
  }
};

export default config;
