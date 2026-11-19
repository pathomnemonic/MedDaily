/** Look-and-feel settings. Colors are driven by two CSS variables (`--hue`, `--sat`); presets are just hue/vibrancy pairs. */
export interface ThemeSettings {
  preset: string;      // preset id, or "custom" when the sliders were moved
  hue: number;         // 0–360, the base color of backgrounds and panels
  sat: number;         // 0.2–1.4 vibrancy multiplier
  particles: boolean;  // floating medical icons in the background
  stars: boolean;      // twinkling stars
  depth: "chunky" | "soft";
  corners: "round" | "sharp";
  scale: number;       // 0.9 / 1 / 1.12 interface size
  mascot: boolean;
}
export interface ThemePreset { id: string; name: string; hue: number; sat: number }
export const PRESETS: ThemePreset[] = [
  { id: "scrub", name: "Scrub Teal", hue: 178, sat: 0.9 },
  { id: "ocean", name: "Deep Ocean", hue: 214, sat: 1 },
  { id: "violet", name: "Midnight Violet", hue: 262, sat: 1 },
  { id: "berry", name: "Berry Crush", hue: 322, sat: 0.95 },
  { id: "forest", name: "Forest Ward", hue: 142, sat: 0.8 },
  { id: "ember", name: "Ember", hue: 14, sat: 0.95 },
  { id: "graphite", name: "Graphite", hue: 215, sat: 0.18 }
];
export const DEFAULT_THEME: ThemeSettings = { preset: "scrub", hue: 178, sat: 0.9, particles: true, stars: true, depth: "chunky", corners: "round", scale: 1, mascot: true };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
/** Accept anything (old saves, imports) and return a safe, complete theme. */
export function normalizeTheme(input: Partial<ThemeSettings> | undefined | null): ThemeSettings {
  const t = { ...DEFAULT_THEME, ...(input ?? {}) };
  return {
    preset: typeof t.preset === "string" ? t.preset : "custom",
    hue: clamp(Number(t.hue) || 0, 0, 360),
    sat: clamp(Number(t.sat) || DEFAULT_THEME.sat, 0.15, 1.4),
    particles: t.particles !== false, stars: t.stars !== false,
    depth: t.depth === "soft" ? "soft" : "chunky",
    corners: t.corners === "sharp" ? "sharp" : "round",
    scale: [0.9, 1, 1.12].includes(Number(t.scale)) ? Number(t.scale) : 1,
    mascot: t.mascot !== false
  };
}
export const swatch = (hue: number, sat: number) => "linear-gradient(135deg,hsl(" + hue + " " + Math.round(55 * sat) + "% 38%),hsl(" + hue + " " + Math.round(50 * sat) + "% 16%))";

export function applyTheme(input: Partial<ThemeSettings> | undefined | null): void {
  if (typeof document === "undefined") return;
  const t = normalizeTheme(input), root = document.documentElement;
  root.style.setProperty("--hue", String(t.hue));
  root.style.setProperty("--sat", String(t.sat));
  root.style.setProperty("--ui-scale", String(t.scale));
  root.dataset.particles = t.particles ? "on" : "off";
  root.dataset.stars = t.stars ? "on" : "off";
  root.dataset.depth = t.depth;
  root.dataset.corners = t.corners;
  root.dataset.mascot = t.mascot ? "on" : "off";
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", "hsl(" + t.hue + " " + Math.round(50 * t.sat) + "% 12%)");
}
