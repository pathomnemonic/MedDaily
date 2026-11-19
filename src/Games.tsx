import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { connectionPuzzles, diagnosisCases, labPrompts, medleWords, microbePacks, nextStepCases, pairsBank, triageCases } from "./data";
import { deductionCases, glyphPatterns, higherLowerPairs, scrambleWordsExtended as scrambleWords, spellingHivePuzzles, wordLadders } from "./dataExtra";
import { hashSeed, lineCells, makeWordSearch, nonogramRuns, normalize, scoreWord, seeded, shuffle, type GameId } from "./lib";
import { deepDivePrompts, triviaCategories, triviaQuestions, type DeepAnswer, type TriviaCategory, type TriviaCategoryId } from "./dataArcade";
import { letterWordPoints, makeLetterGrid } from "./arcadeLogic";

type Done = (score: number, maxScore: number, perfect: boolean) => void;
type Specialty = "general" | "internal" | "familymed" | "neurology" | "cardiology" | "emergency" | "criticalcare" | "anesthesia" | "surgery" | "orthopedics" | "urology" | "otolaryngology" | "ophthalmology" | "pediatrics" | "obgyn" | "psychiatry" | "infectious" | "allergy" | "nephrology" | "pulmonology" | "endocrine" | "dermatology" | "rheumatology" | "hemeonc" | "gastro" | "geriatrics" | "radiology" | "anatomy" | "pathology" | "pharmacology" | "biostatistics";
interface Props { seed: number; onDone: Done; specialty?: Specialty }
export function GameBoard({ game, seed, onDone, specialty = "general" }: Props & { game: GameId }) {
  switch (game) {
    case "medle": return <Medle seed={seed} onDone={onDone} specialty={specialty} />;
    case "connections": return <Connections seed={seed} onDone={onDone} specialty={specialty} />;
    case "diagnosis": return <MysteryCase seed={seed} onDone={onDone} specialty={specialty} />;
    case "nextstep": return <NextStep seed={seed} onDone={onDone} specialty={specialty} />;
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
          <b>{picked === question.answer ? "Nice answer!" : "The correct answer is " + question.options[question.answer] + "."}</b><p>{question.explanation}</p>
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
  const [entry, setEntry] = useState("");
  const [found, setFound] = useState<string[]>([]);
  const [seconds, setSeconds] = useState(90);
  const [note, setNote] = useState("Find words by connecting letters that touch horizontally, vertically, or diagonally.");
  const [ended, setEnded] = useState(false);
  const done = useRef(false);
  const score = found.reduce((total, word) => total + letterWordPoints(word), 0);
  const maximum = Math.max(1, board.words.reduce((total, word) => total + letterWordPoints(word), 0));

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

  const submit = () => {
    const word = entry.trim().toUpperCase();
    if (ended || !word) return;
    if (found.includes(word)) { setNote("Already found. Keep searching the grid."); return; }
    if (!board.words.includes(word)) { setNote("That word is not in this grid. Try another path."); return; }
    const next = [...found, word];
    setFound(next); setEntry(""); setNote("+" + letterWordPoints(word) + " points · " + word);
    if (next.length === board.words.length) finish(next);
  };

  return <div className="game-layout letter-grid-game">
    <div className="letter-grid-hud"><div><span className="eyebrow">LETTER LAB</span><h2>Find the hidden words</h2></div><div className={"letter-grid-clock" + (seconds <= 10 ? " urgent" : "")}>{String(Math.floor(seconds / 60)).padStart(2, "0")}:{String(seconds % 60).padStart(2, "0")}</div></div>
    <div className="letter-grid-board">{board.grid.map((letter, i) => <div key={i} className={found.some((word) => word.includes(letter)) ? "letter-grid-tile" : "letter-grid-tile"}>{letter}</div>)}</div>
    <p className="letter-grid-score">{score} pts <span>·</span> {found.length} / {board.words.length} words found</p>
    {!ended ? <>
      <form className="dive-answer-row" onSubmit={(event) => { event.preventDefault(); submit(); }}>
        <input value={entry} onChange={(event) => setEntry(event.target.value.replace(/[^a-z]/gi, "").toUpperCase())} autoComplete="off" placeholder="Type a word…" aria-label="Word to find" />
        <button className="button button-primary" disabled={!entry.trim()}>Find word</button>
      </form>
      <p className="game-feedback" aria-live="polite">{note}</p>
      <div className="letter-grid-found">{found.map((word) => <span key={word}>{word}<b>+{letterWordPoints(word)}</b></span>)}</div>
      <button className="button button-quiet full-button" onClick={() => finish(found)}>Finish round</button>
    </> : <div className="letter-grid-finale"><h3>Round complete</h3><strong>{score} / {maximum}</strong><p>{found.length} words found. The hidden-word list is shown below.</p><div>{board.words.slice().sort().map((word) => <span key={word} className={found.includes(word) ? "found" : ""}>{word}</span>)}</div></div>}
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
  return <div className="game-layout medle-game">
    <div className="game-instructions"><span className="instruction-dot mint" /> Guess the five-letter medical word in six tries. Green is the right letter in the right place; gold is in the word elsewhere.</div>
    <div className="word-grid" aria-label="Six guess rows">{Array.from({ length: 6 }, (_, r) => {
      const word = rows[r] ?? (r === rows.length ? guess.toUpperCase() : "");
      const marks = rows[r] ? scoreWord(rows[r], answer) : [];
      return <div className="word-row" key={r}>{Array.from({ length: 5 }, (_, c) => <div key={c} className={"word-cell " + (marks[c] ?? (word[c] ? "filled" : ""))}>{word[c] ?? ""}</div>)}</div>;
    })}</div>
    {!ended ? <form className="word-entry" onSubmit={(e) => { e.preventDefault(); submit(); }}><input autoComplete="off" autoCapitalize="characters" value={guess} maxLength={5} onChange={(e) => setGuess(e.target.value.replace(/[^a-z]/gi, "").slice(0, 5))} aria-label="Five-letter guess" placeholder="TYPE A WORD" /><button className="button button-primary" type="submit">Guess <span>↗</span></button></form> : <Finish title={won ? "Word found!" : "A word for your rounds"} detail={won ? "You solved it in " + rows.length + (rows.length === 1 ? " guess." : " guesses.") : "The answer was " + answer + ". Try another daily puzzle tomorrow."} score={won ? (100 - (rows.length - 1) * 12) + " / 100" : "0 / 100"} />}
    <p className="game-feedback" aria-live="polite">{message}</p>
  </div>;
}

function Connections({ seed, onDone, specialty = "general" }: Props) {
  const board = pick(connectionPuzzles, seed, specialty, "connections");
  const [tiles, setTiles] = useState(() => shuffle(board.flatMap((g, group) => g.words.map((word) => ({ word, group }))), seeded(seed + 31)));
  const [selected, setSelected] = useState<string[]>([]);
  const [solved, setSolved] = useState<number[]>([]);
  const [mistakes, setMistakes] = useState(0);
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
      const next = mistakes + 1; setMistakes(next); setNote(next >= 4 ? "No mistakes left. The remaining groups are shown below." : "Not a set. Look for a different connection."); setSelected([]);
      if (next >= 4) { setEnded(true); if (!done.current) { done.current = true; onDone(Math.max(0, 40 - next * 5), 100, false); } }
    }
  };
  const shuffleTiles = () => setTiles((t) => shuffle(t, seeded(hashSeed(String(seed) + String(solved.length) + String(mistakes)))));
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

