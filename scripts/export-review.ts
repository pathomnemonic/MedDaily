/**
 * Builds the specialist-review packets: every clinical statement the games make, one row per item, grouped by suggested specialty.
 * Run: npx tsx scripts/export-review.ts   (writes review/; safe to re-run, it overwrites)
 */
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { diagnosisCases, nextStepCases, triageCases, labPrompts, pairsBank, connectionPuzzles } from "../src/data";
import { triviaQuestions } from "../src/dataArcade";
import { deepDivePromptsExpanded } from "../src/dataDeepDiveExtra";
import { hoofPrompts } from "../src/dataHoofbeats";
import { blackoutCases } from "../src/dataBlackout";
import { clinicalThemes } from "../src/dataClinicalCases";
import { crossCriteria } from "../src/dataCrossmatch";
import { microbeLeaves, drugLeaves } from "../src/dataBranch";
import { scaleItems } from "../src/dataScale";
import { riddles } from "../src/dataRiddles";
import { higherLowerPairs, scrambleWordsExtended } from "../src/dataExtra";
import { crosswordBank } from "../src/dataCrossword";

type Risk = "High" | "Medium" | "Low";
interface Row { key: string; game: string; bank: string; risk: Risk; specialty: string; check: string; content: string; answer: string; support: string }

/** Keyword routing to a suggested specialty. A hint for sending packets to the right reviewer, not a clinical classification. */
const SPECIALTIES: Record<string, string[]> = {
  "Cardiology": ["heart", "cardiac", "myocard", "arrhythm", "atrial", "ventricular", "aort", "valve", "ecg", "qrs", "angina", "troponin", "coronary", "endocarditis", "pericard", "hypertension", "heart failure", "brugada", "qt "],
  "Pulmonology": ["lung", "pulmon", "asthma", "copd", "pneumo", "bronch", "pleur", "respirat", "oxygen", "intubat", "tubercul", "sarcoid", "cough", "dyspnea", "embol"],
  "Gastroenterology & hepatology": ["liver", "hepat", "bowel", "colon", "gastr", "pancrea", "bile", "biliary", "crohn", "colitis", "esophag", "ulcer", "cirrhosis", "celiac", "diarrhea", "ileus", "appendic", "gallbladder", "cholecyst"],
  "Nephrology & urology": ["kidney", "renal", "nephro", "glomerul", "dialysis", "urinary", "bladder", "prostat", "creatinine", "proteinuria", "hematuria", "urolog", "testic", "electrolyte", "hyperkal", "hyponatr"],
  "Endocrinology & metabolism": ["diabet", "thyroid", "insulin", "adrenal", "cortisol", "pituitary", "glucose", "hormone", "cushing", "addison", "calcium", "parathyroid", "obes", "ketoacid"],
  "Hematology & oncology": ["anemia", "leukemia", "lymphoma", "cancer", "carcinoma", "tumor", "myeloma", "platelet", "coagul", "thrombo", "hemophil", "sickle", "chemotherapy", "metasta", "neutropen", "transfusion", "melanoma"],
  "Infectious disease": ["infection", "bacter", "virus", "viral", "fungal", "antibiotic", "sepsis", "hiv", "malaria", "streptococ", "staphylococ", "meningitis", "pathogen", "culture", "microb", "parasit", "vaccin", "herpes", "hepatitis"],
  "Neurology": ["stroke", "seizure", "epilep", "neuro", "brain", "cerebr", "parkinson", "dementia", "alzheimer", "migraine", "sclerosis", "myasthenia", "guillain", "nerve", "spinal", "cranial", "neuropathy", "csf"],
  "Psychiatry & toxicology": ["depress", "psych", "bipolar", "schizo", "anxiety", "lithium", "overdose", "toxic", "poison", "withdrawal", "serotonin", "antidepress", "antipsychotic", "delirium", "opioid", "naloxone"],
  "Obstetrics, gynecology & pediatrics": ["pregnan", "preeclam", "obstet", "postpartum", "placent", "fetal", "uterus", "ovarian", "cervical", "newborn", "neonat", "infant", "child", "pediatric", "kawasaki", "congenital", "menstru", "ectopic"],
  "Emergency & critical care": ["shock", "resuscit", "cardiac arrest", "trauma", "anaphyla", "airway", "ventilat", "vasopressor", "triage", "hemorrhage", "burn", "overdose", "intensive", "icu", "acls"],
  "Rheumatology, dermatology & musculoskeletal": ["arthritis", "lupus", "gout", "vasculitis", "skin", "rash", "psoria", "dermat", "bone", "fracture", "osteo", "joint", "muscle", "scleroderma", "myositis", "melanoma"],
  "Pharmacology": ["drug", "dose", "mg", "inhibitor", "blocker", "agonist", "antagonist", "statin", "warfarin", "heparin", "antibiotic", "adverse", "interaction", "pharmaco", "receptor", "cytochrome", "cyp"],
  "Anatomy, physiology & basic science": ["nerve", "artery", "muscle", "bone", "embryo", "enzyme", "pathway", "cell", "gene", "chromosome", "histology", "membrane", "hormone", "anatomy", "physiology", "biochem", "foramen", "plexus"]
};
function routeSpecialty(text: string, hint?: string): string {
  if (hint) {
    const h = hint.toLowerCase();
    for (const name of Object.keys(SPECIALTIES)) if (name.toLowerCase().split(/[ &,]+/).some((w) => w.length > 4 && h.includes(w.slice(0, 5)))) return name;
  }
  const t = " " + text.toLowerCase() + " ";
  let best = "General / unrouted", top = 0;
  for (const [name, words] of Object.entries(SPECIALTIES)) {
    let n = 0;
    for (const w of words) if (t.includes(w)) n++;
    if (n > top) { top = n; best = name; }
  }
  return best;
}

