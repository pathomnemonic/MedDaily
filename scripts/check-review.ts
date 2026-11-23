/**
 * Reads reviewers' returned spreadsheets (CSV files saved into review/returned/) and reports what they decided.
 * Run: npx tsx scripts/check-review.ts   (writes review/returned-summary.md; changes no game content)
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cell = "", quoted = false;
  const src = text.replace(/^﻿/, "");
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") { if (ch === "\r" && src[i + 1] === "\n") i++; row.push(cell); cell = ""; if (row.some((c) => c !== "")) rows.push(row); row = []; }
    else cell += ch;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

const dir = "review/returned";
if (!existsSync(dir)) { console.log("No review/returned folder yet. Save returned CSV files there."); process.exit(0); }
const files = readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".csv"));
const counts = { OK: 0, FIX: 0, REMOVE: 0, BLANK: 0, UNKNOWN: 0 };
const problems: string[] = [], fixes: string[] = [], removals: string[] = [];
const seen = new Map<string, string>();
for (const f of files) {
  const rows = parseCsv(readFileSync(dir + "/" + f, "utf8"));
  const head = rows[0] ?? [];
  const col = (needle: string) => head.findIndex((h) => h.toLowerCase().startsWith(needle));
  const idI = col("item id"), gameI = col("game"), keyI = col("keyed"), vI = col("verdict"), cI = col("correction"), sI = col("source you used"), cmI = col("comment"), whoI = col("reviewer");
  if (idI < 0 || vI < 0) { problems.push(f + ": not a MedDaily review sheet (missing Item ID or VERDICT column)"); continue; }
  for (const r of rows.slice(1)) {
    const id = r[idI]; if (!id) continue;
    const verdict = (r[vI] ?? "").trim().toUpperCase();
    if (verdict === "") { counts.BLANK++; continue; }
    if (verdict === "OK" || verdict === "FIX" || verdict === "REMOVE") counts[verdict]++;
    else { counts.UNKNOWN++; problems.push(f + ": " + id + " has verdict '" + r[vI] + "' (use OK, FIX or REMOVE)"); continue; }
    if (seen.has(id) && seen.get(id) !== verdict) problems.push("Conflict: " + id + " is " + seen.get(id) + " in one sheet and " + verdict + " in " + f);
    seen.set(id, verdict);
    const line = "- `" + id + "` (" + r[gameI] + ") keyed answer: " + (r[keyI] ?? "") + (r[cI] ? "\n  - correction: " + r[cI] : "") + (r[sI] ? "\n  - source: " + r[sI] : "") + (r[cmI] ? "\n  - comment: " + r[cmI] : "") + (r[whoI] ? "\n  - reviewer: " + r[whoI] : "");
    if (verdict === "FIX") { fixes.push(line); if (!r[cI]) problems.push(f + ": " + id + " is FIX but has no correction"); }
    if (verdict === "REMOVE") removals.push(line);
  }
}
const md = ["# Returned review summary", "", "Files read: " + (files.join(", ") || "none"), "",
  "| Verdict | Items |", "|---|---|", ...Object.entries(counts).map(([k, v]) => "| " + k + " | " + v + " |"), "",
  "## Problems with the returned sheets", ...(problems.length ? problems.map((p) => "- " + p) : ["None."]), "",
  "## Items to remove (" + removals.length + ")", ...(removals.length ? removals : ["None."]), "",
  "## Items to fix (" + fixes.length + ")", ...(fixes.length ? fixes : ["None."]), ""].join("\n");
writeFileSync("review/returned-summary.md", md);
console.log(counts, problems.length + " problem(s). Wrote review/returned-summary.md");
