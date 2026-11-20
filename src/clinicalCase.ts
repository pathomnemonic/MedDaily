import { hashSeed, seeded, shuffle } from "./lib";
import { clinicalThemes, type ClinicalCondition } from "./dataClinicalCases";

/** One clue as a constraint: patient–cause (pc), patient–finding (pf), or cause–finding (cf, only ever negative). */
export interface ClinicalConstraint { kind: "pc" | "pf" | "cf"; a: number; b: number; expected: boolean }
export interface ClinicalClue { text: string; /** Plain-language decoding of any clinical shorthand in the clue. */ decode?: string }
export interface ClinicalCase {
  id: string; title: string; intro: string; causeName: string; findingName: string;
  patients: string[]; causes: string[]; findings: string[];
  clues: ClinicalClue[];
  solution: { patient: string; cause: string; finding: string; why: string }[];
  constraints: ClinicalConstraint[];
}

const PERMS = [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]];
interface Assignment { cause: number[]; finding: number[] }
const ALL: Assignment[] = PERMS.flatMap((cause) => PERMS.map((finding) => ({ cause: [...cause], finding: [...finding] })));

function satisfies(x: Assignment, k: ClinicalConstraint): boolean {
  if (k.kind === "pc") return (x.cause[k.a] === k.b) === k.expected;
  if (k.kind === "pf") return (x.finding[k.a] === k.b) === k.expected;
  const patient = x.finding.indexOf(k.b);
  return (x.cause[patient] === k.a) === k.expected;
}
export const countClinicalSolutions = (constraints: ClinicalConstraint[]): number => ALL.filter((x) => constraints.every((k) => satisfies(x, k))).length;

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Builds a deterministic case: three look-alike conditions, shuffled columns, and a minimal clue set with exactly one solution. */
export function generateClinicalCase(seed: number): ClinicalCase {
  const rnd = seeded(hashSeed("clinical|" + seed));
  rnd(); rnd();
  const theme = clinicalThemes[Math.floor(rnd() * clinicalThemes.length)];
  const picked: ClinicalCondition[] = shuffle(theme.conditions, rnd).slice(0, 3);
  const causeOrder = shuffle([0, 1, 2], rnd), findingOrder = shuffle([0, 1, 2], rnd);
  const causes = causeOrder.map((i) => picked[i].cause);
  const findings = findingOrder.map((i) => picked[i].finding);
  const solution: Assignment = { cause: picked.map((_, p) => causeOrder.indexOf(p)), finding: picked.map((_, p) => findingOrder.indexOf(p)) };

  const pool: ClinicalConstraint[] = [];
  for (let p = 0; p < 3; p++) {
    for (let j = 0; j < 3; j++) {
      pool.push({ kind: "pc", a: p, b: j, expected: solution.cause[p] === j });
      pool.push({ kind: "pf", a: p, b: j, expected: solution.finding[p] === j });
    }
  }
  for (let ci = 0; ci < 3; ci++) for (let fi = 0; fi < 3; fi++) {
    const patient = solution.finding.indexOf(fi);
    if (solution.cause[patient] !== ci) pool.push({ kind: "cf", a: ci, b: fi, expected: false });
  }

  let remaining = ALL;
  const available = shuffle(pool, rnd);
  const chosen: ClinicalConstraint[] = [];
  while (remaining.length > 1 && available.length) {
    const ranked = available
      .map((k) => ({ k, next: remaining.filter((x) => satisfies(x, k)) }))
      .filter((e) => e.next.length > 0 && e.next.length < remaining.length)
      .sort((a, b) => a.next.length - b.next.length);
    if (!ranked.length) break;
    const top = ranked.slice(0, Math.min(5, ranked.length));
    const pickOne = top[Math.floor(rnd() * top.length)];
    chosen.push(pickOne.k);
    remaining = pickOne.next;
    available.splice(available.indexOf(pickOne.k), 1);
  }

  const altOf = (causeIdx: number) => picked[causeOrder[causeIdx]].alt;
  const clues: ClinicalClue[] = chosen.map((k) => {
    if (k.kind === "pc") {
      const patient = picked[k.a].patient;
      const cause = causes[k.b];
      const useAlt = rnd() < 0.5;
      const named = useAlt ? altOf(k.b) : cause;
      const text = k.expected
        ? "The patient with " + patient + " had an illness caused by " + named + "."
        : "The patient with " + patient + " did not have an illness caused by " + named + ".";
      return { text, decode: useAlt ? cap(altOf(k.b)) + " = " + cause + "." : undefined };
    }
    if (k.kind === "pf") {
      const patient = picked[k.a].patient;
      const f = findings[k.b];
      return { text: "The patient with " + patient + (k.expected ? " had " : " did not have ") + f + "." };
    }
    const useAlt = rnd() < 0.5;
    const named = useAlt ? altOf(k.a) : causes[k.a];
    return { text: "The illness caused by " + named + " did not show " + findings[k.b] + ".", decode: useAlt ? cap(altOf(k.a)) + " = " + causes[k.a] + "." : undefined };
  });

  return {
    id: theme.id,
    title: theme.title + " #" + String((seed >>> 0) % 997 + 1),
    intro: theme.intro,
    causeName: theme.causeName,
    findingName: theme.findingName,
    patients: picked.map((x) => cap(x.patient)),
    causes: causes.map(cap),
    findings: findings.map(cap),
    clues,
    solution: picked.map((x, p) => ({ patient: cap(x.patient), cause: cap(causes[solution.cause[p]]), finding: cap(findings[solution.finding[p]]), why: x.why })),
    constraints: chosen,
  };
}
