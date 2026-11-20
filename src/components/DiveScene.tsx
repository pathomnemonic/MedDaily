import { useEffect, useRef, useState } from "react";
import { seeded } from "../lib";

/**
 * Deep Scan's full-screen pixel-art descent: a low-resolution canvas (about 300 px tall) scaled up with
 * `image-rendering: pixelated`. A tall pre-rendered "world" holds a dawn sky, a skin horizon and six tissue layers
 * (skin, fat, fascia, muscle, bone, marrow); the camera follows a capsule sprite as it dives to the layer that the
 * player's answer reached. All art is generated in code, so there are no image assets.
 */
export const SCENE_H = 300;
const SURFACE = 165;
const ZONE = 100;
const WORLD_H = SURFACE + ZONE * 6 + 120;
const SPRITE_SCREEN_Y = 190;
export const markerY = (tier: number) => SURFACE + (tier - 1) * ZONE + 55;
export const ZONE_COLORS = ["#ffd54a", "#7ee0c0", "#ff9fc2", "#ff7a6b", "#bff3ff", "#ffa05a"];

type RGB = [number, number, number];
const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];

/** Sprite: a 9 × 14 capsule with a face. O outline, P/p pink and highlight, W/w white and shade, E eye. */
const SPRITE = [
  "  OOOOO  ",
  " OppPPPO ",
  "OppPPPPPO",
  "OpPPPPPPO",
  "OPPPPPPPO",
  "OOOOOOOOO",
  "OWWWWWWwO",
  "OWEWWWEwO",
  "OWWWWWWwO",
  "OWWWWWwwO",
  "OWWWWwwwO",
  " OwwwwwwO",
  "  OOOOO  ",
];
const SPRITE_COLORS: Record<string, string> = { O: "#24124f", P: "#ff5d8f", p: "#ffa6c4", W: "#f6f6ff", w: "#c3c6e6", E: "#24124f" };

