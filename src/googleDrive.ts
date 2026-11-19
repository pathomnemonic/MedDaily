import type { PlayerData } from "./storage";

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (options: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
            error_callback?: (error: { type?: string; message?: string }) => void;
          }) => { requestAccessToken: (options?: { prompt?: string }) => void };
        };
      };
    };
  }
}

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const DRIVE_SCOPE = "openid email profile https://www.googleapis.com/auth/drive.appdata";
const FILE_NAME = "meddaily-progress-v1.json";
let token = "";

export const googleDriveConfigured = () => Boolean(CLIENT_ID);
export const hasDriveToken = () => Boolean(token);

function accessToken(): Promise<string> {
  if (!CLIENT_ID) return Promise.reject(new Error("Add VITE_GOOGLE_CLIENT_ID to connect Google Drive."));
  if (!window.google?.accounts?.oauth2) return Promise.reject(new Error("Google Identity Services has not loaded. Check your connection and try again."));
  return new Promise((resolve, reject) => {
    const client = window.google!.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: DRIVE_SCOPE,
      callback: (response) => {
        if (response.error || !response.access_token) { reject(new Error(response.error || "Google sign-in was not completed.")); return; }
        token = response.access_token;
        resolve(token);
      },
      error_callback: (error) => reject(new Error(error.message || "Google sign-in failed."))
    });
    client.requestAccessToken({ prompt: "consent" });
  });
}

async function driveRequest<T>(url: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { Authorization: "Bearer " + token, ...(init.headers ?? {}) }
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error("Google Drive request failed (" + response.status + "): " + body.slice(0, 240));
  }
  if (response.status === 204) return undefined as T;
  return await response.json() as T;
}

export function mergePlayerData(local: PlayerData, remote: PlayerData): PlayerData {
  const combined = new Map<string, PlayerData["results"][number]>();
  for (const item of [...(remote.results ?? []), ...(local.results ?? [])]) {
    const key = [item.date, item.scope ?? "general", item.game].join("|");
    const prior = combined.get(key);
    if (!prior || item.score >= prior.score) combined.set(key, item);
  }
  const bests = { ...(remote.bests ?? {}) };
  for (const [key, value] of Object.entries(local.bests ?? {})) bests[key as keyof typeof bests] = Math.max(Number(bests[key as keyof typeof bests] ?? 0), Number(value ?? 0));
  return {
    results: [...combined.values()].sort((a, b) => a.date.localeCompare(b.date)).slice(-1200),
    bests,
    sound: local.sound,
    reducedMotion: local.reducedMotion,
    hideStreaks: local.hideStreaks
  };
}

export async function connectAndSync(local: PlayerData): Promise<PlayerData> {
  await accessToken();
  const q = encodeURIComponent("name='" + FILE_NAME + "' and trashed=false");
  const listing = await driveRequest<{ files: { id: string; name: string }[] }>(
    "https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=" + q + "&fields=files(id,name)"
  );
  let remote = { results: [], bests: {}, sound: false, reducedMotion: false, hideStreaks: false } as PlayerData;
  let id: string | undefined = listing.files?.[0]?.id;
  if (id) {
    const response = await fetch("https://www.googleapis.com/drive/v3/files/" + id + "?alt=media", { headers: { Authorization: "Bearer " + token } });
    if (response.ok) remote = await response.json() as PlayerData;
  }
  const merged = mergePlayerData(local, remote);
  const metadata = { name: FILE_NAME, mimeType: "application/json", ...(id ? {} : { parents: ["appDataFolder"] }) };
  const boundary = "meddaily_" + Math.random().toString(36).slice(2);
  const body = "--" + boundary + "\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n" + JSON.stringify(metadata) +
    "\r\n--" + boundary + "\r\nContent-Type: application/json\r\n\r\n" + JSON.stringify(merged) +
    "\r\n--" + boundary + "--";
  const url = id
    ? "https://www.googleapis.com/upload/drive/v3/files/" + id + "?uploadType=multipart"
    : "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart";
  await driveRequest(url, { method: id ? "PATCH" : "POST", headers: { "Content-Type": "multipart/related; boundary=" + boundary }, body });
  return merged;
}