function MysteryCase({ seed, onDone, specialty = "general" }: Props) {
  const item = pick(diagnosisCases, seed, specialty, "diagnosis");
  const [clueCount, setClueCount] = useState(1);
  const [guesses, setGuesses] = useState(0);
  const [ended, setEnded] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [note, setNote] = useState("Read the clues and name the most likely diagnosis.");
  const done = useRef(false);
  const choose = (answer: string) => {
    if (ended) return;
    const isRight = answer === item.answer, next = guesses + 1; setGuesses(next);
    if (isRight || next >= 3) {
      setEnded(true); setCorrect(isRight); setNote(isRight ? "Correct diagnosis." : "The case is solved. Review the distinguishing clues.");
      if (!done.current) { done.current = true; onDone(isRight ? 100 - (clueCount - 1) * 18 : 0, 100, isRight && clueCount === 1); }
    } else { setClueCount((n) => Math.min(item.clues.length, n + 1)); setNote("Not this time. One more clue has been added."); }
  };
  return <div className="game-layout">
    <div className="case-banner"><span>CASE FILE</span><strong>{item.title}</strong><small>Progressive diagnosis · {clueCount} of {item.clues.length} clues</small></div>
    <div className="clue-stack">{item.clues.slice(0, clueCount).map((clue, i) => <div className="clue-card" key={i}><span>{String(i + 1).padStart(2, "0")}</span><p>{clue}</p></div>)}</div>
    {!ended ? <div className="answer-options"><SectionLabel>Most likely diagnosis</SectionLabel>{item.options.map((option) => <button key={option} className="answer-option" onClick={() => choose(option)}>{option}<span>→</span></button>)}</div> : <Finish title={correct ? "Case cracked" : "Case closed"} detail={item.explanation} score={correct ? Math.max(0, 100 - (clueCount - 1) * 18) + " / 100" : "0 / 100"}><p className="source-note">Source note: {item.source}</p></Finish>}
    <p className="game-feedback" aria-live="polite">{note}</p>
  </div>;
}

