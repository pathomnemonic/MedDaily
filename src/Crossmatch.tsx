import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { crossAliases, crossDrugs } from "./dataCrossmatch";
import { CROSS_GUESSES, cellAnswers, crossCellPoints, generateCrossPuzzle } from "./crossLogic";
import { matchAnswer } from "./arcadeLogic";
import { reward } from "./juice";
import { sfx } from "./audio";

type Done = (score: number, maxScore: number, perfect: boolean, shareText?: string) => void;
/** Specimen-tube cap colours, like the colour-coded tops of blood collection tubes. */
const CAPS = ["#a98bff", "#ff5d6c", "#3fd9a5", "#5ac8fa", "#ffd54a", "#c7ccd6"];

/**
 * Crossmatch: a 3x3 grid. Each row and column has a criterion (a drug group or a property); every cell needs a drug that
 * satisfies both, and each drug can be used once. Familiar answers score 6, less familiar ones up to 10.
 */
export default function Crossmatch({ seed, onDone, onExit }: { seed: number; onDone: Done; onExit?: () => void }) {
  const puzzle = useMemo(() => generateCrossPuzzle(seed), [seed]);
  const { rows, cols } = puzzle;
  const [cells, setCells] = useState<(null | { drug: string; points: number })[]>(Array(9).fill(null));
  const [open, setOpen] = useState<number | null>(null);
  const [text, setText] = useState("");
  const [msg, setMsg] = useState("");
  const [left, setLeft] = useState(CROSS_GUESSES);
  const [over, setOver] = useState(false);
  const [finished, setFinished] = useState(false);
  const [shake, setShake] = useState(0);
  const filled = cells.filter(Boolean).length;
  const total = cells.reduce((n, c) => n + (c?.points ?? 0), 0) + (filled === 9 ? 10 : 0);
  const used = new Set(cells.filter(Boolean).map((c) => c!.drug));
  const aliasesOf = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const [alias, target] of Object.entries(crossAliases)) map.set(target, [...(map.get(target) ?? []), alias]);
    return map;
  }, []);

  const suggestions = useMemo(() => {
    const q = text.trim().toLowerCase();
    if (!q) return [];
    return crossDrugs.filter((d) => !used.has(d) && (d.toLowerCase().includes(q) || (aliasesOf.get(d) ?? []).some((a) => a.toLowerCase().startsWith(q))))
      .sort((a, b) => Number(b.toLowerCase().startsWith(q)) - Number(a.toLowerCase().startsWith(q)) || a.localeCompare(b)).slice(0, 6);
  }, [text, used, aliasesOf]);

  const pick = (drug: string) => {
    if (open === null || over) return;
    const r = rows[Math.floor(open / 3)], c = cols[open % 3];
    if (used.has(drug)) { setMsg(drug + " is already on the grid. Each drug can be used once."); setShake((n) => n + 1); return; }
    const okRow = r.members.includes(drug), okCol = c.members.includes(drug);
    const remaining = left - 1;
    if (okRow && okCol) {
      const points = crossCellPoints(r, c, drug);
      const next = cells.map((x, i) => (i === open ? { drug, points } : x));
      setCells(next); setOpen(null); setText(""); setMsg(""); setLeft(remaining);
      reward(true, null, "+" + points); sfx(points >= 9 ? "badge" : "correct");
      if (next.every(Boolean) || remaining === 0) setOver(true);
      return;
    }
    // A close miss tells you which half of the cell the drug did satisfy.
    setLeft(remaining); setShake((n) => n + 1); setText("");
    setMsg(okRow ? drug + " fits “" + r.label + "” but not “" + c.label + "”." : okCol ? drug + " fits “" + c.label + "” but not “" + r.label + "”." : drug + " fits neither side of this cell.");
    reward(false); sfx("wrong");
    if (remaining === 0) { setOpen(null); setOver(true); }
  };
  const submit = () => {
    const q = text.trim();
    if (!q) return;
    const exact = crossDrugs.find((d) => d.toLowerCase() === q.toLowerCase());
    const fuzzy = exact ?? matchAnswer(q, crossDrugs.map((d) => ({ answer: d, aliases: aliasesOf.get(d) ?? [] })))?.match.answer;
    if (!fuzzy) { setMsg("Pick a drug from the list."); setShake((n) => n + 1); return; }
    pick(fuzzy);
  };
  const giveUp = () => { setOpen(null); setOver(true); };
  const finish = () => {
    setFinished(true);
    const squares = [0, 1, 2].map((r) => [0, 1, 2].map((c) => { const x = cells[r * 3 + c]; return !x ? "⬛" : x.points >= 9 ? "🟩" : x.points >= 7 ? "🟨" : "🟧"; }).join("")).join("\n");
    onDone(total, 100, filled === 9 && cells.every((c) => (c?.points ?? 0) >= 9), "Crossmatch " + total + "/100\n" + squares + "\n" + (CROSS_GUESSES - left) + " guesses used");
  };

  const active = open !== null ? { r: rows[Math.floor(open / 3)], c: cols[open % 3] } : null;
  const ui = <div className="cm" role="dialog" aria-label="Crossmatch">
    <header className="cm-hud">
      {onExit && <button className="cm-exit" onClick={onExit} aria-label="Leave Crossmatch">✕</button>}
      <div className="cm-title"><small>THE BLOOD BANK GRID</small><b>CROSSMATCH</b></div>
      <div className="cm-chip"><small>GUESSES</small><b>{left}</b></div>
      <div className="cm-chip"><small>POINTS</small><b>{total}</b></div>
    </header>
    <p className="cm-help">Each cell needs a drug that fits <b>both</b> its row and its column. Use each drug once. Less familiar answers score more.</p>

    <div className="cm-board">
      <span />
      {cols.map((c, i) => <div key={c.id} className="cm-tube" style={{ ["--cap" as string]: CAPS[i * 2 % 6] }}><i /><span>{c.label}</span></div>)}
      {rows.map((r, ri) => [
        <div key={"r" + ri} className="cm-row" style={{ ["--cap" as string]: CAPS[(ri * 2 + 1) % 6] }}><span>{r.label}</span></div>,
        ...[0, 1, 2].map((ci) => {
          const idx = ri * 3 + ci, cell = cells[idx];
          const reveal = over && !cell;
          return <button key={idx} className={"cm-cell" + (cell ? " filled p" + cell.points : "") + (reveal ? " missed" : "")} disabled={over || !!cell} onClick={() => { setOpen(idx); setText(""); setMsg(""); }} aria-label={"Cell " + (idx + 1) + ": " + r.label + " and " + cols[ci].label}>
            {cell ? <><b>{cell.drug}</b><em>+{cell.points}</em></> : reveal ? <small>{cellAnswers(r, cols[ci]).slice(0, 2).join(" · ")}</small> : <i>+</i>}
          </button>;
        }),
      ])}
    </div>

    {!over ? <div className="cm-foot"><span>{filled} of 9 filled</span><button onClick={giveUp}>GIVE UP</button></div>
      : <div className="cm-over"><h2>{filled === 9 ? "ALL MATCHED" : "TIME TO RECONCILE"}</h2><p>{filled} of 9 cells filled · {total} points{filled === 9 ? " (includes a 10-point full-grid bonus)" : ""}. Unfilled cells show example answers.</p><button onClick={finish}>COLLECT · {total} PTS</button></div>}

    {active && !over && <div className="cm-modal" onClick={() => setOpen(null)}>
      <div className="cm-sheet" onClick={(e) => e.stopPropagation()}>
        <button className="cm-x" onClick={() => setOpen(null)} aria-label="Close">✕</button>
        <h3>Make your guess</h3>
        <div className="cm-crit"><span>{active.r.label}</span><i>×</i><span>{active.c.label}</span></div>
        <form key={shake} className={shake ? "shake" : ""} onSubmit={(e) => { e.preventDefault(); submit(); }}>
          <input autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="Search drugs…" autoComplete="off" autoCapitalize="off" spellCheck={false} aria-label="Search drugs" />
        </form>
        {msg && <p className="cm-msg" aria-live="polite">{msg}</p>}
        <div className="cm-sugg">{suggestions.map((s) => <button key={s} onClick={() => pick(s)}>{s}</button>)}</div>
        <p className="cm-small">{left} guess{left === 1 ? "" : "es"} left</p>
      </div>
    </div>}
  </div>;

  return <div className="game-layout" data-own-sfx="true">
    {!finished ? (typeof document !== "undefined" ? createPortal(ui, document.body) : null) : <div className="dive-finale">
      <div className="dive-medal">🧪</div><span className="eyebrow">CROSSMATCH COMPLETE</span>
      <h2>{total} / 100</h2><p>{filled} of 9 cells matched.</p>
    </div>}
  </div>;
}
