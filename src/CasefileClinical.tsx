import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import "@fontsource/special-elite/latin-400.css";
import { generateClinicalCase } from "./clinicalCase";
import { reward } from "./juice";
import { sfx } from "./audio";

type Done = (score: number, maxScore: number, perfect: boolean, shareText?: string) => void;
/** 0 = blank, 1 = ruled out, 2 = confirmed. */
type Mark = 0 | 1 | 2;

const TAG = { p: "P", c: "C", f: "F" } as const;

/**
 * Casefile Logic: a clinical deduction game in the spirit of a mystery logic-grid. Three look-alike patients, three causes and three
 * findings; clues describe things by their clinical features, so knowledge helps and every case has exactly one solution.
 * Cards show the cast, the notebook is a real deduction grid, and you get one accusation.
 */
export default function CasefileClinical({ seed, onDone, onExit, practice = false }: { seed: number; onDone: Done; onExit?: () => void; practice?: boolean }) {
  const kase = useMemo(() => generateClinicalCase(seed), [seed]);
  // grid[block][row][col]: block 0 = patients x (causes + findings), block 1 = causes x findings.
  const [g0, setG0] = useState<Mark[][]>(() => Array.from({ length: 3 }, () => Array<Mark>(6).fill(0)));
  const [g1, setG1] = useState<Mark[][]>(() => Array.from({ length: 3 }, () => Array<Mark>(3).fill(0)));
  const [flipped, setFlipped] = useState<boolean[]>([false, false, false]);
  const [struck, setStruck] = useState<boolean[]>(() => kase.clues.map(() => false));
  const [decoded, setDecoded] = useState<boolean[]>(() => kase.clues.map(() => false));
  const [autoCross, setAutoCross] = useState(true);
  const [hints, setHints] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [verdict, setVerdict] = useState<null | { right: boolean[]; points: number }>(null);
  const [finished, setFinished] = useState(false);
  const decodes = decoded.filter(Boolean).length;
  const penalty = hints.length * 10 + decodes * 5;

  const cycle = (m: Mark): Mark => (m === 0 ? 1 : m === 1 ? 2 : 0);
  const clickCell = (block: 0 | 1, r: number, c: number) => {
    if (verdict) return;
    sfx("tick");
    const grid = (block === 0 ? g0 : g1).map((row) => [...row]) as Mark[][];
    const next = cycle(grid[r][c]);
    grid[r][c] = next;
    if (next === 2 && autoCross) {
      // Confirming a cell rules out the rest of its row and column inside the same sub-grid (causes or findings).
      const lo = block === 0 ? (c < 3 ? 0 : 3) : 0, hi = lo + 3;
      for (let k = lo; k < hi; k++) if (k !== c && grid[r][k] === 0) grid[r][k] = 1;
      for (let k = 0; k < 3; k++) if (k !== r && grid[k][c] === 0) grid[k][c] = 1;
    }
    (block === 0 ? setG0 : setG1)(grid);
  };
  const askColleague = () => {
    if (verdict || hints.length >= 3) return;
    const s = kase.solution[Math.floor(hints.length / 2)];
    setHints((h) => [...h, hints.length % 2 === 0 ? "The patient with " + s.patient.toLowerCase() + " had an illness caused by " + s.cause.toLowerCase() + "." : "The patient with " + s.patient.toLowerCase() + " had " + s.finding.toLowerCase() + "."]);
    setNote("A colleague confirms one relationship. That costs 10 points.");
  };
  const accuse = () => {
    if (verdict) return;
    const causeOf = g0.map((row) => row.slice(0, 3).indexOf(2));
    const findingOf = g0.map((row) => row.slice(3).indexOf(2));
    if (causeOf.includes(-1) || findingOf.includes(-1)) { setNote("Mark a ✓ for every patient's cause and finding in the notebook before you accuse. You only get one try."); sfx("wrong"); return; }
    const right: boolean[] = [];
    kase.solution.forEach((s, p) => {
      right.push(kase.causes[causeOf[p]].toLowerCase() === s.cause.toLowerCase());
      right.push(kase.findings[findingOf[p]].toLowerCase() === s.finding.toLowerCase());
    });
    const hits = right.filter(Boolean).length;
    const points = Math.max(0, Math.round((hits / 6) * 100) - penalty);
    setVerdict({ right, points });
    reward(hits === 6, null, hits === 6 ? "CASE CLOSED" : hits + "/6");
    sfx(hits === 6 ? "badge" : "wrong");
  };
  const close = () => {
    if (!verdict) return;
    setFinished(true);
    const hits = verdict.right.filter(Boolean).length;
    const share = "Casefile Logic · " + kase.title + "\n" + verdict.right.map((x) => (x ? "🟩" : "🟥")).join("") + (decodes || hints.length ? "\n🔎 " + decodes + " decoded · " + hints.length + " colleague hint" + (hints.length === 1 ? "" : "s") : "");
    onDone(verdict.points, 100, hits === 6 && penalty === 0, share);
  };

  const cardTitles = ["THE PATIENTS", "THE " + kase.causeName.toUpperCase() + "S", "THE " + kase.findingName.toUpperCase() + "S"];
  const lists = [kase.patients, kase.causes, kase.findings];
  const today = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }).toUpperCase();
  const colTags = [...[0, 1, 2].map((i) => ({ t: TAG.c + (i + 1), k: "c" })), ...[0, 1, 2].map((i) => ({ t: TAG.f + (i + 1), k: "f" }))];
  const rowTagsB = [0, 1, 2].map((i) => ({ t: TAG.c + (i + 1), k: "c" }));
  const cell = (m: Mark) => (m === 2 ? "✓" : m === 1 ? "✗" : "");

  const ui = <div className="cf" role="dialog" aria-label="Casefile Logic">
    <div className="cf-page">
      <header className="cf-top">
        {onExit && <button className="cf-exit" onClick={onExit} aria-label="Leave Casefile Logic">✕</button>}
        <div className="cf-mark"><span className="cf-hat">🩺</span><h1>CASEFILE</h1><small>Clinical Logic Mysteries</small></div>
      </header>
      <h2 className="cf-title">{kase.title}</h2>
      <p className="cf-date">{practice ? "FREE-PLAY CASEFILE" : "CASEFILE FOR " + today}</p>
      <p className="cf-intro">{kase.intro}</p>
      <p className="cf-intro dim">Each patient has one cause and one clinching finding, and none repeat. Some clues describe a cause by its clinical features, so decode them. You get one accusation.</p>

      <div className="cf-cards">{[0, 1, 2].map((i) => <button key={i} className={"cf-card" + (flipped[i] ? " flipped" : "")} onClick={() => setFlipped((f) => f.map((x, j) => (j === i ? !x : x)))} aria-label={"Flip card: " + cardTitles[i]}>
        <span className="cf-face front"><i>🔎</i></span>
        <span className="cf-face back"><b>{cardTitles[i]}</b><strong>{lists[i].length}</strong><em>{["Who walked in?", "What is behind it?", "What clinches it?"][i]}</em></span>
      </button>)}</div>
      <p className="cf-cap">TAP THE CARDS TO FLIP THEM</p>
      <section className="cf-box">
        <h3>THE CAST</h3>
        {[0, 1, 2].map((i) => <div key={i} className="cf-cast"><b>{cardTitles[i]}</b>{lists[i].map((item, k) => <p key={k}><u className={"tag " + "pcf"[i]}>{"PCF"[i] + (k + 1)}</u>{item}</p>)}</div>)}
      </section>

      <section className="cf-box">
        <h3>CLUES &amp; EVIDENCE</h3>
        <ol>{kase.clues.map((clue, i) => <li key={i}>
          <button className={"cf-clue" + (struck[i] ? " struck" : "")} onClick={() => setStruck((s) => s.map((x, j) => (j === i ? !x : x)))}>{clue.text}</button>
          <button className="cf-q" aria-label={"Decode clue " + (i + 1)} onClick={() => { if (!decoded[i] && !verdict) { setDecoded((d) => d.map((x, j) => (j === i ? true : x))); setNote(clue.decode ? "Decoding costs 5 points." : "Nothing to decode in that one. Use logic."); } }}>(?)</button>
          {decoded[i] && <p className="cf-decode">{clue.decode ?? "No clinical shorthand to decode here: use logic."}</p>}
        </li>)}</ol>
        <p className="cf-tip">Tap a clue to cross it off once it is on the grid. (?) decodes clinical shorthand for 5 points.</p>
      </section>

      {hints.length > 0 && <section className="cf-box thin">{hints.map((h, i) => <p key={i}><b>COLLEAGUE {i + 1}:</b> {h}</p>)}</section>}

      <section className="cf-box">
        <h3>THE NOTEBOOK</h3>
        <div className="cf-grid" style={{ gridTemplateColumns: "34px repeat(6, 1fr)" }}>
          <span />{colTags.map((t, i) => <b key={i} className={"cf-h tag " + t.k + (i === 3 ? " gap" : "")}>{t.t}</b>)}
          {[0, 1, 2].map((r) => [<b key={"r" + r} className="cf-h tag p">{"P" + (r + 1)}</b>, ...g0[r].map((m, c) => <button key={r + "-" + c} className={"cf-cell m" + m + (c === 3 ? " gap" : "")} onClick={() => clickCell(0, r, c)} aria-label={"Patient " + (r + 1) + " versus " + colTags[c].t}>{cell(m)}</button>)])}
          {[0, 1, 2].map((r) => [<b key={"b" + r} className={"cf-h tag " + rowTagsB[r].k}>{rowTagsB[r].t}</b>, ...[0, 1, 2].map((c) => <span key={"x" + c} className="cf-void" />), ...g1[r].map((m, c) => <button key={"g" + r + "-" + c} className={"cf-cell m" + m + (c === 0 ? " gap" : "")} onClick={() => clickCell(1, r, c)} aria-label={rowTagsB[r].t + " versus F" + (c + 1)}>{cell(m)}</button>)])}
        </div>
        <label className="cf-auto"><input type="checkbox" checked={autoCross} onChange={(e) => setAutoCross(e.target.checked)} /> Auto-cross the rest of a row and column when I confirm a ✓</label>
      </section>

      {note && !verdict && <p className="cf-note" aria-live="polite">{note}</p>}
      {!verdict && <div className="cf-actions">
        <button className="cf-accuse" onClick={accuse}>MAKE YOUR ACCUSATION</button>
        <button className="cf-hint" onClick={askColleague} disabled={hints.length >= 3}>ASK A COLLEAGUE · −10 PTS ({hints.length}/3)</button>
      </div>}

      {verdict && <section className="cf-verdict">
        <div className={"cf-stamp " + (verdict.right.every(Boolean) ? "won" : "lost")}>{verdict.right.every(Boolean) ? "CASE CLOSED" : "COLD CASE"}</div>
        <p className="cf-score">{verdict.right.filter(Boolean).length} of 6 matches correct · {verdict.points} points{penalty ? " (after " + penalty + " point help penalty)" : ""}</p>
        {kase.solution.map((s, i) => <div key={i} className="cf-reveal">
          <b><u className="tag p">P{i + 1}</u> {s.patient}</b>
          <span className={verdict.right[i * 2] ? "ok" : "bad"}>{verdict.right[i * 2] ? "✓" : "✗"} {kase.causeName}: {s.cause}</span>
          <span className={verdict.right[i * 2 + 1] ? "ok" : "bad"}>{verdict.right[i * 2 + 1] ? "✓" : "✗"} {kase.findingName}: {s.finding}</span>
          <i>{s.why}</i>
        </div>)}
        <button className="cf-accuse" onClick={close}>CLOSE THE CASEFILE</button>
      </section>}
    </div>
  </div>;

  return <div className="game-layout" data-own-sfx="true">
    {!finished ? (typeof document !== "undefined" ? createPortal(ui, document.body) : null) : <div className="dive-finale">
      <div className="dive-medal">🩺</div><span className="eyebrow">{verdict?.right.every(Boolean) ? "CASE CLOSED" : "COLD CASE"}</span>
      <h2>{kase.title}</h2><p>{verdict?.right.filter(Boolean).length} of 6 matches correct.</p>
    </div>}
  </div>;
}
