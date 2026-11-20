import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { connectionPuzzles, diagnosisCases, labPrompts, medleWords, microbePacks, pairsBank } from "./data";
import { glyphPatterns, higherLowerPairs, ladderDictionary, scrambleWordsExtended as scrambleWords, spellingHivePuzzles, wordLadders } from "./dataExtra";
import { hashSeed, nonogramRuns, normalize, scoreWord, seeded, shuffle, type GameId } from "./lib";
import { triviaCategories, triviaQuestions, type TriviaCategory, type TriviaCategoryId } from "./dataArcade";
import { bodyTapPoints, labRange, labScore, labStreakBonus, associationPairPoints, associationTimeBonus, deepDiveAnswerAward, generateMedicalLadder, letterWordPoints, makeLetterGrid, matchAnswer, rumbleNextTurn, traceGridWord, transformNonogram, triviaRumbleResult } from "./arcadeLogic";
import { deepDivePromptsExpanded as deepDivePrompts } from "./dataDeepDiveExtra";
import { anteriorMuscles, posteriorMuscles } from "./dataBodyMuscles";
import { mimeDeck } from "./dataMime";
import ScaleLab from "./ScaleLab";
import BranchLab from "./BranchLab";
import CasefileClinical from "./CasefileClinical";
import Crossmatch from "./Crossmatch";
import BlackoutChart from "./BlackoutChart";
import Hoofbeats from "./Hoofbeats";
import { fiveLetterWords } from "./dataFiveLetter";
import { medicalRungWords } from "./dataRungs";
import { riddles, riddleOptions } from "./dataRiddles";
import { makeCrossword } from "./crosswordGen";
import { makeTrailPuzzle, trailPackOk } from "./trailLogic";
import { extendStrandsPath, readStrandsPath } from "./strandsLogic";
import { createPortal } from "react-dom";
import DiveScene, { ZONE_COLORS } from "./components/DiveScene";
import "@fontsource/pixelify-sans/latin-400.css";
import "@fontsource/pixelify-sans/latin-600.css";
import "@fontsource/silkscreen/latin-400.css";
import "@fontsource/silkscreen/latin-700.css";
import { reward } from "./juice";
import { sfx } from "./audio";
import { vibrate } from "./haptics";

type Done = (score: number, maxScore: number, perfect: boolean, share?: string) => void;
type Specialty = "general" | "internal" | "familymed" | "neurology" | "cardiology" | "emergency" | "criticalcare" | "anesthesia" | "surgery" | "orthopedics" | "urology" | "otolaryngology" | "ophthalmology" | "pediatrics" | "obgyn" | "psychiatry" | "infectious" | "allergy" | "nephrology" | "pulmonology" | "endocrine" | "dermatology" | "rheumatology" | "hemeonc" | "gastro" | "geriatrics" | "radiology" | "anatomy" | "pathology" | "pharmacology" | "biostatistics";
interface Props { seed: number; onDone: Done; specialty?: Specialty }
export function GameBoard({ game, seed, onDone, specialty = "general", practice = false, onExit }: Props & { game: GameId; practice?: boolean; onExit?: () => void }) {
  switch (game) {
    case "medle": return <Medle seed={seed} onDone={onDone} specialty={specialty} />;
    case "connections": return <Connections seed={seed} onDone={onDone} specialty={specialty} />;
    case "diagnosis": return <DoctorDle seed={seed} onDone={onDone} specialty={specialty} />;
    case "labline": return <Labline seed={seed} onDone={onDone} specialty={specialty} />;
    case "pairs": return <MemoryMatch seed={seed} onDone={onDone} specialty={specialty} />;
    case "splice": return <AnagramSprint seed={seed} onDone={onDone} specialty={specialty} />;
    case "glyph": return <CellSketch seed={seed} onDone={onDone} practice={practice} />;
    case "higher": return <HigherLower seed={seed} onDone={onDone} onExit={onExit} />;
    case "ladder": return <WordLadder seed={seed} onDone={onDone} />;
    case "hive": return <SpellingHive seed={seed} onDone={onDone} />;
    case "casefile": return <CasefileClinical seed={seed} onDone={onDone} onExit={onExit} practice={practice} />;
    case "horses": return <Hoofbeats seed={seed} onDone={onDone} onExit={onExit} />;
    case "blackout": return <BlackoutChart seed={seed} onDone={onDone} onExit={onExit} />;
    case "cross": return <Crossmatch seed={seed} onDone={onDone} onExit={onExit} />;
    case "branch": return <BranchLab seed={seed} onDone={onDone} onExit={onExit} />;
    case "scale": return <ScaleLab seed={seed} onDone={onDone} onExit={onExit} />;
    case "dive": return <DeepDive seed={seed} onDone={onDone} onExit={onExit} />;
    case "trivia": return <TriviaRumble seed={seed} onDone={onDone} />;
    case "trail": return <ThemeTrail seed={seed} onDone={onDone} specialty={specialty} />;
    case "crossword": return <CrosswordClinic seed={seed} onDone={onDone} onExit={onExit} />;
    case "riddle": return <RiddleLab seed={seed} onDone={onDone} />;
    case "bodymap": return <BodyMapBlitz seed={seed} onDone={onDone} />;
    case "mime": return <MimeTime seed={seed} onDone={onDone} />;
    case "lettergrid": return <LetterGridGame seed={seed} onDone={onDone} />;
  }
}

const SPECIALTY_INDEX: Partial<Record<Specialty, Partial<Record<string, number[]>>>> = {
  neurology: { diagnosis:[1,4,5,12,13,19,120,121,122,123,124,125], nextstep:[2,16,120,121,122,123,124], connections:[3,10,72,73,78], labline:[18,19,20], pairs:[12,13], microbe:[0,5], triage:[4] },
  cardiology: { diagnosis:[7,16,17,126,127,128,129,209,210], nextstep:[3,13,126,127,128,129,209,210], connections:[0,1,4,74,79,115,121], labline:[1,3,4,17], pairs:[0,1,2,3], triage:[10] },
  emergency: { diagnosis:[0,4,5,7,10,16,17,18,19,125,126,130,153,154,155,163,164,167,180,189,193,194,195,196,197,198,200,201,209,210,211,212,213,218], nextstep:[0,1,2,4,7,8,10,11,12,13,14,18,19,125,126,130,146,153,154,155,163,164,167,170,171,177,178,179,180,189,193,194,195,196,197,198,200,201,209,210,212,213,218], connections:[4,5,7,8,9,73,75,85,89,90,92,100,101,104,106,109,110,114,115,116,119,121], triage:[0,1,2,4,5,6,7,9,10] },
  criticalcare: { diagnosis:[4,5,7,10,11,16,17,18,19], nextstep:[0,1,2,4,7,10,11,12,13,14,18,19], connections:[4,5,7,9,11], labline:[0,1,2,3,4,5,11,17,22], triage:[0,1,2,4,5,6,7,9,10,11] },
  anesthesia: { diagnosis:[5,16,17,178,179], nextstep:[0,2,4,12,14,178,179], connections:[0,1,7,96,100], labline:[0,1,2,4,17], pairs:[0,1,2,3,4,5], triage:[0,4,5,6,9,11] },
  surgery: { diagnosis:[0,5,17,18,160,161,162,163,164,165,166,167], nextstep:[8,9,14,17,160,161,162,163,164,165,166,167], connections:[4,8,9,92,93,100,101], triage:[3,8,9] },
  orthopedics: { diagnosis:[15,16,152,153,154,155], nextstep:[8,153,154], connections:[3,9,85,89,90], pairs:[12,13,14,15,16,17], triage:[9] },
  urology: { diagnosis:[8,9,148,149,150,151], nextstep:[14,148,149,150,151], connections:[4,11,84,87,89,90,91], labline:[2,3,4,12,13], triage:[0] },
  otolaryngology: { diagnosis:[18,19], nextstep:[12], connections:[5,9], triage:[0,11] },
  ophthalmology: { diagnosis:[3,12,159], nextstep:[19,159], connections:[3,10,88], pairs:[12,13,17,18], triage:[2] },
  pediatrics: { diagnosis:[8,9,11,14,18,19,100,101,102,103,104,105,206,218], nextstep:[18,100,101,102,103,104,206,218], connections:[4,5,8,62,67,112,120], labline:[14,15], triage:[11] },
  obgyn: { diagnosis:[0,134,135,136,137,138,139], nextstep:[5,9,16,134,135,136,137,138,139], connections:[8,76,77,80], triage:[3,8] },
  psychiatry: { diagnosis:[1,2,7,12,13,190,191,192,193,194,195,196,197,198,199], nextstep:[2,6,190,191,192,193,194,195,196,197,198,199], connections:[7,10,105,106,107,109], labline:[21], triage:[4] },
  infectious: { diagnosis:[8,11,14,16,18,19,118,119,155,169,171,181,182,183,184,185,186,187,188,189], nextstep:[11,12,118,119,155,169,171,181,182,183,184,185,186,187,188,189], connections:[5,7,9,65,67,94,102,103,104,110,111], microbe:[0,1,2,3,4,5,6,7], triage:[6,7] },
  allergy: { diagnosis:[16,146,147], nextstep:[4,146,147], connections:[5,7,83,87], pairs:[0,1,2,3], triage:[1] },
  nephrology: { diagnosis:[8,9,10,11,106,107,108,109,172,173,174,175], nextstep:[0,11,14,17,105,106,107,108,109,172,173,174,175], connections:[4,11,63,68,95,98], labline:[2,3,4,5,7,11,12,13,14,15,18,19,20,21], triage:[5] },
  pulmonology: { diagnosis:[18,19,112,113], nextstep:[12,112,113], connections:[5,9,64,66], labline:[1,22,27], triage:[0,6] },
  endocrine: { diagnosis:[7,9,10,15,130,131,132,133,176,177], nextstep:[0,14,17,130,131,132,133,176,177], connections:[2,11,75,81,96,99], labline:[8,9,10,23], triage:[5] },
  dermatology: { diagnosis:[14,15,16,140,141,142,143,144,145], nextstep:[4,140,141,142,143,144,145], connections:[4,5,9,82,83,89,91], labline:[24], triage:[1] },
  rheumatology: { diagnosis:[3,15,110,111,158], nextstep:[6,110,111,158], connections:[4,9,10,64,70,88], pairs:[30,31,32,33,34,35], triage:[1] },
  hemeonc: { diagnosis:[10,11,180,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218], nextstep:[7,14,180,200,201,202,203,204,205,206,207,208,209,210,211,212,213,214,215,216,217,218], connections:[4,5,11,102,104,110,112,113,114,115,116,117,118,119,120,121], labline:[14,15,16,17], pairs:[42,43,44,45], triage:[6] },
  gastro: { diagnosis:[17,114,115,116,117,168,169,170,171,214,219], nextstep:[11,114,115,116,117,165,166,168,169,171,205,214,219], connections:[4,12,65,69,71,92,93,94,97,101,118,121], labline:[24], pairs:[35], triage:[6] },
  geriatrics: { diagnosis:[6,7,10,17,156,157], nextstep:[7,13,14,156,157], connections:[4,11,86,88,89], labline:[12,13,14,15,16,17], triage:[0,2,6] },
  radiology: { diagnosis:[4,5,6,12,17,18], nextstep:[1,10], connections:[3,9,10], triage:[2,7] },
  anatomy: { connections:[3,9], pairs:[12,13,14,15,16,17], microbe:[0], triage:[] },
  pathology: { diagnosis:[8,9,10,11,14,15,16,17,18,19], connections:[4,5,6,11], pairs:[42,43,44,45] },
  pharmacology: { nextstep:[0,4,7,8,9,10,11,12,13,14], connections:[0,1,7], pairs:[0,1,2,3,4,5,6,7,8,9,10,11], triage:[1,4,5,6] },
  biostatistics: { labline:[8,9,10,11,17,21,22,23], connections:[4,11] }
};

function pick<T>(items: readonly T[], seed: number, specialty: Specialty, key: string): T {
  const allowed = SPECIALTY_INDEX[specialty]?.[key];
  const valid = allowed?.map((i) => items[i]).filter((v): v is T => v !== undefined);
  const pool = valid?.length ? valid : items;
  return pool[Math.abs(seed) % pool.length];
}
function Finish({ title, detail, score, children }: { title: string; detail: string; score?: string; children?: ReactNode }) {
  return <div className="finish-panel"><div className="finish-spark">✦</div><h3>{title}</h3><p>{detail}</p>{score && <strong className="finish-score">{score}</strong>}{children}</div>;
}
function SectionLabel({ children }: { children: ReactNode }) { return <div className="section-label">{children}</div>; }

const DIVE_TIERS = ["Skin deep", "Subcutaneous", "Fascia", "Muscle", "Bone", "Marrow"];
const DIVE_SECONDS = 25;
const DIVE_FLAVOR = ["Everyone's first thought.", "A little off the beaten path.", "Past the obvious.", "Not many reach for that one.", "A deep cut. Respect.", "One in a marrow. Almost nobody gets here."];
interface DiveResult { answer: string | null; tier: number | null; points: number; gamble?: "won" | "lost" }
const DIVE_GAMBLE_SECONDS = 10;

