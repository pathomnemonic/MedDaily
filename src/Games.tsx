import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { connectionPuzzles, diagnosisCases, labPrompts, medleWords, microbePacks, pairsBank, triageCases } from "./data";
import { deductionCases, glyphPatterns, higherLowerPairs, scrambleWordsExtended as scrambleWords, spellingHivePuzzles, wordLadders } from "./dataExtra";
import { hashSeed, lineCells, makeWordSearch, nonogramRuns, normalize, scoreWord, seeded, shuffle, type GameId } from "./lib";
import { deepDivePrompts, triviaCategories, triviaQuestions, type DeepAnswer, type TriviaCategory, type TriviaCategoryId } from "./dataArcade";
import { letterWordPoints, makeLetterGrid, traceGridWord } from "./arcadeLogic";

type Done = (score: number, maxScore: number, perfect: boolean) => void;
type Specialty = "general" | "internal" | "familymed" | "neurology" | "cardiology" | "emergency" | "criticalcare" | "anesthesia" | "surgery" | "orthopedics" | "urology" | "otolaryngology" | "ophthalmology" | "pediatrics" | "obgyn" | "psychiatry" | "infectious" | "allergy" | "nephrology" | "pulmonology" | "endocrine" | "dermatology" | "rheumatology" | "hemeonc" | "gastro" | "geriatrics" | "radiology" | "anatomy" | "pathology" | "pharmacology" | "biostatistics";
interface Props { seed: number; onDone: Done; specialty?: Specialty }
export function GameBoard({ game, seed, onDone, specialty = "general" }: Props & { game: GameId }) {
  switch (game) {
    case "medle": return <Medle seed={seed} onDone={onDone} specialty={specialty} />;
    case "connections": return <Connections seed={seed} onDone={onDone} specialty={specialty} />;
    case "diagnosis": return <DoctorDle seed={seed} onDone={onDone} specialty={specialty} />;
    case "microbe": return <MicrobeHunt seed={seed} onDone={onDone} specialty={specialty} />;
    case "labline": return <Labline seed={seed} onDone={onDone} specialty={specialty} />;
    case "pairs": return <MemoryMatch seed={seed} onDone={onDone} specialty={specialty} />;
    case "triage": return <TriageOrder seed={seed} onDone={onDone} specialty={specialty} />;
    case "splice": return <AnagramSprint seed={seed} onDone={onDone} specialty={specialty} />;
    case "glyph": return <CellSketch seed={seed} onDone={onDone} />;
    case "higher": return <HigherLower seed={seed} onDone={onDone} specialty={specialty} />;
    case "ladder": return <WordLadder seed={seed} onDone={onDone} />;
    case "hive": return <SpellingHive seed={seed} onDone={onDone} />;
    case "casefile": return <CasefileLogic seed={seed} onDone={onDone} />;
    case "dive": return <DeepDive seed={seed} onDone={onDone} />;
    case "trivia": return <TriviaRumble seed={seed} onDone={onDone} />;
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

const DIVE_POINTS = [10, 15, 30, 60, 85, 100];
const DIVE_TIERS = ["Surface find", "Familiar current", "Reef discovery", "Rare specimen", "Abyssal find", "Hidden gem"];

function DeepDive({ seed, onDone }: Props) {
  const prompts = useMemo(() => shuffle(deepDivePrompts, seeded(seed + 811)).slice(0, 7), [seed]);
  const [round, setRound] = useState(0);
  const [seconds, setSeconds] = useState(25);
  const [entry, setEntry] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [results, setResults] = useState<{ answer: string | null; points: number; tier: number | null }[]>([]);
  const [last, setLast] = useState<DeepAnswer | null>(null);
  const [message, setMessage] = useState("One answer per round. A valid, less-obvious answer dives deeper.");
  const [finished, setFinished] = useState(false);
  const done = useRef(false);
  const item = prompts[round];
  const total = results.reduce((n, r) => n + r.points, 0);

  useEffect(() => {
    if (revealed || finished) return;
    const interval = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(interval);
  }, [round, revealed, finished]);

  useEffect(() => {
    if (seconds !== 0 || revealed || finished) return;
    setRevealed(true);
    setLast(null);
    setResults((current) => current.length > round ? current : [...current, { answer: null, points: 0, tier: null }]);
    setMessage("Signal lost. No accepted answer this round.");
  }, [seconds, revealed, finished, round]);

  const submit = () => {
    if (revealed || finished || !entry.trim()) return;
    const value = normalize(entry);
    const match = item.answers.find((candidate) =>
      [candidate.answer, ...(candidate.aliases ?? [])].some((accepted) => normalize(accepted) === value)
    );
    if (!match) {
      setMessage("Not in the accepted-answer set. Check the category wording and try another answer.");
      return;
    }
    const points = DIVE_POINTS[match.tier - 1];
    setLast(match);
    setResults((current) => [...current.slice(0, round), { answer: match.answer, points, tier: match.tier }]);
    setRevealed(true);
    setMessage("Accepted. Your answer earned " + points + " points.");
  };

  const pass = () => {
    if (revealed || finished) return;
    setLast(null);
    setResults((current) => [...current.slice(0, round), { answer: null, points: 0, tier: null }]);
    setRevealed(true);
    setMessage("Round passed. No depth gained.");
  };

  const next = () => {
    const currentResults = results.length > round ? results.slice(0, round + 1) : [...results, { answer: null, points: 0, tier: null }];
    if (round === prompts.length - 1) {
      const score = currentResults.reduce((n, r) => n + r.points, 0);
      setFinished(true);
      if (!done.current) {
        done.current = true;
        onDone(score, 700, score === 700);
      }
      return;
    }
    setResults(currentResults);
    setRound((value) => value + 1);
    setSeconds(25);
    setEntry("");
    setLast(null);
    setRevealed(false);
    setMessage("New category. Think past the first obvious answer.");
  };

  return <div className="game-layout dive-game">
    <div className="dive-hud">
      <div><span className="eyebrow">DAILY DEEP DIVE</span><strong>{total * 10}<small> m</small></strong><span>depth reached</span></div>
      <div className={"dive-timer" + (seconds <= 5 ? " urgent" : "")}><b>{revealed ? "✓" : seconds}</b><span>{revealed ? "LOCKED" : "SECONDS"}</span></div>
      <div><span className="eyebrow">EXPEDITION</span><strong>{round + 1}<small> / 7</small></strong><span>prompts</span></div>
    </div>
    <div className="dive-depth-track"><i style={{ width: Math.min(100, total / 7) + "%" }} /></div>
    {!finished ? <>
      <div className="dive-prompt-card">
        <div className="dive-surface-art" aria-hidden="true"><span>◉</span><i>✦</i><b>≈</b></div>
        <span className="eyebrow">{item.scope.toUpperCase()} · PROMPT {round + 1}</span>
        <h2>{item.prompt}</h2>
        <p>Type one answer. The accepted set is curated for this game; rarity tiers are editorial, not live population statistics.</p>
      </div>
      {!revealed ? <form className="dive-answer-row" onSubmit={(event) => { event.preventDefault(); submit(); }}>
        <input value={entry} onChange={(event) => setEntry(event.target.value)} autoComplete="off" placeholder="Your answer…" aria-label="Your answer" />
        <button className="button button-primary" type="submit" disabled={!entry.trim()}>Dive in ↗</button>
        <button className="button button-quiet" type="button" onClick={pass}>Pass</button>
      </form> : <div className="dive-result-card">
        {last ? <>
          <span className={"dive-tier tier-" + last.tier}>{DIVE_TIERS[last.tier - 1]} · {DIVE_POINTS[last.tier - 1]} pts</span>
          <h3>{last.answer}</h3>
          <p>{item.explanation}</p>
          <div className="dive-answer-examples">{item.answers.slice().sort((a, b) => b.tier - a.tier).slice(0, 5).map((answer) => <span key={answer.answer}>{answer.answer}<b>{DIVE_POINTS[answer.tier - 1]}</b></span>)}</div>
        </> : <>
          <span className="dive-tier tier-0">No score this round</span>
          <h3>Keep moving.</h3>
          <p>{item.explanation}</p>
        </>}
        <button className="button button-primary full-button" onClick={next}>{round === 6 ? "Surface & see score" : "Next prompt ↓"}</button>
      </div>}
      <p className="game-feedback" aria-live="polite">{message}</p>
      <div className="dive-progress-dots">{prompts.map((_, i) => <i key={i} className={i < results.length ? "complete" : i === round ? "current" : ""} />)}</div>
    </> : <div className="dive-finale">
      <div className="dive-medal">✦</div><span className="eyebrow">EXPEDITION COMPLETE</span>
      <h2>{total} / 700</h2><p>{total * 10} metres below the surface. {total >= 500 ? "A deep and impressive run." : "Every dive teaches you a new part of the map."}</p>
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
  const [used, setUsed] = useState<Partial<Record<TriviaCategoryId, string[]>>>({});
  const done = useRef(false);
  const currentPlayer = players[turn];
  const limit = mode === "solo" ? 24 : 36;

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
    setStage("question");
  };

  const spin = () => {
    if (stage !== "spin") return;
    const random = seeded(hashSeed(seed + "|" + round + "|" + turn + "|wheel"));
    const index = Math.floor(random() * 7);
    const segment = 360 / 7;
    setRotation((value) => value + 1440 + 360 - (index + 0.5) * segment);
    setStage("spinning");
    window.setTimeout(() => {
      if (index === 6) setStage("wild");
      else deal(triviaCategories[index]);
    }, 1500);
  };

  const answer = (index: number) => {
    if (stage !== "question" || !question || !category || picked !== null) return;
    setPicked(index);
    const correct = index === question.answer;
    const nextPlayers = players.map((player, playerIndex) => {
      if (playerIndex !== turn || !correct) return player;
      const progress = { ...player.progress, [category.id]: Math.min(3, player.progress[category.id] + 1) };
      const crowns = progress[category.id] >= 3 && !player.crowns.includes(category.id) ? [...player.crowns, category.id] : player.crowns;
      return { ...player, progress, crowns, correct: player.correct + 1 };
    });
    setPlayers(nextPlayers);
    const newWinner = nextPlayers.find((player) => player.crowns.length === triviaCategories.length);
    if (newWinner) setWinner(newWinner.name);
    setStage("reveal");
  };

  const finish = () => {
    const best = Math.max(0, ...players.map((player) => player.correct));
    setStage("done");
    if (!done.current) {
      done.current = true;
      onDone(best * 100, limit * 100, best === limit);
    }
  };

  const next = () => {
    if (winner || round + 1 >= limit) { finish(); return; }
    setTurn((value) => mode === "solo" ? 0 : (value + 1) % players.length);
    setRound((value) => value + 1);
    setCategory(null); setQuestion(null); setPicked(null);
    setStage("spin");
  };

  return <div className="game-layout trivia-rumble">
    {stage === "setup" ? <div className="rumble-setup">
      <div className="rumble-logo">TRIVIA <b>RUMBLE</b><span>⚡</span></div>
      <p>Spin into six worlds of medical knowledge. Collect three correct answers in a category to win its badge.</p>
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
        <div className="rumble-question-card"><span className="eyebrow">{category.short} · QUESTION {round + 1}</span><h2>{question.question}</h2></div>
        <div className="rumble-options">{question.options.map((option, i) => <button key={option} disabled={stage === "reveal"} className={stage === "reveal" ? (i === question.answer ? "right" : i === picked ? "wrong" : "dim") : picked === i ? "selected" : ""} onClick={() => answer(i)}><span>{String.fromCharCode(65 + i)}</span>{option}</button>)}</div>
        {stage === "reveal" && <div className={"rumble-explanation" + (picked === question.answer ? " correct" : "")}>
          <b>{picked === question.answer ? "Correct! Badge progress updated." : "Not quite. Correct answer: " + question.options[question.answer] + "."}</b><p>{question.explanation}</p>
          <button className="button button-primary full-button" onClick={next}>{winner ? "See the winner" : round + 1 === limit ? "View final scores" : mode === "pass" ? "Next player's turn →" : "Spin again →"}</button>
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
  const [seconds, setSeconds] = useState(90);
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
  const done = useRef(false);
  const submit = () => {
    const word = guess.trim().toUpperCase();
    if (ended) return;
    if (word.length !== 5 || !/^[A-Z]{5}$/.test(word)) { setMessage("Enter exactly five letters."); return; }
    if (!medleWords.includes(word)) { setMessage("That word isn't in today's medical word list."); return; }
    if (rows.includes(word)) { setMessage("You've already tried that word."); return; }
    const next = [...rows, word]; setRows(next); setGuess("");
    const correct = word === answer, finished = correct || next.length >= 6;
    setMessage(correct ? "Exactly right. Nice diagnosis of a word." : finished ? "The word was " + answer + "." : "Not quite. Use the tile clues to narrow it down.");
    if (finished) { setEnded(true); setWon(correct); if (!done.current) { done.current = true; onDone(correct ? 100 - (next.length - 1) * 12 : 0, 100, correct && next.length === 1); } }
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
    else if (guess.length < 5) setGuess((value) => value + key);
  };
  return <div className="game-layout medle-game">
    <div className="game-instructions"><span className="instruction-dot mint" /> Guess the five-letter medical word in six tries. Green is the right letter in the right place; gold is in the word elsewhere.</div>
    <div className="word-grid" aria-label="Six guess rows">{Array.from({ length: 6 }, (_, r) => {
      const word = rows[r] ?? (r === rows.length ? guess.toUpperCase() : "");
      const marks = rows[r] ? scoreWord(rows[r], answer) : [];
      return <div className="word-row" key={r}>{Array.from({ length: 5 }, (_, c) => <div key={c} className={"word-cell " + (marks[c] ?? (word[c] ? "filled" : ""))}>{word[c] ?? ""}</div>)}</div>;
    })}</div>
    {!ended ? <>
      <form className="word-entry" onSubmit={(e) => { e.preventDefault(); submit(); }}><input autoComplete="off" autoCapitalize="characters" value={guess} maxLength={5} onChange={(e) => setGuess(e.target.value.replace(/[^a-z]/gi, "").slice(0, 5))} aria-label="Five-letter guess" placeholder="TYPE A WORD" /><button className="button button-primary" type="submit">Guess <span>↗</span></button></form>
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
  const choose = (word: string) => {
    if (ended || solved.some((n) => board[n].words.includes(word))) return;
    setSelected((s) => s.includes(word) ? s.filter((x) => x !== word) : s.length < 4 ? [...s, word] : s);
  };
  const submit = () => {
    if (selected.length !== 4 || ended) return;
    const group = tiles.find((t) => selected.includes(t.word))?.group;
    if (group !== undefined && selected.every((word) => board[group].words.includes(word))) {
      const next = [...solved, group]; setSolved(next); setSelected([]); setNote(board[group].category + " — " + board[group].hint);
      if (next.length === 4) { setEnded(true); if (!done.current) { done.current = true; onDone(Math.max(0, 100 - mistakes * 15), 100, mistakes === 0); } }
    } else {
      const nearMiss = group !== undefined && selected.filter((word) => board[group].words.includes(word)).length === 3;
      const next = mistakes + 1; setMistakes(next); setNote(next >= 4 ? "No mistakes left. The remaining groups are shown below." : nearMiss ? "One away… Three of those terms belong together, but one is from another group." : "Not a set. Look for a different connection."); setSelected([]);
      if (next >= 4) { setEnded(true); if (!done.current) { done.current = true; onDone(Math.max(0, 40 - next * 5), 100, false); } }
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

function DoctorDle({ seed, onDone, specialty = "general" }: Props) {
  const item = pick(diagnosisCases, seed, specialty, "diagnosis");
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
    const correct = value === normalize(item.answer);
    setGuesses(next);
    setGuess("");
    if (correct || next.length >= 6) {
      setEnded(true); setWon(correct);
      setNote(correct ? "Diagnosis confirmed." : "No guesses remaining. Review the case.");
      if (!done.current) { done.current = true; onDone(correct ? Math.max(0, 100 - (next.length - 1) * 15 - manualHints * 5) : 0, 100, correct && next.length === 1 && manualHints === 0); }
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
        <div><input id="doctordle-guess" value={guess} onChange={(event) => setGuess(event.target.value)} placeholder="Type a diagnosis…" autoComplete="off" /><button className="button button-primary" type="submit" disabled={!guess.trim()}>Guess ↗</button></div>
      </form>
      <div className="doctordle-tools"><button className="text-button" onClick={revealClue} disabled={clueCount >= item.clues.length}>Reveal another clue · −5 pts</button><span>{guesses.length}/6 guesses used</span></div>
    </> : <Finish title={won ? "Diagnosis found" : "Case revealed"} detail={(won ? "Solved in " + guesses.length + " of 6 guesses. " : "Six guesses used. ") + item.explanation}><p className="doctordle-answer">Answer: <b>{item.answer}</b></p><p className="source-note">Source note: {item.source}</p></Finish>}
    <p className="game-feedback" aria-live="polite">{note}</p>
  </div>;
}


function MicrobeHunt({ seed, onDone, specialty = "general" }: Props) {
  const pack = pick(microbePacks, seed, specialty, "microbe");
  const board = useMemo(() => makeWordSearch(pack.words, 14, seed + 99), [pack, seed]);
  const words = board.placed;
  const [found, setFound] = useState<string[]>([]);
  const [foundPaths, setFoundPaths] = useState<number[][]>([]);
  const [start, setStart] = useState<number | null>(null);
  const [path, setPath] = useState<number[]>([]);
  const [note, setNote] = useState("Drag across a word in any straight direction. You can also tap its first and last letters.");
  const [ended, setEnded] = useState(false);
  const done = useRef(false);

  const begin = (index: number) => {
    if (ended || foundPaths.some((cells) => cells.includes(index))) return;
    if (start === null) { setStart(index); setPath([index]); }
  };
  const preview = (index: number) => {
    if (ended || start === null) return;
    const cells = lineCells(start, index, 14);
    if (cells.length) setPath(cells);
  };
  const resolve = (cells: number[]) => {
    if (cells.length < 2) return;
    const word = cells.map((i) => board.grid[Math.floor(i / 14)][i % 14]).join("");
    const match = words.find((candidate) => !found.includes(candidate) && (candidate === word || candidate === [...word].reverse().join("")));
    if (!match) {
      setNote("That line is not a remaining word. Try another direction or clear your selection.");
      setStart(null); setPath([]);
      return;
    }
    const next = [...found, match];
    setFound(next);
    setFoundPaths((current) => [...current, cells]);
    setStart(null); setPath([]);
    setNote(match + " found. " + (words.length - next.length) + " remaining.");
    if (next.length === words.length) {
      setEnded(true);
      if (!done.current) { done.current = true; onDone(100, 100, true); }
    }
  };
  const finish = (index: number) => {
    if (ended || start === null) return;
    const cells = lineCells(start, index, 14);
    if (!cells.length) {
      setNote("Words run horizontally, vertically, or diagonally in a straight line.");
      setStart(null); setPath([]);
      return;
    }
    if (cells.length > 1) resolve(cells);
  };
  const clear = () => { setStart(null); setPath([]); };

  return <div className="game-layout wordhunt-game">
    <div className="case-banner microbe-banner"><span>WORD HUNT · THEMED SEARCH</span><strong>{pack.name}</strong><small>Find every hidden word. Words may run forwards, backwards, vertically, horizontally, or diagonally.</small></div>
    <div className="wordhunt-layout">
      <div className="wordsearch-board" role="group" aria-label="Letter grid" onPointerMove={(event) => {
        const tile = document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-cell-index]") as HTMLElement | null;
        if (tile) preview(Number(tile.dataset.cellIndex));
      }} onPointerUp={(event) => {
        const tile = document.elementFromPoint(event.clientX, event.clientY)?.closest("[data-cell-index]") as HTMLElement | null;
        if (tile) finish(Number(tile.dataset.cellIndex));
      }} onPointerCancel={clear}>
        {board.grid.flat().map((letter, i) => {
          const isFound = foundPaths.some((cells) => cells.includes(i));
          return <button key={i} data-cell-index={i} type="button" className={"letter-tile" + (path.includes(i) ? " path-cell" : "") + (isFound ? " found-cell" : "")} onPointerDown={() => begin(i)} onClick={(event) => { if (event.detail === 0) { if (start === null) begin(i); else finish(i); } }} disabled={ended} aria-label={"Row " + (Math.floor(i / 14) + 1) + ", column " + (i % 14 + 1) + ", " + letter}>
            {letter}
          </button>;
        })}
      </div>
      <aside className="target-words"><SectionLabel>WORDS TO FIND</SectionLabel><div>{words.map((word) => <span key={word} className={found.includes(word) ? "target-found" : ""}>{word}</span>)}</div></aside>
    </div>
    <div className="connection-controls"><span className="mistake-count">{found.length} / {words.length} found</span><button className="button button-soft" onClick={clear} disabled={ended || start === null}>Clear selection</button><span className="wordhunt-progress">{words.length - found.length} left</span></div>
    <p className="game-feedback" aria-live="polite">{note}</p>
    {ended && <Finish title="Grid cleared!" detail={"Every hidden word in " + pack.name + " found."} score="100 / 100" />}
  </div>;
}

function Labline({ seed, onDone, specialty = "general" }: Props) {
  const rounds = useMemo(() => {
    const pool = specialty === "neurology" ? labPrompts.filter((_, index) => [18,19,20].includes(index)) : specialty === "cardiology" ? labPrompts.filter((_, index) => [1,3,4,17].includes(index)) : labPrompts;
    return shuffle(pool.length >= 5 ? pool : labPrompts, seeded(seed + 27)).slice(0, 5);
  }, [seed, specialty]);
  const [round, setRound] = useState(0);
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [points, setPoints] = useState(0);
  const [total, setTotal] = useState(0);
  const [results, setResults] = useState<{prompt:string;estimate:string;actual:number;unit:string;points:number;context:string;source:string}[]>([]);
  const [message, setMessage] = useState("Five estimates. Trust your clinical intuition; precision earns the points.");
  const [finished, setFinished] = useState(false);
  const done = useRef(false);
  const item = rounds[round];

  const check = () => {
    const estimate = Number(value);
    if (value.trim() === "" || !Number.isFinite(estimate)) { setMessage("Enter a number to make your estimate."); return; }
    if (submitted || finished) return;
    const diff = Math.abs(estimate - item.value);
    const earned = item.tolerance === 0 ? (diff < 0.0001 ? 100 : 0) : Math.max(0, Math.round(100 * (1 - diff / Math.max(item.tolerance * 3, Math.abs(item.value) * 0.2))));
    const nextTotal = total + earned;
    setPoints(earned);
    setTotal(nextTotal);
    setSubmitted(true);
    setResults((current) => [...current, {prompt:item.prompt,estimate:value,actual:item.value,unit:item.unit,points:earned,context:item.context,source:item.source}]);
    setMessage(diff <= item.tolerance ? "Bullseye — inside the expected reference window." : diff <= item.tolerance * 2 ? "Close estimate. Tighten your range next round." : "A useful reference point to remember.");
    if (round === rounds.length - 1) {
      setFinished(true);
      if (!done.current) { done.current = true; onDone(nextTotal, rounds.length * 100, nextTotal === rounds.length * 100); }
    }
  };
  const next = () => {
    if (!submitted || finished) return;
    setRound((current) => current + 1);
    setValue("");
    setPoints(0);
    setSubmitted(false);
    setMessage("New estimate. How close can you get?");
  };

  return <div className="game-layout labline-game">
    <div className="lab-console"><span className="lab-light" /><span>LABLINE · ESTIMATION CHALLENGE</span><span className="lab-light second" /></div>
    <div className="labline-hud"><div><b>{round + 1}<small> / 5</small></b><span>ROUND</span></div><div><b>{total}</b><span>POINTS</span></div><div><b>{Math.max(0, 5 - round - Number(submitted))}</b><span>LEFT</span></div></div>
    <div className="labline-progress"><i style={{width:((round + Number(submitted))/5*100)+"%"}} /></div>
    {!finished ? <>
      <div className="lab-prompt"><SectionLabel>CALIBRATE YOUR CLINICAL EYE</SectionLabel><h3>{item.prompt}</h3><p>Enter your best estimate. No calculator needed.</p></div>
      {!submitted ? <form className="lab-input-row" onSubmit={(event) => { event.preventDefault(); check(); }}><input type="number" step="any" value={value} onChange={(event) => setValue(event.target.value)} aria-label={"Estimate in " + item.unit} placeholder="Your estimate" /><span>{item.unit || "value"}</span><button className="button button-primary" type="submit" disabled={!value.trim()}>Lock estimate</button></form> : <div className="labline-reveal"><span className="eyebrow">REFERENCE VALUE</span><strong>{item.value} {item.unit}</strong><b>{points} / 100</b><p>{item.context}</p><small>Source: {item.source}</small><button className="button button-primary full-button" onClick={next}>Next estimate →</button></div>}
      <p className="game-feedback" aria-live="polite">{message}</p>
    </> : <div className="labline-finale"><Finish title="Calibration complete" detail={"Five clinical estimates. " + (total >= 400 ? "Excellent calibration." : total >= 250 ? "Your reference instincts are developing." : "Keep building your mental reference ranges.")} score={total + " / 500"}><div className="reveal-groups">{results.map((result, index) => <span key={index}><b>{index + 1}. {result.points} pts</b>{result.prompt}<br/>Your estimate: {result.estimate} {result.unit} · Reference: {result.actual} {result.unit}</span>)}</div></Finish></div>}
  </div>;
}

function MemoryMatch({ seed, onDone, specialty = "general" }: Props) {
  const pool = useMemo(() => specialty === "neurology" ? pairsBank.slice(12, 24) : specialty === "infectious" ? pairsBank.slice(36, 46) : specialty === "cardiology" ? pairsBank.slice(0, 12) : pairsBank, [specialty]);
  const pairSet = useMemo(() => shuffle(pool, seeded(seed + 11)).slice(0, 10), [seed, pool]);
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
  const [note, setNote] = useState("Memorize the cards. Find all ten term–association pairs before time runs out.");
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
    onDone(score, 1500, false);
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
      const earned = 100 + Math.min(combo * 10, 50);
      const nextScore = score + earned;
      setMatched(nextMatched);
      setCombo(nextCombo);
      setScore(nextScore);
      setRevealed([]);
      setNote(nextCombo > 1 ? "Pair found. " + nextCombo + " in a row — +" + earned + " points." : "Pair found. +" + earned + " points.");
      if (nextMatched.length === pairSet.length) {
        const finalScore = nextScore + seconds * 2;
        done.current = true;
        setEnded(true);
        setNote("All ten pairs found. Time bonus: " + seconds * 2 + " points.");
        onDone(finalScore, 1500, mismatches === 0);
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
    <div className="game-instructions"><span className="instruction-dot peach" /> Ten pairs are hidden in a 4 × 5 memory board. Match terms to their clinical associations, build a streak, and beat the 75-second clock.</div>
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
    {ended && <Finish title={matched.length === pairSet.length ? "Board cleared!" : "Time's up"} detail={matched.length === pairSet.length ? "All ten associations found in " + moves + " turns." : matched.length + " of ten pairs found. " + mismatches + " mismatches."} score={score + " / 1500"}><div className="reveal-groups">{pairSet.map(([term, meaning]) => <span key={term}><b>{term}</b>{meaning}</span>)}</div></Finish>}
  </div>;
}

function TriageOrder({ seed, onDone, specialty = "general" }: Props) {
  const item = pick(triageCases, seed, specialty, "triage");
  const [steps, setSteps] = useState(() => shuffle(item.steps, seeded(seed + 21)));
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(0);
  const done = useRef(false);
  const move = (index: number, delta: number) => {
    if (submitted) return;
    const target = index + delta; if (target < 0 || target >= steps.length) return;
    setSteps((current) => { const copy = [...current]; [copy[index], copy[target]] = [copy[target], copy[index]]; return copy; });
  };
  const check = () => {
    const positions = steps.reduce((count, step, i) => count + (step === item.steps[i] ? 1 : 0), 0);
    setCorrect(positions); setSubmitted(true);
    if (!done.current) { done.current = true; onDone(Math.round(positions / steps.length * 100), 100, positions === steps.length); }
  };
  return <div className="game-layout">
    <div className="case-banner triage-banner"><span>ORDER OF OPERATIONS</span><strong>{item.title}</strong><small>{item.scenario}</small></div>
    <p className="muted-copy">Arrange the response in the safest order. Use the arrows to move each step.</p>
    <ol className="triage-list">{steps.map((step, i) => <li key={step} className={submitted ? (item.steps[i] === step ? "step-right" : "step-wrong") : ""}><span className="step-number">{i + 1}</span><p>{step}</p><span className="step-moves"><button aria-label={"Move " + step + " up"} disabled={submitted || i === 0} onClick={() => move(i, -1)}>↑</button><button aria-label={"Move " + step + " down"} disabled={submitted || i === steps.length - 1} onClick={() => move(i, 1)}>↓</button></span></li>)}</ol>
    {!submitted ? <button className="button button-primary full-button" onClick={check}>Check sequence</button> : <Finish title={correct === steps.length ? "Sequence secured" : "Review the response order"} detail={"You placed " + correct + " of " + steps.length + " steps in the correct position."} score={Math.round(correct / steps.length * 100) + " / 100"}><div className="reveal-groups">{item.steps.map((s, i) => <span key={s}><b>{i + 1}.</b> {s}</span>)}</div></Finish>}
  </div>;
}

function AnagramSprint({ seed, onDone }: Props) {
  const rounds = useMemo(() => shuffle(scrambleWords, seeded(seed + 51)).slice(0, 5), [seed]);
  const [round, setRound] = useState(0);
  const [text, setText] = useState("");
  const [tries, setTries] = useState(0);
  const [hint, setHint] = useState(false);
  const [roundFinished, setRoundFinished] = useState(false);
  const [won, setWon] = useState(false);
  const [score, setScore] = useState(0);
  const [seconds, setSeconds] = useState(75);
  const [note, setNote] = useState("Five words. Seventy-five seconds. Solve each specimen before moving on.");
  const [ended, setEnded] = useState(false);
  const done = useRef(false);
  const word = rounds[round];
  const scrambled = useMemo(() => {
    const value = shuffle(word[0].split(""), seeded(seed + 51 + round * 73)).join("");
    return value === word[0] ? value.slice(1) + value[0] : value;
  }, [seed, word, round]);

  useEffect(() => {
    if (ended) return;
    const timer = window.setInterval(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [ended]);
  useEffect(() => {
    if (seconds !== 0 || ended || done.current) return;
    done.current = true;
    setEnded(true);
    setNote("Time. The remaining words are revealed below.");
    onDone(score, 100, score === 100);
  }, [seconds, ended, score, onDone]);

  const check = () => {
    const answer = text.trim().replace(/\s/g, "").toUpperCase();
    if (ended || roundFinished || !answer) return;
    const nextTries = tries + 1;
    setTries(nextTries);
    if (answer === word[0]) {
      const earned = hint ? 12 : nextTries === 1 ? 20 : nextTries === 2 ? 15 : 10;
      setScore((current) => current + earned);
      setWon(true);
      setRoundFinished(true);
      setNote("Unscrambled. +" + earned + " points.");
    } else if (nextTries >= 3) {
      setWon(false);
      setRoundFinished(true);
      setNote("Three attempts used. The answer is " + word[0] + ".");
    } else {
      setText("");
      setNote("Not quite. " + (3 - nextTries) + " attempts left.");
    }
  };
  const next = () => {
    if (!roundFinished || ended) return;
    if (round === rounds.length - 1) {
      const finalScore = score;
      setEnded(true);
      if (!done.current) { done.current = true; onDone(finalScore, 100, finalScore === 100); }
      return;
    }
    setRound((current) => current + 1);
    setText("");
    setTries(0);
    setHint(false);
    setWon(false);
    setRoundFinished(false);
    setNote("Next specimen. Keep the pace.");
  };

  return <div className="game-layout anagram-sprint">
    <div className="anagram-hud"><div><span className="eyebrow">ANAGRAM SPRINT</span><b>{round + 1}<small> / 5</small></b></div><div className={"anagram-clock" + (seconds <= 10 ? " urgent" : "")}>{seconds}s</div><div><b>{score}<small> pts</small></b></div></div>
    <div className="anagram-progress"><i style={{width:((round + Number(roundFinished))/5*100)+"%"}} /></div>
    {!ended ? <>
      <div className="game-instructions"><span className="instruction-dot mint" /> Unscramble the medical term. Three attempts per word; a hint reduces the maximum points.</div>
      <div className="anagram-board"><span className="eyebrow">SPECIMEN {round + 1} · {word[0].length} LETTERS</span><div className="anagram-letters">{scrambled.split("").map((ch, i) => <b key={i}>{ch}</b>)}</div>{hint && <p>{word[1]}</p>}</div>
      {!roundFinished ? <>
        <form className="word-entry" onSubmit={(event) => { event.preventDefault(); check(); }}><input value={text} onChange={(event) => setText(event.target.value.replace(/[^a-z]/gi, "").toUpperCase())} maxLength={word[0].length} placeholder="Your answer" autoComplete="off" /><button className="button button-primary" type="submit" disabled={!text.trim()}>Submit</button></form>
        <div className="anagram-tools"><button className="text-button" onClick={() => setHint(true)} disabled={hint}>Reveal definition hint</button><span>{tries} / 3 attempts</span></div>
      </> : <div className="anagram-round-result"><b>{won ? "Correct" : "Answer revealed"} · {won ? "Points added" : "No points"}</b><h3>{word[0]}</h3><p>{word[1]}</p><button className="button button-primary full-button" onClick={next}>{round === 4 ? "Finish sprint" : "Next specimen →"}</button></div>}
      <p className="game-feedback" aria-live="polite">{note}</p>
    </> : <Finish title="Sprint complete" detail={"You solved " + (round + Number(roundFinished)) + " of five specimens before the clock ran out."} score={score + " / 100"}><div className="reveal-groups">{rounds.map(([answer, clue], index) => <span key={answer}><b>{index + 1}. {answer}</b>{clue}</span>)}</div></Finish>}
  </div>;
}

function CellSketch({ seed, onDone }: Props) {
  const item = glyphPatterns[seed % glyphPatterns.length];
  const [cells, setCells] = useState<number[][]>(() => item.pattern.map((row) => row.map(() => 0)));
  const [checked, setChecked] = useState(false);
  const rowClues = item.pattern.map((row) => nonogramRuns(row));
  const colClues = item.pattern[0].map((_, c) => nonogramRuns(item.pattern.map((row) => row[c])));
  const lineSolved = (line: number[], clue: number[]) => line.every((value) => value !== 0) && JSON.stringify(nonogramRuns(line.map((value) => value === 1 ? 1 : 0))) === JSON.stringify(clue);
  const check = () => {
    const correct = item.pattern.reduce((n, row, r) => n + row.reduce((m, value, c) => m + ((value === 1 && cells[r][c] === 1) || (value === 0 && cells[r][c] === 2) ? 1 : 0), 0), 0);
    setChecked(true);
    onDone(Math.round(correct / 25 * 100), 100, correct === 25);
  };
  return <div className="game-layout">
    <div className="game-instructions"><span className="instruction-dot lilac" /> Solve the 5×5 nonogram. Each clue gives the length of consecutive filled runs. Cycle each cell through unknown, filled, and marked empty to keep track without paper.</div>
    <div className="nonogram-legend"><span><b>●</b> Filled</span><span><b>×</b> Empty</span><span><b>·</b> Unknown</span></div>
    <div className="nonogram-wrap"><div className="nonogram-col-clues"><span />{colClues.map((clue, i) => <span key={i} className={lineSolved(cells.map((row) => row[i]), clue)?"clue-complete":""}>{clue.length ? clue.join(" ") : "–"}</span>)}</div><div className="nonogram-grid">{cells.map((row, r) => <div className="nonogram-row" key={r}><span className={"nonogram-clue"+(lineSolved(row,rowClues[r])?" clue-complete":"")}>{rowClues[r].length ? rowClues[r].join(" ") : "–"}</span>{row.map((value, c) => <button key={c} disabled={checked} aria-label={"Row " + (r+1) + " column " + (c+1) + ": " + (value===1?"filled":value===2?"marked empty":"unknown")} className={"nonogram-cell" + (value===1 ? " filled-cell" : "") + (value===2 ? " empty-marked" : "") + (checked && (item.pattern[r][c] ? value!==1 : value!==2) ? " error-cell" : "")} onClick={() => setCells((all) => all.map((x, ri) => ri === r ? x.map((v, ci) => ci === c ? (v + 1) % 3 : v) : x))}>{value===1?"●":value===2?"×":""}</button>)}</div>)}</div></div>
    <div className="nonogram-actions"><span>{cells.flat().filter((value)=>value!==0).length} / 25 cells marked</span><button className="button button-quiet" onClick={()=>setCells(item.pattern.map((row)=>row.map(()=>0)))} disabled={checked}>Reset grid</button></div>
    {!checked ? <button className="button button-primary full-button" onClick={check}>Check pattern</button> : <Finish title="Pattern revealed" detail={"The hidden shape was " + item.name + ". " + item.hint + ". Filled cells are compared with the solution."} score={Math.round(item.pattern.reduce((n, row, r) => n + row.reduce((m, v, c) => m + ((v===1 && cells[r][c]===1) || (v===0 && cells[r][c]===2) ? 1 : 0), 0), 0) / 25 * 100) + " / 100"} />}
  </div>;
}

function HigherLower({ seed, onDone }: Props) {
  const list = useMemo(() => shuffle(higherLowerPairs.filter((item) => "fun" in item), seeded(seed + 29)).slice(0, 5), [seed]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<"a" | "b" | "tie" | null>(null);
  const [reveal, setReveal] = useState(false);
  const [finished, setFinished] = useState(false);
  const item = list[round];
  const correct = item.av === item.bv ? "tie" : item.av > item.bv ? "a" : "b";
  const choose = (v: "a"|"b"|"tie") => {
    if (reveal || finished) return;
    const ok = v === correct;
    const next = score + (ok ? 1 : 0);
    setPicked(v); setScore(next); setReveal(true);
    window.setTimeout(() => {
      if (round + 1 === list.length) { setFinished(true); onDone(Math.round(next / list.length * 100), 100, next === list.length); }
      else { setRound((r) => r + 1); setPicked(null); setReveal(false); }
    }, 900);
  };
  return <div className="game-layout">
    <div className="game-instructions"><span className="instruction-dot gold" /> Which quantity is greater? Five quick comparisons. Sometimes the answer is a tie.</div>
    <div className="higher-progress">COMPARISON {Math.min(round + 1, 5)} / 5 <span>{score} right</span></div>
    {!finished ? <div className="higher-cards"><button className={"higher-card" + (reveal && correct === "a" ? " right" : reveal && picked === "a" ? " wrong" : "")} onClick={() => choose("a")} disabled={reveal}><span>A</span><b>{item.a}</b>{reveal && <strong>{item.av}</strong>}</button><div className="higher-or">{reveal && correct === "tie" ? "TIE" : "OR"} <button onClick={() => choose("tie")} disabled={reveal}>=</button></div><button className={"higher-card" + (reveal && correct === "b" ? " right" : reveal && picked === "b" ? " wrong" : "")} onClick={() => choose("b")} disabled={reveal}><span>B</span><b>{item.b}</b>{reveal && <strong>{item.bv}</strong>}</button></div> : <Finish title="Comparison complete" detail={"You called " + score + " of " + list.length + " comparisons correctly."} score={Math.round(score/list.length*100) + " / 100"} />}
    {reveal && <p className="game-feedback">{item.explanation} <span className="source-note">{item.source}</span></p>}
  </div>;
}

const LADDER_WORDS = new Set(["COLD","CORD","CARD","WARD","WARM","HEAL","HEAR","SEAR","SEER","SEEK","PAIN","GAIN","CARE","CURE","VEIN","VEIL","VAIL","PAIL","MIND","MILD","BOLD","BOND","BEND","SEND","SAND","SANE","CANE","CONE","BONE","TONE","TUNE","MULE","MILE","TILE","TIDE","SIDE","SINE","LINE","LION","IRON","ICON","RING","SING","SONG","LONG","LUNG","FINE","FIVE","DIVE","LIVE","LOVE","MOVE","MORE","CARE","CASE","CASH","WASH","WISH","FISH","FIST","LIST","LAST","LOST","COST","CAST","EAST","EASE","EARS","EARN","BARN","BARK","DARK","DART","PART","PARK","MARK","MARS","MASS","PASS","PAST","FAST","FATE","LATE","MATE","MATH","PATH","BATH","BETA","DATA","DATE","GATE","GAME","NAME","SAME","SAVE","SAFE","SAGE","PAGE","PACE","RACE","RARE","CARE","CORE","CURE","PURE","PURL","PEAR","HEAR","BEAR","BEAD","HEAD","HEAT","SEAT","MEAT","MELT","BELT","BELL","CELL","SELL","SELF","SHELF"]);
function WordLadder({ seed, onDone }: Props) {
  const item = wordLadders[seed % wordLadders.length];
  const [entered, setEntered] = useState<string[]>([item.start]);
  const [text, setText] = useState("");
  const [note, setNote] = useState("Change one letter at a time. Every step must be a real word.");
  const [showPath, setShowPath] = useState(false);
  const [ended, setEnded] = useState(false);
  const maxMoves = Math.max(2, item.path.length + 2);
  const diffOne = (a: string, b: string) => a.length === b.length && [...a].filter((c, i) => c !== b[i]).length === 1;
  const add = () => {
    const word = text.trim().toUpperCase();
    if (ended || !word) return;
    if (!diffOne(entered[entered.length - 1], word)) { setNote("Change exactly one letter."); return; }
    if (!LADDER_WORDS.has(word)) { setNote("That one-letter combination isn't in this round's word list. Try a listed word."); return; }
    if (entered.includes(word)) { setNote("You've already used that word."); return; }
    const next = [...entered, word]; setEntered(next); setText("");
    if (word === item.end) { setEnded(true); onDone(Math.max(0, Math.min(100, 100 - Math.max(0, next.length - item.path.length) * 12 - (showPath ? 20 : 0))), 100, next.length === item.path.length && !showPath); }
    else if (next.length >= maxMoves) { setEnded(true); onDone(0, 100, false); }
    else setNote("Good step. Keep going.");
  };
  return <div className="game-layout">
    <div className="game-instructions"><span className="instruction-dot peach" /> Build a word ladder from the start word to the end word. Change one letter at a time; all intermediate steps must be words.</div>
    <div className="ladder-ends"><span>START <b>{item.start}</b></span><span>FINISH <b>{item.end}</b></span></div>
    <div className="ladder-rungs">{entered.map((w, i) => <span key={i}>{w}</span>)}{!ended && <i>?</i>}</div>
    {!ended ? <>
      <form className="word-entry" onSubmit={(e) => { e.preventDefault(); add(); }}><input value={text} maxLength={item.start.length} onChange={(e) => setText(e.target.value.replace(/[^a-z]/gi,"").toUpperCase())} placeholder="Next word" /><button className="button button-primary">Add step</button></form>
      <button className="text-button" onClick={() => setShowPath((value) => !value)}>{showPath ? "Hide suggested path" : "Need a nudge? Reveal one possible path"}</button>
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
  const maximum = useMemo(() => puzzle.words.reduce((n, word) => n + wordPoints(word, puzzle), 0), [puzzle]);
  const score = found.reduce((n, word) => n + wordPoints(word, puzzle), 0);
  const points = (word: string) => wordPoints(word, puzzle);
  const submit = () => {
    const word = entry.toUpperCase().trim();
    if (ended || !word) return;
    if (word.length < 4) { setNote("Use at least four letters."); return; }
    if (!word.includes(puzzle.center)) { setNote("Every word needs the center letter."); return; }
    if ([...word].some((letter) => !puzzle.letters.includes(letter))) { setNote("That word uses a letter outside the hive."); return; }
    if (!puzzle.words.includes(word)) { setNote("Not in today's word list. Try another combination."); return; }
    if (found.includes(word)) { setNote("Already found. Find a new word."); return; }
    const next = [...found, word];
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
    <div className="hive-board" aria-label="Seven letter spelling hive">
      <button className="hive-letter center-letter" onClick={() => setEntry((v) => v + puzzle.center)}>{puzzle.center}</button>
      {letters.filter((letter) => letter !== puzzle.center).map((letter, i) => <button key={letter} className={"hive-letter hive-position-" + i} onClick={() => setEntry((v) => v + letter)}>{letter}</button>)}
    </div>
    <div className="hive-entry-row">
      <input value={entry} onChange={(e) => setEntry(e.target.value.toUpperCase().replace(/[^A-Z]/g,""))} onKeyDown={(e) => { if (e.key === "Enter") submit(); }} aria-label="Build a word" placeholder="Build a word…" disabled={ended} />
      <button className="button button-primary" onClick={submit} disabled={ended}>Enter</button>
      <button className="button button-soft" onClick={() => setEntry((v) => v.slice(0,-1))} disabled={ended || !entry}>⌫</button>
      <button className="button button-quiet" onClick={() => setEntry("")} disabled={ended}>Clear</button>
    </div>
    <div className="hive-tools"><button className="text-button" onClick={() => setHint(true)} disabled={hint}>Need a hint?</button><button className="text-button" onClick={finish} disabled={ended}>Finish for today</button></div>
    {hint && <p className="game-feedback">{puzzle.hint}</p>}
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

function CasefileLogic({ seed, onDone }: Props) {
  const item = deductionCases[seed % deductionCases.length];
  const blank = () => Object.fromEntries(item.suspects.map((suspect) => [suspect, { location:"", object:"" }]));
  const [assignments, setAssignments] = useState(blank);
  const [pencilMarks, setPencilMarks] = useState<Record<string, "possible" | "excluded">>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [hints, setHints] = useState<string[]>([]);
  const [note, setNote] = useState("Use the clues to assign one unique room and one unique item to each person.");
  const update = (suspect: string, field: "location"|"object", value: string) => {
    if (submitted) return;
    const duplicate = item.suspects.some((other) => other !== suspect && assignments[other][field] === value);
    if (value && duplicate) {
      setNote("Each " + field + " can only be assigned once. Choose a different one.");
      return;
    }
    setAssignments((current) => ({ ...current, [suspect]: { ...current[suspect], [field]: value } }));
  };
  const togglePencil = (suspect: string, field: "location" | "object", value: string) => {
    const key = suspect + "|" + field + "|" + value;
    setPencilMarks((current) => {
      const next = { ...current };
      if (!current[key]) next[key] = "possible";
      else if (current[key] === "possible") next[key] = "excluded";
      else delete next[key];
      return next;
    });
  };
  const revealHint = () => {
    if (submitted || hintsUsed >= 3) return;
    const solution = item.solution[Math.floor(hintsUsed / 2)];
    const hint = hintsUsed % 2 === 0
      ? solution.suspect + " was in the " + solution.location + "."
      : solution.suspect + " had the " + solution.object + ".";
    setHints((current) => [...current, hint]);
    setHintsUsed((current) => current + 1);
    setNote("Confirmed relationship revealed. This costs 10 points.");
  };
  const check = () => {
    if (submitted) return;
    const complete = item.suspects.every((suspect) => assignments[suspect].location && assignments[suspect].object);
    if (!complete) { setNote("Complete both assignments for all three people first."); return; }
    const matches = item.solution.reduce((n, solution) => {
      const current = assignments[solution.suspect];
      return n + Number(current.location === solution.location) + Number(current.object === solution.object);
    }, 0);
    const points = Math.max(0, Math.round(matches / 6 * 100) - hintsUsed * 10);
    setScore(points);
    setSubmitted(true);
    setNote(matches === 6 ? "Every clue fits. Mystery solved." : matches + " of 6 assignments are in the right place. Review the clues and solution.");
    onDone(points, 100, matches === 6 && hintsUsed === 0);
  };
  return <div className="game-layout">
    <div className="case-banner logic-banner"><span>FICTIONAL LOGIC PUZZLE</span><strong>{item.title}</strong><small>Deduction, not diagnosis</small></div>
    <p className="logic-briefing">{item.briefing}</p>
    <div className="logic-clues"><SectionLabel>CLUE BOARD</SectionLabel>{item.clues.map((clue,i)=><div key={i}><span>{String(i+1).padStart(2,"0")}</span>{clue}</div>)}</div>
    <div className="logic-hint-tools"><button className="text-button" onClick={revealHint} disabled={submitted || hintsUsed >= 3}>Reveal a confirmed relationship · −10 pts</button><span>{hintsUsed} / 3 hints used</span></div>
    {hints.length > 0 && <div className="logic-hints">{hints.map((hint,index)=><p key={index}><b>HINT {index+1}</b>{hint}</p>)}</div>}
    <details className="logic-pencil-board"><summary>Open deduction grid <span>Use pencil marks instead of paper</span></summary><p>Tap a candidate to cycle through unknown, possible, and ruled out. Use these marks to track deductions across both categories; they never change your final assignments.</p><div className="pencil-legend"><span><b>✓</b> Possible</span><span><b>×</b> Ruled out</span><span><b>·</b> Unknown</span></div><div className="pencil-grid"><div className="pencil-head"><b>PERSON</b><b>LOCATION CANDIDATES</b><b>OBJECT CANDIDATES</b></div>{item.suspects.map((suspect)=><div className="pencil-row" key={suspect}><strong>{suspect}</strong><div>{item.locations.map((value)=><button type="button" key={value} className={pencilMarks[suspect+"|location|"+value]??""} onClick={()=>togglePencil(suspect,"location",value)} aria-pressed={Boolean(pencilMarks[suspect+"|location|"+value])} aria-label={suspect+" location "+value+": "+(pencilMarks[suspect+"|location|"+value]??"unknown")}>{pencilMarks[suspect+"|location|"+value]==="possible"?"✓ ":pencilMarks[suspect+"|location|"+value]==="excluded"?"× ":"· "}{value}</button>)}</div><div>{item.objects.map((value)=><button type="button" key={value} className={pencilMarks[suspect+"|object|"+value]??""} onClick={()=>togglePencil(suspect,"object",value)} aria-pressed={Boolean(pencilMarks[suspect+"|object|"+value])} aria-label={suspect+" object "+value+": "+(pencilMarks[suspect+"|object|"+value]??"unknown")}>{pencilMarks[suspect+"|object|"+value]==="possible"?"✓ ":pencilMarks[suspect+"|object|"+value]==="excluded"?"× ":"· "}{value}</button>)}</div></div>)}</div><button type="button" className="text-button" onClick={()=>setPencilMarks({})}>Clear pencil marks</button></details>
    <div className="logic-table"><div className="logic-table-head"><span>PERSON</span><span>LOCATION</span><span>OBJECT</span></div>
      {item.suspects.map((suspect) => <div className="logic-table-row" key={suspect}>
        <strong>{suspect}</strong>
        <select aria-label={suspect+" location"} disabled={submitted} value={assignments[suspect].location} onChange={(e)=>update(suspect,"location",e.target.value)}>
          <option value="">Choose…</option>{item.locations.map((v)=><option key={v} value={v}>{v}</option>)}
        </select>
        <select aria-label={suspect+" object"} disabled={submitted} value={assignments[suspect].object} onChange={(e)=>update(suspect,"object",e.target.value)}>
          <option value="">Choose…</option>{item.objects.map((v)=><option key={v} value={v}>{v}</option>)}
        </select>
      </div>)}
    </div>
    {!submitted ? <button className="button button-primary full-button" onClick={check}>Submit deduction</button> : <Finish title={score===100?"Case cracked":"The solution revealed"} detail={"You got " + score + "% of the assignments correct. " + item.title + " is a fictional deduction puzzle."} score={score+" / 100"}><div className="reveal-groups">{item.solution.map((solution)=><span key={solution.suspect}><b>{solution.suspect}</b>{solution.location} · {solution.object}</span>)}</div></Finish>}
    <p className="game-feedback" aria-live="polite">{note}</p>
  </div>;
}