function buildWorld(W: number, seed: number): HTMLCanvasElement {
  const rnd = seeded(seed ^ 0x5bd1e995);
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = WORLD_H;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(W, WORLD_H);
  const horizon = Array.from({ length: W }, (_, x) => SURFACE + Math.round(3 * Math.sin(x * 0.09 + 1) + 2 * Math.sin(x * 0.21)));
  const put = (x: number, y: number, c: RGB) => { const i = (y * W + x) * 4; img.data[i] = c[0]; img.data[i + 1] = c[1]; img.data[i + 2] = c[2]; img.data[i + 3] = 255; };
  const band = (y0: number, y1: number, pal: string[], mask?: (x: number, y: number) => boolean) => {
    const cols = pal.map(hex);
    for (let y = y0; y < y1; y++) {
      const t = (y - y0) / Math.max(1, y1 - y0 - 1);
      const pos = t * (cols.length - 1);
      const i = Math.min(cols.length - 2, Math.floor(pos));
      const f = pos - i;
      // Crisp colour bands with a narrow dithered seam between them, like hand-made pixel art.
      const mix = f < 0.38 ? 0 : f > 0.62 ? 1 : (f - 0.38) / 0.24;
      for (let x = 0; x < W; x++) {
        if (mask && !mask(x, y)) continue;
        put(x, y, mix > (BAYER[y & 3][x & 3] + 0.5) / 16 ? cols[i + 1] : cols[i]);
      }
    }
  };
  // Sky, then skin horizon and the six layers, then the core.
  band(0, SURFACE + 10, ["#0a1b3a", "#14487a", "#2a8c9a", "#8fdcc4", "#ffe6a8"]);
  band(SURFACE - 4, SURFACE + ZONE, ["#f6c3a0", "#eaa07c"], (x, y) => y >= horizon[x]);
  band(SURFACE + ZONE, SURFACE + ZONE * 2, ["#ffdc66", "#efb53a"]);
  band(SURFACE + ZONE * 2, SURFACE + ZONE * 3, ["#fbf1de", "#e0cfb2"]);
  band(SURFACE + ZONE * 3, SURFACE + ZONE * 4, ["#d8433b", "#a02a30"]);
  band(SURFACE + ZONE * 4, SURFACE + ZONE * 5, ["#f3e9d3", "#d6c6a2"]);
  band(SURFACE + ZONE * 5, SURFACE + ZONE * 6, ["#f48f55", "#cf563a"]);
  band(SURFACE + ZONE * 6, WORLD_H, ["#b0452e", "#6e2644", "#241030"]);
  ctx.putImageData(img, 0, 0);

  const dot = (x: number, y: number, c: string, w = 1, h = 1, a = 1) => { ctx.globalAlpha = a; ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); ctx.globalAlpha = 1; };
  const R = (a: number, b: number) => a + Math.floor(rnd() * (b - a + 1));
  const zoneTop = (i: number) => SURFACE + ZONE * i; // i: 0..5
  const disc = (cx: number, cy: number, r: number, c: string, a = 1, limit?: (x: number, y: number) => boolean) => {
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + 1 && (!limit || limit(cx + x, cy + y))) dot(cx + x, cy + y, c, 1, 1, a);
  };
  const ring = (cx: number, cy: number, r: number, c: string, a = 1) => { for (let d = 0; d < 360; d += 360 / Math.max(10, r * 7)) dot(cx + Math.cos((d * Math.PI) / 180) * r, cy + Math.sin((d * Math.PI) / 180) * r, c, 1, 1, a); };

  // Sky: stars, a pale sun with banded halo, drifting-cloud strips.
  for (let i = 0; i < 70; i++) dot(R(0, W - 1), R(0, SURFACE - 30), ["#ffffff", "#bff3ff", "#ffe9a8"][R(0, 2)], 1, 1, 0.5 + rnd() * 0.5);
  const sunX = Math.round(W * 0.74), sunY = SURFACE - 2;
  const aboveHorizon = (x: number, y: number) => x >= 0 && x < W && y < horizon[x];
  disc(sunX, sunY, 26, "#fff3c2", 0.16, aboveHorizon);
  disc(sunX, sunY, 19, "#fff3c2", 0.22, aboveHorizon);
  disc(sunX, sunY, 13, "#fff6cc", 0.5, aboveHorizon);
  disc(sunX, sunY, 8, "#fffbe6", 1, aboveHorizon);
  for (let i = 0; i < 6; i++) { const cx = R(0, W - 30), cy = R(14, SURFACE - 40); dot(cx, cy, "#ffffff", R(14, 28), 2, 0.85); dot(cx + 4, cy - 2, "#ffffff", R(8, 16), 2, 0.85); dot(cx + 2, cy + 2, "#bfe3f5", R(10, 20), 1, 0.8); }

  // Skin horizon: highlight edge, hairs and pores.
  for (let x = 0; x < W; x++) { dot(x, horizon[x], "#ffe6d0"); dot(x, horizon[x] + 1, "#f9cfae"); }
  for (let i = 0; i < Math.round(W / 9); i++) { const x = R(2, W - 3); const h = R(3, 6); dot(x, horizon[x] - h, "#5a3328", 1, h); }
  for (let i = 0; i < 34; i++) { const x = R(0, W - 2); const y = R(horizon[Math.min(W - 1, x)] + 6, zoneTop(1) - 6); dot(x, y, "#c97f5e", 2, 1, 0.9); }
  for (let i = 0; i < 7; i++) { const x = R(6, W - 10), y = R(zoneTop(0) + 28, zoneTop(1) - 14); dot(x, y, "#c83a46", 1, 3); dot(x + 1, y + 3, "#c83a46", 2, 1); dot(x + 3, y + 2, "#c83a46", 1, 1); dot(x + 3, y, "#c83a46", 1, 2); }
  for (let i = 0; i < 4; i++) { const x = R(8, W - 8), y = R(zoneTop(0) + 20, zoneTop(1) - 24); dot(x, y, "#8a5a48", 1, 7, 0.7); disc(x, y + 8, 1, "#8a5a48", 0.6); }

  // Subcutaneous fat: round cells.
  for (let i = 0; i < 30; i++) { const r = R(3, 6); ring(R(r, W - r), R(zoneTop(1) + r + 4, zoneTop(2) - r - 4), r, "#fff3b0", 0.8); }
  for (let i = 0; i < 40; i++) dot(R(0, W - 1), R(zoneTop(1) + 2, zoneTop(2) - 2), "#c98a1a", 1, 1, 0.6);

  // Fascia: crossing fibres, a vein and a nerve.
  for (let i = 0; i < 70; i++) { let x = R(0, W - 1), y = R(zoneTop(2) + 2, zoneTop(3) - 6); const len = R(8, 22), up = rnd() < 0.5; for (let k = 0; k < len; k++) { dot(x, y, "#c7b28c", 1, 1, 0.85); x += 2; if (k % 2) y += up ? -1 : 1; } }
  for (let x = 0; x < W; x++) { const y = zoneTop(2) + 34 + Math.round(2 * Math.sin(x * 0.15)); dot(x, y, "#3c68c0", 1, 2); dot(x, y - 1, "#7aa2ee", 1, 1, 0.7); }
  for (let x = 0; x < W; x++) dot(x, zoneTop(2) + 62 + Math.round(1.5 * Math.sin(x * 0.11 + 2)), "#ffe066", 1, 1);

  // Muscle: striated fibres with sarcomere bands.
  for (let x = 1; x < W; x += 3) { let y = zoneTop(3); while (y < zoneTop(4) - 2) { const run = R(10, 40); for (let k = 0; k < run && y < zoneTop(4); k++, y++) dot(x + (k % 17 === 0 ? 1 : 0), y, "#7d1a28", 1, 1, 0.8); y += R(2, 6); } }
  for (let y = zoneTop(3) + 4; y < zoneTop(4); y += 6) for (let x = 0; x < W; x += R(6, 16)) dot(x, y, "#f0766a", R(2, 5), 1, 0.5);

  // Bone: porous trabeculae, osteocyte lacunae and a haversian canal.
  for (let i = 0; i < 150; i++) dot(R(0, W - 1), R(zoneTop(4) + 2, zoneTop(5) - 2), "#b3a077", R(1, 2), 1, 0.9);
  for (let i = 0; i < 26; i++) { const x = R(2, W - 6), y = R(zoneTop(4) + 4, zoneTop(5) - 6); dot(x, y, "#8a7650", 3, 2); dot(x + 1, y - 1, "#8a7650", 1, 1); }
  for (let k = 0; k < 2; k++) { const x = R(10, W - 14); for (let y = zoneTop(4) + 3; y < zoneTop(5) - 3; y++) { dot(x + Math.round(Math.sin(y * 0.12 + k)), y, "#e8dcc0", 4, 1); dot(x + 1 + Math.round(Math.sin(y * 0.12 + k)), y, "#7a2f3a", 2, 1); } }
  for (let i = 0; i < 28; i++) { let x = R(0, W - 1), y = R(zoneTop(4) + 2, zoneTop(5) - 8); const dir = rnd() < 0.5 ? 1 : -1; for (let k = 0; k < R(6, 14); k++) { dot(x, y, "#a8946a", 1, 1, 0.9); x += dir; y += 1 - (k % 2); } }

  // Marrow: red cells, white cells and platelets.
  for (let i = 0; i < 80; i++) { const x = R(2, W - 3), y = R(zoneTop(5) + 3, zoneTop(6) - 3); disc(x, y, 2, "#b3262e"); dot(x, y, "#e0575c"); }
  for (let i = 0; i < 9; i++) { const x = R(4, W - 5), y = R(zoneTop(5) + 6, zoneTop(6) - 6); disc(x, y, 4, "#d9bcf2"); disc(x, y, 2, "#7a3fa3"); }
  for (let i = 0; i < 30; i++) dot(R(0, W - 1), R(zoneTop(5) + 2, zoneTop(6) - 2), "#ffe29a", 1, 1);

  // Layer edges, then the depth shadow.
  for (let i = 1; i <= 6; i++) { dot(0, zoneTop(i) - 1, "#000000", W, 1, 0.45); dot(0, zoneTop(i), "#ffffff", W, 1, 0.18); }
  const steps = 12;
  for (let s = 0; s < steps; s++) { const y0 = SURFACE + Math.round(((WORLD_H - SURFACE) * s) / steps); dot(0, y0, "#0a0020", W, Math.ceil((WORLD_H - SURFACE) / steps) + 1, (0.4 * s) / steps); }
  return canvas;
}

