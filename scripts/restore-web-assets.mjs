// `capacitor-assets generate` also rewrites the web manifest and writes an icons/ folder meant for other setups.
// MedDaily's web manifest is hand-maintained, so put it back and remove the extras.
import { execSync } from "node:child_process";
import { rmSync, existsSync } from "node:fs";

if (existsSync("icons")) rmSync("icons", { recursive: true, force: true });
for (const file of ["public/manifest.webmanifest", "public/meddaily-icon.svg"]) {
  try { execSync(`git checkout -- ${file}`, { stdio: "ignore" }); } catch { /* not a git checkout or unchanged */ }
}
console.log("Web manifest restored; native icons and splash screens are in ios/ and android/.");