const rows: Row[] = [];
const add = (r: Omit<Row, "specialty"> & { specialty?: string }, route: string, hint?: string) =>
  rows.push({ ...r, specialty: r.specialty ?? routeSpecialty(route, hint) });
const clean = (s: unknown) => String(s ?? "").replace(/\s+/g, " ").trim();

for (const d of diagnosisCases) add({ key: "dx:" + d.id, game: "Differential", bank: "Diagnosis cases", risk: "Medium",
  check: "Do the clues point to this diagnosis, are the distractors plausible but wrong, is the explanation accurate?",
  content: d.clues.map((c, i) => (i + 1) + ") " + clean(c)).join(" ") + " | Options: " + d.options.join("; "), answer: d.answer, support: clean(d.explanation) + (d.source ? " [" + clean(d.source) + "]" : "") }, d.title + " " + d.answer + " " + d.clues.join(" "));

for (const n of nextStepCases) add({ key: "ns:" + n.id, game: "Differential family (next-step cases)", bank: "Next-step management", risk: "High",
  check: "Is the keyed next step correct per current guidance, and are the other options clearly wrong? Name the guideline and year.",
  content: clean(n.vignette) + " Q: " + clean(n.question) + " | Options: " + n.options.map((o, i) => String.fromCharCode(65 + i) + ") " + o).join("; "), answer: String.fromCharCode(65 + n.answer) + ") " + n.options[n.answer], support: clean(n.explanation) + (n.source ? " [" + clean(n.source) + "]" : "") }, n.vignette + " " + n.options[n.answer], n.specialty);

for (const t of triageCases as { id: string; title: string; scenario: string; steps: string[] }[]) add({ key: "tr:" + t.id, game: "Triage", bank: "Triage sequences", risk: "High",
  check: "Is the order of steps right for the first minutes of care? Is anything unsafe, missing or in the wrong place?",
  content: clean(t.scenario), answer: t.steps.map((s, i) => (i + 1) + ". " + s).join(" "), support: "" }, t.title + " " + t.scenario + " " + t.steps.join(" "));

for (const q of triviaQuestions) add({ key: "tq:" + q.id, game: "Trivia Rumble", bank: "Trivia questions (" + q.category + ")", risk: "Medium",
  check: "Is the keyed answer correct and the only correct option? Is the explanation right?",
  content: clean(q.question) + " | Options: " + q.options.map((o, i) => String.fromCharCode(65 + i) + ") " + o).join("; "), answer: String.fromCharCode(65 + q.answer) + ") " + q.options[q.answer], support: clean(q.explanation) },
  q.question + " " + q.options.join(" "), q.category === "clinical" ? undefined : undefined);

for (const p of hoofPrompts) add({ key: "hf:" + p.id, game: "Hoofbeats", bank: "Most-common-answer prompts", risk: "High",
  check: "Are these answers valid for the prompt? Are the percentages a fair approximation of how common each is among clinicians' answers? Missing common answers?",
  content: clean(p.prompt) + " (" + clean(p.scope) + ")", answer: [...p.answers].sort((a, b) => b.pct - a.pct).map((a) => a.name + " " + a.pct + "%").join("; "), support: clean(p.note) }, p.prompt + " " + p.answers.map((a) => a.name).join(" "), p.scope);

