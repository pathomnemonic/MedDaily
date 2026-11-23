/**
 * Procedural audio for Clinicle: sound effects and looping background music synthesized with the
 * Web Audio API (no asset files). Each scene name seeds its own key, scale, tempo, and melody so every
 * game has a distinct musical identity. Browsers only allow audio after a user gesture, so the engine
 * unlocks itself on the first pointer/keyboard event.
 */
import { hashSeed, seeded } from "./lib";

export type Sfx = "tap" | "pop" | "correct" | "wrong" | "win" | "perfect" | "tick" | "spin" | "badge" | "whoosh" | "start";

const SCALES: Record<string, number[]> = {
  major: [0, 2, 4, 7, 9],          // major pentatonic: bright and bouncy
  minor: [0, 3, 5, 7, 10],         // minor pentatonic: a bit moodier
  lydian: [0, 2, 4, 6, 7, 9, 11],  // floaty
  dorian: [0, 2, 3, 5, 7, 9, 10]   // groovy
};
/** Mix levels, tuned with renderForTest so effects sit clearly above the music without clipping. */
const SFX_LEVEL = 0.6, MUSIC_LEVEL = 0.085;
const midi = (n: number) => 440 * Math.pow(2, (n - 69) / 12);

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let sfxBus: GainNode | null = null;
let musicBus: GainNode | null = null;
let noise: AudioBuffer | null = null;
let sfxOn = true;
let musicOn = true;
let unlocked = false;
let scene: string | null = null;
let timer: number | null = null;
let nextTime = 0;
let step = 0;
let song: Song | null = null;

interface Song { tempo: number; root: number; scale: number[]; chords: number[]; arp: number[]; lead: (number | null)[]; energy: number }

function ensure(): AudioContext | null {
  if (ctx) return ctx;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  ctx = new Ctor();
  master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination);
  sfxBus = ctx.createGain(); sfxBus.gain.value = SFX_LEVEL; sfxBus.connect(master);
  musicBus = ctx.createGain(); musicBus.gain.value = MUSIC_LEVEL; musicBus.connect(master);
  noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType, vol: number, when: number, bus: GainNode, slideTo?: number, filter?: number) {
  if (!ctx) return;
  const osc = ctx.createOscillator(), gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, when);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, when + dur);
  gain.gain.setValueAtTime(0.0001, when);
  gain.gain.exponentialRampToValueAtTime(vol, when + 0.008);
  gain.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  let node: AudioNode = osc;
  if (filter) { const f = ctx.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = filter; osc.connect(f); node = f; }
  node.connect(gain); gain.connect(bus);
  osc.start(when); osc.stop(when + dur + 0.02);
}

function hit(dur: number, vol: number, when: number, bus: GainNode, hp = 6000) {
  if (!ctx || !noise) return;
  const src = ctx.createBufferSource(), gain = ctx.createGain(), f = ctx.createBiquadFilter();
  src.buffer = noise; f.type = "highpass"; f.frequency.value = hp;
  gain.gain.setValueAtTime(vol, when); gain.gain.exponentialRampToValueAtTime(0.0001, when + dur);
  src.connect(f); f.connect(gain); gain.connect(bus);
  src.start(when, Math.random() * 0.5); src.stop(when + dur + 0.02);
}

/** Each game gets its own effects timbre and a small pitch shift, derived from its name, so a chime in one game does not sound like another. */
const VOICES: OscillatorType[] = ["square", "triangle", "sine", "sawtooth"];
const voiceOf = (): OscillatorType => (scene && scene !== "menu" ? VOICES[hashSeed("voice|" + scene) % VOICES.length] : "square");
const shiftOf = (): number => (scene && scene !== "menu" ? (hashSeed("shift|" + scene) % 5) - 2 : 0);