function NextStep({ seed, onDone, specialty = "general" }: Props) {
  const raw = pick(nextStepCases, seed, specialty, "nextstep");
  const item = raw.id === "n01" ? { ...raw, explanation: raw.explanation.replace("below 3.3 mEq/L", "below 3.5 mEq/L") } : raw;
  const [choice, setChoice] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const done = useRef(false);
  const submit = () => {
    if (choice === null || submitted) return;
    setSubmitted(true);
    const ok = choice === item.answer;
    if (!done.current) { done.current = true; onDone(ok ? 100 : 0, 100, ok); }
  };
  return <div className="game-layout">
    <div className="specialty-pill">{item.specialty} · CLINICAL REASONING</div>
    <div className="vignette-card"><SectionLabel>THE PRESENTATION</SectionLabel><p>{item.vignette}</p></div>
    <h3 className="game-question">{item.question}</h3>
    <div className="answer-options">{item.options.map((option, i) => <button key={option} disabled={submitted} onClick={() => setChoice(i)} className={"answer-option" + (choice === i ? " chosen" : "") + (submitted && i === item.answer ? " answer-correct" : "") + (submitted && choice === i && i !== item.answer ? " answer-wrong" : "")}><span className="option-letter">{String.fromCharCode(65 + i)}</span>{option}</button>)}</div>
    {!submitted ? <button className="button button-primary full-button" disabled={choice === null} onClick={submit}>Lock in answer <span>↗</span></button> : <Finish title={choice === item.answer ? "Good clinical call" : "Review the next step"} detail={item.explanation} score={choice === item.answer ? "100 / 100" : "0 / 100"}><button className="text-button" onClick={() => setRevealed((v) => !v)}>{revealed ? "Hide" : "Show"} source note</button>{revealed && <p className="source-note">{item.source}</p>}</Finish>}
  </div>;
}

function MicrobeHunt({ seed, onDone, specialty = "general" }: Props) {
  const pack = pick(microbePacks, seed, specialty, "microbe");
  const board = useMemo(() => makeWordSearch(pack.words, 14, seed + 99), [pack, seed]);
  const words = board.placed;
  const [found, setFound] = useState<string[]>([]);
  const [start, setStart] = useState<number | null>(null);
  const [path, setPath] = useState<number[]>([]);
  const [note, setNote] = useState("Tap the first and last letter of a hidden word.");
  const [ended, setEnded] = useState(false);
  const done = useRef(false);
  const tap = (index: number) => {
    if (ended) return;
    if (start === null) { setStart(index); setPath([index]); return; }
    const cells = lineCells(start, index, 14);
    if (!cells.length) { setStart(index); setPath([index]); setNote("Words run in straight lines, including diagonals."); return; }
    setPath(cells);
  };
  const add = () => {
    if (path.length < 2) { setNote("Choose a start and end cell first."); return; }
    const word = path.map((i) => board.grid[Math.floor(i / 14)][i % 14]).join("");
    const match = words.find((w) => !found.includes(w) && (w === word || w === [...word].reverse().join("")));
    if (!match) { setNote("No target word on that line. Try again."); setStart(null); setPath([]); return; }
    const next = [...found, match]; setFound(next); setStart(null); setPath([]); setNote(match + " found.");
    if (next.length === words.length) { setEnded(true); if (!done.current) { done.current = true; onDone(100, 100, true); } }
  };
  return <div className="game-layout">
    <div className="case-banner microbe-banner"><span>MICROBE FIELD GUIDE</span><strong>{pack.name}</strong><small>Trace the organism names through the grid.</small></div>
    <div className="wordsearch-board" role="group" aria-label="Letter grid">{board.grid.flat().map((letter, i) => <button key={i} className={"letter-tile" + (path.includes(i) ? " path-cell" : "")} onClick={() => tap(i)} disabled={ended}>{letter}</button>)}</div>
    <div className="target-words"><SectionLabel>FIELD SPECIMENS</SectionLabel><div>{words.map((word) => <span key={word} className={found.includes(word) ? "target-found" : ""}>{word}</span>)}</div></div>
    <div className="connection-controls"><span className="mistake-count">{found.length} / {words.length} found</span><button className="button button-soft" onClick={() => { setStart(null); setPath([]); }}>Clear</button><button className="button button-primary" onClick={add} disabled={ended}>Mark word</button></div>
    <p className="game-feedback" aria-live="polite">{note}</p>
    {ended && <Finish title="Field guide complete" detail={"You identified all " + words.length + " organisms in this board."} score="100 / 100" />}
  </div>;
}