for (const p of deepDivePromptsExpanded as { id: string; prompt: string; scope: string; explanation: string; answers: { answer: string; tier: number }[] }[]) add({ key: "ds:" + p.id, game: "Deep Scan", bank: "Rarity-tier prompts", risk: "Medium",
  check: "Is each answer valid for the prompt? Are the rarity tiers (1 = very common, 6 = rare) sensible? Any wrong or missing common answers?",
  content: clean(p.prompt) + " (" + clean(p.scope) + ")", answer: [1, 2, 3, 4, 5, 6].map((t) => "T" + t + ": " + p.answers.filter((a) => a.tier === t).map((a) => a.answer).join(", ")).filter((x) => !x.endsWith(": ")).join(" | "), support: clean(p.explanation) }, p.prompt + " " + p.answers.map((a) => a.answer).join(" "), p.scope);

for (const [i, b] of blackoutCases.entries()) add({ key: "bo:" + i, game: "Blackout Chart", bank: "Case reports", risk: "Medium",
  check: "Is the vignette clinically coherent for this diagnosis (findings, labs, treatment)? Does it contradict itself?",
  content: clean(b.text), answer: b.title + (b.aliases.length ? " (also: " + b.aliases.join(", ") + ")" : ""), support: "" }, b.title + " " + b.text);

for (const th of clinicalThemes) for (const [i, c] of th.conditions.entries()) add({ key: "cf:" + th.id + ":" + i, game: "Casefile Logic", bank: "Case themes: " + th.title, risk: "High",
  check: "Is this presentation caused by this cause, and is the finding the right clinching test or sign? Is the teaching point correct?",
  content: "Patient with " + clean(c.patient) + " | Decoded cause phrase: " + clean(c.alt), answer: "Cause: " + clean(c.cause) + " | Finding: " + clean(c.finding), support: clean(c.why) }, c.patient + " " + c.cause + " " + c.finding);

for (const cr of crossCriteria) add({ key: "cm:" + cr.id, game: "Crossmatch", bank: "Drug groups and properties", risk: "High",
  check: cr.kind === "class" ? "Is every drug listed a member of this class? Any obvious members missing that would make a grid cell ambiguous?" : "Does every drug listed truly have this property (as commonly taught)? Any exceptions that would mislead?",
  content: cr.label + " (" + cr.kind + ")", answer: cr.members.join(", "), support: "" }, cr.label + " " + cr.members.join(" "));

for (const [set, leaves] of [["Microbes", microbeLeaves], ["Drugs", drugLeaves]] as const) for (const l of leaves) add({ key: "bl:" + set + ":" + l.name, game: "Branch Lab", bank: "Taxonomy: " + set, risk: "Medium",
  check: "Is the lineage correct and is the clue accurate for this organism or drug?", content: clean(l.clue), answer: l.path.join(" > "), support: "" }, l.name + " " + l.clue + " " + l.path.join(" "), set === "Microbes" ? "Infectious" : "Pharmacology");

for (const s of scaleItems) add({ key: "sl:" + s.id, game: "Scale Lab", bank: "Sizes and quantities (" + s.cat + ")", risk: "Medium",
  check: "Is the typical value right to within a reasonable range? Is the fact accurate?", content: s.name, answer: String(s.value) + " (" + s.cat + " base units)", support: clean(s.fact) }, s.name + " " + s.fact);

for (const l of labPrompts) add({ key: "lb:" + l.id, game: "Labline", bank: "Reference values", risk: "High",
  check: "Is the number correct (and unit)? Is the tolerance band sensible for a clinician's estimate? Cite the source if it differs.",
  content: clean(l.prompt), answer: l.value + " " + l.unit + (l.tolerance ? " (±" + l.tolerance + ")" : ""), support: clean(l.context) + (l.source ? " [" + clean(l.source) + "]" : "") }, l.prompt + " " + l.context);

for (const [i, h] of (higherLowerPairs as { a: string; av: number; b: string; bv: number; unit: string; explanation: string; source?: string }[]).entries()) add({ key: "hl:" + i, game: "What Has More?", bank: "Comparisons", risk: "High",
  check: "Are both numbers right and comparable (same unit, same definition)? Could a reasonable clinician argue the other way?",
  content: clean(h.a) + " (" + h.av + " " + h.unit + ") vs " + clean(h.b) + " (" + h.bv + " " + h.unit + ")", answer: h.av === h.bv ? "Tie" : h.av > h.bv ? "First is greater" : "Second is greater", support: clean(h.explanation) + (h.source ? " [" + clean(h.source) + "]" : "") }, h.a + " " + h.b + " " + h.explanation);