/** `level` raises the pitch of a correct-answer chime by that many semitones (combo escalation). */
export function sfx(name: Sfx, level = 0) {
  if (!sfxOn || !unlocked) return;
  const c = ensure(); if (!c || !sfxBus) return;
  if (c.state === "suspended") void c.resume();
  const t = c.currentTime + 0.005, bus = sfxBus;
  const arp = (notes: number[], gap: number, type: OscillatorType = "square", vol = 0.5, len = 0.16) => notes.forEach((n, i) => tone(midi(n + shiftOf()), len, type === "square" ? voiceOf() : type, vol, t + i * gap, bus, undefined, 5200));
  switch (name) {
    case "tap": tone(660, 0.06, voiceOf(), 0.55, t, bus, 990, 4000); break;
    case "pop": tone(420, 0.09, "sine", 0.6, t, bus, 900); break;
    case "tick": tone(1400, 0.04, "square", 0.5, t, bus); break;
    case "correct": arp([72, 76, 79].map((n) => n + Math.min(8, Math.max(0, level))), 0.065); break;
    case "wrong": tone(220, 0.28, "sawtooth", 0.35, t, bus, 90, 1400); tone(165, 0.28, "square", 0.2, t + 0.04, bus, 70, 1200); break;
    case "start": arp([60, 67, 72], 0.07, "triangle", 0.6, 0.2); break;
    case "badge": arp([79, 83, 86, 91], 0.07, "sine", 0.55, 0.3); break;
    case "whoosh": hit(0.35, 0.5, t, bus, 1200); tone(200, 0.35, "sine", 0.2, t, bus, 900); break;
    case "spin": for (let i = 0; i < 14; i++) tone(500 + i * 40, 0.06, "square", 0.4, t + i * (0.09 + i * 0.006), bus, undefined, 3000); break;
    case "win": arp([72, 76, 79, 84, 88], 0.09, "square", 0.5, 0.3); tone(midi(60), 0.6, "triangle", 0.4, t, bus); break;
    case "perfect": arp([72, 76, 79, 84, 88, 91, 96], 0.075, "square", 0.5, 0.3); tone(midi(60), 0.9, "triangle", 0.45, t, bus); hit(0.6, 0.2, t + 0.5, bus, 4000); break;
  }
}

function makeSong(name: string): Song {
  const rand = seeded(hashSeed("song|" + name));
  const isMenu = name === "menu";
  const scaleName = isMenu ? "major" : (["major", "minor", "lydian", "dorian"] as const)[Math.floor(rand() * 4)];
  const scale = SCALES[scaleName];
  const root = 45 + Math.floor(rand() * 7);
  const tempo = isMenu ? 112 : 92 + Math.floor(rand() * 26);
  const degrees = [[0, 4, 5, 3], [0, 3, 4, 3], [0, 5, 3, 4], [5, 3, 0, 4]][Math.floor(rand() * 4)];
  const arp = Array.from({ length: 8 }, () => Math.floor(rand() * 3));
  const lead: (number | null)[] = [];
  let at = 2;
  for (let i = 0; i < 32; i++) {
    if (rand() < (isMenu ? 0.35 : 0.5)) lead.push(null);
    else { at = Math.max(0, Math.min(scale.length * 2 - 1, at + Math.floor(rand() * 5) - 2)); lead.push(at); }
  }
  return { tempo, root, scale, chords: degrees, arp, lead, energy: isMenu ? 1 : 0.6 };
}

const noteOf = (s: Song, degree: number, octave = 0) => s.root + 12 * (octave + Math.floor(degree / s.scale.length)) + s.scale[((degree % s.scale.length) + s.scale.length) % s.scale.length];

function scheduleStep(s: Song, i: number, when: number) {
  if (!musicBus) return;
  const bar = Math.floor(i / 16) % 4, pos = i % 16;
  const chordRoot = s.chords[bar];
  if (pos % 4 === 0) tone(midi(noteOf(s, chordRoot, 0)), 60 / s.tempo * 0.9, "triangle", 0.9, when, musicBus, undefined, 900);
  if (pos % 2 === 0 || s.energy > 0.8) {
    const tonePick = s.arp[(pos >> 1) % s.arp.length];
    tone(midi(noteOf(s, chordRoot + tonePick * 2, 2)), 0.12, "square", 0.22, when, musicBus, undefined, 2600);
  }
  const lead = s.lead[(i >> 1) % s.lead.length];
  if (pos % 2 === 0 && lead !== null && (s.energy > 0.8 || bar % 2 === 1)) tone(midi(noteOf(s, lead, 2)), 0.22, "triangle", 0.5, when, musicBus, undefined, 3200);
  if (pos % 8 === 0) tone(110, 0.14, "sine", 1, when, musicBus, 40);
  if (pos % 8 === 4) hit(0.08, 0.5, when, musicBus, 1800);
  if (pos % 2 === 1) hit(0.03, 0.18, when, musicBus, 8000);
}

