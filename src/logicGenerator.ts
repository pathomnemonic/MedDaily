import { seeded, shuffle } from "./lib";

export type DeductionConstraint =
  | { kind: "person-location"; suspect: number; location: number; expected: boolean }
  | { kind: "person-object"; suspect: number; object: number; expected: boolean }
  | { kind: "object-location"; object: number; location: number; expected: boolean };

type Assignment = { locations: number[]; objects: number[] };
export interface GeneratedDeductionCase {
  title: string;
  briefing: string;
  suspects: string[];
  locations: string[];
  objects: string[];
  clues: string[];
  solution: { suspect: string; location: string; object: string }[];
  constraints: DeductionConstraint[];
}

const PERMUTATIONS = [
  [0, 1, 2], [0, 2, 1], [1, 0, 2],
  [1, 2, 0], [2, 0, 1], [2, 1, 0]
];
const NAME_POOL = [
  "Dr. Chen", "Dr. Okafor", "Dr. Patel", "Dr. Morales", "Dr. Ibrahim", "Dr. Park",
  "Dr. Singh", "Dr. Reyes", "Dr. Brooks", "Dr. Nair", "Dr. Carter", "Dr. Kim",
  "Dr. Foster", "Dr. Lin", "Dr. Adeyemi", "Dr. Bennett", "Dr. Shah", "Dr. Vale"
];
const LOCATION_POOL = [
  "Imaging Suite", "Research Lab", "Intensive Care", "Simulation Center", "Outpatient Clinic",
  "Operating Room", "Pharmacy", "Pathology Lab", "Lecture Hall", "Recovery Bay",
  "Ward Three", "Cardiac Lab", "Endoscopy Suite", "Pediatrics Unit", "Trauma Bay", "Neurology Clinic"
];
const OBJECT_POOL = [
  "Portable ultrasound", "Specimen tray", "Reflex hammer", "Bronchoscope", "Stethoscope",
  "Otoscope", "Pulse oximeter", "Medication chart", "ECG lead set", "Microscope",
  "Infusion pump", "Airway kit", "Laryngoscope", "Blood gas syringe", "Bone model", "Surgical clamp"
];
const CASE_TITLES = [
  "The Overnight Handoff", "The Equipment Audit", "The Missing Specimen", "The Simulation Mix-Up",
  "The Late Consult", "The Research Relay", "The Ward Mystery", "The Conference Shuffle",
  "The After-Hours Round", "The Lost Instrument"
];

function allAssignments(): Assignment[] {
  return PERMUTATIONS.flatMap((locations) =>
    PERMUTATIONS.map((objects) => ({ locations: [...locations], objects: [...objects] }))
  );
}

function satisfies(assignment: Assignment, clue: DeductionConstraint): boolean {
  if (clue.kind === "person-location") {
    return (assignment.locations[clue.suspect] === clue.location) === clue.expected;
  }
  if (clue.kind === "person-object") {
    return (assignment.objects[clue.suspect] === clue.object) === clue.expected;
  }
  const suspect = assignment.objects.indexOf(clue.object);
  return (assignment.locations[suspect] === clue.location) === clue.expected;
}

export function countDeductionSolutions(constraints: DeductionConstraint[]): number {
  return allAssignments().filter((assignment) => constraints.every((clue) => satisfies(assignment, clue))).length;
}

function clueText(clue: DeductionConstraint, suspects: string[], locations: string[], objects: string[]): string {
  if (clue.kind === "person-location") {
    return suspects[clue.suspect] + (clue.expected ? " was in the " : " was not in the ") + locations[clue.location] + ".";
  }
  if (clue.kind === "person-object") {
    return suspects[clue.suspect] + (clue.expected ? " had the " : " did not have the ") + objects[clue.object] + ".";
  }
  return "The " + objects[clue.object] + (clue.expected ? " was in the " : " was not in the ") + locations[clue.location] + ".";
}

export function generateDeductionCase(seed: number): GeneratedDeductionCase {
  const random = seeded((seed ^ 0x5f3759df) >>> 0);
  const suspects = shuffle(NAME_POOL, random).slice(0, 3);
  const locations = shuffle(LOCATION_POOL, random).slice(0, 3);
  const objects = shuffle(OBJECT_POOL, random).slice(0, 3);
  const assignments = allAssignments();
  const solution = assignments[Math.floor(random() * assignments.length)];

  const allClues: DeductionConstraint[] = [];
  for (let suspect = 0; suspect < 3; suspect++) {
    for (let location = 0; location < 3; location++) {
      allClues.push({ kind: "person-location", suspect, location, expected: solution.locations[suspect] === location });
    }
    for (let object = 0; object < 3; object++) {
      allClues.push({ kind: "person-object", suspect, object, expected: solution.objects[suspect] === object });
    }
  }
  for (let object = 0; object < 3; object++) {
    const assignedSuspect = solution.objects.indexOf(object);
    for (let location = 0; location < 3; location++) {
      allClues.push({ kind: "object-location", object, location, expected: solution.locations[assignedSuspect] === location });
    }
  }

  let remaining = assignments;
  const available = shuffle(allClues, random);
  const selected: DeductionConstraint[] = [];
  while (remaining.length > 1 && available.length) {
    const ranked = available
      .map((clue) => ({ clue, next: remaining.filter((candidate) => satisfies(candidate, clue)) }))
      .filter((entry) => entry.next.length > 0 && entry.next.length < remaining.length)
      .sort((a, b) => a.next.length - b.next.length);
    if (!ranked.length) break;
    const top = ranked.slice(0, Math.min(4, ranked.length));
    const chosen = top[Math.floor(random() * top.length)];
    selected.push(chosen.clue);
    remaining = chosen.next;
    available.splice(available.indexOf(chosen.clue), 1);
  }

  // Keep the generated puzzle solvable even if a future clue type is added incorrectly.
  if (remaining.length !== 1 || selected.length < 5) {
    for (const clue of available) {
      if (!selected.includes(clue) && satisfies(solution, clue)) selected.push(clue);
      if (selected.length >= 7 && countDeductionSolutions(selected) === 1) break;
    }
  }

  const solutionRows = suspects.map((suspect, index) => ({
    suspect,
    location: locations[solution.locations[index]],
    object: objects[solution.objects[index]]
  }));
  const title = CASE_TITLES[Math.floor(random() * CASE_TITLES.length)] + " #" + String((seed >>> 0) % 997 + 1);
  return {
    title,
    briefing: "Three clinicians each used a different hospital area and a different piece of equipment. Reconstruct the handoff by matching every clinician to one location and one item.",
    suspects,
    locations,
    objects,
    clues: selected.map((clue) => clueText(clue, suspects, locations, objects)),
    solution: solutionRows,
    constraints: selected
  };
}