for (const r of riddles) add({ key: "rd:" + r.id, game: "Riddle Lab", bank: "Riddles (" + r.kind + ")", risk: "Medium",
  check: "Do all four clues describe this answer correctly, and only this answer by the last clue?", content: r.clues.map((c, i) => (i + 1) + ") " + clean(c)).join(" "), answer: r.answer, support: "" }, r.answer + " " + r.clues.join(" "));

for (const [term, meaning] of pairsBank as [string, string][]) add({ key: "pb:" + term, game: "Association Blitz", bank: "Term and association pairs", risk: "Low",
  check: "Is the association accurate and distinctive?", content: term, answer: meaning, support: "" }, term + " " + meaning);

for (const [i, board] of (connectionPuzzles as { category: string; words: string[]; hint: string }[][]).entries()) for (const g of board) add({ key: "qs:" + i + ":" + g.category, game: "Quad Squad", bank: "Connection groups", risk: "Low",
  check: "Do all four items belong to this category, and is the category unambiguous?", content: g.category, answer: g.words.join(", "), support: clean(g.hint) }, g.category + " " + g.words.join(" "));

for (const [word, clue] of scrambleWordsExtended) add({ key: "an:" + word, game: "Anagram Sprint", bank: "Terms and definitions", risk: "Low",
  check: "Is the definition accurate for the term?", content: clean(clue), answer: word, support: "" }, word + " " + clue);

for (const [word, clue] of crosswordBank) add({ key: "xw:" + word, game: "Crossword Clinic", bank: "Crossword clues", risk: "Low",
  check: "Is the clue accurate and the answer unambiguous?", content: clean(clue), answer: word, support: "" }, word + " " + clue);

// dedupe identical keys defensively
const seen = new Set<string>();
const unique = rows.filter((r) => (seen.has(r.key) ? false : (seen.add(r.key), true)));

const order: Record<Risk, number> = { High: 0, Medium: 1, Low: 2 };
unique.sort((a, b) => order[a.risk] - order[b.risk] || a.game.localeCompare(b.game) || a.key.localeCompare(b.key));

const HEADER = ["Item ID", "Game", "Bank", "Risk", "Suggested specialty", "What to check", "Content", "Keyed answer", "Our explanation / source", "VERDICT (OK / FIX / REMOVE)", "Correction or better wording", "Source you used (guideline + year)", "Comment", "Reviewer initials"];
const esc = (s: string) => '"' + s.replace(/"/g, '""') + '"';
const toCsv = (list: Row[]) => "﻿" + [HEADER.map(esc).join(","), ...list.map((r) => [r.key, r.game, r.bank, r.risk, r.specialty, r.check, r.content, r.answer, r.support, "", "", "", "", ""].map(esc).join(","))].join("\r\n") + "\r\n";
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

rmSync("review/by-specialty", { recursive: true, force: true });
mkdirSync("review/by-specialty", { recursive: true });
const groups = new Map<string, Row[]>();
for (const r of unique) groups.set(r.specialty, [...(groups.get(r.specialty) ?? []), r]);
writeFileSync("review/PRIORITY-high-risk.csv", toCsv(unique.filter((r) => r.risk === "High")));
rmSync("review/ALL-items.csv", { force: true });
const summary: { name: string; file: string; total: number; high: number }[] = [];
for (const [name, list] of [...groups.entries()].sort((a, b) => b[1].length - a[1].length)) {
  const file = "by-specialty/" + slug(name) + ".csv";
  writeFileSync("review/" + file, toCsv(list));
  summary.push({ name, file, total: list.length, high: list.filter((r) => r.risk === "High").length });
}
const byGame = new Map<string, { n: number; risk: Risk }>();
for (const r of unique) byGame.set(r.game, { n: (byGame.get(r.game)?.n ?? 0) + 1, risk: r.risk });
writeFileSync("review/summary.json", JSON.stringify({ generated: new Date().toISOString().slice(0, 10), total: unique.length, specialties: summary, games: Object.fromEntries(byGame) }, null, 2));
console.log("rows:", unique.length, "| high-risk:", unique.filter((r) => r.risk === "High").length);
console.table(summary.map((s) => ({ specialty: s.name, items: s.total, high: s.high })));
console.table([...byGame.entries()].map(([game, v]) => ({ game, items: v.n, risk: v.risk })));