interface Props { tier: number | null; seed: number; tag: string; names: string[]; /** Horse day: the capsule rises toward the surface (with a balloon) instead of diving. */ up?: boolean }

export default function DiveScene({ tier, seed, tag, names, up = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tierRef = useRef<number | null>(tier);
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);
  const tagRef = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(() => width());
  tierRef.current = tier;

  useEffect(() => {
    const onResize = () => setW(width());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = W; canvas.height = SCENE_H;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const world = buildWorld(W, seed);
    const reduce = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rnd = seeded(seed + 77);
    const bubbles = Array.from({ length: reduce ? 8 : 26 }, () => ({ x: rnd() * W, y: rnd() * SCENE_H, v: 4 + rnd() * 9, big: rnd() < 0.25 }));
    const birds = [0, 1, 2].map((i) => ({ x: rnd() * W, y: 40 + i * 28 + rnd() * 10, v: 5 + rnd() * 4 }));
    const sparks: { x: number; y: number; vx: number; vy: number; life: number; c: string }[] = [];
    const restY = up ? WORLD_H - 70 : SURFACE - 12;
    const state = { sprite: restY, cam: up ? WORLD_H - SCENE_H : 0, arrived: false, lastTier: tierRef.current, t: 0 };
    let raf = 0, last = performance.now();
    const spriteX = Math.round(W * 0.3);
    const tapeX = Math.round(W * 0.56);
    const colors: Record<string, string> = SPRITE_COLORS;

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now; state.t += dt;
      const tr = tierRef.current;
      if (tr !== state.lastTier) { state.lastTier = tr; state.arrived = false; }
      const target = tr ? markerY(tr) : restY + Math.sin(state.t * 2) * 2;
      const ease = (rate: number) => (reduce ? 1 : 1 - Math.exp(-dt * rate));
      state.sprite += (target - state.sprite) * ease(tr ? 2.2 : 5);
      const camTarget = Math.max(0, Math.min(WORLD_H - SCENE_H, state.sprite - SPRITE_SCREEN_Y));
      state.cam += (camTarget - state.cam) * ease(tr ? 1.7 : 3);
      if (tr && !state.arrived && Math.abs(state.sprite - target) < 1.5) {
        state.arrived = true;
        for (let i = 0; i < 22; i++) { const a = (i / 22) * Math.PI * 2; sparks.push({ x: spriteX, y: state.sprite - state.cam, vx: Math.cos(a) * (18 + rnd() * 26), vy: Math.sin(a) * (18 + rnd() * 26) - 8, life: 0.7 + rnd() * 0.4, c: ZONE_COLORS[(tr - 1) % 6] }); }
      }
      const cam = Math.round(state.cam);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(world, 0, -cam);

      // Sonar tape: a measuring line with ticks, like a rope to follow down.
      for (let sy = 0; sy < SCENE_H; sy++) {
        const wy = sy + cam;
        if (wy < SURFACE - 16 || wy > WORLD_H - 20) continue;
        ctx.fillStyle = "rgba(190,243,255,.16)"; ctx.fillRect(tapeX - 3, sy, 7, 1);
        ctx.fillStyle = "rgba(220,250,255,.8)"; ctx.fillRect(tapeX, sy, 1, 1);
        if (wy % 6 === 0) ctx.fillRect(tapeX - (wy % 30 === 0 ? 6 : 3), sy, wy % 30 === 0 ? 6 : 3, 1);
      }
      // Birds above the surface.
      for (const b of birds) { b.x += b.v * dt; if (b.x > W + 4) b.x = -6; const sy = Math.round(b.y - cam); if (sy < -4 || sy > SCENE_H) continue; const up = Math.floor(state.t * 4 + b.x) % 2 === 0; ctx.fillStyle = "#ffffff"; ctx.fillRect(Math.round(b.x), sy + (up ? 0 : 1), 1, 1); ctx.fillRect(Math.round(b.x) + 1, sy + (up ? 1 : 0), 1, 1); ctx.fillRect(Math.round(b.x) + 2, sy + (up ? 0 : 1), 1, 1); ctx.fillRect(Math.round(b.x) + 3, sy + (up ? 1 : 0), 1, 1); }
      // Drifting bubbles.
      for (const b of bubbles) { b.y -= b.v * dt; b.x += Math.sin(state.t * 1.3 + b.y * 0.05) * 3 * dt; if (b.y < -3) { b.y = SCENE_H + 3; b.x = rnd() * W; } if (b.y + cam < SURFACE + 2) continue; ctx.fillStyle = b.big ? "rgba(255,255,255,.42)" : "rgba(255,255,255,.6)"; ctx.fillRect(Math.round(b.x), Math.round(b.y), b.big ? 2 : 1, b.big ? 2 : 1); }
      // Sprite and its glow.
      const sy = Math.round(state.sprite - state.cam);
      const sx = spriteX + Math.round(Math.sin(state.t * 3) * 1);
      for (let r = 10; r >= 4; r -= 3) { ctx.fillStyle = "rgba(255,255,255,.09)"; for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r) ctx.fillRect(sx + x, sy + y, 1, 1); }
      SPRITE.forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== " ") { ctx.fillStyle = colors[ch]; ctx.fillRect(sx - 4 + x, sy - 6 + y, 1, 1); } }));
      if (up) {
        // A balloon lifts the capsule toward the surface on horse days.
        const bx = sx, by = sy - 22;
        ctx.fillStyle = "#24124f"; ctx.fillRect(bx, by + 8, 1, 8);
        ctx.fillStyle = "#24124f"; for (let y = -7; y <= 7; y++) for (let x = -6; x <= 6; x++) if ((x * x) / 40 + (y * y) / 56 <= 1) ctx.fillRect(bx + x, by + y, 1, 1);
        ctx.fillStyle = "#ff5d6c"; for (let y = -6; y <= 6; y++) for (let x = -5; x <= 5; x++) if ((x * x) / 28 + (y * y) / 42 <= 1) ctx.fillRect(bx + x, by + y, 1, 1);
        ctx.fillStyle = "#ffb3bb"; ctx.fillRect(bx - 3, by - 4, 2, 3);
      }
      ctx.fillStyle = "rgba(255,255,255,.7)";
      for (let i = 0; i < 3; i++) ctx.fillRect(sx - 1 + Math.round(Math.sin(state.t * 5 + i * 2) * 2), sy - 10 - i * 4 - Math.floor((state.t * 10 + i * 3) % 3), 1 + (i % 2), 1 + (i % 2));
      // Arrival burst.
      for (let i = sparks.length - 1; i >= 0; i--) { const s = sparks[i]; s.life -= dt; if (s.life <= 0) { sparks.splice(i, 1); continue; } s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 30 * dt; ctx.fillStyle = s.c; ctx.globalAlpha = Math.min(1, s.life * 2); ctx.fillRect(Math.round(s.x), Math.round(s.y), 2, 2); ctx.globalAlpha = 1; }

      // DOM overlays follow the camera.
      const scale = canvas.clientHeight / SCENE_H;
      for (let t = 1; t <= 6; t++) {
        const el = lineRefs.current[t - 1];
        if (!el) continue;
        const y = (markerY(t) - state.cam) * scale;
        el.style.transform = "translateY(" + y.toFixed(1) + "px)";
        el.style.opacity = y < -10 || y > canvas.clientHeight + 10 ? "0" : "1";
      }
      if (tagRef.current) tagRef.current.style.transform = "translate(" + ((sx + 8) * scale).toFixed(1) + "px," + ((sy - 8) * scale).toFixed(1) + "px)";
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [W, seed, up]);

  return <div className="dv-scene" aria-hidden="true">
    <canvas ref={canvasRef} className="dv-canvas" />
    {names.map((name, i) => <div key={name} className="dv-zone" style={{ color: ZONE_COLORS[i], ["--zc" as string]: ZONE_COLORS[i] }} ref={(el) => { lineRefs.current[i] = el; }}><span>{name}</span></div>)}
    <div className={"dv-flytag" + (tag ? " on" : "")} ref={tagRef}><b>{tag}</b></div>
  </div>;
}

function width(): number {
  if (typeof window === "undefined") return 140;
  return Math.max(110, Math.min(360, Math.round((SCENE_H * window.innerWidth) / Math.max(1, window.innerHeight))));
}
