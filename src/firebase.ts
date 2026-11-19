import { getApps, initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import {
  getFirestore, doc, getDoc, runTransaction, onSnapshot, collection, serverTimestamp, type Unsubscribe
} from "firebase/firestore";
import type { GameId } from "./lib";

const env = import.meta.env;
const configured = Boolean(env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_PROJECT_ID && env.VITE_FIREBASE_APP_ID);
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export interface RoomInfo {
  code: string;
  gameId: GameId;
  scope: string;
  specialty: string;
  date: string;
  seed: number;
}
export interface RoomPlayer {
  uid: string;
  name: string;
  score: number | null;
  maxScore: number | null;
  finished: boolean;
  perfect: boolean;
}
export interface RoomState extends RoomInfo {
  hostUid: string;
  players: RoomPlayer[];
  status: "waiting" | "playing";
}
interface RoomDocument extends RoomInfo {
  hostUid: string;
  memberUids: string[];
  status: "waiting" | "playing";
}

let app: ReturnType<typeof initializeApp> | null = null;
function services() {
  if (!configured) throw new Error("Multiplayer is not configured yet. See the Firebase setup guide.");
  app ??= getApps()[0] ?? initializeApp({
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    appId: env.VITE_FIREBASE_APP_ID,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID
  });
  return { auth: getAuth(app), db: getFirestore(app) };
}
async function identity() {
  const { auth } = services();
  if (!auth.currentUser) await signInAnonymously(auth);
  if (!auth.currentUser) throw new Error("Could not create a guest multiplayer session.");
  return auth.currentUser.uid;
}
const roomRef = (code: string) => doc(services().db, "rooms", code.toUpperCase());
const playerRef = (code: string, uid: string) => doc(services().db, "rooms", code.toUpperCase(), "players", uid);

export function multiplayerConfigured() { return configured; }

export async function createRoom(input: Omit<RoomInfo, "code"> & { name: string }): Promise<string> {
  const { db } = services();
  const uid = await identity();
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
    const ref = roomRef(code);
    const member = playerRef(code, uid);
    try {
      await runTransaction(db, async (tx) => {
        const existing = await tx.get(ref);
        if (existing.exists()) throw new Error("Room code collision. Try again.");
        const room: RoomDocument = {
          ...input,
          code,
          hostUid: uid,
          memberUids: [uid],
          status: "waiting"
        };
        tx.set(ref, { ...room, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        tx.set(member, {
          uid,
          name: input.name.trim().slice(0, 20) || "Guest",
          score: null,
          maxScore: null,
          finished: false,
          perfect: false
        });
      });
      return code;
    } catch (error) {
      if (!(error instanceof Error) || error.message !== "Room code collision. Try again.") throw error;
    }
  }
  throw new Error("Could not find an available room code. Try again.");
}

export async function joinOrCreateRoom(codeInput: string, input: Omit<RoomInfo, "code"> & { name: string }): Promise<RoomState> {
  const code = codeInput.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  if (code.length !== 6) throw new Error("Enter a six-character room code.");
  const { db } = services();
  const uid = await identity();
  const ref = roomRef(code);
  const member = playerRef(code, uid);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) {
      const room: RoomDocument = { ...input, code, hostUid: uid, memberUids: [uid], status: "waiting" };
      tx.set(ref, { ...room, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      tx.set(member, { uid, name: input.name.trim().slice(0, 20) || "Guest", score: null, maxScore: null, finished: false, perfect: false });
      return;
    }
    const room = snap.data() as RoomDocument;
    const members = room.memberUids ?? [];
    if (!members.includes(uid) && members.length >= 8) throw new Error("This room is full (maximum eight players).");
    if (!members.includes(uid)) {
      tx.update(ref, { memberUids: [...members, uid], updatedAt: serverTimestamp() });
      tx.set(member, { uid, name: input.name.trim().slice(0, 20) || "Guest", score: null, maxScore: null, finished: false, perfect: false });
    }
  });
  const [snap, playerSnap] = await Promise.all([getDoc(ref), getDoc(member)]);
  if (!snap.exists() || !playerSnap.exists()) throw new Error("Room could not be joined.");
  const room = snap.data() as RoomDocument;
  return { ...room, players: [playerSnap.data() as RoomPlayer] };
}

export async function joinRoom(codeInput: string, name: string): Promise<RoomState> {
  const code = codeInput.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
  if (code.length !== 6) throw new Error("Enter the six-character room code.");
  const { db } = services();
  const uid = await identity();
  const ref = roomRef(code);
  const member = playerRef(code, uid);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("No room found. Check the code.");
    const room = snap.data() as RoomDocument;
    const members = room.memberUids ?? [];
    if (!members.includes(uid) && members.length >= 8) throw new Error("This room is full (maximum eight players).");
    if (!members.includes(uid)) {
      tx.update(ref, {
        memberUids: [...members, uid],
        updatedAt: serverTimestamp()
      });
      tx.set(member, {
        uid,
        name: name.trim().slice(0, 20) || "Guest",
        score: null,
        maxScore: null,
        finished: false,
        perfect: false
      });
    }
  });
  const snap = await getDoc(ref);
  const playerSnaps = await getDoc(member);
  if (!snap.exists() || !playerSnaps.exists()) throw new Error("Room could not be joined.");
  const room = snap.data() as RoomDocument;
  return { ...room, players: [playerSnaps.data() as RoomPlayer] };
}

export function watchRoom(code: string, callback: (room: RoomState | null) => void): Unsubscribe {
  const { db } = services();
  let info: Omit<RoomState, "players"> | null = null;
  let players: RoomPlayer[] = [];
  let gotRoom = false;
  let gotPlayers = false;
  const emit = () => {
    if (gotRoom && gotPlayers) callback(info ? { ...info, players } : null);
  };
  const unsubRoom = onSnapshot(roomRef(code), (snap) => {
    gotRoom = true;
    info = snap.exists() ? snap.data() as Omit<RoomState, "players"> : null;
    emit();
  }, () => callback(null));
  const unsubPlayers = onSnapshot(collection(db, "rooms", code.toUpperCase(), "players"), (snap) => {
    gotPlayers = true;
    players = snap.docs.map((item) => item.data() as RoomPlayer);
    emit();
  }, () => callback(null));
  return () => { unsubRoom(); unsubPlayers(); };
}

export async function submitRoomScore(code: string, score: number, maxScore: number, perfect: boolean): Promise<void> {
  const { db } = services();
  const uid = await identity();
  const ref = playerRef(code, uid);
  const room = roomRef(code);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("You are no longer in this room.");
    tx.update(ref, { score, maxScore, perfect, finished: true });
    tx.update(room, { status: "playing", updatedAt: serverTimestamp() });
  });
}

export async function leaveRoom(code: string): Promise<void> {
  const { db } = services();
  const uid = await identity();
  const ref = roomRef(code);
  const member = playerRef(code, uid);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) return;
    const room = snap.data() as RoomDocument;
    const members = (room.memberUids ?? []).filter((id) => id !== uid);
    if (members.length === (room.memberUids ?? []).length) return;
    tx.delete(member);
    if (!members.length) tx.delete(ref);
    else tx.update(ref, { memberUids: members, updatedAt: serverTimestamp() });
  });
}