function Labline({ seed, onDone, specialty = "general" }: Props) {
  const item = pick(labPrompts, seed, specialty, "labline");
  const [value, setValue] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("");
  const done = useRef(false);
  const check = () => {
    const n = Number(value);
    if (value.trim() === "" || !Number.isFinite(n)) { setMessage("Enter a number to make your estimate."); return; }
    const diff = Math.abs(n - item.value);
    const points = item.tolerance === 0 ? (diff < 0.0001 ? 100 : 0) : Math.max(0, Math.round(100 * (1 - diff / Math.max(item.tolerance * 3, Math.abs(item.value) * 0.2))));
    setScore(points); setSubmitted(true);
    setMessage(diff <= item.tolerance ? "Inside the expected reference window." : diff <= item.tolerance * 2 ? "Close estimate." : "A useful number to add to your mental reference sheet.");
    if (!done.current) { done.current = true; onDone(points, 100, diff <= item.tolerance); }
  };
  return <div className="game-layout">
    <div className="lab-console"><span className="lab-light" /><span>LABORATORY · REFERENCE RANGE CHALLENGE</span><span className="lab-light second" /></div>
    <div className="lab-prompt"><SectionLabel>CALIBRATE YOUR CLINICAL EYE</SectionLabel><h3>{item.prompt}</h3><p>Enter your best estimate. No calculator needed.</p></div>
    {!submitted ? <form className="lab-input-row" onSubmit={(e) => { e.preventDefault(); check(); }}><input type="number" step="any" value={value} onChange={(e) => setValue(e.target.value)} aria-label={"Estimate in " + item.unit} placeholder="Your estimate" /><span>{item.unit || "value"}</span><button className="button button-primary" type="submit">Check</button></form> : <Finish title={score >= 85 ? "Calibrated!" : "The reference point"} detail={item.context} score={score + " / 100"}><p className="lab-answer">{item.value} {item.unit}</p><p className="source-note">Source note: {item.source}</p></Finish>}
    <p className="game-feedback" aria-live="polite">{message}</p>
  </div>;
}

