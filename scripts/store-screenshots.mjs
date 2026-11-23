// Captures store-listing screenshots from a running copy of the app (default http://localhost:4180/, e.g. `npx vite preview --port 4180`).
// Needs Playwright (`npm i -D playwright` or a global install). Usage: node scripts/store-screenshots.mjs [baseUrl]
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
import { mkdirSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:4180/";
const sizes = [
  { dir: "store/screenshots/ios-6.7in-1290x2796", width: 430, height: 932, scale: 3 },
  { dir: "store/screenshots/android-phone-1080x1920", width: 360, height: 640, scale: 3 }
];
const shots = [
  ["home", async () => {}],
  ["trivia-rumble", async (p) => { await open(p, "Trivia Rumble"); await p.locator(".tr-go").click(); await p.waitForTimeout(500); }],
  ["stat-word", async (p) => { await open(p, "Stat Word"); await p.keyboard.type("ACUTE"); await p.keyboard.press("Enter"); await p.waitForTimeout(900); await p.keyboard.type("PULSE"); await p.keyboard.press("Enter"); await p.waitForTimeout(900); }],
  ["letter-lab", async (p) => { await open(p, "Letter Lab"); await p.locator(".ll-go").click(); await p.waitForTimeout(1600); }],
  ["association-blitz", async (p) => { await open(p, "Association Blitz"); await p.locator(".am-card").nth(0).click(); await p.locator(".am-card").nth(5).click(); await p.waitForTimeout(900); }],
  ["riddle-lab", async (p) => { await open(p, "Riddle Lab"); await p.locator(".rd-options button").first().click(); await p.waitForTimeout(700); }],
  ["deep-scan", async (p) => { await open(p, "Deep Scan"); await p.waitForTimeout(1800); }],
  ["quad-squad", async (p) => { await open(p, "Quad Squad"); }]
];

async function open(page, name) {
  await page.locator(`.game-card[aria-label^="Play ${name}"]`).first().click();
  await page.waitForTimeout(1500);
}

const browser = await chromium.launch();
for (const size of sizes) {
  mkdirSync(size.dir, { recursive: true });
  for (const [name, setup] of shots) {
    const ctx = await browser.newContext({ viewport: { width: size.width, height: size.height }, deviceScaleFactor: size.scale, hasTouch: true, isMobile: true });
    const page = await ctx.newPage();
    await page.goto(base);
    await page.locator(".splash").click({ force: true }).catch(() => {});
    await page.waitForTimeout(1200);
    await setup(page);
    await page.screenshot({ path: `${size.dir}/${name}.jpg`, type: "jpeg", quality: 86 });
    await ctx.close();
  }
}
await browser.close();
console.log("Screenshots written to store/screenshots/");
