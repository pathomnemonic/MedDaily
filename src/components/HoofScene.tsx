import { useEffect, useRef, useState } from "react";
import { seeded } from "../lib";

/**
 * Hoofbeats' full-screen pixel scene: a pasture with horses, a zebra, a path and a pond at the bottom, and a sky that deepens
 * into stars and planets at the top. The capsule hangs from balloons and rises as answers score, so common answers lift you
 * higher. Everything is generated in code at about 300 pixels tall and scaled up.
 */
const SCENE_H = 300;
const WORLD_H = 780;
const GROUND = WORLD_H - 150;
const SPRITE_SCREEN_Y = 168;
const START_Y = WORLD_H - 120;
const END_Y = 74;

type RGB = [number, number, number];
const hex = (h: string): RGB => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
const SPRITE = ["  OOOOO  ", " OppPPPO ", "OppPPPPPO", "OpPPPPPPO", "OPPPPPPPO", "OOOOOOOOO", "OWWWWWWwO", "OWEWWWEwO", "OWWWWWWwO", "OWWWWWwwO", "OWWWWwwwO", " OwwwwwwO", "  OOOOO  "];
const SPRITE_COLORS: Record<string, string> = { O: "#24124f", P: "#ff5d8f", p: "#ffa6c4", W: "#f6f6ff", w: "#c3c6e6", E: "#24124f" };