function MemoryMatch({ seed, onDone, specialty = "general" }: Props) {
  const pool = useMemo(() => specialty === "neurology" ? pairsBank.slice(12, 24) : specialty === "infectious" ? pairsBank.slice(36, 46) : specialty === "cardiology" ? pairsBank.slice(0, 12) : pairsBank, [specialty]);
  const pairs = useMemo(() => shuffle(pool, seeded(seed + 11)).slice(0, 6), [seed, pool]);
  const left = useMemo(() => shuffle(pairs.map((p, id) => ({ id, label: p[0] })), seeded(seed + 12)), [pairs, seed]);
  const right = useMemo(() => shuffle(pairs.map((p, id) => ({ id, label: p[1] })), seeded(seed + 13)), [pairs, seed]);
  const [a, setA] = useState<number | null>(null);
  const [b, setB] = useState<number | null>(null);
  const [matched, setMatched] = useState<number[]>([]);
  const [wrong, setWrong] = useState(0);
  const [note, setNote] = useState("Pick a term on the left, then its match on the right.");
  const [ended, setEnded] = useState(false);
  const done = useRef(false);
  const choose = (leftId: number, rightId: number) => {
    if (leftId === rightId) {
      const next = [...matched, leftId]; setMatched(next); setNote("Matched: " + pairs[leftId][0] + " ↔ " + pairs[leftId][1] + "."); setA(null); setB(null);
      if (next.length === pairs.length) { setEnded(true); if (!done.current) { done.current = true; onDone(Math.max(0, 100 - wrong * 8), 100, wrong === 0); } }
    } else { setWrong((n) => n + 1); setNote("Not a pair. Try another connection."); setA(null); setB(null); }
  };
  const pickLeft = (id: number) => { if (matched.includes(id) || ended) return; setA(id); if (b !== null) choose(id, b); };
  const pickRight = (id: number) => { if (matched.includes(id) || ended) return; setB(id); if (a !== null) choose(a, id); };
  return <div className="game-layout">
    <div className="game-instructions"><span className="instruction-dot peach" /> Match each clinical term with its definition or key association. Choose one on each side.</div>
    <div className="pair-columns"><div><SectionLabel>TERM</SectionLabel>{left.map((x) => <button key={x.id} disabled={matched.includes(x.id) || ended} onClick={() => pickLeft(x.id)} className={"pair-tile" + (a === x.id ? " selected" : "") + (matched.includes(x.id) ? " matched" : "")}>{x.label}</button>)}</div><div><SectionLabel>MEANING</SectionLabel>{right.map((x) => <button key={x.id} disabled={matched.includes(x.id) || ended} onClick={() => pickRight(x.id)} className={"pair-tile" + (b === x.id ? " selected" : "") + (matched.includes(x.id) ? " matched" : "")}>{x.label}</button>)}</div></div>
    <p className="game-feedback" aria-live="polite">{note}</p><div className="game-footnote">{matched.length} of {pairs.length} matched · {wrong} mismatches</div>
    {ended && <Finish title="All pairs connected" detail={"You matched " + pairs.length + " medical associations."} score={Math.max(0, 100 - wrong * 8) + " / 100"} />}
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
  const word = scrambleWords[seed % scrambleWords.length];
  const [text, setText] = useState("");
  const [tries, setTries] = useState(0);
  const [hint, setHint] = useState(false);
  const [done, setDone] = useState(false);
  const [won, setWon] = useState(false);
  const check = () => {
    if (done || !text.trim()) return;
    const ok = text.trim().replace(/\s/g,"").toUpperCase() === word[0];
    const n = tries + 1; setTries(n);
    if (ok || n >= 3) { setDone(true); setWon(ok); onDone(ok ? (hint ? 80 : n === 1 ? 100 : 90) : 0, 100, ok && n === 1 && !hint); }
    else setText("");
  };
  const scrambled = useMemo(() => shuffle(word[0].split(""), seeded(seed + 51)).join(""), [seed, word]);
  return <div className="game-layout">
    <div className="game-instructions"><span className="instruction-dot mint" /> Unscramble the letters. Three guesses; ask for a definition hint if you need one.</div>
    <div className="anagram-board"><span className="eyebrow">SCRAMBLE THE SPECIMEN</span><div className="anagram-letters">{scrambled.split("").map((ch, i) => <b key={i}>{ch}</b>)}</div>{hint && <p>{word[1]}</p>}</div>
    {!done ? <form className="word-entry" onSubmit={(e) => { e.preventDefault(); check(); }}><input value={text} onChange={(e) => setText(e.target.value)} placeholder="Your answer" autoComplete="off" /><button className="button button-primary">Submit</button></form> : <Finish title={won ? "Unscrambled!" : "The word was " + word[0]} detail={word[1]} score={won ? (hint ? 80 : tries === 1 ? 100 : 90) + " / 100" : "0 / 100"} />}
    <button className="text-button" onClick={() => setHint(true)} disabled={hint || done}>Need a hint?</button>
  </div>;
}

