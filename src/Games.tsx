import { useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { connectionPuzzles, diagnosisCases, labPrompts, medleWords, microbePacks, nextStepCases, pairsBank, triageCases } from "./data";
import { deductionCases, glyphPatterns, higherLowerPairs, scrambleWords, spellingHivePuzzles, wordLadders } from "./dataExtra";
import { hashSeed, lineCells, makeWordSearch, nonogramRuns, scoreWord, seeded, shuffle, type GameId } from "./lib";

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
  }
}

const SPECIALTY_INDEX: Partial<Record<Specialty, Partial<Record<string, number[]>>>> = {
  neurology: { diagnosis:[1,4,5,12,13,19], nextstep:[2,16], connections:[3,10], labline:[18,19,20], pairs:[12,13], microbe:[0,5], triage:[4] },
  cardiology: { diagnosis:[7,16,17], nextstep:[3,13], connections:[0,1,4], labline:[1,3,4,17], pairs:[0,1,2,3], triage:[10] },
  emergency: { diagnosis:[0,4,5,7,10,16,17,18,19], nextstep:[0,1,2,4,7,8,10,11,12,13,14,18,19], connections:[4,5,7,8,9], triage:[0,1,2,4,5,6,7,9,10] },
  criticalcare: { diagnosis:[4,5,7,10,11,16,17,18,19], nextstep:[0,1,2,4,7,10,11,12,13,14,18,19], connections:[4,5,7,9,11], labline:[0,1,2,3,4,5,11,17,22], triage:[0,1,2,4,5,6,7,9,10,11] },
  anesthesia: { diagnosis:[5,16,17], nextstep:[0,2,4,12,14], connections:[0,1,7], labline:[0,1,2,4,17], pairs:[0,1,2,3,4,5], triage:[0,4,5,6,9,11] },
  surgery: { diagnosis:[0,5,17,18], nextstep:[8,9,14,17], connections:[4,8,9], triage:[3,8,9] },
  orthopedics: { diagnosis:[15,16], nextstep:[8], connections:[3,9], pairs:[12,13,14,15,16,17], triage:[9] },
  urology: { diagnosis:[8,9], nextstep:[14], connections:[4,11], labline:[2,3,4,12,13], triage:[0] },
  otolaryngology: { diagnosis:[18,19], nextstep:[12], connections:[5,9], triage:[0,11] },
  ophthalmology: { diagnosis:[3,12], nextstep:[19], connections:[3,10], pairs:[12,13,17,18], triage:[2] },
  pediatrics: { diagnosis:[8,9,11,14,18,19], nextstep:[18], connections:[4,5,8], labline:[14,15], triage:[11] },
  obgyn: { diagnosis:[0], nextstep:[5,9,16], connections:[8], triage:[3,8] },
  psychiatry: { diagnosis:[1,2,7,12,13], nextstep:[2,6], connections:[7,10], labline:[21], triage:[4] },
  infectious: { diagnosis:[8,11,14,16,18,19], nextstep:[11,12], connections:[5,7,9], microbe:[0,1,2,3,4,5,6,7], triage:[6,7] },
  allergy: { diagnosis:[16], nextstep:[4], connections:[5,7], pairs:[0,1,2,3], triage:[1] },
  nephrology: { diagnosis:[8,9,10,11], nextstep:[0,11,14,17], connections:[4,11], labline:[2,3,4,5,7,11,12,13,14,15,18,19,20,21], triage:[5] },
  pulmonology: { diagnosis:[18,19], nextstep:[12], connections:[5,9], labline:[1,22,27], triage:[0,6] },
  endocrine: { diagnosis:[7,9,10,15], nextstep:[0,14,17], connections:[2,11], labline:[8,9,10,23], triage:[5] },
  dermatology: { diagnosis:[14,15,16], nextstep:[4], connections:[4,5,9], labline:[24], triage:[1] },
  rheumatology: { diagnosis:[3,15], nextstep:[6], connections:[4,9,10], pairs:[30,31,32,33,34,35], triage:[1] },
  hemeonc: { diagnosis:[10,11], nextstep:[7,14], connections:[4,5,11], labline:[14,15,16,17], pairs:[42,43,44,45], triage:[6] },
  gastro: { diagnosis:[17], nextstep:[11], connections:[4,12], labline:[24], pairs:[35], triage:[6] },
  geriatrics: { diagnosis:[6,7,10,17], nextstep:[7,13,14], connections:[4,11], labline:[12,13,14,15,16,17], triage:[0,2,6] },
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