function buildWorld(W: number, seed: number): { canvas: HTMLCanvasElement; horizon: number[] } {
  const rnd = seeded(seed ^ 0x2545f491);
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = WORLD_H;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(W, WORLD_H);
  const horizon = Array.from({ length: W }, (_, x) => GROUND + Math.round(3 * Math.sin(x * 0.07 + 1) + 2 * Math.sin(x * 0.19)));
  const put = (x: number, y: number, c: RGB) => { const i = (y * W + x) * 4; img.data[i] = c[0]; img.data[i + 1] = c[1]; img.data[i + 2] = c[2]; img.data[i + 3] = 255; };
  const band = (y0: number, y1: number, pal: string[], mask?: (x: number, y: number) => boolean) => {
    const cols = pal.map(hex);
    for (let y = y0; y < y1; y++) {
      const t = (y - y0) / Math.max(1, y1 - y0 - 1);
      const pos = t * (cols.length - 1);
      const i = Math.min(cols.length - 2, Math.floor(pos));
      const f = pos - i;
      const mix = f < 0.38 ? 0 : f > 0.62 ? 1 : (f - 0.38) / 0.24;
      for (let x = 0; x < W; x++) {
        if (mask && !mask(x, y)) continue;
        put(x, y, mix > (BAYER[y & 3][x & 3] + 0.5) / 16 ? cols[i + 1] : cols[i]);
      }
    }
  };
  band(0, GROUND + 10, ["#0a0830", "#171a64", "#2a4fb0", "#4f9fe0", "#9bd4f5", "#e2f4ff"]);
  band(GROUND - 6, WORLD_H, ["#69c25c", "#3a9a47", "#27733a"], (x, y) => y >= horizon[x]);
  ctx.putImageData(img, 0, 0);

  const dot = (x: number, y: number, c: string, w = 1, h = 1, a = 1) => { ctx.globalAlpha = a; ctx.fillStyle = c; ctx.fillRect(Math.round(x), Math.round(y), w, h); ctx.globalAlpha = 1; };
  const R = (a: number, b: number) => a + Math.floor(rnd() * (b - a + 1));
  const disc = (cx: number, cy: number, r: number, c: string, a = 1) => { for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r + 1) dot(cx + x, cy + y, c, 1, 1, a); };

  // Stars, a ringed planet and a moon in the dark upper sky.
  for (let i = 0; i < 120; i++) dot(R(0, W - 1), R(0, 260), ["#ffffff", "#cfe6ff", "#ffe9a8"][R(0, 2)], 1, 1, 0.45 + rnd() * 0.55);
  disc(Math.round(W * 0.72), 70, 12, "#ff9fc2"); disc(Math.round(W * 0.72) - 3, 66, 5, "#ffd0e2", 0.55);
  for (let x = -22; x <= 22; x++) { const y = Math.round(Math.sqrt(Math.max(0, 1 - (x * x) / 484)) * 4); dot(Math.round(W * 0.72) + x, 74 + y - 4, "#fff4d6", 1, 1, 0.9); }
  disc(Math.round(W * 0.18), 150, 6, "#e9edf7"); disc(Math.round(W * 0.18) + 2, 148, 2, "#c5cbe0");

  // Distant tree line.
  for (let x = 0; x < W; x += 7) { const r = R(7, 11); disc(x + R(0, 4), horizon[Math.min(W - 1, x)] - 1, r, "#1f5a2b"); disc(x + 2, horizon[Math.min(W - 1, x)] - 4, Math.max(3, r - 4), "#2c8a3d", 0.9); }
  // A red barn with a white X door.
  const bx = Math.round(W * 0.78), by = horizon[Math.min(W - 1, bx)] - 14;
  dot(bx, by, "#b3322e", 26, 16); dot(bx - 2, by - 5, "#7a1f1c", 30, 6); dot(bx + 8, by + 5, "#fff4d6", 10, 11); dot(bx + 8, by + 5, "#b3322e", 10, 1); dot(bx + 12, by + 5, "#b3322e", 2, 11);
  // Winding dirt path from the bottom edge up to the horizon.
  const pathX = Math.round(W * 0.5);
  for (let y = WORLD_H - 1; y >= GROUND + 4; y--) {
    const t = (WORLD_H - y) / (WORLD_H - GROUND);
    const cx = pathX + Math.sin((WORLD_H - y) * 0.05) * 16 * (1 - t * 0.5);
    const hw = Math.max(2, Math.round(11 * (1 - t) + 2));
    dot(cx - hw, y, "#b98a56", hw * 2); dot(cx - hw, y, "#8f6a3a", 1); dot(cx + hw - 1, y, "#8f6a3a", 1);
    if (rnd() < 0.55) dot(cx - hw + R(1, hw * 2 - 2), y, "#d9b27a");
  }
  // Pond with lily pads.
  const px = Math.round(W * 0.22), py = WORLD_H - 40;
  for (let y = -13; y <= 13; y++) for (let x = -34; x <= 34; x++) { const d = (x * x) / 1156 + (y * y) / 169; if (d <= 1.15) dot(px + x, py + y, d > 1 ? "#2c6a3a" : y < -4 ? "#7cc9f4" : "#2f86c9"); }
  for (let i = 0; i < 6; i++) dot(px - 24 + i * 9, py - 5 + (i % 3) * 3, "#9fe0f8", 5, 1);
  for (const [lx, ly] of [[-12, 2], [10, -2], [18, 5]]) { disc(px + lx, py + ly, 3, "#4caf50"); dot(px + lx, py + ly, "#2f86c9", 3, 1); }
  // Flowers, mushrooms and a short fence.
  for (let i = 0; i < 70; i++) { const x = R(1, W - 2), y = R(GROUND + 14, WORLD_H - 2); if (Math.abs(x - pathX) < 14) continue; dot(x, y, ["#ff7fb0", "#ffe066", "#ffffff", "#c9a0ff"][R(0, 3)], 1, 1); if (rnd() < 0.3) dot(x, y + 1, "#2c8a3d"); }
  for (let i = 0; i < 6; i++) { const x = R(4, W - 8), y = R(GROUND + 40, WORLD_H - 6); dot(x, y, "#e5484d", 4, 2); dot(x + 1, y + 2, "#fff4d6", 2, 3); dot(x + 1, y, "#fff4d6", 1, 1); }
  for (let x = Math.round(W * 0.62); x < W - 4; x += 12) { dot(x, GROUND + 22, "#8a5a2b", 2, 10); dot(x, GROUND + 24, "#a8743b", 12, 1); dot(x, GROUND + 28, "#a8743b", 12, 1); }
  return { canvas, horizon };
}