function pump() {
  if (!ctx || !song) return;
  const secPerStep = 60 / song.tempo / 4;
  while (nextTime < ctx.currentTime + 0.2) { scheduleStep(song, step, nextTime); nextTime += secPerStep; step++; }
}

function startMusic() {
  if (!musicOn || !unlocked || !scene) return;
  const c = ensure(); if (!c) return;
  if (c.state === "suspended") void c.resume();
  song = makeSong(scene);
  step = 0; nextTime = c.currentTime + 0.1;
  if (timer === null) timer = window.setInterval(pump, 40);
}
function stopMusic() { if (timer !== null) { window.clearInterval(timer); timer = null; } }

/** Pick the background track. Calling with the current scene is a no-op; null silences music. */
export function setScene(name: string | null) {
  if (name === scene) return;
  scene = name;
  stopMusic();
  if (name) startMusic();
}
export function setSfxEnabled(on: boolean) { sfxOn = on; }
export function setMusicEnabled(on: boolean) { musicOn = on; if (on) startMusic(); else stopMusic(); }

/** Install one-time listeners that unlock audio on the first gesture and pause it when the tab is hidden. */
export function installAudioUnlock() {
  const unlock = () => {
    if (unlocked) return;
    unlocked = true;
    const c = ensure();
    if (c && c.state === "suspended") void c.resume();
    startMusic();
  };
  window.addEventListener("pointerdown", unlock, { once: false, passive: true });
  window.addEventListener("keydown", unlock, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (!ctx) return;
    if (document.hidden) void ctx.suspend(); else if (unlocked) void ctx.resume();
  });
}

/** Debug/testing hook: current engine state. */
export const audioDebug = () => ({ state: ctx?.state ?? "none", scene, music: timer !== null, unlocked });

/**
 * Test hook: render a sound effect or a stretch of a scene's music into an OfflineAudioContext and report
 * its peak and RMS level, so loudness, clipping, and silence can be checked without listening.
 */
export async function renderForTest(kind: "sfx" | "music", name: string, seconds = 2): Promise<{ peak: number; rms: number; seconds: number }> {
  const rate = 44100;
  const off = new OfflineAudioContext(1, Math.ceil(rate * seconds), rate);
  const saved = { ctx, master, sfxBus, musicBus, noise, unlocked, sfxOn, song };
  ctx = off as unknown as AudioContext;
  master = off.createGain(); master.connect(off.destination);
  sfxBus = off.createGain(); sfxBus.gain.value = SFX_LEVEL; sfxBus.connect(master);
  musicBus = off.createGain(); musicBus.gain.value = MUSIC_LEVEL; musicBus.connect(master);
  noise = off.createBuffer(1, rate, rate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  unlocked = true; sfxOn = true;
  try {
    if (kind === "sfx") sfx(name as Sfx);
    else {
      const tune = makeSong(name);
      const secPerStep = 60 / tune.tempo / 4;
      for (let i = 0, t = 0; t < seconds; i++, t += secPerStep) scheduleStep(tune, i, t);
    }
    const buffer = await off.startRendering();
    const samples = buffer.getChannelData(0);
    let peak = 0, sum = 0;
    for (let i = 0; i < samples.length; i++) { peak = Math.max(peak, Math.abs(samples[i])); sum += samples[i] * samples[i]; }
    return { peak, rms: Math.sqrt(sum / samples.length), seconds };
  } finally {
    ({ ctx, master, sfxBus, musicBus, noise, unlocked, sfxOn, song } = saved);
  }
}
if (typeof window !== "undefined") {
  const w = window as unknown as { __medAudio?: typeof audioDebug; __medAudioRender?: typeof renderForTest };
  w.__medAudio = audioDebug; w.__medAudioRender = renderForTest;
}