function CellSketch({ seed, onDone }: Props) {
  const item = glyphPatterns[seed % glyphPatterns.length];
  const [cells, setCells] = useState<boolean[][]>(() => item.pattern.map((row) => row.map(() => false)));
  const [checked, setChecked] = useState(false);
  const rowClues = item.pattern.map((row) => nonogramRuns(row));
  const colClues = item.pattern[0].map((_, c) => nonogramRuns(item.pattern.map((row) => row[c])));
  const check = () => {
    const correct = item.pattern.reduce((n, row, r) => n + row.reduce((m, value, c) => m + (Boolean(value) === cells[r][c] ? 1 : 0), 0), 0);
    setChecked(true); onDone(Math.round(correct / 25 * 100), 100, correct === 25);
  };
  return <div className="game-layout">
    <div className="game-instructions"><span className="instruction-dot lilac" /> Fill the 5×5 grid using the row and column counts. A number tells you how many cells in that line are filled. This is a tiny nonogram.</div>
    <div className="nonogram-wrap"><div className="nonogram-col-clues">{colClues.map((n, i) => <span key={i}>{n.length ? n.join(" ") : "–"}</span>)}</div><div className="nonogram-grid">{cells.map((row, r) => <div className="nonogram-row" key={r}><span className="nonogram-clue">{rowClues[r].length ? rowClues[r].join(" ") : "–"}</span>{row.map((value, c) => <button key={c} disabled={checked} aria-label={"Row " + (r+1) + " column " + (c+1)} className={"nonogram-cell" + (value ? " filled-cell" : "") + (checked && value !== Boolean(item.pattern[r][c]) ? " error-cell" : "")} onClick={() => setCells((all) => all.map((x, ri) => ri === r ? x.map((v, ci) => ci === c ? !v : v) : x))}>{value ? "•" : ""}</button>)}</div>)}</div></div>
    {!checked ? <button className="button button-primary full-button" onClick={check}>Check pattern</button> : <Finish title="Pattern revealed" detail={"The hidden shape was " + item.name + ". " + item.hint + ". Your cells are marked for comparison."} score={Math.round(item.pattern.reduce((n, row, r) => n + row.reduce((m, v, c) => m + (Boolean(v) === cells[r][c] ? 1 : 0), 0), 0) / 25 * 100) + " / 100"} />}
  </div>;
}

function HigherLower({ seed, onDone }: Props) {
  const list = useMemo(() => shuffle(higherLowerPairs, seeded(seed + 29)).slice(0, 5), [seed]);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [reveal, setReveal] = useState(false);
  const [finished, setFinished] = useState(false);
  const item = list[round];
  const correct = item.av === item.bv ? "tie" : item.av > item.bv ? "a" : "b";
  const choose = (v: "a"|"b"|"tie") => {
    if (reveal || finished) return;
    const ok = v === correct;
    const next = score + (ok ? 1 : 0);
    setScore(next); setReveal(true);
    window.setTimeout(() => {
      if (round + 1 === list.length) { setFinished(true); onDone(Math.round(next / list.length * 100), 100, next === list.length); }
      else { setRound((r) => r + 1); setReveal(false); }
    }, 900);
  };
  return <div className="game-layout">
    <div className="game-instructions"><span className="instruction-dot gold" /> Which quantity is greater? Five quick comparisons. Sometimes the answer is a tie.</div>
    <div className="higher-progress">COMPARISON {Math.min(round + 1, 5)} / 5 <span>{score} right</span></div>
    {!finished ? <div className="higher-cards"><button className={"higher-card" + (reveal && correct === "a" ? " right" : "")} onClick={() => choose("a")} disabled={reveal}><span>A</span><b>{item.a}</b>{reveal && <strong>{item.av}</strong>}</button><div className="higher-or">OR <button onClick={() => choose("tie")} disabled={reveal}>=</button></div><button className={"higher-card" + (reveal && correct === "b" ? " right" : "")} onClick={() => choose("b")} disabled={reveal}><span>B</span><b>{item.b}</b>{reveal && <strong>{item.bv}</strong>}</button></div> : <Finish title="Comparison complete" detail={"You called " + score + " of " + list.length + " comparisons correctly."} score={Math.round(score/list.length*100) + " / 100"} />}
    {reveal && <p className="game-feedback">{item.explanation} <span className="source-note">{item.source}</span></p>}
  </div>;
}