function drawHorse(ctx: CanvasRenderingContext2D, x: number, y: number, body: string, mane: string, t: number, phase: number, zebra = false) {
  const graze = Math.sin(t * 0.6 + phase) > 0.35;
  const px = Math.round(x), py = Math.round(y);
  const f = (cx: number, cy: number, w: number, h: number, c: string) => { ctx.fillStyle = c; ctx.fillRect(px + cx, py + cy, w, h); };
  f(-2, 0, 3, 5, mane); // tail
  f(0, 0, 14, 6, body);
  for (const lx of [1, 4, 10, 13]) f(lx, 6, 2, 6, body);
  for (const lx of [1, 4, 10, 13]) f(lx, 11, 2, 1, "#2a1a0a"); // hooves
  f(12, -4, 4, 6, body); // neck
  if (graze) { f(14, 1, 5, 3, body); f(18, 2, 2, 2, mane); } else { f(14, -6, 5, 3, body); f(18, -5, 1, 1, "#fff"); f(14, -7, 2, 2, mane); }
  f(12, -5, 2, 4, mane); // mane
  if (zebra) { ctx.fillStyle = "#1a1a1a"; for (let i = 1; i < 13; i += 3) ctx.fillRect(px + i, py, 1, 6); for (let i = 0; i < 4; i++) ctx.fillRect(px + 12, py - 4 + i * 2 - 0, 3, 1); for (const lx of [1, 4, 10, 13]) { ctx.fillRect(px + lx, py + 8, 2, 1); } }
}

