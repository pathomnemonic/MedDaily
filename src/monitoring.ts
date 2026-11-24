import { APP_VERSION } from "./support";

/** Public, write-only ingest identifiers (safe to ship in the client). */
export const SENTRY_DSN = "https://e3e587510b078b8a33956c9e21342486@o4512486931169280.ingest.us.sentry.io/4512486934118400";
export const POSTHOG_KEY = "phc_kWmx5oVY3FreyoD2myh2jTYZKyuDXYsLHBGkvCq3yyYY";
export const POSTHOG_HOST = "https://us.i.posthog.com";
export const APP_TAG = "roundsy";

/** Monitoring runs only in the production build, never in dev, tests or previews on localhost. */
export function monitoringEnabled(prod: boolean, host: string): boolean {
  return prod && !/^(localhost|127\.0\.0\.1|\[::1\])$/.test(host);
}

/** Removes anything that could identify a room or a person from a URL (room codes, sign-in tokens, query strings and fragments). */
export function scrubUrl(url: string | undefined): string | undefined {
  if (!url) return url;
  return url.replace(/[?#].*$/, "");
}

let sentry: typeof import("@sentry/browser") | null = null;

/** Starts crash reporting and anonymous pageview/error analytics after the app has painted. Failures here must never affect the app. */
export function startMonitoring(prod: boolean = import.meta.env.PROD, host: string = window.location.hostname): void {
  if (!monitoringEnabled(prod, host)) return;
  const run = () => { void startSentry().catch(() => undefined); void startPostHog().catch(() => undefined); };
  const idle = (window as unknown as { requestIdleCallback?: (cb: () => void) => void }).requestIdleCallback;
  if (idle) idle(run); else window.setTimeout(run, 1500);
}

async function startSentry(): Promise<void> {
  const Sentry = await import("@sentry/browser");
  Sentry.init({
    dsn: SENTRY_DSN,
    environment: "production",
    release: "roundsy@" + APP_VERSION,
    tracesSampleRate: 0,
    initialScope: { tags: { app: APP_TAG } },
    beforeSend(event) {
      delete event.user;
      if (event.request) { event.request.url = scrubUrl(event.request.url); delete event.request.cookies; delete event.request.query_string; }
      return event;
    },
    beforeBreadcrumb(crumb) {
      if (crumb.category === "ui.input" || crumb.category === "ui.click") return null; // no typed answers or click targets
      if (crumb.data?.url) crumb.data.url = scrubUrl(String(crumb.data.url));
      return crumb;
    }
  });
  sentry = Sentry;
}

async function startPostHog(): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.doNotTrack === "1") return;
  const { default: posthog } = await import("posthog-js");
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    autocapture: false,            // pageviews and errors only
    capture_pageview: true,
    capture_pageleave: false,
    capture_exceptions: true,
    disable_session_recording: true,
    person_profiles: "identified_only",
    before_send: (event) => {
      if (!event) return event;
      event.properties = { ...event.properties, app: APP_TAG, app_version: APP_VERSION };
      for (const key of ["$current_url", "$referrer", "$pathname"]) {
        if (typeof event.properties[key] === "string") event.properties[key] = scrubUrl(event.properties[key] as string);
      }
      return event;
    }
  });
  posthog.register({ app: APP_TAG });
}

/** Called from the error boundaries so a crash that React caught still reaches Sentry. */
export function reportCrash(error: unknown): void {
  try { sentry?.captureException(error); } catch { /* reporting must never throw */ }
}
