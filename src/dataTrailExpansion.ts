import { branchSets } from "./dataBranch";
import { microbePacks } from "./data";
import { trailPackOk } from "./trailLogic";
import type { TrailPack } from "./trailLogic";
import { hashSeed, seeded, shuffle } from "./lib";

const shortForm = (name: string): string => {
  const special: Record<string, string> = {
    "Herpes simplex virus 1": "HSV1",
    "Varicella-zoster virus": "VZV",
    "Cytomegalovirus": "CMV",
    "Epstein-Barr virus": "EBV",
    "Human papillomavirus": "HPV",
    "Human immunodeficiency virus": "HIV",
    "Hepatitis B virus": "HBV",
    "Hepatitis C virus": "HCV",
    "Respiratory syncytial virus": "RSV"
  };
  if (special[name]) return special[name];
  const parts = name.replace(/[^A-Za-z0-9 ]/g, " ").trim().split(/\s+/);
  if (parts.length === 1) return parts[0].toUpperCase().slice(0, 13);
  const form = (parts[0][0] + parts[1]).toUpperCase();
  return form.slice(0, 13);
};

const groups = new Map<string, { label: string; words: string[] }>();
for (const leaf of branchSets.microbe) {
  const key = leaf.path.slice(0, 3).join("/");
  const label = leaf.path.slice(1, 3).join(" ");
  const group = groups.get(key) ?? { label, words: [] };
  const word = shortForm(leaf.name);
  if (word.length >= 3 && word.length <= 13 && !group.words.includes(word)) group.words.push(word);
  groups.set(key, group);
}

/**
 * Seeded themed sets from the curated organism taxonomy. Every pack stays within one
 * microbiology family; the short forms are standard organism abbreviations or compact genus/species forms.
 * The runtime keeps only packs whose Strands-style board generator proves playable.
 */
export const themeTrailYearCandidates: TrailPack[] = (() => {
  const candidates: TrailPack[] = [];
  const seen = new Set<string>();
  for (const [groupKey, group] of [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    if (group.words.length < 4) continue;
    for (let variant = 0; variant < 100; variant++) {
      const random = seeded(hashSeed(groupKey + "|theme-trail|" + variant));
      const count = 4 + Math.floor(random() * 3);
      const words = shuffle(group.words, random).slice(0, Math.min(count, group.words.length));
      if (words.length < 4 || !words.some((word) => word.length >= 5)) continue;
      const key = words.slice().sort().join("|");
      if (seen.has(key)) continue;
      seen.add(key);
      candidates.push({ name: group.label + " · set " + String(variant + 1).padStart(2, "0"), words });
    }
  }
  return candidates;
})();

/** The published daily pool is validated lazily and capped at 365 distinct themed boards. */
let validatedTrailYearPacks: TrailPack[] | null = null;
export const getThemeTrailYearPacks = (): TrailPack[] => (validatedTrailYearPacks ??= (() => {
  const valid: TrailPack[] = [];
  const names = new Set<string>();
  const signatures = new Set<string>();
  for (const pack of [...microbePacks, ...themeTrailYearCandidates]) {
    const signature = pack.words.map((word) => word.toUpperCase().replace(/[^A-Z]/g, "")).sort().join("|");
    if (names.has(pack.name) || signatures.has(signature) || !trailPackOk(pack)) continue;
    names.add(pack.name);
    signatures.add(signature);
    valid.push(pack);
    if (valid.length === 365) break;
  }
  return valid;
})());