export default function HoofScene({ frac, seed }: { frac: number; seed: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fracRef = useRef(frac);
  fracRef.current = frac;
  const [W, setW] = useState(width());

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
    const { canvas: world, horizon } = buildWorld(W, seed);
    const reduce = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    const rnd = seeded(seed + 31);
    const clouds = Array.from({ length: 11 }, () => ({ x: rnd() * W, y: 160 + rnd() * 460, w: 16 + Math.floor(rnd() * 22), v: 1.5 + rnd() * 3 }));
    const birds = Array.from({ length: 5 }, () => ({ x: rnd() * W, y: 330 + rnd() * 180, v: 5 + rnd() * 4 }));
    const flies = Array.from({ length: 7 }, (_, i) => ({ cx: rnd() * W, cy: GROUND + 30 + rnd() * 80, ph: i * 1.7, c: ["#ff7fb0", "#ffe066", "#8fd7ff"][i % 3] }));
    const horses = [
      { x: W * 0.16, y: horizon[Math.floor(W * 0.16)] + 26, body: "#8a5a2b", mane: "#2a1a0a", ph: 0.2, zebra: false },
      { x: W * 0.34, y: horizon[Math.floor(W * 0.34)] + 14, body: "#c98a4a", mane: "#5a3a1a", ph: 2.1, zebra: false },
      { x: W * 0.6, y: horizon[Math.floor(W * 0.6)] + 40, body: "#e8e2d2", mane: "#8a8578", ph: 4.0, zebra: false },
      { x: W * 0.84, y: horizon[Math.floor(Math.min(W - 1, W * 0.84))] + 26, body: "#f4f4f4", mane: "#1a1a1a", ph: 1.2, zebra: true },
    ];
    const sparks: { x: number; y: number; vx: number; vy: number; life: number; c: string }[] = [];
    const state = { sprite: START_Y, cam: WORLD_H - SCENE_H, t: 0, prev: fracRef.current };
    const spriteX = Math.round(W / 2);
    let raf = 0, last = performance.now();

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); last = now; state.t += dt;
      const f = fracRef.current;
      if (f > state.prev + 0.001) { for (let i = 0; i < 18; i++) { const a = (i / 18) * Math.PI * 2; sparks.push({ x: spriteX, y: state.sprite - state.cam, vx: Math.cos(a) * (14 + rnd() * 22), vy: Math.sin(a) * (14 + rnd() * 22) - 6, life: 0.7 + rnd() * 0.4, c: ["#ffd54a", "#ff7fb0", "#7dffd0"][i % 3] }); } }
      state.prev = f;
      const target = START_Y + (END_Y - START_Y) * Math.min(1, f);
      state.sprite += (target - state.sprite) * (reduce ? 1 : 1 - Math.exp(-dt * 1.4));
      const camTarget = Math.max(0, Math.min(WORLD_H - SCENE_H, state.sprite - SPRITE_SCREEN_Y));
      state.cam += (camTarget - state.cam) * (reduce ? 1 : 1 - Math.exp(-dt * 2));
      const cam = Math.round(state.cam);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(world, 0, -cam);

      // Clouds drift sideways.
      for (const c of clouds) { c.x += c.v * dt; if (c.x > W + 40) c.x = -c.w - 10; const sy = Math.round(c.y - cam); if (sy < -8 || sy > SCENE_H) continue; ctx.fillStyle = "rgba(255,255,255,.92)"; ctx.fillRect(Math.round(c.x), sy, c.w, 3); ctx.fillRect(Math.round(c.x) + 4, sy - 2, c.w - 9, 2); ctx.fillRect(Math.round(c.x) + 9, sy - 4, Math.max(4, c.w - 20), 2); ctx.fillStyle = "rgba(170,205,240,.9)"; ctx.fillRect(Math.round(c.x) + 2, sy + 3, c.w - 4, 1); }
      // Birds.
      for (const b of birds) { b.x += b.v * dt; if (b.x > W + 6) b.x = -6; const sy = Math.round(b.y - cam); if (sy < -4 || sy > SCENE_H) continue; const up = Math.floor(state.t * 4 + b.x) % 2 === 0; ctx.fillStyle = "#1a2a4a"; ctx.fillRect(Math.round(b.x), sy + (up ? 0 : 1), 1, 1); ctx.fillRect(Math.round(b.x) + 1, sy + (up ? 1 : 0), 1, 1); ctx.fillRect(Math.round(b.x) + 2, sy + (up ? 0 : 1), 1, 1); ctx.fillRect(Math.round(b.x) + 3, sy + (up ? 1 : 0), 1, 1); }
      // Pasture life: grazing horses, the zebra and butterflies.
      if (GROUND - cam < SCENE_H + 20) {
        for (const h of horses) drawHorse(ctx, h.x, h.y - cam, h.body, h.mane, state.t, h.ph, h.zebra);
        for (const b of flies) { const bx = b.cx + Math.sin(state.t * 0.9 + b.ph) * 16, by = b.cy + Math.sin(state.t * 1.7 + b.ph) * 7 - cam; ctx.fillStyle = b.c; ctx.fillRect(Math.round(bx), Math.round(by), 2, 1); if (Math.floor(state.t * 6 + b.ph) % 2) ctx.fillRect(Math.round(bx), Math.round(by) - 1, 1, 1); }
      }
      // Capsule hanging from three balloons.
      const sy = Math.round(state.sprite - state.cam);
      const sway = Math.round(Math.sin(state.t * 1.6) * 2);
      const sx = spriteX + Math.round(Math.sin(state.t * 2.2));
      const balloons: [number, number, string][] = [[-9 + sway, -34, "#3fd9a5"], [sway, -40, "#a98bff"], [9 + sway, -34, "#ff7fb0"]];
      for (const [dx, dy, c] of balloons) {
        ctx.fillStyle = "#24124f";
        { const x0 = sx, y0 = sy - 8, x1 = sx + dx, y1 = sy + dy + 6, n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)); for (let k = 0; k <= n; k++) ctx.fillRect(Math.round(x0 + ((x1 - x0) * k) / n), Math.round(y0 + ((y1 - y0) * k) / n), 1, 1); }
        ctx.fillStyle = "#24124f"; for (let y = -6; y <= 6; y++) for (let x = -5; x <= 5; x++) if ((x * x) / 30 + (y * y) / 44 <= 1) ctx.fillRect(sx + dx + x, sy + dy + y, 1, 1);
        ctx.fillStyle = c; for (let y = -5; y <= 5; y++) for (let x = -4; x <= 4; x++) if ((x * x) / 20 + (y * y) / 30 <= 1) ctx.fillRect(sx + dx + x, sy + dy + y, 1, 1);
        ctx.fillStyle = "rgba(255,255,255,.7)"; ctx.fillRect(sx + dx - 2, sy + dy - 3, 1, 2);
      }
      SPRITE.forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== " ") { ctx.fillStyle = SPRITE_COLORS[ch]; ctx.fillRect(sx - 4 + x, sy - 6 + y, 1, 1); } }));
      for (let i = sparks.length - 1; i >= 0; i--) { const s = sparks[i]; s.life -= dt; if (s.life <= 0) { sparks.splice(i, 1); continue; } s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 28 * dt; ctx.fillStyle = s.c; ctx.globalAlpha = Math.min(1, s.life * 2); ctx.fillRect(Math.round(s.x), Math.round(s.y), 2, 2); ctx.globalAlpha = 1; }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [W, seed]);

  return <canvas ref={canvasRef} className="hn-canvas" aria-hidden="true" />;
}

function width(): number {
  if (typeof window === "undefined") return 140;
  return Math.max(110, Math.min(360, Math.round((SCENE_H * window.innerWidth) / Math.max(1, window.innerHeight))));
}