/** Deep Scan: seven open questions, 25 seconds each, one typed answer per question. Rarer (less obvious) valid answers scan deeper into the tissue. */
function DeepDive({ seed, onDone, onExit }: Props & { onExit?: () => void }) {
  const prompts = useMemo(() => shuffle(deepDivePrompts, seeded(seed + 811)).slice(0, 7), [seed]);
  const [round, setRound] = useState(0);
  const [seconds, setSeconds] = useState(DIVE_SECONDS);
  const [entry, setEntry] = useState("");
  const [locked, setLocked] = useState(false);
  const [results, setResults] = useState<DiveResult[]>([]);
  const [message, setMessage] = useState("Type one answer. The less obvious (but valid) it is, the deeper the scan reaches.");
  const [finished, setFinished] = useState(false);
  const [shake, setShake] = useState(0);
  const [gambling, setGambling] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const done = useRef(false);
  const item = prompts[round];
  const current = results[round];
  const total = results.reduce((sum, r) => sum + r.points, 0);

  useEffect(() => { if (!locked && !finished) input.current?.focus({ preventScroll: true }); }, [round, locked, finished]);
  useEffect(() => {
    if (locked || finished) return;
    const interval = window.setInterval(() => setSeconds((v) => Math.max(0, v - 1)), 1000);
    return () => window.clearInterval(interval);
  }, [round, locked, finished]);
  useEffect(() => {
    if (locked || finished) return;
    if (seconds > 0 && seconds <= 5) sfx("tick");
    if (seconds === 0) {
      sfx("whoosh");
      if (gambling) { loseGamble("Time ran out on the deeper scan. "); return; }
      setResults((all) => [...all.slice(0, round), { answer: null, tier: null, points: 0 }]);
      setLocked(true);
      setMessage("Scan timed out on this one.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, locked, finished, round]);
  /** A failed gamble costs half of the points already banked on this scan. */
  const loseGamble = (lead: string) => {
    setResults((all) => all.map((r, i) => i === round ? { ...r, points: Math.floor(r.points / 2), gamble: "lost" as const } : r));
    setGambling(false); setLocked(true);
    setMessage(lead + "Half of this scan's points were lost.");
  };
  const goDeeper = () => {
    if (!locked || !current?.answer || (current.tier ?? 0) >= 6 || current.gamble) return;
    setGambling(true); setLocked(false); setEntry(""); setSeconds(DIVE_GAMBLE_SECONDS);
    sfx("whoosh");
    setMessage("Go deeper: find a rarer answer in " + DIVE_GAMBLE_SECONDS + " seconds, or lose half of this scan's points.");
  };

  const submit = () => {
    if (locked || finished || !entry.trim()) return;
    const found = matchAnswer(entry, item.answers);
    if (!found) {
      // An open question: an answer we do not list is not called wrong, it just cannot be scored.
      reward(false);
      setShake((n) => n + 1);
      setMessage("Not on our list yet. It may still be right, but we can't score it. Try another answer while time remains.");
      return;
    }
    if (gambling) {
      if (found.match.tier > (current?.tier ?? 0)) {
        const upgraded = deepDiveAnswerAward(found.match.tier, 0);
        setResults((all) => all.map((r, i) => i === round ? { answer: found.match.answer, tier: found.match.tier, points: upgraded, gamble: "won" as const } : r));
        setGambling(false); setLocked(true);
        reward(true, null, "+" + (upgraded - (current?.points ?? 0)));
        sfx("badge");
        setMessage("Deeper! Gamble won.");
      } else {
        reward(false);
        loseGamble(found.match.answer === current?.answer ? "Same layer. " : "That one is no deeper. ");
      }
      return;
    }
    const points = deepDiveAnswerAward(found.match.tier, 0);
    setResults((all) => [...all.slice(0, round), { answer: found.match.answer, tier: found.match.tier, points }]);
    setLocked(true);
    reward(true, null, "+" + points);
    if (found.match.tier >= 5) window.setTimeout(() => sfx("badge"), 400);
    setMessage(found.fuzzy ? "Counted as “" + found.match.answer + "” (typo forgiven)." : "");
  };
  const surface = () => {
    if (locked || finished) return;
    if (gambling) { setGambling(false); setLocked(true); setMessage("You kept your answer."); return; }
    setResults((all) => [...all.slice(0, round), { answer: null, tier: null, points: 0 }]);
    setLocked(true);
    setMessage("You skipped this scan.");
  };
  const next = () => {
    if (round === prompts.length - 1) {
      setFinished(true);
      if (!done.current) {
        done.current = true;
        const square = ["⬛", "🟦", "🟦", "🟩", "🟨", "🟧", "🟥"];
        onDone(total, 700, total === 700, "Deep Scan · " + Math.round(total / 5) + " mm deep\n" + results.map((r) => square[r.tier ?? 0]).join("") + "\n🟦 skin → 🟥 marrow");
      }
      return;
    }
    setRound((v) => v + 1);
    setGambling(false);
    setSeconds(DIVE_SECONDS);
    setEntry("");
    setLocked(false);
    setMessage("Next scan. Think past the first obvious answer.");
  };

  const tierNow = locked && current?.tier ? current.tier : null;
  const mmNow = Math.round(total / 5);
  const ui = <div className={"dv" + (locked ? " dv-locked" : "")} role="dialog" aria-label="Deep Scan">
    <DiveScene tier={tierNow} seed={seed} names={DIVE_TIERS} tag={locked && current?.answer ? current.answer.toUpperCase().slice(0, 18) : ""} />
    <div className="dv-scan" />
    <header className="dv-hud">
      <div className="dv-chip"><small>DEPTH</small><b>{mmNow}<i> mm</i></b></div>
      <div className="dv-segs" aria-label={"Scan " + (round + 1) + " of " + prompts.length}>
        <div>{prompts.map((_, i) => <i key={i} className={i === round ? "cur" : ""} style={i < results.length && results[i].tier ? { background: ZONE_COLORS[(results[i].tier ?? 1) - 1] } : i < results.length ? { background: "#4a4f78" } : undefined} />)}</div>
        <span>SCAN {Math.min(round + 1, prompts.length)} OF {prompts.length}</span>
      </div>
      <div className="dv-chip right"><small>SCORE</small><b>{total}</b></div>
    </header>
    {onExit && <button className="dv-exit" onClick={onExit} aria-label="Leave Deep Scan">✕</button>}
    {!locked && <section className="dv-q" key={round}>
      <small>SCAN {round + 1} OF {prompts.length} · {item.scope.toUpperCase()}</small>
      <h2>{item.prompt}</h2>
      <p>{gambling ? "▼ GO DEEPER: find a rarer layer or lose half ▼" : "▼ rarer answers dive deeper ▼"}</p>
    </section>}
    {locked && <section className="dv-rev" key={"rev" + round}>
      {current?.answer ? <>
        {(current.tier ?? 0) >= 5 && <div className={"dv-stinger tier-" + current.tier}>{current.tier === 6 ? "ONE IN A MARROW" : "DEEP CUT"}</div>}
        <h3 className="dv-tier" data-text={DIVE_TIERS[(current.tier ?? 1) - 1].toUpperCase()} style={{ color: ZONE_COLORS[(current.tier ?? 1) - 1] }}>{DIVE_TIERS[(current.tier ?? 1) - 1].toUpperCase()}</h3>
        <div className="dv-ans">“{current.answer}”</div>
        <div className="dv-gain">+{current.points} PTS · DEPTH {Math.round(current.points / 5)} MM{current.gamble === "won" ? " · GAMBLE WON" : current.gamble === "lost" ? " · GAMBLE LOST" : ""}</div>
        <div className="dv-flavor">{DIVE_FLAVOR[(current.tier ?? 1) - 1]}</div>
        <p className="dv-note">{(() => { const t = current.tier ?? 1; const same = item.answers.filter((x) => x.tier === t).length; const deeper = item.answers.filter((x) => x.tier > t).sort((x, y) => y.tier - x.tier)[0]; return "One of " + same + " answer" + (same === 1 ? "" : "s") + " at this depth." + (deeper ? " Deeper layers held " + deeper.answer + "." : " Nothing lies deeper."); })()}</p>
      </> : <>
        <h3 className="dv-tier" data-text="NO SCAN" style={{ color: "#9aa3d8" }}>NO SCAN</h3>
        <div className="dv-flavor">Some answers: {item.answers.slice().sort((x, y) => x.tier - y.tier).slice(0, 3).map((x) => x.answer).join(" · ")} … and deeper: {item.answers.slice().sort((x, y) => y.tier - x.tier).slice(0, 2).map((x) => x.answer).join(" · ")}</div>
      </>}
      <p className="dv-expl">{item.explanation}</p>
      {message && <p className="dv-msg" aria-live="polite">{message}</p>}
      {current?.answer && (current.tier ?? 0) < 6 && !current.gamble && <button className="dv-gamble" onClick={goDeeper}>⬇ GO DEEPER · RISK HALF FOR A RARER LAYER</button>}
      <div className="dv-next"><button onClick={next}>{round === prompts.length - 1 ? "FINISH SCAN" : "NEXT QUESTION"}</button></div>
    </section>}
    {!locked && <footer className="dv-dock">
      <form key={shake} className={"dv-form" + (shake ? " shake" : "") + (gambling ? " gambling" : "")} onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <div className={"dv-clock" + (seconds <= 5 ? " urgent" : "")}>{seconds}</div>
        <div className="dv-field">
          <input ref={input} value={entry} onChange={(e) => setEntry(e.target.value)} autoComplete="off" autoCapitalize="off" spellCheck={false} placeholder="Type one answer…" aria-label="Your answer" />
          <i className="dv-bar"><b style={{ width: (seconds / (gambling ? DIVE_GAMBLE_SECONDS : DIVE_SECONDS) * 100) + "%" }} /></i>
        </div>
        <button className="dv-go" type="submit" disabled={!entry.trim()}>DIVE</button>
      </form>
      <div className="dv-foot"><p aria-live="polite">{message}</p><button type="button" onClick={surface}>{gambling ? "KEEP IT" : "SKIP"}</button></div>
    </footer>}
  </div>;

  return <div className="game-layout dive-game" data-own-sfx="true">
    {!finished ? (typeof document !== "undefined" ? createPortal(ui, document.body) : null) : <div className="dive-finale">
      <div className="dive-medal">🩻</div><span className="eyebrow">SCAN COMPLETE</span>
      <h2>{total} / 700</h2><p>{Math.round(total / 5)} mm below the skin. {total >= 450 ? "Straight through to the marrow." : "Every scan teaches you another layer."}</p>
      <div className="dive-log">{prompts.map((prompt, i) => <div key={prompt.id}><span>{i + 1}</span><b>{results[i]?.answer ?? "—"}</b><strong>+{results[i]?.points ?? 0}</strong></div>)}</div>
    </div>}
  </div>;
}

type RumbleMode = "solo" | "pass";
type RumbleStage = "setup" | "spin" | "spinning" | "wild" | "question" | "reveal" | "done";
interface RumblePlayer {
  name: string;
  crowns: TriviaCategoryId[];
  progress: Record<TriviaCategoryId, number>;
  correct: number;
}
const newRumblePlayer = (name: string): RumblePlayer => ({
  name,
  crowns: [],
  progress: Object.fromEntries(triviaCategories.map((category) => [category.id, 0])) as Record<TriviaCategoryId, number>,
  correct: 0
});

const RUMBLE_SECONDS = 20;
function TriviaRumble({ seed, onDone }: Props) {
  const [mode, setMode] = useState<RumbleMode>("solo");
  const [names, setNames] = useState(["Player 1", "Player 2"]);
  const [players, setPlayers] = useState<RumblePlayer[]>([]);
  const [stage, setStage] = useState<RumbleStage>("setup");
  const [turn, setTurn] = useState(0);
  const [round, setRound] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [category, setCategory] = useState<TriviaCategory | null>(null);
  const [question, setQuestion] = useState<(typeof triviaQuestions)[number] | null>(null);
  const [picked, setPicked] = useState<number | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [used, setUsed] = useState<Partial<Record<TriviaCategoryId, string[]>>>({});
  const [seconds, setSeconds] = useState(RUMBLE_SECONDS);
  const done = useRef(false);
  const spinTimer = useRef<number | null>(null);
  useEffect(() => () => { if (spinTimer.current !== null) window.clearTimeout(spinTimer.current); }, []);
  const currentPlayer = players[turn];
  const limit = mode === "solo" ? 24 : 36;

  useEffect(() => {
    if (stage !== "question") return;
    const interval = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(interval);
  }, [stage, round]);
  useEffect(() => {
    if (stage === "question" && seconds > 0 && seconds <= 5) sfx("tick");
    if (stage === "question" && seconds === 0) answer(-1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, stage]);

  const start = () => {
    const list = mode === "solo" ? [names[0].trim() || "Player 1"] : [names[0].trim() || "Player 1", names[1].trim() || "Player 2"];
    setPlayers(list.map(newRumblePlayer));
    setTurn(0); setRound(0); setRotation(0); setCategory(null); setQuestion(null); setPicked(null);
    setWinner(null); setUsed({}); done.current = false; setStage("spin");
  };

  const deal = (selected: TriviaCategory) => {
    const pool = triviaQuestions.filter((item) => item.category === selected.id);
    const seen = used[selected.id] ?? [];
    const fresh = pool.filter((item) => !seen.includes(item.id));
    const choices = fresh.length ? fresh : pool;
    const nextQuestion = shuffle(choices, seeded(hashSeed(seed + "|" + round + "|" + turn + "|" + selected.id)))[0];
    setUsed((all) => ({ ...all, [selected.id]: [...(all[selected.id] ?? []), nextQuestion.id] }));
    setCategory(selected);
    setQuestion(nextQuestion);
    setPicked(null);
    setSeconds(RUMBLE_SECONDS);
    setStage("question");
  };

  const spin = () => {
    if (stage !== "spin") return;
    const random = seeded(hashSeed(seed + "|" + round + "|" + turn + "|wheel"));
    const index = Math.floor(random() * 7);
    const segment = 360 / 7;
    setRotation((value) => value + 1440 + 360 - (index + 0.5) * segment);
    sfx("spin");
    setStage("spinning");
    spinTimer.current = window.setTimeout(() => {
      spinTimer.current = null;
      if (index === 6) setStage("wild");
      else deal(triviaCategories[index]);
    }, 1500);
  };

  const answer = (index: number) => {
    if (stage !== "question" || !question || !category || picked !== null) return;
    setPicked(index);
    setLastCorrect(index === question.answer);
    const correct = index === question.answer;
    reward(correct, null, correct ? "+1" : undefined);
    const nextPlayers = players.map((player, playerIndex) => {
      if (playerIndex !== turn || !correct) return player;
      const progress = { ...player.progress, [category.id]: Math.min(3, player.progress[category.id] + 1) };
      const crowns = progress[category.id] >= 3 && !player.crowns.includes(category.id) ? [...player.crowns, category.id] : player.crowns;
      return { ...player, progress, crowns, correct: player.correct + 1 };
    });
    setPlayers(nextPlayers);
    if (nextPlayers[turn].crowns.length > players[turn].crowns.length) window.setTimeout(() => sfx("badge"), 350);
    const newWinner = nextPlayers.find((player) => player.crowns.length === triviaCategories.length);
    if (newWinner) setWinner(newWinner.name);
    setStage("reveal");
  };

  const finish = () => {
    const result = triviaRumbleResult(players.map((player) => player.correct), mode, limit);
    setStage("done");
    if (!done.current) {
      done.current = true;
      const top = [...players].sort((a, b) => b.crowns.length - a.crowns.length || b.correct - a.correct)[0];
      onDone(result.score, result.maxScore, result.perfect, "Trivia Rumble · " + top.crowns.length + "/6 badges\n" + triviaCategories.map((cat) => top.crowns.includes(cat.id) ? cat.icon : "▫️").join(" ") + "\n" + top.correct + " correct" + (mode === "pass" ? " · " + players.length + "-player game" : ""));
    }
  };

  const next = () => {
    if (winner || round + 1 >= limit) { finish(); return; }
    setTurn((value) => rumbleNextTurn({ turn: value, playerCount: players.length, correct: lastCorrect }));
    setRound((value) => value + 1);
    setCategory(null); setQuestion(null); setPicked(null);
    setStage("spin");
  };

  return <div className="game-layout trivia-rumble" data-own-sfx="true">
    {stage === "setup" ? <div className="rumble-setup">
      <div className="rumble-logo">TRIVIA <b>RUMBLE</b><span>⚡</span></div>
      <p>Spin into six worlds of medical knowledge. Collect three correct answers in a category to win its badge. {mode === "pass" ? "Get one right and you keep the wheel; miss, or run out of the 20 seconds, and it passes." : "Beat the 20-second clock on every question."}</p>
      <div className="rumble-mode-picks">
        <button className={mode === "solo" ? "chosen" : ""} onClick={() => setMode("solo")}><b>Solo challenge</b><span>Collect all six badges</span></button>
        <button className={mode === "pass" ? "chosen" : ""} onClick={() => setMode("pass")}><b>Pass & play</b><span>Take turns on one device</span></button>
      </div>
      <label className="rumble-name">Player 1<input value={names[0]} onChange={(event) => setNames((v) => [event.target.value, v[1]])} maxLength={18} /></label>
      {mode === "pass" && <label className="rumble-name">Player 2<input value={names[1]} onChange={(event) => setNames((v) => [v[0], event.target.value])} maxLength={18} /></label>}
      <button className="button button-primary full-button rumble-start" onClick={start}>Enter the arena ↗</button>
    </div> : stage !== "done" ? <>
      <div className="rumble-scoreboard">
        {players.map((player, i) => <div key={player.name + i} className={"rumble-player" + (turn === i ? " active" : "")}>
          <b>{player.name}</b><strong>{player.crowns.length}<small> / 6</small></strong>
          <div className="rumble-crowns">{triviaCategories.map((cat) => <span key={cat.id} className={player.crowns.includes(cat.id) ? "won" : ""} title={cat.name}>{player.crowns.includes(cat.id) ? cat.icon : "·"}</span>)}</div>
        </div>)}
      </div>
      <div className="rumble-roundline"><span>ROUND {round + 1} / {limit}</span><span>{currentPlayer?.name ?? "Your turn"} {mode === "pass" ? "· pass the device" : "· solo run"}</span></div>
      {stage === "spin" || stage === "spinning" || stage === "wild" ? <div className="rumble-wheel-area">
        <div className="trivia-wheel-wrap">
          <div className="trivia-pointer">▼</div>
          <div className="trivia-wheel" style={{ transform: "rotate(" + rotation + "deg)" }}>
            {triviaCategories.map((cat, i) => {
              const angle = i * (360 / 7) + (180 / 7);
              return <span key={cat.id} className="trivia-wheel-mark" style={{ transform: "rotate(" + angle + "deg) translateY(-94px) rotate(" + (-angle) + "deg)" }}>{cat.icon}</span>;
            })}
            <span className="trivia-wheel-wild" style={{ transform: "rotate(" + (6 * 360 / 7 + 180 / 7) + "deg) translateY(-94px) rotate(" + (-(6 * 360 / 7 + 180 / 7)) + "deg)" }}>★</span>
            <div className="trivia-wheel-hub">GO!</div>
          </div>
        </div>
        {stage === "spin" && <button className="button button-primary rumble-spin" onClick={spin}>SPIN THE WHEEL ↻</button>}
        {stage === "spinning" && <p className="rumble-wheel-note">The wheel is choosing your category…</p>}
        {stage === "wild" && <div className="rumble-wild-pick"><h3>Wild card! Choose a category.</h3><div>{triviaCategories.filter((cat) => !currentPlayer.crowns.includes(cat.id)).map((cat) => <button key={cat.id} style={{ "--cat-color": cat.color } as React.CSSProperties} onClick={() => deal(cat)}>{cat.icon} {cat.name}</button>)}</div></div>}
      </div> : null}
      {stage === "question" || stage === "reveal" ? question && category && <div className="rumble-question" style={{ "--cat-color": category.color } as React.CSSProperties}>
        <div className="rumble-category"><span>{category.icon}</span><b>{category.name}</b></div>
        <div className="rumble-question-card"><span className="eyebrow">{category.short} · QUESTION {round + 1}</span>{stage === "question" && <div className={"rumble-timer" + (seconds <= 5 ? " urgent" : "")} role="timer" aria-label={seconds + " seconds left"}><i style={{ width: (seconds / RUMBLE_SECONDS * 100) + "%" }} /><b>{seconds}</b></div>}<h2>{question.question}</h2></div>
        <div className="rumble-options">{question.options.map((option, i) => <button key={option} disabled={stage === "reveal"} className={stage === "reveal" ? (i === question.answer ? "right" : i === picked ? "wrong" : "dim") : picked === i ? "selected" : ""} onClick={() => answer(i)}><span>{String.fromCharCode(65 + i)}</span>{option}</button>)}</div>
        {stage === "reveal" && <div className={"rumble-explanation" + (picked === question.answer ? " correct" : "")}>
          <b>{picked === question.answer ? (mode === "pass" ? "Correct! You keep the wheel." : "Correct! Badge progress updated.") : (picked === -1 ? "Time's up! " : "Not quite. ") + "Correct answer: " + question.options[question.answer] + "." + (mode === "pass" ? " The wheel passes on." : "")}</b><p>{question.explanation}</p>
          <button className="button button-primary full-button" onClick={next}>{winner ? "See the winner" : round + 1 === limit ? "View final scores" : mode === "pass" ? (lastCorrect ? "Spin again — you keep going →" : "Next player's turn →") : "Spin again →"}</button>
        </div>}
      </div> : null}
    </> : <div className="rumble-finale">
      <div className="rumble-trophy">🏆</div><span className="eyebrow">ARENA COMPLETE</span><h2>{winner ? winner + " wins!" : "Final scoreboard"}</h2>
      <div className="rumble-final-list">{[...players].sort((a, b) => b.crowns.length - a.crowns.length || b.correct - a.correct).map((player, i) => <div key={player.name + i}><span>{i + 1}</span><b>{player.name}</b><strong>{player.crowns.length} badges · {player.correct} correct</strong></div>)}</div>
      <p>Six badges are waiting tomorrow. Keep your streak going.</p>
    </div>}
    <p className="rumble-footnote">Original medical question set · local pass-and-play · no account needed</p>
  </div>;
}

const LETTER_DICTIONARY = [...new Set([
  ...medleWords,
  ...scrambleWords.map(([word]) => word),
  ...wordLadders.flatMap((ladder) => ladder.path),
  ...pairsBank.map(([term]) => term),
  ...connectionPuzzles.flatMap((board) => board.flatMap((group) => group.words)),
  ...microbePacks.flatMap((pack) => pack.words)
].map((value) => normalize(String(value)).replace(/\s/g, "").toUpperCase()).filter((word) => /^[A-Z]{3,8}$/.test(word)))];

function LetterGridGame({ seed, onDone }: Props) {
  const board = useMemo(() => makeLetterGrid(seed, LETTER_DICTIONARY), [seed]);
  const [path, setPath] = useState<number[]>([]);
  const [found, setFound] = useState<string[]>([]);
  const [foundPaths, setFoundPaths] = useState<number[][]>([]);
  const [seconds, setSeconds] = useState(75);
  const [note, setNote] = useState("Connect adjacent letters in any direction. Each cell can be used once per word.");
  const [ended, setEnded] = useState(false);
  const done = useRef(false);
  const score = found.reduce((total, word) => total + letterWordPoints(word), 0);
  const maximum = Math.max(1, board.words.reduce((total, word) => total + letterWordPoints(word), 0));
  const currentWord = path.map((index) => board.grid[index]).join("");

  const finish = (words: string[]) => {
    setEnded(true);
    if (!done.current) {
      done.current = true;
      const points = words.reduce((total, word) => total + letterWordPoints(word), 0);
      onDone(points, maximum, points === maximum);
    }
  };

  useEffect(() => {
    if (ended) return;
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [ended]);
  useEffect(() => {
    if (seconds === 0 && !ended) finish(found);
  }, [seconds, ended, found]);

  const chooseCell = (index: number) => {
    if (ended) return;
    if (path.includes(index)) {
      if (path[path.length - 1] === index) setPath((current) => current.slice(0, -1));
      else setNote("A letter cannot be reused in the same word. Remove the last tile to backtrack.");
      return;
    }
    if (path.length) {
      const last = path[path.length - 1];
      const rowGap = Math.abs(Math.floor(last / 4) - Math.floor(index / 4));
      const colGap = Math.abs((last % 4) - (index % 4));
      if (rowGap > 1 || colGap > 1) {
        setNote("Choose a tile touching the previous letter, including diagonals.");
        return;
      }
    }
    setPath((current) => [...current, index]);
  };

  const submit = () => {
    const word = currentWord;
    if (ended || word.length < 3) return;
    if (found.includes(word)) { setNote("Already found. Search for another path."); setPath([]); return; }
    if (!board.words.includes(word) || !traceGridWord(board.grid, word)) {
      setNote(word + " is not one of the hidden words. Try another path.");
      setPath([]);
      return;
    }
    const next = [...found, word];
    setFound(next);
    setFoundPaths((current) => [...current, path]);
    setPath([]);
    setNote("+" + letterWordPoints(word) + " points · " + word);
    if (next.length === board.words.length) finish(next);
  };

  return <div className="game-layout letter-grid-game">
    <div className="letter-grid-hud"><div><span className="eyebrow">LETTER LAB</span><h2>Find the hidden words</h2></div><div className={"letter-grid-clock" + (seconds <= 10 ? " urgent" : "")}>{String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}</div></div>
    <p className="game-instructions"><span className="instruction-dot mint" /> Connect neighboring letters horizontally, vertically, or diagonally. Longer words earn more points.</p>
    <div className="letter-grid-board" aria-label="Boggle-style letter board">{board.grid.map((letter, i) => {
      const isFound = foundPaths.some((cells) => cells.includes(i));
      return <button key={i} type="button" className={"letter-grid-tile" + (path.includes(i) ? " selected" : "") + (isFound ? " found" : "")} onClick={() => chooseCell(i)} disabled={ended || isFound} aria-label={"Tile " + letter + ", row " + (Math.floor(i / 4) + 1) + ", column " + (i % 4 + 1)}>{letter}</button>;
    })}</div>
    <div className="letter-grid-current"><span>YOUR WORD</span><strong>{currentWord || "—"}</strong><small>{path.length} tiles</small></div>
    <div className="letter-grid-controls"><button className="button button-soft" onClick={() => setPath((current) => current.slice(0, -1))} disabled={ended || !path.length}>Undo</button><button className="button button-quiet" onClick={() => setPath([])} disabled={ended || !path.length}>Clear</button><button className="button button-primary" onClick={submit} disabled={ended || path.length < 3}>Submit word</button></div>
    <p className="letter-grid-score">{score} pts <span>·</span> {found.length} / {board.words.length} words found</p>
    {!ended ? <>
      <p className="game-feedback" aria-live="polite">{note}</p>
      <div className="letter-grid-found">{found.map((word) => <span key={word}>{word}<b>+{letterWordPoints(word)}</b></span>)}</div>
      <button className="button button-quiet full-button" onClick={() => finish(found)}>Finish round</button>
    </> : <div className="letter-grid-finale"><h3>{found.length === board.words.length ? "Grid cleared!" : "Round complete"}</h3><strong>{score} / {maximum}</strong><p>{found.length} words found before the clock stopped. The full word list is below.</p><div>{board.words.slice().sort().map((word) => <span key={word} className={found.includes(word) ? "found" : ""}>{word}</span>)}</div></div>}
  </div>;
}

function Medle({ seed, onDone, specialty = "general" }: Props) {
  const pool = specialty === "general" ? medleWords : medleWords.filter((w) => specialty === "neurology" ? ["BRAIN","NERVE","OPTIC","VAGUS","ULNAR","SPASM","MOTOR","COMAS"].includes(w) : specialty === "cardiology" ? ["AORTA","VALVE","SHOCK","RALES","SPASM","ACUTE"].includes(w) : specialty === "infectious" ? ["STAPH","STREP","VIRAL","YEAST","SPORE","TITER","COCCI","PRION"].includes(w) : true);
  const answer = pool[seed % pool.length] ?? "ACUTE";
  const [guess, setGuess] = useState("");
  const [rows, setRows] = useState<string[]>([]);
  const [message, setMessage] = useState("Six tries. Every guess must be five letters.");
  const [ended, setEnded] = useState(false);
  const [won, setWon] = useState(false);
  const [shake, setShake] = useState(0);
  const done = useRef(false);
  const submit = () => {
    const word = guess.trim().toUpperCase();
    if (ended) return;
    const invalid = (text: string) => { setMessage(text); setShake((n) => n + 1); sfx("wrong"); vibrate([30, 40, 30]); };
    if (word.length !== 5 || !/^[A-Z]{5}$/.test(word)) { invalid("Not enough letters. Five, please."); return; }
    if (!medleWords.includes(word) && !fiveLetterWords.has(word)) { invalid("That isn't a word we know. Try another."); return; }
    if (rows.includes(word)) { invalid("You've already tried that word."); return; }
    const next = [...rows, word]; setRows(next); setGuess("");
    const correct = word === answer, finished = correct || next.length >= 6;
    if (correct) reward(true, null, "Solved!"); else if (finished) reward(false); else sfx("pop");
    setMessage(correct ? "Exactly right. Nice diagnosis of a word." : finished ? "The word was " + answer + "." : "Not quite. Use the tile clues to narrow it down.");
    if (finished) { setEnded(true); setWon(correct); if (!done.current) { done.current = true; onDone(correct ? 100 - (next.length - 1) * 12 : 0, 100, correct && next.length === 1, "Stat Word " + (correct ? next.length : "X") + "/6\n" + next.map((row) => scoreWord(row, answer).map((mark) => mark === "correct" ? "🟩" : mark === "present" ? "🟨" : "⬛").join("")).join("\n")); } }
  };
  const keyboardRows = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
  const keyboardMarks: Record<string, "correct" | "present" | "absent"> = {};
  const priority = { absent: 1, present: 2, correct: 3 };
  rows.forEach((row) => scoreWord(row, answer).forEach((mark, index) => {
    const letter = row[index];
    if (!keyboardMarks[letter] || priority[mark] > priority[keyboardMarks[letter]]) keyboardMarks[letter] = mark;
  }));
  const pressKey = (key: string) => {
    if (ended) return;
    if (key === "ENTER") submit();
    else if (key === "⌫") setGuess((value) => value.slice(0, -1));
    else if (guess.length < 5) { setGuess((value) => value + key); sfx("pop"); vibrate(6); }
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || ended) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (/^[a-zA-Z]$/.test(e.key)) { e.preventDefault(); pressKey(e.key.toUpperCase()); }
      else if (e.key === "Backspace") { e.preventDefault(); pressKey("⌫"); }
      else if (e.key === "Enter" && !(t && t.tagName === "BUTTON")) { e.preventDefault(); pressKey("ENTER"); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guess, ended, rows]);
  return <div className="game-layout medle-game">
    <div className="game-instructions"><span className="instruction-dot mint" /> Guess the five-letter medical word in six tries. Green is the right letter in the right place; gold is in the word elsewhere.</div>
    <div className="word-grid" aria-label="Six guess rows">{Array.from({ length: 6 }, (_, r) => {
      const word = rows[r] ?? (r === rows.length ? guess.toUpperCase() : "");
      const marks = rows[r] ? scoreWord(rows[r], answer) : [];
      return <div className={"word-row" + (r === rows.length && shake ? " shake" : "")} key={r + "-" + (r === rows.length ? shake : 0)}>{Array.from({ length: 5 }, (_, c) => <div key={c} style={{ "--i": c } as React.CSSProperties} className={"word-cell " + (marks[c] ?? (word[c] ? "filled" : ""))}>{word[c] ?? ""}</div>)}</div>;
    })}</div>
    {!ended ? <>
      <p className="type-hint">Just start typing, or tap the keys. Enter to guess.</p>
      <div className="medle-keyboard" aria-label="On-screen keyboard">{keyboardRows.map((row, index) => <div key={row} className="medle-key-row">{row.split("").map((key) => <button key={key} type="button" className={keyboardMarks[key]??""} onClick={() => pressKey(key)}>{key}</button>)}{index===2&&<><button type="button" className="wide-key" onClick={() => pressKey("ENTER")}>ENTER</button><button type="button" className="wide-key" onClick={() => pressKey("⌫")}>⌫</button></>}</div>)}</div>
    </> : <Finish title={won ? "Word found!" : "A word for your rounds"} detail={won ? "You solved it in " + rows.length + (rows.length === 1 ? " guess." : " guesses.") : "The answer was " + answer + ". Try another daily puzzle tomorrow."} score={won ? (100 - (rows.length - 1) * 12) + " / 100" : "0 / 100"} />}
    <p className="game-feedback" aria-live="polite">{message}</p>
  </div>;
}

function Connections({ seed, onDone, specialty = "general" }: Props) {
  const board = pick(connectionPuzzles, seed, specialty, "connections");
  const [tiles, setTiles] = useState(() => shuffle(board.flatMap((g, group) => g.words.map((word) => ({ word, group }))), seeded(seed + 31)));
  const [selected, setSelected] = useState<string[]>([]);
  const [solved, setSolved] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [shuffleCount, setShuffleCount] = useState(0);
  const [note, setNote] = useState("Find four groups of four related medical terms.");
  const [ended, setEnded] = useState(false);
  const done = useRef(false);
  const guessLog = useRef<string[]>([]);
  const shareText = () => "Quad Squad\n" + guessLog.current.join("\n");
  const choose = (word: string) => {
    if (ended || solved.some((n) => board[n].words.includes(word))) return;
    setSelected((s) => s.includes(word) ? s.filter((x) => x !== word) : s.length < 4 ? [...s, word] : s);
  };
  const submit = () => {
    if (selected.length !== 4 || ended) return;
    const group = tiles.find((t) => selected.includes(t.word))?.group;
    guessLog.current.push(selected.map((word) => ["🟨", "🟩", "🟦", "🟪"][tiles.find((t) => t.word === word)?.group ?? 0]).join(""));
    if (group !== undefined && selected.every((word) => board[group].words.includes(word))) {
      reward(true); const next = [...solved, group]; setSolved(next); setSelected([]); setNote(board[group].category + " — " + board[group].hint);
      if (next.length === 4) { setEnded(true); if (!done.current) { done.current = true; onDone(Math.max(0, 100 - mistakes * 15), 100, mistakes === 0, shareText()); } }
    } else {
      const nearMiss = group !== undefined && selected.filter((word) => board[group].words.includes(word)).length === 3;
      reward(false); const next = mistakes + 1; setMistakes(next); setNote(next >= 4 ? "No mistakes left. The remaining groups are shown below." : nearMiss ? "One away… Three of those terms belong together, but one is from another group." : "Not a set. Look for a different connection."); setSelected([]);
      if (next >= 4) { setEnded(true); if (!done.current) { done.current = true; onDone(Math.max(0, 40 - next * 5), 100, false, shareText()); } }
    }
  };
  const shuffleTiles = () => {
    const next = shuffleCount + 1;
    setShuffleCount(next);
    setTiles((current) => shuffle(current, seeded(hashSeed(String(seed) + String(solved.length) + String(mistakes) + String(next)))));
  };
  return <div className="game-layout">
    <div className="game-instructions"><span className="instruction-dot lilac" /> Select four terms that share a medical connection. Four groups complete the board; you have four mistakes available.</div>
    <div className="connection-found">{solved.map((n) => <div className="connection-solved" key={n}><strong>{board[n].category}</strong><span>{board[n].words.join(" · ")}</span></div>)}</div>
    <div className="connection-grid">{tiles.map((tile, i) => {
      const isSolved = solved.some((n) => board[n].words.includes(tile.word));
      return <button key={tile.word + i} className={"connection-tile" + (selected.includes(tile.word) ? " selected" : "") + (isSolved ? " hidden-tile" : "")} onClick={() => choose(tile.word)} disabled={isSolved || ended}>{tile.word}</button>;
    })}</div>
    <div className="connection-controls"><span className="mistake-count">Mistakes <b>{mistakes}</b><span> / 4</span></span><button className="button button-soft" onClick={shuffleTiles} disabled={ended}>Shuffle</button><button className="button button-primary" onClick={submit} disabled={selected.length !== 4 || ended}>Submit group</button></div>
    <p className="game-feedback" aria-live="polite">{note}</p>
    {ended && <Finish title={solved.length === 4 ? "Board cleared!" : "The connections revealed"} detail={solved.length === 4 ? "All four categories found." : "Keep the category patterns in mind for your next round."} score={Math.max(0, solved.length === 4 ? 100 - mistakes * 15 : 40 - mistakes * 5) + " / 100"}><div className="reveal-groups">{board.map((g) => <span key={g.category}><b>{g.category}</b>{g.words.join(" · ")}</span>)}</div></Finish>}
  </div>;
}

const DOCTORDLE_ALIASES: Record<string, string[]> = {
  "acute myocardial infarction": ["mi", "heart attack", "ami"],
  "diabetic ketoacidosis": ["dka"],
  "chronic obstructive pulmonary disease": ["copd"],
  "acute kidney injury": ["aki"],
  "chronic kidney disease": ["ckd"],
  "pulmonary embolism": ["pe"],
  "deep vein thrombosis": ["dvt"],
  "subarachnoid hemorrhage": ["sah"],
  "intracerebral hemorrhage": ["ich"],
  "multiple sclerosis": ["ms"],
  "myasthenia gravis": ["mg"],
  "guillain barre syndrome": ["gbs", "guillain barre"],
  "systemic lupus erythematosus": ["sle", "lupus"],
  "rheumatoid arthritis": ["ra"],
  "ulcerative colitis": ["uc"],
  "hepatocellular carcinoma": ["hcc"],
  "pheochromocytoma": ["pheo"]
};
function DoctorDle({ seed, onDone, specialty = "general" }: Props) {
  const item = pick(diagnosisCases, seed, specialty, "diagnosis");
  const bank = useMemo(() => [...new Set(diagnosisCases.map((c) => c.answer))].sort(), []);
  const [guess, setGuess] = useState("");
  const [guesses, setGuesses] = useState<string[]>([]);
  const [clueCount, setClueCount] = useState(2);
  const [manualHints, setManualHints] = useState(0);
  const [ended, setEnded] = useState(false);
  const [won, setWon] = useState(false);
  const [note, setNote] = useState("Read the case, then type the diagnosis. Six guesses; each miss unlocks another clue.");
  const done = useRef(false);
  const submit = () => {
    const value = normalize(guess);
    if (!value || ended) return;
    if (guesses.some((g) => normalize(g) === value)) { setNote("You already tried that diagnosis."); return; }
    const next = [...guesses, guess.trim()];
    const answerKey = normalize(item.answer);
    const correct = value === answerKey || (DOCTORDLE_ALIASES[answerKey] ?? []).some((alias) => normalize(alias) === value);
    if (correct) reward(true, null, "Diagnosis!"); else reward(false);
    setGuesses(next);
    setGuess("");
    if (correct || next.length >= 6) {
      setEnded(true); setWon(correct);
      setNote(correct ? "Diagnosis confirmed." : "No guesses remaining. Review the case.");
      if (!done.current) { done.current = true; onDone(correct ? Math.max(0, 100 - (next.length - 1) * 15 - manualHints * 5) : 0, 100, correct && next.length === 1 && manualHints === 0, "Differential " + (correct ? next.length : "X") + "/6\n" + "🟥".repeat(correct ? next.length - 1 : 6) + (correct ? "🟩" : "") + (manualHints ? "\n💡 " + manualHints + (manualHints === 1 ? " hint" : " hints") : "")); }
    } else {
      setClueCount((n) => Math.min(item.clues.length, n + 1));
      setNote("Not quite. A new clue has been added.");
    }
  };
  const revealClue = () => {
    if (ended || clueCount >= item.clues.length) return;
    setClueCount((n) => Math.min(item.clues.length, n + 1));
    setManualHints((n) => n + 1);
    setNote("Optional clue revealed. This costs 5 points.");
  };
  return <div className="game-layout doctordle-game">
    <div className="case-banner"><span>DOCTORDLE · CASE {item.id.toUpperCase()}</span><strong>{item.title}</strong><small>{clueCount} of {item.clues.length} clues revealed · {6 - guesses.length} guesses left</small></div>
    <div className="doctordle-attempts" aria-label="Six diagnosis attempts">{Array.from({length:6},(_,i)=><span key={i} className={i < guesses.length ? "used" : ""}>{i < guesses.length ? guesses[i] : "Diagnosis "+(i+1)}</span>)}</div>
    <div className="clue-stack">{item.clues.slice(0, clueCount).map((clue, i) => <div className="clue-card" key={i}><span>{String(i + 1).padStart(2, "0")}</span><p>{clue}</p></div>)}</div>
    {!ended ? <>
      <form className="doctordle-entry" onSubmit={(event) => { event.preventDefault(); submit(); }}>
        <label htmlFor="doctordle-guess">Your diagnosis</label>
        <div><input id="doctordle-guess" value={guess} onChange={(event) => setGuess(event.target.value)} placeholder="Type a diagnosis…" autoComplete="off" autoCapitalize="off" enterKeyHint="go" /><button className="button button-primary" type="submit" disabled={!guess.trim()}>Guess ↗</button></div>
        {(() => {
          const q = normalize(guess);
          const options = q.length < 2 ? [] : bank.filter((a) => normalize(a).includes(q) && normalize(a) !== q && !guesses.some((g) => normalize(g) === normalize(a))).slice(0, 5);
          return options.length ? <div className="suggest-row" role="listbox" aria-label="Suggestions">{options.map((a) => <button type="button" role="option" aria-selected="false" key={a} onClick={() => { setGuess(a); sfx("pop"); }}>{a}</button>)}</div> : null;
        })()}
      </form>
      <div className="doctordle-tools"><button className="text-button" onClick={revealClue} disabled={clueCount >= item.clues.length}>Reveal another clue · −5 pts</button><span>{guesses.length}/6 guesses used</span></div>
    </> : <Finish title={won ? "Diagnosis found" : "Case revealed"} detail={(won ? "Solved in " + guesses.length + " of 6 guesses. " : "Six guesses used. ") + item.explanation}><p className="doctordle-answer">Answer: <b>{item.answer}</b></p><p className="source-note">Source note: {item.source}</p></Finish>}
    <p className="game-feedback" aria-live="polite">{note}</p>
  </div>;
}



function Labline({ seed, onDone, specialty = "general" }: Props) {
  const rounds = useMemo(() => {
    const pool = specialty === "neurology" ? labPrompts.filter((_, index) => [18,19,20].includes(index)) : specialty === "cardiology" ? labPrompts.filter((_, index) => [1,3,4,17].includes(index)) : labPrompts;
    return shuffle(pool.length >= 5 ? pool : labPrompts, seeded(seed + 27)).slice(0, 5);
  }, [seed, specialty]);
  const [round, setRound] = useState(0);
  const item = rounds[round];
  const range = useMemo(() => labRange(item.value, seed + round * 13, item.tolerance), [item, seed, round]);
  // Slider step: a clean fraction of the tolerance (or 1% of the value for threshold prompts).
  const step = useMemo(() => {
    const raw = item.tolerance > 0 ? item.tolerance / 5 : Math.max(Math.abs(item.value) / 100, 0.01);
    const pow = Math.pow(10, Math.floor(Math.log10(raw)));
    return [1, 2, 5, 10].map((m) => m * pow).find((c) => c >= raw) ?? raw;
  }, [item]);
  const decimals = Math.max(0, Math.min(3, Math.ceil(-Math.log10(step) - 1e-9)));
  // Slider bounds sit on whole steps (and always contain the true value) so the thumb snaps cleanly.
  const sMin = Number((Math.floor(range.min / step) * step).toFixed(decimals)), sMax = Number((Math.ceil(range.max / step) * step).toFixed(decimals));
  const snap = (v: number) => Number(Math.min(sMax, Math.max(sMin, Math.round(v / step) * step)).toFixed(decimals));
  const [estimate, setEstimate] = useState<number>(() => snap((sMin + sMax) / 2));
  const [typing, setTyping] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [earned, setEarned] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bonus, setBonus] = useState(0);
  const [total, setTotal] = useState(0);
  const [pins, setPins] = useState(false);
  const [results, setResults] = useState<{ prompt: string; estimate: number; actual: number; unit: string; points: number }[]>([]);
  const [finished, setFinished] = useState(false);
  const done = useRef(false);
  const maxScore = rounds.length * 100 + 90;
  const fmt = (v: number) => Number(v.toFixed(Math.max(decimals, 1)));
  const lock = () => {
    if (submitted || finished) return;
    const typed = typing !== null && typing.trim() !== "" ? Number(typing) : NaN;
    const guess = Number.isFinite(typed) ? typed : estimate;
    const points = labScore(guess, item.value, item.tolerance);
    const streakBonus = points >= 80 ? labStreakBonus(streak) : 0;
    const nextStreak = points >= 80 ? streak + 1 : 0;
    const nextTotal = total + points + streakBonus;
    setEstimate(guess); setEarned(points); setBonus(streakBonus); setStreak(nextStreak); setTotal(nextTotal); setSubmitted(true); setTyping(null);
    setResults((r) => [...r, { prompt: item.prompt, estimate: guess, actual: item.value, unit: item.unit, points }]);
    window.setTimeout(() => setPins(true), 60);
    reward(points >= 60, null, points >= 99 ? "BULLSEYE!" : "+" + (points + streakBonus));
    if (round === rounds.length - 1) {
      setFinished(true);
      if (!done.current) {
        done.current = true;
        const squares = results.concat([{ prompt: "", estimate: guess, actual: item.value, unit: "", points }]).map((r) => r.points >= 95 ? "🟩" : r.points >= 70 ? "🟨" : r.points >= 35 ? "🟧" : "🟥").join("");
        onDone(nextTotal, maxScore, nextTotal >= rounds.length * 100, "Labline " + nextTotal + "/" + maxScore + "\n" + squares);
      }
    }
  };
  const next = () => {
    if (!submitted) return;
    const nextItem = rounds[round + 1];
    void nextItem;
    setRound((r) => r + 1); setSubmitted(false); setPins(false); setBonus(0);
    setTyping(null);
  };
  useEffect(() => { if (!submitted) setEstimate(snap((sMin + sMax) / 2)); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [round]);
  // Ruler geometry for the reveal.
  const lo = Math.min(estimate, item.value - Math.max(item.tolerance, 0)) , hi = Math.max(estimate, item.value + Math.max(item.tolerance, 0));
  const pad = Math.max((hi - lo) * 0.25, Math.abs(item.value) * 0.03, 0.001);
  const rLo = lo - pad, rHi = hi + pad;
  const pct = (v: number) => ((v - rLo) / (rHi - rLo)) * 100;
  const verdict = earned >= 99 ? "Bullseye! 🎯" : earned >= 85 ? "Inside the window ✓" : earned >= 60 ? "Close" : earned >= 30 ? "Getting warm" : "Far off";

  return <div className="game-layout labline-game" data-own-sfx="true">
    <div className="labline-hud"><div><b>{round + 1}<small> / 5</small></b><span>ROUND</span></div><div><b>{total}</b><span>POINTS</span></div><div className={"hot" + (streak >= 2 ? " on" : "")}><b>{streak >= 2 ? "🔥 ×" + streak : "—"}</b><span>HOT STREAK</span></div></div>
    <div className="labline-progress"><i style={{ width: ((round + Number(submitted)) / 5 * 100) + "%" }} /></div>
    {!finished || submitted ? <>
      <div className="lab-prompt"><SectionLabel>CALIBRATE YOUR CLINICAL EYE</SectionLabel><h3>{item.prompt}</h3></div>
      {!submitted ? <div className="lab-dial">
        <div className="lab-readout">
          {typing === null ? <button className="lab-number" onClick={() => setTyping(String(estimate))} aria-label="Tap to type an exact number">{fmt(estimate)}<small>{item.unit}</small></button>
            : <form onSubmit={(e) => { e.preventDefault(); lock(); }}><input className="lab-number-input" autoFocus type="number" step="any" value={typing} onChange={(e) => setTyping(e.target.value)} onBlur={() => { const n = Number(typing); if (Number.isFinite(n) && typing.trim()) setEstimate(n); setTyping(null); }} aria-label={"Estimate in " + item.unit} /><small>{item.unit}</small></form>}
        </div>
        <div className="lab-slider-row">
          <button className="lab-step" onClick={() => setEstimate((v) => snap(v - step))} aria-label="Decrease">−</button>
          <input type="range" className="lab-slider" min={sMin} max={sMax} step={step} value={Math.min(sMax, Math.max(sMin, estimate))} onChange={(e) => { setEstimate(Number(e.target.value)); setTyping(null); }} aria-label={"Estimate in " + item.unit} />
          <button className="lab-step" onClick={() => setEstimate((v) => snap(v + step))} aria-label="Increase">+</button>
        </div>
        <div className="lab-scale"><span>{fmt(sMin)}</span><span>drag, nudge, or tap the number to type</span><span>{fmt(sMax)}</span></div>
        <button className="button button-primary full-button lab-lock" onClick={lock}>Lock in {fmt(typing !== null && Number.isFinite(Number(typing)) && typing.trim() ? Number(typing) : estimate)} {item.unit}</button>
      </div> : <div className="lab-reveal">
        <div className="lab-verdict"><b>{verdict}</b><span>+{earned}{bonus ? " · 🔥 streak bonus +" + bonus : ""}</span></div>
        <div className="lab-ruler" aria-label={"You said " + fmt(estimate) + ", the value is " + item.value}>
          {item.tolerance > 0 && <i className="lab-band" style={{ left: pct(item.value - item.tolerance) + "%", width: pct(item.value + item.tolerance) - pct(item.value - item.tolerance) + "%" }} />}
          <span className={"lab-pin you" + (pins ? " go" : "")} style={{ left: pins ? pct(estimate) + "%" : "50%" }}><em>You</em><b>{fmt(estimate)}</b></span>
          <span className={"lab-pin answer" + (pins ? " go" : "")} style={{ left: pins ? pct(item.value) + "%" : "50%" }}><em>Answer</em><b>{item.value}</b></span>
        </div>
        <p className="lab-context">{item.context} <span className="source-note">{item.source}</span></p>
        {!finished && <button className="button button-primary full-button" onClick={next}>Next estimate ▶</button>}
      </div>}
    </> : null}
    {finished && submitted && <Finish title="Calibration complete" detail={"Five clinical estimates. " + (total >= 450 ? "Superb calibration." : total >= 300 ? "Your reference instincts are sharp." : "Keep building your mental reference ranges.")} score={total + " / " + maxScore}><div className="labline-results">{results.map((r, i) => <div key={i}><span>{r.prompt}</span><b>{fmt(r.estimate)} vs {r.actual} {r.unit}</b><strong>+{r.points}</strong></div>)}</div></Finish>}
  </div>;
}

function MemoryMatch({ seed, onDone, specialty = "general" }: Props) {
  const pool = useMemo(() => specialty === "neurology" ? pairsBank.slice(12, 24) : specialty === "infectious" ? pairsBank.slice(36, 46) : specialty === "cardiology" ? pairsBank.slice(0, 12) : pairsBank, [specialty]);
  const pairSet = useMemo(() => {
    // Preserve the selected specialty first; pad small specialty subsets without silently
    // replacing the entire specialty pool (the infectious set currently has ten pairs).
    const expanded = pool.length >= 12
      ? pool
      : [...pool, ...pairsBank.filter(([term]) => !pool.some(([selected]) => selected === term))].slice(0, 12);
    return shuffle(expanded, seeded(seed + 11)).slice(0, 12);
  }, [seed, pool]);
  const cards = useMemo(() => shuffle(pairSet.flatMap(([term, meaning], pairId) => [
    { id: pairId * 2, pairId, label: term, side: "TERM" },
    { id: pairId * 2 + 1, pairId, label: meaning, side: "ASSOCIATION" }
  ]), seeded(seed + 14)), [pairSet, seed]);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [mismatches, setMismatches] = useState(0);
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [seconds, setSeconds] = useState(75);
  const [locked, setLocked] = useState(false);
  const [ended, setEnded] = useState(false);
  const [note, setNote] = useState("Memorize the cards. Find all twelve term–association pairs before time runs out.");
  const done = useRef(false);
  const flipTimer = useRef<number | null>(null);

  useEffect(() => () => { if (flipTimer.current !== null) window.clearTimeout(flipTimer.current); }, []);
  useEffect(() => { if (ended && flipTimer.current !== null) { window.clearTimeout(flipTimer.current); flipTimer.current = null; } }, [ended]);
  useEffect(() => {
    if (ended) return;
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [ended]);
  useEffect(() => {
    if (seconds !== 0 || ended || done.current) return;
    done.current = true;
    setEnded(true);
    setNote("Time. Review the pairs you uncovered and try to build a longer streak next run.");
    onDone(score, 1800, false);
  }, [seconds, ended, score, onDone]);

  const flip = (id: number) => {
    if (ended || locked || revealed.includes(id)) return;
    const card = cards.find((item) => item.id === id);
    if (!card || matched.includes(card.pairId)) return;
    const next = [...revealed, id];
    setRevealed(next);
    if (next.length < 2) return;

    setMoves((value) => value + 1);
    const first = cards.find((item) => item.id === next[0]);
    if (first?.pairId === card.pairId) {
      const nextMatched = [...matched, card.pairId];
      const nextCombo = combo + 1;
      const earned = associationPairPoints(combo);
      const nextScore = score + earned;
      setMatched(nextMatched);
      setCombo(nextCombo);
      setScore(nextScore);
      setRevealed([]);
      setNote(nextCombo > 1 ? "Pair found. " + nextCombo + " in a row — +" + earned + " points." : "Pair found. +" + earned + " points.");
      if (nextMatched.length === pairSet.length) {
        const finalScore = nextScore + associationTimeBonus(seconds);
        done.current = true;
        setEnded(true);
        setNote("All twelve pairs found. Time bonus: " + associationTimeBonus(seconds) + " points.");
        onDone(finalScore, 1800, mismatches === 0);
      }
    } else {
      setLocked(true);
      setMismatches((value) => value + 1);
      setCombo(0);
      setNote("Not a match. Memorize both cards; they turn back over in a moment.");
      flipTimer.current = window.setTimeout(() => {
        setRevealed([]);
        setLocked(false);
        flipTimer.current = null;
      }, 850);
    }
  };

  return <div className="game-layout association-game">
    <div className="game-instructions"><span className="instruction-dot peach" /> Twelve pairs are hidden in a 4 × 6 memory board. Match terms to their clinical associations, build a streak, and beat the 75-second clock.</div>
    <div className="association-hud">
      <div><b>{seconds}</b><span>SECONDS</span></div>
      <div><b>{matched.length}/{pairSet.length}</b><span>PAIRS</span></div>
      <div><b>{combo}×</b><span>STREAK</span></div>
      <div><b>{score}</b><span>POINTS</span></div>
    </div>
    <div className="association-grid" aria-label="Memory cards">
      {cards.map((card) => {
        const isMatched = matched.includes(card.pairId);
        const isRevealed = revealed.includes(card.id);
        return <button key={card.id} type="button" className={"association-card" + (isMatched ? " matched" : "") + (isRevealed ? " revealed" : "")} onClick={() => flip(card.id)} disabled={ended || isMatched || locked} aria-label={isMatched || isRevealed ? card.label : "Hidden association card"}>
          {isMatched || isRevealed ? <><small>{card.side}</small><span>{card.label}</span></> : <b>✦</b>}
        </button>;
      })}
    </div>
    <div className="association-footer"><span>{moves} turns · {mismatches} mismatches</span><span>Match streaks earn bonus points</span></div>
    <p className="game-feedback" aria-live="polite">{note}</p>
    {ended && <Finish title={matched.length === pairSet.length ? "Board cleared!" : "Time's up"} detail={matched.length === pairSet.length ? "All twelve associations found in " + moves + " turns." : matched.length + " of twelve pairs found. " + mismatches + " mismatches."} score={score + " / 1800"}><div className="reveal-groups">{pairSet.map(([term, meaning]) => <span key={term}><b>{term}</b>{meaning}</span>)}</div></Finish>}
  </div>;
}


/** Anagram Sprint: an endless unscramble run. Solves earn time back, misses cost time; speed and combos add points. */
const SPRINT_START = 60, SPRINT_BONUS = 6, SPRINT_PENALTY = 4, SPRINT_TARGET = 240;
function AnagramSprint({ seed, onDone }: Props) {
  const deck = useMemo(() => shuffle(scrambleWords, seeded(seed + 51)).filter(([w]) => w.length >= 5 && w.length <= 11), [seed]);
  const [index, setIndex] = useState(0);
  const [seconds, setSeconds] = useState(SPRINT_START);
  const [picked, setPicked] = useState<number[]>([]);
  const [order, setOrder] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [log, setLog] = useState<{ word: string; points: number; fast: boolean }[]>([]);
  const [note, setNote] = useState("Tap letters (or type) to spell the medical term. Each solve earns +" + SPRINT_BONUS + "s.");
  const [hint, setHint] = useState(false);
  const [bad, setBad] = useState(0);
  const [ended, setEnded] = useState(false);
  const startedAt = useRef(Date.now());
  const done = useRef(false);
  const [word, definition] = deck[index % deck.length];
  const tiles = useMemo(() => {
    const letters = shuffle(word.split("").map((ch, i) => ({ ch, id: i })), seeded(seed + 51 + index * 73 + order * 7));
    if (letters.map((t) => t.ch).join("") === word) letters.reverse();
    return letters;
  }, [seed, word, index, order]);

  useEffect(() => {
    if (ended) return;
    const timer = window.setInterval(() => setSeconds((v) => Math.max(0, v - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [ended]);
  useEffect(() => { if (!ended && seconds > 0 && seconds <= 5) sfx("tick"); }, [seconds, ended]);
  useEffect(() => {
    if (seconds !== 0 || ended || done.current) return;
    done.current = true; setEnded(true); sfx("whoosh");
    const solved = log.filter((l) => l.points > 0);
    const fastSquares = log.map((l) => l.points === 0 ? "🟥" : l.fast ? "🟩" : "🟨").join("");
    onDone(score, SPRINT_TARGET, score >= SPRINT_TARGET, "Anagram Sprint · " + solved.length + " word" + (solved.length === 1 ? "" : "s") + " · " + score + " pts\n" + (fastSquares || "⬛") + (streak >= 3 ? "\n🔥 best run on fire" : ""));
  }, [seconds, ended, score, onDone, log, streak]);

  const nextWord = (entry: { word: string; points: number; fast: boolean }) => {
    setLog((l) => [...l, entry]); setIndex((i) => i + 1); setPicked([]); setHint(false); startedAt.current = Date.now();
  };
  const pick = (tileIndex: number) => {
    if (ended || picked.includes(tileIndex)) return;
    const next = [...picked, tileIndex];
    setPicked(next); sfx("pop"); vibrate(6);
    if (next.length === word.length) {
      const guess = next.map((i) => tiles[i].ch).join("");
      if (guess === word) {
        const elapsed = (Date.now() - startedAt.current) / 1000;
        const fast = elapsed <= 8;
        const points = 10 + Math.max(0, word.length - 5) * 2 + (fast ? 5 : 0) + Math.min(10, streak * 2) - (hint ? 4 : 0);
        setScore((v) => v + points); setStreak((v) => v + 1); setSeconds((v) => Math.min(90, v + SPRINT_BONUS));
        reward(true, null, "+" + points);
        setNote(word + " ✓  +" + points + (fast ? " (fast!)" : "") + " · +" + SPRINT_BONUS + "s");
        nextWord({ word, points, fast });
      } else {
        reward(false); setBad((n) => n + 1); setStreak(0); setSeconds((v) => Math.max(0, v - SPRINT_PENALTY));
        setNote("Not quite. −" + SPRINT_PENALTY + "s. Try again.");
        window.setTimeout(() => setPicked([]), 280);
      }
    }
  };
  const unpick = (slot: number) => { if (!ended) setPicked((p) => p.slice(0, slot)); };
  const skip = () => {
    if (ended) return;
    setStreak(0); setSeconds((v) => Math.max(0, v - 3)); setNote("Skipped " + word + ". −3s.");
    nextWord({ word, points: 0, fast: false });
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (ended || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (/^[a-zA-Z]$/.test(e.key)) {
        const i = tiles.findIndex((tile, k) => tile.ch === e.key.toUpperCase() && !picked.includes(k));
        if (i >= 0) { e.preventDefault(); pick(i); }
      } else if (e.key === "Backspace") { e.preventDefault(); setPicked((p) => p.slice(0, -1)); }
      else if (e.key === " " ) { e.preventDefault(); setOrder((o) => o + 1); setPicked([]); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tiles, picked, ended]);

  const solved = log.filter((l) => l.points > 0).length;
  return <div className="game-layout anagram-sprint" data-own-sfx="true">
    <div className="anagram-hud"><div><span className="eyebrow">WORDS</span><b>{solved}</b></div><div className={"anagram-clock" + (seconds <= 10 ? " urgent" : "")}>{seconds}s</div><div><b>{score}<small> pts</small></b>{streak >= 2 && <span className="sprint-streak">🔥 ×{streak}</span>}</div></div>
    <div className="anagram-progress"><i style={{ width: Math.min(100, seconds / 90 * 100) + "%" }} /></div>
    {!ended ? <>
      <div className="anagram-board"><span className="eyebrow">UNSCRAMBLE · {word.length} LETTERS</span>
        <div className={"ana-slots" + (bad ? "" : "")} key={bad}>{word.split("").map((_, slot) => <button key={slot} className={"ana-slot" + (picked[slot] !== undefined ? " filled" : "")} onClick={() => unpick(slot)} aria-label={picked[slot] !== undefined ? "Remove letter " + tiles[picked[slot]].ch : "Empty slot " + (slot + 1)}>{picked[slot] !== undefined ? tiles[picked[slot]].ch : ""}</button>)}</div>
        <div className="ana-tiles">{tiles.map((tile, i) => <button key={i} className={"ana-tile" + (picked.includes(i) ? " used" : "")} disabled={picked.includes(i)} onClick={() => pick(i)}>{tile.ch}</button>)}</div>
        {hint && <p className="ana-hint">{definition}</p>}
      </div>
      <div className="ana-tools"><button className="button button-quiet" onClick={() => { setOrder((o) => o + 1); setPicked([]); }}>🔀 Shuffle</button><button className="button button-quiet" onClick={() => setHint(true)} disabled={hint}>Clue (−4 pts)</button><button className="button button-quiet" onClick={skip}>Skip (−3s)</button></div>
      <p className="game-feedback" aria-live="polite">{note}</p>
    </> : <Finish title="Time!" detail={"You unscrambled " + solved + " term" + (solved === 1 ? "" : "s") + " in the sprint."} score={score + " pts"}><div className="reveal-groups">{log.map((l, i) => <span key={i} className={l.points ? "" : "missed"}>{l.word}{l.points ? " +" + l.points : " skipped"}</span>)}</div></Finish>}
  </div>;
}

interface SketchItem { name: string; hint: string; pattern: number[][] }
interface SketchResult { name: string; points: number; hints: number; secs: number; solved: boolean }

/** One nonogram. Reports back when the grid satisfies every clue (or the player gives up). */
function SketchBoard({ item, index, total, seed, onFinished }: { item: SketchItem; index: number; total: number; seed: number; onFinished: (r: SketchResult) => void }) {
  const [cells, setCells] = useState<number[][]>(() => item.pattern.map((row) => row.map(() => 0)));
  const [history, setHistory] = useState<number[][][]>([]);
  const [autoMark, setAutoMark] = useState(true);
  const [pen, setPen] = useState<"cycle" | "fill" | "cross">("cycle");
  const [hints, setHints] = useState(0);
  const [secs, setSecs] = useState(0);
  const [result, setResult] = useState<SketchResult | null>(null);
  const painting = useRef<number | null>(null);
  const rowClues = item.pattern.map((row) => nonogramRuns(row));
  const colClues = item.pattern[0].map((_, c) => nonogramRuns(item.pattern.map((row) => row[c])));
  const sameRuns = (line: number[], clue: number[]) => JSON.stringify(nonogramRuns(line.map((v) => v === 1 ? 1 : 0))) === JSON.stringify(clue);
  const lineSolved = (line: number[], clue: number[]) => line.every((value) => value !== 0) && sameRuns(line, clue);
  const satisfies = (grid: number[][]) => grid.every((row, r) => sameRuns(row, rowClues[r])) && colClues.every((clue, c) => sameRuns(grid.map((row) => row[c]), clue));

  useEffect(() => {
    if (result) return;
    const t = window.setInterval(() => setSecs((v) => v + 1), 1000);
    return () => window.clearInterval(t);
  }, [result]);

  const finish = (solved: boolean, grid: number[][]) => {
    const correct = item.pattern.reduce((n, row, r) => n + row.reduce((m, v, c) => m + ((v === 1 && grid[r][c] === 1) || (v === 0 && grid[r][c] !== 1) ? 1 : 0), 0), 0);
    const points = solved ? Math.max(40, 100 - hints * 8 - Math.max(0, Math.floor((secs - 60) / 10))) : Math.round(correct / 25 * 45);
    const r = { name: item.name, points, hints, secs, solved };
    setResult(r);
    if (solved) { reward(true, null, "SOLVED!"); window.setTimeout(() => sfx("badge"), 350); } else sfx("wrong");
  };
  /** When a line's filled runs already match its clue, the remaining unknown cells in it must be empty. */
  const withAutoMarks = (grid: number[][]): number[][] => {
    if (!autoMark) return grid;
    const next = grid.map((row) => [...row]);
    next.forEach((row, r) => { if (sameRuns(row, rowClues[r])) row.forEach((v, c) => { if (v === 0) next[r][c] = 2; }); });
    colClues.forEach((clue, c) => { if (sameRuns(next.map((row) => row[c]), clue)) next.forEach((row) => { if (row[c] === 0) row[c] = 2; }); });
    return next;
  };
  const commit = (grid: number[][]) => {
    if (result) return;
    const next = withAutoMarks(grid);
    setHistory((h) => [...h.slice(-30), cells]); setCells(next);
    if (satisfies(next)) finish(true, next);
  };
  const setCell = (r: number, c: number, value: number) => commit(cells.map((x, ri) => ri === r ? x.map((v, ci) => ci === c ? value : v) : x));
  const undo = () => setHistory((h) => { if (!h.length || result) return h; setCells(h[h.length - 1]); return h.slice(0, -1); });
  const hint = () => {
    const wrong: [number, number][] = [];
    item.pattern.forEach((row, r) => row.forEach((v, c) => { if ((v === 1 && cells[r][c] !== 1) || (v === 0 && cells[r][c] === 1)) wrong.push([r, c]); }));
    if (!wrong.length) return;
    const [r, c] = wrong[Math.floor(seeded(seed + hints * 31)() * wrong.length)];
    setHints((n) => n + 1);
    commit(cells.map((x, ri) => ri === r ? x.map((v, ci) => ci === c ? (item.pattern[r][c] ? 1 : 2) : v) : x));
  };
  const giveUp = () => { const grid = item.pattern.map((row) => row.map((v) => v ? 1 : 2)); setCells(grid); finish(false, cells); };

  return <div className="game-layout cellsketch" data-own-sfx="true">
    <div className="sketch-head"><span>PICTURE {index + 1} / {total}</span><b>{Math.floor(secs / 60)}:{String(secs % 60).padStart(2, "0")}</b><span>{hints ? "💡 " + hints : "no hints"}</span></div>
    <div className="pen-row" role="radiogroup" aria-label="Pen mode"><span>Pen</span>{([["fill", "● Fill"], ["cross", "× Cross"], ["cycle", "↻ Cycle"]] as const).map(([k, l]) => <button key={k} role="radio" aria-checked={pen === k} className={pen === k ? "on" : ""} onClick={() => setPen(k)}>{l}</button>)}</div>
    <div className="nonogram-wrap"><div className="nonogram-col-clues"><span />{colClues.map((clue, i) => <span key={i} className={lineSolved(cells.map((row) => row[i]), clue) ? "clue-complete" : ""}>{clue.length ? clue.join(" ") : "–"}</span>)}</div><div className="nonogram-grid">{cells.map((row, r) => <div className="nonogram-row" key={r}><span className={"nonogram-clue" + (lineSolved(row, rowClues[r]) ? " clue-complete" : "")}>{rowClues[r].length ? rowClues[r].join(" ") : "–"}</span>{row.map((value, c) => <button key={c} disabled={!!result} aria-label={"Row " + (r + 1) + " column " + (c + 1) + ": " + (value === 1 ? "filled" : value === 2 ? "marked empty" : "unknown")} className={"nonogram-cell" + (value === 1 ? " filled-cell" : "") + (value === 2 ? " empty-marked" : "") + (result ? " reveal-cell r" + r : "")} onContextMenu={(e) => { e.preventDefault(); setCell(r, c, value === 2 ? 0 : 2); }} onPointerDown={(e) => { if (e.button === 2) return; e.preventDefault(); painting.current = pen === "fill" ? (value === 1 ? 0 : 1) : pen === "cross" ? (value === 2 ? 0 : 2) : (value + 1) % 3; setCell(r, c, painting.current); vibrate(6); }} onPointerEnter={(e) => { if (painting.current !== null && e.buttons === 1 && value !== painting.current) setCell(r, c, painting.current); }} onPointerUp={() => { painting.current = null; }} onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); setCell(r, c, (value + 1) % 3); } }}>{value === 1 ? "●" : value === 2 ? "×" : ""}</button>)}</div>)}</div></div>
    {!result ? <>
      <div className="nonogram-actions" onPointerLeave={() => { painting.current = null; }}><span>It solves itself the moment every clue is met.</span><span className="nonogram-tools"><button className="button button-quiet" onClick={undo} disabled={!history.length}>↶ Undo</button><button className="button button-quiet" onClick={hint}>💡 Hint −8</button><button className="button button-quiet" onClick={giveUp}>Reveal</button></span></div>
      <label className="auto-toggle"><input type="checkbox" checked={autoMark} onChange={(e) => setAutoMark(e.target.checked)} /> Auto-mark × on finished lines · drag across cells to paint · right-click for ×</label>
    </> : <div className="sketch-reveal"><div className="sketch-art" aria-hidden="true">{item.pattern.map((row, r) => <div key={r}>{row.map((v, c) => <i key={c} className={v ? "on" : ""} style={{ "--h": (r * 38 + c * 11) % 360, animationDelay: (r * 5 + c) * 35 + "ms" } as React.CSSProperties} />)}</div>)}</div>
      <h3>{item.name.replace(/ ·.*$/, "")}</h3><p>{item.hint}</p><span className={"sketch-score" + (result.solved ? "" : " lost")}>{result.solved ? "Solved in " + result.secs + "s · +" + result.points : "Revealed · +" + result.points}</span>
      <button className="button button-primary full-button" onClick={() => onFinished(result)}>{index + 1 === total ? "See results" : "Next picture ▶"}</button></div>}
  </div>;
}

/** Cell Sketch: three pictures per run. Daily and generated variants alternate; solved boards finish themselves. */
function CellSketch({ seed, onDone, practice = false }: Props & { practice?: boolean }) {
  const generated = practice || seed % 2 === 1;
  const items = useMemo<SketchItem[]>(() => {
    const names = new Set<string>(), picks: SketchItem[] = [];
    for (const base of shuffle(glyphPatterns, seeded(seed + 61))) {
      const key = base.name.replace(/ ·.*$/, "");
      if (names.has(key)) continue;
      names.add(key);
      picks.push(generated ? { ...base, pattern: transformNonogram(base.pattern, seed + picks.length) } : base);
      if (picks.length === 3) break;
    }
    return picks;
  }, [seed, generated]);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<SketchResult[]>([]);
  const [finished, setFinished] = useState(false);
  const done = useRef(false);
  const total = results.reduce((n, r) => n + r.points, 0);
  const advance = (r: SketchResult) => {
    const all = [...results, r];
    setResults(all);
    if (all.length === items.length) {
      setFinished(true);
      if (!done.current) {
        done.current = true;
        const sum = all.reduce((n, x) => n + x.points, 0);
        onDone(sum, items.length * 100, all.every((x) => x.solved && x.hints === 0 && x.points >= 90), "Cell Sketch · " + all.reduce((n, x) => n + x.secs, 0) + "s\n" + all.map((x) => !x.solved ? "🟥" : x.points >= 90 ? "🟩" : "🟨").join("") + (all.some((x) => x.hints) ? "\n💡 " + all.reduce((n, x) => n + x.hints, 0) + " hint(s)" : ""));
      }
    } else setIndex((i) => i + 1);
  };
  return <div className="game-layout">
    <div className="eyebrow ladder-mode-label">{practice ? "GENERATED FREE-PLAY SET" : generated ? "GENERATED DAILY SET" : "CURATED DAILY SET"} · {total} pts</div>
    {!finished ? <SketchBoard key={index} item={items[index]} index={index} total={items.length} seed={seed + index * 7} onFinished={advance} />
      : <Finish title="Gallery complete" detail={results.map((r) => r.name + (r.solved ? " (" + r.secs + "s)" : " (revealed)")).join(" · ")} score={total + " / " + items.length * 100} />}
  </div>;
}

/** Card titles hide parenthetical working (per-item amounts, "approximate"), which would let players do the sum; it is shown after the reveal. */
const splitNotes = (label: string): { title: string; notes: string } => {
  const notes = [...label.matchAll(/\(([^)]*)\)/g)].map((m) => m[1].trim()).filter((n) => n.toLowerCase() !== "approximate");
  return { title: label.replace(/\s*\([^)]*\)/g, "").trim(), notes: notes.join("; ") };
};
/** Counts up to a value, with the same decimals as the value, so reveals feel like a game-show tally. */
function CountUp({ to, ms = 1000 }: { to: number; ms?: number }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    const reduce = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setV(to); return; }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => { const k = Math.min(1, (t - t0) / ms); setV(to * (1 - Math.pow(1 - k, 3))); if (k < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, ms]);
  const decimals = Number.isInteger(to) ? 0 : Math.min(3, (String(to).split(".")[1] ?? "").length);
  return <>{v.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</>;
}

function HigherLower({ seed, onDone, onExit }: Props & { onExit?: () => void }) {
  const list = useMemo(() => shuffle(higherLowerPairs.filter((item) => "fun" in item), seeded(seed + 29)).slice(0, 5).map((item, i) => seeded(seed * 31 + i * 17 + 5)() < 0.5 ? { ...item, a: item.b, av: item.bv, b: item.a, bv: item.av } : item), [seed]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [marks, setMarks] = useState<("ok" | "no")[]>([]);
  const [picked, setPicked] = useState<"a" | "b" | "tie" | null>(null);
  const [reveal, setReveal] = useState(false);
  const [finished, setFinished] = useState(false);
  const done = useRef(false);
  const item = list[round];
  const correct = item.av === item.bv ? "tie" : item.av > item.bv ? "a" : "b";
  const choose = (v: "a" | "b" | "tie") => {
    if (reveal || finished) return;
    const ok = v === correct;
    setPicked(v); setReveal(true); setMarks((m) => [...m, ok ? "ok" : "no"]);
    if (ok) { setScore((n) => n + 1); setStreak((n) => n + 1); reward(true, null, "+1"); } else { setStreak(0); reward(false); }
  };
  const next = () => {
    if (!reveal) return;
    if (round + 1 === list.length) {
      setFinished(true);
      if (!done.current) { done.current = true; onDone(Math.round(score / list.length * 100), 100, score === list.length); }
      return;
    }
    setRound((r) => r + 1); setPicked(null); setReveal(false);
  };
  const half = (side: "a" | "b") => {
    const label = splitNotes(side === "a" ? item.a : item.b);
    const value = side === "a" ? item.av : item.bv;
    const win = reveal && (correct === side || correct === "tie");
    return <button className={"hl-half hl-" + side + (reveal ? (win ? " win" : " lose") : "") + (picked === side ? " picked" : "")} onClick={() => choose(side)} disabled={reveal}>
      <small>{side.toUpperCase()}</small>
      <h2 key={round + side}>{label.title}</h2>
      {reveal && <div className="hl-val"><b><CountUp to={value} /></b><span>{item.unit}</span>{label.notes && <em>{label.notes}</em>}</div>}
      {reveal && <i className="hl-mark">{win ? "✓" : "✗"}</i>}
    </button>;
  };
  const ui = <div className="hl" role="dialog" aria-label="What Has More?">
    <header className="hl-hud">
      {onExit && <button className="hl-exit" onClick={onExit} aria-label="Leave game">✕</button>}
      <div className="hl-segs">{list.map((_, i) => <i key={i} className={i === round ? "cur" : marks[i] ?? ""} />)}</div>
      <div className={"hl-streak" + (streak >= 2 ? " hot" : "")}>{streak >= 2 ? "🔥 " + streak : score + " ✓"}</div>
    </header>
    <p className="hl-ask">WHICH IS GREATER?</p>
    {half("a")}
    <div className="hl-vs">{reveal ? <b className="hl-res">{picked === correct ? "✓" : "✗"}</b> : <button onClick={() => choose("tie")} aria-label="They are equal">=</button>}<span>{reveal && correct === "tie" ? "TIE" : "VS"}</span></div>
    {half("b")}
    {reveal && <footer className="hl-foot"><p>{item.explanation} <em>{item.source}</em></p><button onClick={next}>{round === list.length - 1 ? "SEE MY SCORE" : "NEXT ▶"}</button></footer>}
  </div>;
  return <div className="game-layout" data-own-sfx="true">
    {!finished ? (typeof document !== "undefined" ? createPortal(ui, document.body) : null) : <Finish title="Comparison complete" detail={"You called " + score + " of " + list.length + " comparisons correctly."} score={Math.round(score / list.length * 100) + " / 100"} />}
  </div>;
}


function WordLadder({ seed, onDone }: Props) {
  const item = useMemo(() => generateMedicalLadder(seed, [...ladderDictionary], medicalRungWords) ?? wordLadders[seed % wordLadders.length], [seed]);
  const [entered, setEntered] = useState<string[]>([item.start]);
  const [text, setText] = useState("");
  const [note, setNote] = useState("Change one letter at a time. Every step must be a real word.");
  const [showPath, setShowPath] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);
  const [ended, setEnded] = useState(false);
  const [nudges, setNudges] = useState(0);
  const maxMoves = Math.max(2, item.path.length + 2);
  const diffOne = (a: string, b: string) => a.length === b.length && [...a].filter((c, i) => c !== b[i]).length === 1;
  const add = () => {
    const word = text.trim().toUpperCase();
    if (ended || !word) return;
    if (!diffOne(entered[entered.length - 1], word)) { setNote("Change exactly one letter."); return; }
    if (!ladderDictionary.has(word)) { setNote("That word is not in the ladder dictionary. Try another one-letter neighbor."); return; }
    if (entered.includes(word)) { setNote("You've already used that word."); return; }
    const next = [...entered, word]; setEntered(next); setText("");
    if (word === item.end) { setEnded(true); onDone(Math.max(0, Math.min(100, 100 - Math.max(0, next.length - item.path.length) * 12 - (hintUsed ? 20 : 0) - nudges * 8)), 100, next.length === item.path.length && !hintUsed && nudges === 0); }
    else if (next.length >= maxMoves) { setEnded(true); onDone(0, 100, false); }
    else setNote("Good step. Keep going.");
  };
  return <div className="game-layout">
    <div className="eyebrow ladder-mode-label">MEDICAL LADDER · TURN {item.start} INTO {item.end}</div>
    <div className="game-instructions"><span className="instruction-dot peach" /> Build a word ladder from the start word to the end word. Change one letter at a time; all intermediate steps must be words.</div>
    <div className="ladder-ends"><span>START <b>{item.start}</b></span><span>FINISH <b>{item.end}</b></span></div>
    <div className="ladder-rungs">{entered.map((w, i) => <span key={i}>{[...w].map((ch, k) => <em key={k} className={i > 0 && ch !== entered[i - 1][k] ? "changed" : ""}>{ch}</em>)}</span>)}{!ended && <i>?</i>}</div>
    {!ended ? <>
      <form className="word-entry" onSubmit={(e) => { e.preventDefault(); add(); }}><input value={text} maxLength={item.start.length} onChange={(e) => setText(e.target.value.replace(/[^a-z]/gi,"").toUpperCase())} placeholder="Next word" /><button className="button button-primary">Add step</button></form>
      <p className={"ladder-live" + (text.length === item.start.length ? (diffOne(entered[entered.length - 1], text) ? (ladderDictionary.has(text) ? " ok" : " maybe") : " bad") : "")} aria-live="polite">{text.length === item.start.length ? (diffOne(entered[entered.length - 1], text) ? (ladderDictionary.has(text) ? "✓ Valid step" : "One letter changed, but not a word in this round") : "✗ Change exactly one letter from " + entered[entered.length - 1]) : "Type the next " + item.start.length + "-letter word"}</p>
      <button className="text-button" onClick={() => { const i = entered.length; const nxt = item.path[i]; if (!nxt) return; setNudges((n) => n + 1); const prev = entered[entered.length - 1]; const pos = [...nxt].findIndex((ch, k) => ch !== prev[k]); setNote("Nudge: change letter " + (pos + 1) + " to " + nxt[pos] + "."); }}>Nudge me one letter (−8)</button>
      <button className="text-button" onClick={() => { setShowPath((value) => !value); setHintUsed(true); }}>{showPath ? "Hide suggested path" : "Need a nudge? Reveal one possible path"}</button>
      {showPath && <p className="ladder-hint">One valid route: {item.path.join(" → ")}</p>}
    </> : <Finish title={entered[entered.length-1] === item.end ? "Ladder climbed" : "The ladder revealed"} detail={"One possible path: " + item.path.join(" → ")} score={entered[entered.length-1] === item.end ? (showPath ? "Hint used" : "Solved") : "Try another run"} />}
    <p className="game-feedback">{note}</p>
  </div>;
}


const MEDICAL_HIVE_PUZZLES = spellingHivePuzzles.filter((puzzle) => !["Practice Round","Capture the Clue","Tricone Terms"].includes(puzzle.title));
function SpellingHive({ seed, onDone }: Props) {
  const puzzle = MEDICAL_HIVE_PUZZLES[seed % MEDICAL_HIVE_PUZZLES.length];
  const letters = useMemo(() => shuffle(puzzle.letters, seeded(seed + 83)), [puzzle, seed]);
  const [entry, setEntry] = useState("");
  const [found, setFound] = useState<string[]>([]);
  const [note, setNote] = useState("Make words of four or more letters. Every word must use the center letter.");
  const [hint, setHint] = useState(false);
  const [ended, setEnded] = useState(false);
  const [shuffles, setShuffles] = useState(0);
  const outer = useMemo(() => shuffle(letters.filter((letter) => letter !== puzzle.center), seeded(seed + 17 + shuffles * 101)), [letters, puzzle, seed, shuffles]);
  const [starter, setStarter] = useState<string | null>(null);
  const maximum = useMemo(() => puzzle.words.reduce((n, word) => n + wordPoints(word, puzzle), 0), [puzzle]);
  const score = found.reduce((n, word) => n + wordPoints(word, puzzle), 0);
  const points = (word: string) => wordPoints(word, puzzle);
  const submit = () => {
    const word = entry.toUpperCase().trim();
    if (ended || !word) return;
    if (word.length < 4) { sfx("wrong"); setNote("Use at least four letters."); return; }
    if (!word.includes(puzzle.center)) { sfx("wrong"); setNote("Every word needs the center letter."); return; }
    if ([...word].some((letter) => !puzzle.letters.includes(letter))) { sfx("wrong"); setNote("That word uses a letter outside the hive."); return; }
    if (!puzzle.words.includes(word)) { sfx("wrong"); setNote("Not in today's word list. Try another combination."); return; }
    if (found.includes(word)) { sfx("wrong"); setNote("Already found. Find a new word."); return; }
    const next = [...found, word];
    reward(true, null, word === puzzle.pangram ? "PANGRAM!" : "+" + points(word));
    setFound(next);
    setEntry("");
    setNote(word === puzzle.pangram ? "Pangram! You used all seven letters." : "+" + points(word) + " points. Keep exploring.");
    if (next.length === puzzle.words.length) {
      setEnded(true);
      onDone(maximum, maximum, true);
    }
  };
  const finish = () => {
    if (ended) return;
    setEnded(true);
    onDone(score, maximum, found.length === puzzle.words.length);
  };
  return <div className="game-layout">
    <div className="game-instructions"><span className="instruction-dot mint" /> Find as many words as you can using the seven hive letters. Words need at least four letters and must include the center letter. Use all seven for a pangram bonus.</div>
    <div className="hive-header"><span className="eyebrow">TODAY'S HIVE</span><strong>{puzzle.title}</strong><small>{found.length} / {puzzle.words.length} words found · {score} points</small></div>
    {(() => {
      const ratio = score / Math.max(1, maximum);
      const ranks = [["Premed", 0], ["Student", 0.1], ["Intern", 0.25], ["Resident", 0.4], ["Fellow", 0.6], ["Attending", 0.8]] as const;
      const rank = [...ranks].reverse().find(([, min]) => ratio >= min)![0];
      const lengths = [...new Set(puzzle.words.map((w) => w.length))].sort((a, b) => a - b);
      return <div className="hive-progress"><div className="hive-rank"><b>{rank}</b><i><span style={{ width: Math.min(100, ratio * 100 / 0.8) + "%" }} /></i></div><div className="hive-lengths">{lengths.map((n) => <span key={n} className={puzzle.words.filter((w) => w.length === n && !found.includes(w)).length === 0 ? "done" : ""}>{n}-letter <b>{puzzle.words.filter((w) => w.length === n && found.includes(w)).length}/{puzzle.words.filter((w) => w.length === n).length}</b></span>)}</div></div>;
    })()}
    <div className="hive-board" aria-label="Seven letter spelling hive">
      <button className="hive-letter center-letter" onClick={() => setEntry((v) => v + puzzle.center)}>{puzzle.center}</button>
      {outer.map((letter, i) => <button key={letter} className={"hive-letter hive-position-" + i} onClick={() => setEntry((v) => v + letter)}>{letter}</button>)}
    </div>
    <div className="hive-entry-row">
      <input value={entry} onChange={(e) => setEntry(e.target.value.toUpperCase().replace(/[^A-Z]/g,""))} onKeyDown={(e) => { if (e.key === "Enter") submit(); }} aria-label="Build a word" placeholder="Build a word…" disabled={ended} />
      <button className="button button-primary" onClick={submit} disabled={ended}>Enter</button>
      <button className="button button-soft" onClick={() => setEntry((v) => v.slice(0,-1))} disabled={ended || !entry}>⌫</button>
      <button className="button button-quiet" onClick={() => setEntry("")} disabled={ended}>Clear</button>
    </div>
    <div className="hive-tools"><button className="text-button" onClick={() => setShuffles((n) => n + 1)}>🔀 Shuffle</button><button className="text-button" onClick={() => { const left = puzzle.words.filter((w) => !found.includes(w)); if (left.length) setStarter(left[Math.floor(Math.random() * left.length)].slice(0, 2) + "…"); }} disabled={ended}>Starter hint</button><button className="text-button" onClick={() => setHint(true)} disabled={hint}>Need a hint?</button><button className="text-button" onClick={finish} disabled={ended}>Finish for today</button></div>
    {hint && <p className="game-feedback">{puzzle.hint}</p>}
    {starter && !ended && <p className="game-feedback">A word still hiding starts with <b>{starter}</b></p>}
    <p className="game-feedback" aria-live="polite">{note}</p>
    {found.length>0&&<div className="hive-found"><SectionLabel>FOUND WORDS</SectionLabel>{found.map((word) => <span key={word} className={word===puzzle.pangram?"pangram-word":""}>{word}<b>+{points(word)}</b></span>)}</div>}
    {ended && <Finish title={found.includes(puzzle.pangram) ? "Pangram found" : "Hive closed"} detail={found.length + " of " + puzzle.words.length + " words found. The longest word is " + puzzle.pangram + "."} score={score + " / " + maximum}><div className="hive-reveal">{puzzle.words.filter((word)=>!found.includes(word)).map((word)=><span key={word}>{word}</span>)}</div></Finish>}
  </div>;
}
function wordPoints(word: string, puzzle: { pangram:string }): number {
  const base = Math.max(1, word.length - 3);
  const pangram = [...new Set(word)].length === 7 && word === puzzle.pangram ? 7 : 0;
  return base + pangram;
}

const MIME_SECONDS = 45;
type MimeStage = "setup" | "ready" | "play" | "between" | "done";
function MimeTime({ seed, onDone }: Props) {
  const [flash, setFlash] = useState<"" | "got" | "skip">("");
  const flashTimer = useRef<number | null>(null);
  const blink = (kind: "got" | "skip") => { setFlash(kind); if (flashTimer.current !== null) window.clearTimeout(flashTimer.current); flashTimer.current = window.setTimeout(() => setFlash(""), 320); };
  const [count, setCount] = useState(2);
  const [names, setNames] = useState(["Player 1", "Player 2", "Player 3", "Player 4", "Player 5", "Player 6"]);
  const [stage, setStage] = useState<MimeStage>("setup");
  const [turn, setTurn] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [cardIndex, setCardIndex] = useState(0);
  const [seconds, setSeconds] = useState(MIME_SECONDS);
  const [gotThisTurn, setGotThisTurn] = useState(0);
  const [skipsThisTurn, setSkipsThisTurn] = useState(0);
  const done = useRef(false);
  const deck = useMemo(() => shuffle(mimeDeck, seeded(seed + 4242)), [seed]);
  const rounds = count === 1 ? 3 : 2;
  const totalTurns = count * rounds;
  const player = turn % count;
  const card = deck[cardIndex % deck.length];

  const begin = () => { setScores(Array(count).fill(0)); setTurn(0); setCardIndex(0); setStage("ready"); done.current = false; };
  const startTurn = () => { setSeconds(MIME_SECONDS); setGotThisTurn(0); setSkipsThisTurn(0); setStage("play"); };
  useEffect(() => {
    if (stage !== "play") return;
    const id = window.setInterval(() => setSeconds((v) => Math.max(0, v - 1)), 1000);
    return () => window.clearInterval(id);
  }, [stage]);
  useEffect(() => { if (stage === "play" && seconds > 0 && seconds <= 5) sfx("tick"); if (stage === "play" && seconds === 0) { sfx("whoosh"); endTurn(); } /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [seconds, stage]);
  const endTurn = () => {
    setScores((all) => all.map((v, i) => i === player ? v + gotThisTurn : v));
    setStage("between");
  };
  const got = () => { blink("got"); reward(true, null, "+1"); setGotThisTurn((v) => v + 1); setCardIndex((v) => v + 1); };
  const skip = () => { blink("skip"); sfx("whoosh"); setSkipsThisTurn((v) => v + 1); setCardIndex((v) => v + 1); };
  const nextTurn = () => {
    if (turn + 1 >= totalTurns) {
      setStage("done");
      if (!done.current) {
        done.current = true;
        const ranked = names.slice(0, count).map((name, i) => ({ name: name.trim() || "Player " + (i + 1), score: scores[i] })).sort((a, b) => b.score - a.score);
        const top = ranked[0].score;
        const medals = ["🥇", "🥈", "🥉"];
        onDone(top, Math.max(12, top), false, "Mime Time · " + count + (count === 1 ? " player" : " players") + "\n" + ranked.map((r, i) => (medals[i] ?? "▫️") + " " + r.name + " " + r.score).join("\n"));
      }
      return;
    }
    setTurn((v) => v + 1);
    setStage("ready");
  };
  const ranked = names.slice(0, count).map((name, i) => ({ name: name.trim() || "Player " + (i + 1), score: scores[i] ?? 0 })).sort((a, b) => b.score - a.score);

  return <div className="game-layout mime-game" data-own-sfx="true">
    {stage === "setup" && <div className="mime-setup">
      <div className="mime-mask" aria-hidden="true">🎭</div>
      <h2>Act it out. No talking!</h2>
      <p>One person acts the card on screen. Everyone else shouts guesses. Tap <b>Got it</b> when someone nails it. {MIME_SECONDS} seconds per turn.</p>
      <div className="mime-count" role="group" aria-label="Number of players">{[1, 2, 3, 4, 5, 6].map((n) => <button key={n} className={count === n ? "chosen" : ""} onClick={() => setCount(n)}>{n === 1 ? "Solo" : n}</button>)}</div>
      <div className="mime-names">{names.slice(0, count).map((name, i) => <input key={i} value={name} maxLength={14} aria-label={"Player " + (i + 1) + " name"} onChange={(e) => setNames((all) => all.map((v, j) => j === i ? e.target.value : v))} />)}</div>
      <button className="button button-primary full-button" onClick={begin}>Start the show ▶</button>
    </div>}
    {stage === "ready" && <div className="mime-ready">
      <span className="eyebrow">TURN {turn + 1} OF {totalTurns}</span>
      <h2>{names[player].trim() || "Player " + (player + 1)}, you're up!</h2>
      <p>{count > 1 ? "Take the phone, hide the screen from the others, then start." : "Act each card out loud-free and count your own wins."}</p>
      <button className="button button-primary full-button" onClick={startTurn}>I'm ready ▶</button>
    </div>}
    {stage === "play" && createPortal(<div className={"mm mm-c" + (cardIndex % 5) + (flash ? " flash-" + flash : "")} role="dialog" aria-label="Mime Time">
      <header className="mm-top">
        <span className="mm-who">{(names[player] ?? "").trim() || "Player " + (player + 1)}</span>
        <div className={"mm-ring" + (seconds <= 10 ? " urgent" : "")}><svg viewBox="0 0 44 44"><circle cx="22" cy="22" r="19" /><circle cx="22" cy="22" r="19" className="fg" style={{ strokeDasharray: 119.4, strokeDashoffset: 119.4 * (1 - seconds / MIME_SECONDS) }} /></svg><b>{seconds}</b></div>
        <span className="mm-tally">{gotThisTurn} ✓<small> · {skipsThisTurn} ↷</small></span>
      </header>
      <div className="mm-card" key={cardIndex}>
        <small>{card.kind.toUpperCase()}</small>
        <h2 style={{ fontSize: card.term.length > 26 ? "clamp(26px,8vw,48px)" : card.term.length > 14 ? "clamp(34px,10.5vw,64px)" : "clamp(44px,15vw,90px)" }}>{card.term}</h2>
        <p>Act it out. No words, no sounds.</p>
      </div>
      <div className="mm-btns"><button className="mm-skip" onClick={skip}><b>↷</b>SKIP</button><button className="mm-got" onClick={got}><b>✓</b>GOT IT</button></div>
      <i className="mm-flash" aria-hidden="true">{flash === "got" ? "✓" : flash === "skip" ? "↷" : ""}</i>
    </div>, document.body)}
    {stage === "between" && <div className="mime-ready">
      <span className="eyebrow">TIME'S UP</span>
      <h2>{gotThisTurn} {gotThisTurn === 1 ? "card" : "cards"}!</h2>
      <div className="mime-scoreline">{names.slice(0, count).map((name, i) => <span key={i} className={i === player ? "active" : ""}>{name.trim() || "Player " + (i + 1)} <b>{scores[i]}</b></span>)}</div>
      <button className="button button-primary full-button" onClick={nextTurn}>{turn + 1 >= totalTurns ? "See final scores" : "Pass the phone ▶"}</button>
    </div>}
    {stage === "done" && <Finish title={count === 1 ? "Show's over!" : ranked[0].name + " steals the show!"} detail={ranked.map((r, i) => (["🥇", "🥈", "🥉"][i] ?? "▫️") + " " + r.name + ": " + r.score).join("  ·  ")} />}
  </div>;
}


function RiddleLab({ seed, onDone }: Props) {
  const picks = useMemo(() => shuffle(riddles, seeded(seed + 991)).slice(0, 5), [seed]);
  const [round, setRound] = useState(0);
  const [shown, setShown] = useState(1);
  const [gone, setGone] = useState<string[]>([]);
  const [results, setResults] = useState<number[]>([]);
  const [solved, setSolved] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const done = useRef(false);
  const item = picks[round];
  const options = useMemo(() => riddleOptions(item, seeded(seed + round * 17 + 5)), [item, seed, round]);
  const points = (clues: number) => 5 - clues;
  const guess = (option: string) => {
    if (solved !== null || gone.includes(option)) return;
    if (option === item.answer) { setSolved(option); setResults((all) => [...all.slice(0, round), points(shown)]); return; }
    sfx("wrong");
    setGone((g) => [...g, option]);
    if (shown >= 4) { setSolved("__missed"); setResults((all) => [...all.slice(0, round), 0]); }
    else setShown((n) => n + 1);
  };
  const next = () => {
    if (round === picks.length - 1) {
      const total = results.reduce((n, v) => n + v, 0);
      setFinished(true);
      if (!done.current) {
        done.current = true;
        const square = ["⬛", "🟥", "🟧", "🟨", "🟩"];
        onDone(total, 20, total === 20, "Riddle Lab " + total + "/20\n" + results.map((v) => square[v]).join(""));
      }
      return;
    }
    setRound((v) => v + 1); setShown(1); setGone([]); setSolved(null);
  };
  const total = results.reduce((n, v) => n + v, 0);
  return <div className="game-layout riddle-game" data-own-sfx="true">
    <div className="riddle-hud"><span>RIDDLE {Math.min(round + 1, picks.length)} / {picks.length}</span><b>{total} pts</b></div>
    {!finished ? <>
      <div className="riddle-kind">I am a <b>{item.kind.toLowerCase()}</b>…</div>
      <div className="riddle-clues">{item.clues.slice(0, shown).map((clue, i) => <p key={i} className={"riddle-clue clue-" + i}><span>{i + 1}</span>{clue}</p>)}</div>
      <p className="riddle-worth">{solved === null ? "Worth " + points(shown) + " point" + (points(shown) === 1 ? "" : "s") + " right now" : solved === "__missed" ? "Missed it. The answer was " + item.answer + "." : "+" + points(shown) + " · it was " + item.answer + "!"}</p>
      <div className="riddle-options">{options.map((opt) => <button key={opt} disabled={solved !== null || gone.includes(opt)} className={(gone.includes(opt) ? "gone" : "") + (solved !== null && opt === item.answer ? " right" : "")} onClick={(e) => { guess(opt); if (opt === item.answer) reward(true, e.currentTarget as Element, "+" + points(shown)); }}>{opt}</button>)}</div>
      {solved !== null && <button className="button button-primary full-button" onClick={next}>{round === picks.length - 1 ? "See my score" : "Next riddle ▶"}</button>}
    </> : <Finish title="Case closed" detail={results.map((v, i) => picks[i].answer + " (" + v + ")").join(" · ")} score={total + " / 20"} />}
  </div>;
}

interface Organ { id: string; name: string; fact: string; node: (hot: boolean) => ReactNode }
const BODY_INK = "#2a1658";
const organStyle = (fill: string, hot: boolean) => ({ fill, stroke: BODY_INK, strokeWidth: hot ? 3.5 : 2, strokeLinejoin: "round" as const });
const ORGANS: Organ[] = [
  { id: "colon", name: "Colon", fact: "It frames the small intestine: ascending, transverse, descending, then sigmoid.", node: (h) => <path d="M66 216V186Q66 172 80 172H120Q134 172 134 186V216" fill="none" stroke={h ? "#ffd54a" : "#e08f5a"} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" /> },
  { id: "kidney", name: "Kidney", fact: "They sit behind the abdominal cavity beside the spine; the right usually sits a little lower.", node: (h) => <g><ellipse cx={77} cy={168} rx={6} ry={11} {...organStyle("#c0392b", h)} /><ellipse cx={123} cy={168} rx={6} ry={11} {...organStyle("#c0392b", h)} /></g> },
  { id: "smallint", name: "Small intestine", fact: "About 6 meters long: duodenum, jejunum, ileum.", node: (h) => <g><rect x={82} y={186} width={36} height={24} rx={10} {...organStyle("#ffc1d4", h)} /><path d="M88 194q6-6 12 0t12 0M88 202q6-6 12 0t12 0" fill="none" stroke={BODY_INK} strokeWidth={2} strokeLinecap="round" /></g> },
  { id: "pancreas", name: "Pancreas", fact: "It lies behind the stomach and is both a digestive and an endocrine gland.", node: (h) => <ellipse cx={108} cy={164} rx={24} ry={5.5} transform="rotate(-8 108 164)" {...organStyle("#ffd966", h)} /> },
  { id: "liver", name: "Liver", fact: "The largest solid organ, mostly in the right upper quadrant (your left on this diagram).", node: (h) => <path d="M52 140Q70 128 106 136Q114 150 100 162Q70 168 54 156Z" {...organStyle("#b5602f", h)} /> },
  { id: "stomach", name: "Stomach", fact: "It sits in the left upper abdomen; gastric acid is around pH 1.5–2.", node: (h) => <ellipse cx={124} cy={148} rx={16} ry={12} transform="rotate(25 124 148)" {...organStyle("#ffb36b", h)} /> },
  { id: "spleen", name: "Spleen", fact: "Tucked behind the stomach under the left ribs.", node: (h) => <ellipse cx={144} cy={142} rx={6} ry={11} {...organStyle("#9a4fd1", h)} /> },
  { id: "gallbladder", name: "Gallbladder", fact: "A small pouch under the liver that stores bile.", node: (h) => <ellipse cx={95} cy={162} rx={4.5} ry={7} {...organStyle("#3ec28f", h)} /> },
  { id: "bladder", name: "Bladder", fact: "A pelvic organ that stores urine.", node: (h) => <ellipse cx={100} cy={224} rx={10} ry={7} {...organStyle("#ffe27a", h)} /> },
  { id: "rlung", name: "Right lung", fact: "Three lobes, and the patient's right is on your left. It is shorter than the left because the liver sits beneath it.", node: (h) => <ellipse cx={78} cy={104} rx={19} ry={32} {...organStyle("#8fd7ff", h)} /> },
  { id: "llung", name: "Left lung", fact: "Two lobes, with a notch for the heart.", node: (h) => <ellipse cx={122} cy={106} rx={17} ry={30} {...organStyle("#8fd7ff", h)} /> },
  { id: "heart", name: "Heart", fact: "About the size of your fist, tilted slightly left of the midline.", node: (h) => <path d="M104 126C88 114 90 98 102 100c5 1 7 5 8 8 1-3 3-7 8-8 12-2 14 14-2 26z" transform="translate(2 2)" {...organStyle("#ff4f6e", h)} /> },
  { id: "thyroid", name: "Thyroid", fact: "Butterfly-shaped, wrapped around the front of the windpipe.", node: (h) => <g><ellipse cx={93} cy={62} rx={7} ry={5} {...organStyle("#ff8a5c", h)} /><ellipse cx={107} cy={62} rx={7} ry={5} {...organStyle("#ff8a5c", h)} /><rect x={96} y={60} width={8} height={4} fill="#ff8a5c" /></g> },
  { id: "brain", name: "Brain", fact: "About 2% of body weight but around 20% of the body's energy use.", node: (h) => <g><ellipse cx={100} cy={26} rx={17} ry={13} {...organStyle("#ff9fc2", h)} /><path d="M92 22q4 4 0 8M104 20q-4 4 0 9M99 16v6" fill="none" stroke={BODY_INK} strokeWidth={1.5} strokeLinecap="round" /></g> }
];
const BODY_SECONDS = 15;
type BodyView = "organs" | "front" | "back";
interface BodyTarget { id: string; name: string; fact: string; view: BodyView; keys?: string[] }
/** Muscle targets use outlines from `dataBodyMuscles.ts` (keys select the polygons; a muscle may span both sides). */
const MUSCLE_TARGETS: BodyTarget[] = [
  { id: "pec", view: "front", keys: ["chest"], name: "Pectoralis major", fact: "Adducts and medially rotates the arm; supplied by the medial and lateral pectoral nerves." },
  { id: "rectus", view: "front", keys: ["abs"], name: "Rectus abdominis", fact: "The \"six-pack\" muscle, divided by tendinous intersections; supplied by the thoracoabdominal nerves (T7–T12)." },
  { id: "extobl", view: "front", keys: ["obliques"], name: "External oblique", fact: "The flank muscle that rotates and flexes the trunk; its aponeurosis forms the anterior wall of the inguinal canal." },
  { id: "biceps", view: "front", keys: ["biceps"], name: "Biceps brachii", fact: "Flexes the elbow and supinates the forearm; supplied by the musculocutaneous nerve (C5–C6)." },
  { id: "deltA", view: "front", keys: ["front-deltoids"], name: "Deltoid (anterior fibres)", fact: "Flexes the shoulder; the axillary nerve supplies it and is at risk in surgical-neck humerus fractures." },
  { id: "quads", view: "front", keys: ["quadriceps"], name: "Quadriceps femoris", fact: "Extends the knee; supplied by the femoral nerve (L2–L4), which the patellar reflex tests." },
  { id: "flexors", view: "front", keys: ["forearm"], name: "Forearm flexors", fact: "Mostly median nerve, with flexor carpi ulnaris and the medial flexor digitorum profundus on the ulnar nerve." },
  { id: "trap", view: "back", keys: ["trapezius"], name: "Trapezius", fact: "Elevates, retracts and rotates the scapula; supplied by the spinal accessory nerve (CN XI)." },
  { id: "lats", view: "back", keys: ["upper-back"], name: "Latissimus dorsi", fact: "Extends, adducts and medially rotates the arm; supplied by the thoracodorsal nerve." },
  { id: "deltP", view: "back", keys: ["back-deltoids"], name: "Deltoid (posterior fibres)", fact: "Extends and laterally rotates the shoulder; supplied by the axillary nerve." },
  { id: "triceps", view: "back", keys: ["triceps"], name: "Triceps brachii", fact: "Extends the elbow; supplied by the radial nerve, so a humeral shaft fracture can weaken it." },
  { id: "erector", view: "back", keys: ["lower-back"], name: "Lower back (erector spinae)", fact: "Extends and stabilizes the spine; supplied by the dorsal rami of spinal nerves." },
  { id: "glute", view: "back", keys: ["gluteal"], name: "Gluteus maximus", fact: "The main hip extensor; supplied by the inferior gluteal nerve." },
  { id: "hams", view: "back", keys: ["hamstring"], name: "Hamstrings", fact: "Extend the hip and flex the knee; supplied by the sciatic nerve (tibial division, plus common fibular for biceps femoris short head)." },
  { id: "adduct", view: "back", keys: ["adductor"], name: "Hip adductors", fact: "The inner-thigh group; mostly supplied by the obturator nerve." },
  { id: "gastroc", view: "back", keys: ["calves"], name: "Gastrocnemius (calf)", fact: "Plantarflexes the ankle and flexes the knee; supplied by the tibial nerve (S1–S2)." },
  { id: "extensors", view: "back", keys: ["forearm"], name: "Forearm extensors", fact: "Supplied by the radial nerve (mainly its posterior interosseous branch)." }
];
const ORGAN_TARGETS: BodyTarget[] = ORGANS.map((o) => ({ id: o.id, name: o.name, fact: o.fact, view: "organs" as BodyView }));
const BODY_VIEW_LABEL: Record<BodyView, string> = { organs: "Organs", front: "Muscles · front", back: "Muscles · back" };
const BODY_CM_PER_UNIT: Record<BodyView, number> = { organs: 0.73, front: 0.87, back: 0.87 };
const BODY_GEOM = "path,ellipse,rect,polygon,circle";

/** Measures a tap against the rendered shapes of one target: inside the fill/stroke, or the nearest outline distance in screen px. */
function measureTap(shapes: Element[], clientX: number, clientY: number): { inside: boolean; px: number } {
  let inside = false, best = Infinity;
  for (const node of shapes) {
    const el = node as unknown as SVGGeometryElement;
    const m = el.getScreenCTM?.();
    if (!m || typeof el.getTotalLength !== "function") continue;
    const local = new DOMPoint(clientX, clientY).matrixTransform(m.inverse());
    if (el.isPointInFill(local) || el.isPointInStroke(local)) { inside = true; best = 0; break; }
    const len = el.getTotalLength();
    for (let i = 0; i <= 60; i++) {
      const pt = el.getPointAtLength((len * i) / 60).matrixTransform(m);
      best = Math.min(best, Math.hypot(pt.x - clientX, pt.y - clientY));
    }
  }
  return { inside, px: best };
}

function BodyMapBlitz({ seed, onDone }: Props) {
  const targets = useMemo(() => {
    const rnd = seeded(seed + 313);
    return [...shuffle(ORGAN_TARGETS, rnd).slice(0, 4), ...shuffle(MUSCLE_TARGETS.filter((t) => t.view === "front"), rnd).slice(0, 3), ...shuffle(MUSCLE_TARGETS.filter((t) => t.view === "back"), rnd).slice(0, 3)];
  }, [seed]);
  const [round, setRound] = useState(0);
  const [started, setStarted] = useState(Date.now());
  const [seconds, setSeconds] = useState(BODY_SECONDS);
  const [state, setState] = useState<"ask" | "reveal">("ask");
  const [message, setMessage] = useState("");
  const [pts, setPts] = useState<number[]>([]);
  const [marks, setMarks] = useState<string[]>([]);
  const [pin, setPin] = useState<{ x: number; y: number } | null>(null);
  const [finished, setFinished] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const done = useRef(false);
  const target = targets[round];
  const total = pts.reduce((n, v) => n + v, 0);

  useEffect(() => {
    if (state !== "ask" || finished) return;
    const id = window.setInterval(() => setSeconds((v) => Math.max(0, v - 1)), 1000);
    return () => window.clearInterval(id);
  }, [state, round, finished]);
  useEffect(() => { if (state === "ask" && seconds === 0 && !finished) resolve(0, "⬛", "Time's up. "); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [seconds, state]);

  const resolve = (points: number, mark: string, lead: string) => {
    setPts((p) => [...p, points]); setMarks((m) => [...m, mark]);
    setMessage(lead + target.name + ": " + target.fact);
    setState("reveal");
  };
  const shapesOf = (id: string) => Array.from(svgRef.current?.querySelectorAll('[data-shape="' + id + '"] ' + BODY_GEOM) ?? []);
  const tap = (clientX: number, clientY: number, el: Element | null) => {
    const svg = svgRef.current;
    if (state !== "ask" || !svg) return;
    const ctm = svg.getScreenCTM();
    if (!ctm) return;
    const at = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
    setPin({ x: at.x, y: at.y });
    const width = svg.getBoundingClientRect().width || 1;
    const hit = measureTap(shapesOf(target.id), clientX, clientY);
    const elapsed = (Date.now() - started) / 1000;
    const distFrac = hit.px / width;
    const points = bodyTapPoints(hit.inside, distFrac, elapsed);
    const unitPx = ctm.a || 1;
    const cm = Math.round((hit.px / unitPx) * BODY_CM_PER_UNIT[target.view]);
    const other = !hit.inside ? targets.concat(ORGAN_TARGETS, MUSCLE_TARGETS).find((t) => t.view === target.view && t.id !== target.id && measureTap(shapesOf(t.id), clientX, clientY).inside) : undefined;
    if (hit.inside) {
      if (el) reward(true, el, "+" + points); else reward(true, svg, "+" + points);
      resolve(points, elapsed <= 4 ? "🟩" : "🟨", "Bullseye! ");
    } else {
      reward(false, svg);
      const gap = cm <= 0 ? "just off" : "about " + cm + " cm off";
      resolve(points, points >= 5 ? "🟧" : points > 0 ? "🟥" : "⬛", (other ? "That was the " + other.name.toLowerCase() + ". " : "") + (points > 0 ? "So close, " + gap + " (+" + points + "). " : "Missed, " + gap + ". "));
    }
  };
  const next = () => {
    if (round === targets.length - 1) {
      setFinished(true);
      if (!done.current) {
        done.current = true;
        onDone(total, 100, total === 100, "Body Map Blitz " + total + "/100\n" + marks.join(""));
      }
      return;
    }
    setRound((v) => v + 1); setMessage(""); setPin(null); setSeconds(BODY_SECONDS); setStarted(Date.now()); setState("ask");
  };
  const view = target?.view ?? "organs";
  const hotFill = (id: string) => (state === "reveal" && id === target.id ? "#ffd54a" : "#ffd9b8");
  const muscles = view === "front" ? anteriorMuscles : posteriorMuscles;
  const muscleIds = (key: string) => MUSCLE_TARGETS.filter((t) => t.view === view && t.keys?.includes(key));
  return <div className="game-layout bodymap-game" data-own-sfx="true">
    <div className="bodymap-hud"><span>{Math.min(round + 1, targets.length)} / {targets.length}</span><b>{total} pts</b><div className={"bodymap-clock" + (seconds <= 5 ? " urgent" : "")}><i style={{ width: (state === "ask" ? seconds / BODY_SECONDS * 100 : 0) + "%" }} /></div></div>
    {!finished ? <>
      <div className="bodymap-prompt">Tap the <b>{target.name}</b></div>
      <p className="bodymap-view">{BODY_VIEW_LABEL[view]} · closer taps score more</p>
      {view === "organs" ? <svg ref={svgRef} data-target={target.id} className="bodymap-svg" viewBox="20 0 160 240" role="group" aria-label="Body diagram. The patient's right side is on your left." onClick={(e) => tap(e.clientX, e.clientY, e.detail === 0 ? e.target as Element : null)}>
        <path d="M52 74Q30 84 26 132" fill="none" stroke={BODY_INK} strokeWidth={16} strokeLinecap="round" /><path d="M52 74Q30 84 26 132" fill="none" stroke="#ffd9b8" strokeWidth={11} strokeLinecap="round" />
        <path d="M148 74Q170 84 174 132" fill="none" stroke={BODY_INK} strokeWidth={16} strokeLinecap="round" /><path d="M148 74Q170 84 174 132" fill="none" stroke="#ffd9b8" strokeWidth={11} strokeLinecap="round" />
        <circle cx={100} cy={28} r={23} fill="#ffd9b8" stroke={BODY_INK} strokeWidth={2.5} />
        <rect x={91} y={48} width={18} height={16} fill="#ffd9b8" stroke={BODY_INK} strokeWidth={2.5} />
        <path d="M58 66Q100 58 142 66Q154 70 154 92L152 192Q150 236 100 238Q50 236 48 192L46 92Q46 70 58 66Z" fill="#ffd9b8" stroke={BODY_INK} strokeWidth={2.5} />
        {ORGANS.map((organ) => {
          const hot = state === "reveal" && organ.id === target.id;
          return <g key={organ.id} data-shape={organ.id} className={"organ" + (hot ? " organ-hot" : "")} role="button" tabIndex={0} aria-label={organ.name} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); (e.currentTarget as unknown as HTMLElement).dispatchEvent(new MouseEvent("click", { bubbles: true, detail: 0 })); } }}>{organ.node(hot)}</g>;
        })}
        {pin && <circle className="bodymap-pin" cx={pin.x} cy={pin.y} r={4} />}
      </svg> : <svg ref={svgRef} data-target={target.id} className="bodymap-svg bodymap-muscles" viewBox="0 0 100 200" role="img" aria-label={"Muscle diagram, " + (view === "front" ? "front view" : "back view") + ". Tap the named muscle."} onClick={(e) => tap(e.clientX, e.clientY, null)}>
        {muscles.map((group) => {
          const owners = muscleIds(group.m);
          return <g key={group.m} data-shape={owners[0]?.id} className={"muscle" + (owners.some((t) => t.id === target.id) && state === "reveal" ? " organ-hot" : "")}>
            {group.p.map((points, i) => <polygon key={i} points={points} fill={owners.length && hotFill(owners[0].id) === "#ffd54a" && owners[0].id === target.id ? "#ffd54a" : group.m === "head" ? "#ffd9b8" : "#f2c4a0"} stroke={BODY_INK} strokeWidth={0.7} strokeLinejoin="round" />)}
          </g>;
        })}
        {pin && <circle className="bodymap-pin" cx={pin.x} cy={pin.y} r={2.2} />}
      </svg>}
      <p className="bodymap-note">{view === "back" ? "Back view: the patient's right is on your right." : "The patient's right is on your left."}</p>
      <p className="game-feedback" aria-live="polite">{message}</p>
      {state === "reveal" && <button className="button button-primary full-button" onClick={next}>{round === targets.length - 1 ? "See my score" : "Next ▶"}</button>}
    </> : <Finish title="Map complete" detail={marks.join("")} score={total + " / 100"} />}
  </div>;
}


function CrosswordClinic({ seed, onDone, onExit }: Props & { onExit?: () => void }) {
  const cw = useMemo(() => makeCrossword(seed), [seed]);
  const cells = useMemo(() => {
    const map = new Map<string, { letter: string; number?: number }>();
    cw.words.forEach((w) => [...w.word].forEach((ch, i) => {
      const key = (w.row + (w.across ? 0 : i)) + "," + (w.col + (w.across ? i : 0));
      const existing = map.get(key);
      map.set(key, { letter: ch, number: i === 0 ? w.number : existing?.number });
    }));
    return map;
  }, [cw]);
  const [entries, setEntries] = useState<Record<string, string>>({});
  const [sel, setSel] = useState<{ r: number; c: number }>(() => ({ r: cw.words[0].row, c: cw.words[0].col }));
  const [across, setAcross] = useState(true);
  const [wrong, setWrong] = useState<Set<string>>(new Set());
  const [reveals, setReveals] = useState(0);
  const [finished, setFinished] = useState(false);
  const [secs, setSecs] = useState(0);
  useEffect(() => { if (finished) return; const id = window.setInterval(() => setSecs((v) => v + 1), 1000); return () => window.clearInterval(id); }, [finished]);
  const clock = Math.floor(secs / 60) + ":" + String(secs % 60).padStart(2, "0");
  const input = useRef<HTMLInputElement>(null);
  const done = useRef(false);
  const key = (r: number, c: number) => r + "," + c;
  const active = cw.words.find((w) => w.across === across && [...w.word].some((_, i) => key(w.row + (w.across ? 0 : i), w.col + (w.across ? i : 0)) === key(sel.r, sel.c)))
    ?? cw.words.find((w) => [...w.word].some((_, i) => key(w.row + (w.across ? 0 : i), w.col + (w.across ? i : 0)) === key(sel.r, sel.c)));
  const activeCells = new Set(active ? [...active.word].map((_, i) => key(active.row + (active.across ? 0 : i), active.col + (active.across ? i : 0))) : []);

  const complete = (next: Record<string, string>) => {
    if (done.current || ![...cells].every(([k, v]) => next[k] === v.letter)) return;
    done.current = true; setFinished(true);
    onDone(Math.max(0, 100 - reveals * 5), 100, reveals === 0, "Crossword Clinic " + cw.words.length + " words · " + clock + (reveals ? " · " + reveals + " reveal" + (reveals > 1 ? "s" : "") : " · no reveals ✨") + "\n" + "🟩".repeat(cw.words.length));
  };
  const move = (dr: number, dc: number) => {
    let r = sel.r + dr, c = sel.c + dc;
    while (r >= 0 && c >= 0 && r < cw.size && c < cw.size && !cells.has(key(r, c))) { r += dr; c += dc; }
    if (cells.has(key(r, c))) setSel({ r, c });
  };
  const advance = () => { const dir = active ? active.across : across; const dr = dir ? 0 : 1, dc = dir ? 1 : 0; if (cells.has(key(sel.r + dr, sel.c + dc))) setSel({ r: sel.r + dr, c: sel.c + dc }); };
  const type = (letter: string) => {
    if (finished) return;
    const next = { ...entries, [key(sel.r, sel.c)]: letter };
    setEntries(next); setWrong((w) => { const n = new Set(w); n.delete(key(sel.r, sel.c)); return n; });
    sfx("pop"); advance(); complete(next);
  };
  const back = () => {
    if (entries[key(sel.r, sel.c)]) { setEntries((e) => { const n = { ...e }; delete n[key(sel.r, sel.c)]; return n; }); return; }
    const dir = active ? active.across : across;
    const dr = dir ? 0 : -1, dc = dir ? -1 : 0;
    if (cells.has(key(sel.r + dr, sel.c + dc))) setSel({ r: sel.r + dr, c: sel.c + dc });
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (/^[a-zA-Z]$/.test(e.key)) { e.preventDefault(); type(e.key.toUpperCase()); }
    else if (e.key === "Backspace") { e.preventDefault(); back(); }
    else if (e.key === "ArrowRight") { e.preventDefault(); setAcross(true); move(0, 1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); setAcross(true); move(0, -1); }
    else if (e.key === "ArrowDown") { e.preventDefault(); setAcross(false); move(1, 0); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setAcross(false); move(-1, 0); }
    else if (e.key === " " || e.key === "Tab") { e.preventDefault(); setAcross((v) => !v); }
  };
  const check = () => {
    const bad = new Set<string>();
    for (const [k, v] of cells) if (entries[k] && entries[k] !== v.letter) bad.add(k);
    setWrong(bad); sfx(bad.size ? "wrong" : "correct");
  };
  const reveal = () => {
    const k = key(sel.r, sel.c), truth = cells.get(k)!.letter;
    if (entries[k] === truth) return;
    setReveals((n) => n + 1);
    const next = { ...entries, [k]: truth };
    setEntries(next); setWrong((w) => { const n = new Set(w); n.delete(k); return n; }); sfx("badge"); complete(next);
  };
  const covers = (w: (typeof cw.words)[number], r: number, c: number) => [...w.word].some((_, i) => w.row + (w.across ? 0 : i) === r && w.col + (w.across ? i : 0) === c);
  const pickCell = (r: number, c: number) => {
    const hasAcross = cw.words.some((w) => w.across && covers(w, r, c)), hasDown = cw.words.some((w) => !w.across && covers(w, r, c));
    if (r === sel.r && c === sel.c && hasAcross && hasDown) setAcross((v) => !v);
    else { setSel({ r, c }); if (!hasAcross) setAcross(false); else if (!hasDown) setAcross(true); }
    input.current?.focus({ preventScroll: true });
  };
  const clueList = (isAcross: boolean) => cw.words.filter((w) => w.across === isAcross).sort((a, b) => a.number - b.number);
  const filled = [...cells.keys()].filter((k) => entries[k]).length;
  // Physical keyboards work anywhere on the page while the chart is open.
  useEffect(() => {
    if (finished) return;
    const handler = (e: KeyboardEvent) => { if (e.metaKey || e.ctrlKey || e.altKey) return; if ((e.target as HTMLElement)?.tagName === "INPUT") return; onKey(e as unknown as React.KeyboardEvent); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  });
  const [showClues, setShowClues] = useState(false);
  const ordered = [...clueList(true), ...clueList(false)];
  const gotoClue = (delta: number) => {
    const i = Math.max(0, ordered.findIndex((w) => w === active));
    const w = ordered[(i + delta + ordered.length) % ordered.length];
    setAcross(w.across); setSel({ r: w.row, c: w.col });
  };
  const KEYS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
  const ui = <div className="xwp" role="dialog" aria-label="Crossword Clinic">
    <header className="xwp-top">
      {onExit && <button className="xwp-icon" onClick={onExit} aria-label="Leave crossword">✕</button>}
      <div className="xwp-title"><b>Crossword Clinic</b><small>⏱ {clock} · {filled}/{cells.size}</small></div>
      <div className="xwp-tools"><button onClick={check}>Check</button><button onClick={reveal}>Reveal −5</button><button onClick={() => setShowClues((v) => !v)}>Clues</button></div>
    </header>
    <div className="xwp-clue"><button onClick={() => gotoClue(-1)} aria-label="Previous clue">‹</button><div><small>{active ? active.number + (active.across ? " ACROSS" : " DOWN") : ""}</small><b>{active?.clue}</b></div><button onClick={() => gotoClue(1)} aria-label="Next clue">›</button></div>
    <div className="xwp-board"><div className="crossword-grid xwp-grid" role="grid" style={{ gridTemplateColumns: "repeat(" + cw.size + ", 1fr)" }}>
      {Array.from({ length: cw.size * cw.size }, (_, i) => {
        const r = Math.floor(i / cw.size), c = i % cw.size, k = key(r, c), cell = cells.get(k);
        if (!cell) return <span key={k} className="xw-block" />;
        const cls = "xw-cell" + (r === sel.r && c === sel.c ? " sel" : activeCells.has(k) ? " in-word" : "") + (wrong.has(k) ? " bad" : "");
        return <button key={k} className={cls} role="gridcell" aria-label={"Row " + (r + 1) + " column " + (c + 1) + (cell.number ? ", clue " + cell.number : "") + (entries[k] ? ", " + entries[k] : ", empty")} onClick={() => pickCell(r, c)}>{cell.number && <i>{cell.number}</i>}{entries[k] ?? ""}</button>;
      })}
    </div></div>
    {showClues && <div className="xwp-drawer">{[true, false].map((isAcross) => <div key={String(isAcross)}><h4>{isAcross ? "ACROSS" : "DOWN"}</h4>{clueList(isAcross).map((w) => <button key={w.number + String(isAcross)} className={active === w ? "on" : ""} onClick={() => { setAcross(w.across); setSel({ r: w.row, c: w.col }); setShowClues(false); }}><b>{w.number}</b> {w.clue} <small>({w.word.length})</small></button>)}</div>)}</div>}
    <div className="xwp-keys">
      {KEYS.map((row, ri) => <div key={row} className="xwp-row">
        {ri === 2 && <button className="xwp-key wide" onClick={() => setAcross((v) => !v)} aria-label="Switch direction">↔</button>}
        {[...row].map((ch) => <button key={ch} className="xwp-key" onClick={() => type(ch)}>{ch}</button>)}
        {ri === 2 && <button className="xwp-key wide" onClick={back} aria-label="Delete">⌫</button>}
      </div>)}
    </div>
  </div>;
  return <div className="game-layout crossword-game" data-own-sfx="true">
    {!finished ? (typeof document !== "undefined" ? createPortal(ui, document.body) : null) : <Finish title="Grid complete!" detail={reveals ? reveals + " letter" + (reveals > 1 ? "s" : "") + " revealed." : "Solved without a single reveal."} score={Math.max(0, 100 - reveals * 5) + " / 100"} />}
  </div>;
}


let trailPacksCache: typeof microbePacks | null = null;
const trailPacks = () => (trailPacksCache ??= microbePacks.filter(trailPackOk));
function ThemeTrail({ seed, onDone, specialty = "general" }: Props) {
  const pack = pick(trailPacks(), seed, specialty, "microbe");
  const puzzle = useMemo(() => makeTrailPuzzle(pack, seed), [pack, seed]);
  const { grid, rows, columns } = puzzle;
  // Measured cell centres let us draw connecting lines for the live path and for every found word, like the Strands look.
  const boardRef = useRef<HTMLDivElement>(null);
  const [geo, setGeo] = useState<{ w: number; h: number; c: { x: number; y: number }[] }>({ w: 0, h: 0, c: [] });
  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;
    const measure = () => {
      const br = board.getBoundingClientRect();
      const c = [...board.querySelectorAll<HTMLElement>("[data-cell]")].map((el) => { const r = el.getBoundingClientRect(); return { x: r.left - br.left + r.width / 2, y: r.top - br.top + r.height / 2 }; });
      setGeo({ w: br.width, h: br.height, c });
    };
    measure();
    const ro = typeof ResizeObserver === "function" ? new ResizeObserver(measure) : null;
    ro?.observe(board);
    return () => ro?.disconnect();
  }, [grid]);
  const [found, setFound] = useState<string[]>([]);
  const [bonus, setBonus] = useState<string[]>([]);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hintCells, setHintCells] = useState<number[]>([]);
  const [path, setPath] = useState<number[]>([]);
  const [note, setNote] = useState("Drag through touching letters (any direction) to spell a hidden term. Or tap letters one by one, then Submit.");
  const [ended, setEnded] = useState(false);
  const drag = useRef(false);
  const moved = useRef(false);
  const done = useRef(false);
  const ownerOf = useMemo(() => {
    const map = new Map<number, string>();
    for (const word of found) puzzle.paths[word].forEach((cell) => map.set(cell, word));
    return map;
  }, [found, puzzle]);
  const earnedHints = Math.floor(bonus.length / 3);
  const hintsAvailable = earnedHints - hintsUsed;
  const currentWord = readStrandsPath(grid, path, columns);

  const finishGame = (all: string[]) => {
    setEnded(true);
    if (done.current) return;
    done.current = true;
    const score = Math.round(all.length / puzzle.words.length * 100);
    const squares = puzzle.words.map((w) => all.includes(w) ? (w === puzzle.trail ? "🟪" : "🟦") : "⬛").join("");
    onDone(score, 100, all.length === puzzle.words.length && hintsUsed === 0, "Theme Trail · " + puzzle.theme + "\n" + squares + (hintsUsed ? "\n💡 " + hintsUsed + " hint" + (hintsUsed > 1 ? "s" : "") : ""));
  };
  const submit = () => {
    if (ended || path.length < 3) { setPath([]); return; }
    const word = currentWord;
    const match = puzzle.words.find((w) => w === word && !found.includes(w));
    if (match) {
      // Any path that spells the word counts; remember its cells so the board shows where it lives.
      puzzle.paths[match] = [...path];
      const next = [...found, match];
      setFound(next);
      setHintCells([]);
      reward(true, null, match === puzzle.trail ? "TRAIL!" : "+1");
      setNote(match === puzzle.trail ? "You found the trail word, stretching across the whole board!" : "Theme term found: " + match + ".");
      if (next.length === puzzle.words.length) finishGame(next);
    } else if (found.includes(word)) setNote("You already found " + word + ".");
    else if (word.length >= 4 && LETTER_DICTIONARY.includes(word) && !bonus.includes(word)) {
      setBonus((b) => [...b, word]);
      sfx("badge");
      setNote("Bonus word: " + word + ". Every three bonus words earn a hint (" + ((bonus.length + 1) % 3 === 0 ? "hint earned!" : (3 - ((bonus.length + 1) % 3)) + " more to go") + ").");
    } else { sfx("wrong"); setNote("Not a theme term. Keep tracing."); }
    setPath([]);
  };
  const useHint = () => {
    if (hintsAvailable <= 0 || ended) return;
    const left = puzzle.words.filter((w) => !found.includes(w) && w !== puzzle.trail);
    const target = left[0] ?? puzzle.trail;
    setHintsUsed((n) => n + 1);
    setHintCells(puzzle.paths[target]);
    setNote("Hint: these highlighted letters spell a theme term (in order along a trail).");
  };
  const cellAt = (e: React.PointerEvent): number | null => {
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    const raw = el?.closest("[data-cell]")?.getAttribute("data-cell");
    return raw === null || raw === undefined ? null : Number(raw);
  };
  const onDown = (e: React.PointerEvent, cell: number) => {
    if (ended) return;
    e.preventDefault();
    if (path.length && path[path.length - 1] === cell) { submit(); return; }
    drag.current = true; moved.current = false;
    const extended = path.length ? extendStrandsPath(path, cell, rows, columns) : [cell];
    setPath(extended.length === path.length && path.length ? [cell] : extended);
    sfx("tap");
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current || ended) return;
    const cell = cellAt(e);
    if (cell === null) return;
    setPath((p) => { const next = extendStrandsPath(p, cell, rows, columns); if (next.length !== p.length) { moved.current = true; sfx("pop"); } return next; });
  };
  const onUp = () => {
    if (!drag.current) return;
    drag.current = false;
    if (moved.current) submit();
  };
  const accent = (cell: number) => ownerOf.get(cell);
  return <div className="game-layout trail-game" data-own-sfx="true" onPointerUp={onUp} onPointerLeave={() => { if (drag.current) { drag.current = false; if (moved.current) submit(); } }}>
    <div className="trail-theme"><span className="eyebrow">TODAY'S THEME</span><strong>{puzzle.theme}</strong><small>{found.length} / {puzzle.words.length} terms · {bonus.length} bonus {bonus.length === 1 ? "word" : "words"}</small></div>
    <div className="trail-word-live" aria-live="polite">{currentWord || "\u00a0"}</div>
    <div className="trail-board" ref={boardRef} style={{ gridTemplateColumns: "repeat(" + columns + ", 1fr)" }} onPointerMove={onMove}>
      {geo.c.length > 0 && <svg className="trail-lines" width={geo.w} height={geo.h} aria-hidden="true">
        {found.map((word) => <polyline key={word} points={puzzle.paths[word].map((cell) => geo.c[cell] ? geo.c[cell].x + "," + geo.c[cell].y : "").join(" ")} className={word === puzzle.trail ? "line-trail" : "line-found"} />)}
        {path.length > 1 && <polyline points={path.map((cell) => geo.c[cell] ? geo.c[cell].x + "," + geo.c[cell].y : "").join(" ")} className="line-live" />}
      </svg>}
      {grid.flat().map((letter, cell) => {
        const owner = accent(cell), inPath = path.includes(cell);
        return <button key={cell} data-cell={cell} className={"trail-cell" + (owner ? (owner === puzzle.trail ? " is-trail" : " is-found") : "") + (inPath ? " in-path" : "") + (hintCells.includes(cell) ? " hint" : "")} onPointerDown={(e) => onDown(e, cell)} aria-label={"Letter " + letter}>{letter}</button>;
      })}
    </div>
    <div className="trail-actions">
      <button className="button button-primary" onClick={submit} disabled={ended || path.length < 3}>Submit</button>
      <button className="button button-quiet" onClick={() => setPath([])} disabled={!path.length}>Clear</button>
      <button className="button button-soft" onClick={useHint} disabled={hintsAvailable <= 0 || ended}>💡 Hint ({Math.max(0, hintsAvailable)})</button>
      <button className="button button-quiet" onClick={() => finishGame(found)} disabled={ended}>Give up</button>
    </div>
    <p className="game-feedback" aria-live="polite">{note}</p>
    {found.length > 0 && <div className="trail-found">{found.map((w) => <span key={w} className={w === puzzle.trail ? "is-trail" : ""}>{w}</span>)}</div>}
    {ended && <Finish title={found.length === puzzle.words.length ? "Trail complete!" : "Trail revealed"} detail={"The theme was " + puzzle.theme + ". Terms: " + puzzle.words.join(", ") + ". The long trail word was " + puzzle.trail + "."} score={Math.round(found.length / puzzle.words.length * 100) + " / 100"} />}
  </div>;
}