const LADDER_WORDS = new Set(["COLD","CORD","CARD","WARD","WARM","HEAL","HEAR","SEAR","SEER","SEEK","PAIN","GAIN","CARE","CURE","VEIN","VEIL","VAIL","PAIL","MIND","MILD","BOLD","BOND","BEND","SEND","SAND","SANE","CANE","CONE","BONE","TONE","TUNE","MULE","MILE","TILE","TIDE","SIDE","SINE","LINE","LION","IRON","ICON","RING","SING","SONG","LONG","LUNG","FINE","FIVE","DIVE","LIVE","LOVE","MOVE","MORE","CARE","CASE","CASH","WASH","WISH","FISH","FIST","LIST","LAST","LOST","COST","CAST","EAST","EASE","EARS","EARN","BARN","BARK","DARK","DART","PART","PARK","MARK","MARS","MASS","PASS","PAST","FAST","FATE","LATE","MATE","MATH","PATH","BATH","BETA","DATA","DATE","GATE","GAME","NAME","SAME","SAVE","SAFE","SAGE","PAGE","PACE","RACE","RARE","CARE","CORE","CURE","PURE","PURL","PEAR","HEAR","BEAR","BEAD","HEAD","HEAT","SEAT","MEAT","MELT","BELT","BELL","CELL","SELL","SELF","SHELF"]);
function WordLadder({ seed, onDone }: Props) {
  const item = wordLadders[seed % wordLadders.length];
  const [entered, setEntered] = useState<string[]>([item.start]);
  const [text, setText] = useState("");
  const [note, setNote] = useState("Change one letter at a time. Every step must be a real word.");
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
    if (word === item.end) { setEnded(true); onDone(Math.max(0, Math.min(100, 100 - Math.max(0, next.length - item.path.length) * 12)), 100, next.length === item.path.length); }
    else if (next.length >= maxMoves) { setEnded(true); onDone(0, 100, false); }
    else setNote("Good step. Keep going.");
  };
  return <div className="game-layout">
    <div className="game-instructions"><span className="instruction-dot peach" /> Build a word ladder from the start word to the end word. Change one letter at a time; all intermediate steps must be words.</div>
    <div className="ladder-ends"><span>START <b>{item.start}</b></span><span>FINISH <b>{item.end}</b></span></div>
    <div className="ladder-rungs">{entered.map((w, i) => <span key={i}>{w}</span>)}{!ended && <i>?</i>}</div>
    {!ended ? <form className="word-entry" onSubmit={(e) => { e.preventDefault(); add(); }}><input value={text} maxLength={item.start.length} onChange={(e) => setText(e.target.value.replace(/[^a-z]/gi,"").toUpperCase())} placeholder="Next word" /><button className="button button-primary">Add step</button></form> : <Finish title={entered[entered.length-1] === item.end ? "Ladder climbed" : "The ladder revealed"} detail={"One possible path: " + item.path.join(" → ")} score={entered[entered.length-1] === item.end ? "Solved" : "Try another tomorrow"} />}
    <p className="game-feedback">{note}</p>
  </div>;
}


function SpellingHive({ seed, onDone }: Props) {
  const puzzle = spellingHivePuzzles[seed % spellingHivePuzzles.length];
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
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
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
  const check = () => {
    if (submitted) return;
    const complete = item.suspects.every((suspect) => assignments[suspect].location && assignments[suspect].object);
    if (!complete) { setNote("Complete both assignments for all three people first."); return; }
    const matches = item.solution.reduce((n, solution) => {
      const current = assignments[solution.suspect];
      return n + Number(current.location === solution.location) + Number(current.object === solution.object);
    }, 0);
    const points = Math.round(matches / 6 * 100);
    setScore(points);
    setSubmitted(true);
    setNote(matches === 6 ? "Every clue fits. Mystery solved." : matches + " of 6 assignments are in the right place. Review the clues and solution.");
    onDone(points, 100, matches === 6);
  };
  return <div className="game-layout">
    <div className="case-banner logic-banner"><span>FICTIONAL LOGIC PUZZLE</span><strong>{item.title}</strong><small>Deduction, not diagnosis</small></div>
    <p className="logic-briefing">{item.briefing}</p>
    <div className="logic-clues"><SectionLabel>CLUE BOARD</SectionLabel>{item.clues.map((clue,i)=><div key={i}><span>{String(i+1).padStart(2,"0")}</span>{clue}</div>)}</div>
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
