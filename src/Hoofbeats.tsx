import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { HoofAnswer } from "./dataHoofbeats";
import { HOOF_ROUNDS, HOOF_SECONDS, hoofPoints, hoofRank, hoofScore, matchHoof, pickHoofPrompts, promptMax, sortedAnswers } from "./hoofLogic";
import { reward } from "./juice";
import { sfx } from "./audio";

type Done = (score: number, maxScore: number, perfect: boolean, shareText?: string) => void;
interface Pick { answer: HoofAnswer | null; points: number }

const FLAVOR: Record<string, string> = {
  "A horse": "Hoofbeats mean horses. A great call.",
  "A pony": "Common enough to count, though not the top answer.",
  "A donkey": "Valid, but uncommon. Think more common.",
  "A zebra": "A zebra: real, rare, and worth almost nothing today.",
};

/**
 * Hoofbeats: "when you hear hoofbeats, think horses, not zebras." Each prompt has a board of valid answers weighted by how
 * common they are (ten points per percent). Name the most common one. Rare answers are real but score almost nothing.
 */
export default function Hoofbeats({ seed, onDone, onExit }: { seed: number; onDone: Done; onExit?: () => void }) {
  const prompts = useMemo(() => pickHoofPrompts(seed), [seed]);
  const [round, setRound] = useState(0);
  const [entry, setEntry] = useState("");
  const [seconds, setSeconds] = useState(HOOF_SECONDS);
  const [locked, setLocked] = useState(false);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [message, setMessage] = useState("");
  const [shake, setShake] = useState(0);
  const [finished, setFinished] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const done = useRef(false);
  const prompt = prompts[round];
  const board = useMemo(() => sortedAnswers(prompt), [prompt]);
  const current = picks[round];
  const total = picks.reduce((n, p) => n + p.points, 0);
  const max = prompts.reduce((n, p) => n + promptMax(p), 0);
  const soFarMax = prompts.slice(0, picks.length).reduce((n, p) => n + promptMax(p), 0);

  useEffect(() => { if (!locked && !finished) input.current?.focus({ preventScroll: true }); }, [round, locked, finished]);
  useEffect(() => {
    if (locked || finished) return;
    const id = window.setInterval(() => setSeconds((v) => Math.max(0, v - 1)), 1000);
    return () => window.clearInterval(id);
  }, [round, locked, finished]);
  useEffect(() => {
    if (locked || finished) return;
    if (seconds > 0 && seconds <= 5) sfx("tick");
    if (seconds === 0) { sfx("whoosh"); setPicks((all) => [...all.slice(0, round), { answer: null, points: 0 }]); setLocked(true); setMessage("Time ran out. The board is revealed below."); }
  }, [seconds, locked, finished, round]);

  const lockWith = (pick: Pick) => {
    setPicks((all) => [...all.slice(0, round), pick]);
    setLocked(true);
    window.setTimeout(() => sfx("tick"), 60);
  };
  const submit = () => {
    if (locked || finished || !entry.trim()) return;
    const found = matchHoof(entry, prompt);
    if (!found) { reward(false); setShake((n) => n + 1); setMessage("Not on the board. It may be valid but too rare to list. Try a more common answer."); return; }
    const points = hoofPoints(found.answer.pct);
    const rank = hoofRank(found.answer.pct);
    lockWith({ answer: found.answer, points });
    reward(rank.label === "A horse" || rank.label === "A pony", null, "+" + points);
    window.setTimeout(() => sfx(rank.label === "A horse" ? "badge" : rank.label === "A zebra" ? "wrong" : "correct"), 250);
    setMessage(found.fuzzy ? "Counted as “" + found.answer.name + "” (typo forgiven)." : "");
  };
  const pass = () => { if (locked || finished) return; lockWith({ answer: null, points: 0 }); setMessage("You passed. The board is revealed below."); };
  const next = () => {
    if (round === HOOF_ROUNDS - 1) {
      setFinished(true);
      if (!done.current) {
        done.current = true;
        const score = hoofScore(total, max);
        const icons = picks.map((p) => (p.answer ? hoofRank(p.answer.pct).icon : "⬛")).join("");
        onDone(score, 100, total === max, "Hoofbeats " + score + "/100\n" + icons + "\n🐴 common → 🦓 rare");
      }
      return;
    }
    setRound((r) => r + 1); setEntry(""); setLocked(false); setSeconds(HOOF_SECONDS); setMessage("");
  };

  const rank = current?.answer ? hoofRank(current.answer.pct) : null;
  const ui = <div className="hf" role="dialog" aria-label="Hoofbeats">
    <div className="hf-run" aria-hidden="true"><span>🐴 🐴 🦓 🐴 🐎 🐴 🫏 🐴 🐴 🦓 🐴</span></div>
    <header className="hf-hud">
      {onExit && <button className="hf-exit" onClick={onExit} aria-label="Leave Hoofbeats">✕</button>}
      <div className="hf-title"><small>THINK HORSES, NOT ZEBRAS</small><b>HOOFBEATS</b></div>
      <div className="hf-chip"><small>ROUND</small><b>{Math.min(round + 1, HOOF_ROUNDS)}<i>/{HOOF_ROUNDS}</i></b></div>
      <div className="hf-chip"><small>POINTS</small><b>{total}</b></div>
    </header>

    <section className="hf-prompt" key={round}>
      <small>{prompt.scope.toUpperCase()} · NAME THE MOST COMMON</small>
      <h2>{prompt.prompt}</h2>
      <div className={"hf-clock" + (seconds <= 5 && !locked ? " urgent" : "")}><i style={{ width: (locked ? 0 : (seconds / HOOF_SECONDS) * 100) + "%" }} /><b>{locked ? "✓" : seconds}</b></div>
    </section>

    <div className="hf-board">
      <div className="hf-bulbs" aria-hidden="true" />
      <div className="hf-slots">
        {board.map((a, i) => {
          const mine = locked && current?.answer?.name === a.name;
          const r = hoofRank(a.pct);
          return <div key={a.name} className={"hf-slot" + (locked ? " flipped" : "") + (mine ? " mine" : "") + (a.pct <= 1 && locked ? " zebra" : "")} style={{ animationDelay: locked ? i * 120 + "ms" : "0ms" }}>
            {locked ? <>
              <i className="bar" style={{ width: Math.max(3, a.pct * 2) + "%" }} />
              <span className="icon">{r.icon}</span>
              <span className="name">{a.name}</span>
              <span className="pct">{a.pct}%<em>{hoofPoints(a.pct)} pts</em></span>
              {mine && <b className="tag">YOU</b>}
            </> : <><span className="num">{i + 1}</span><span className="q">?</span></>}
          </div>;
        })}
      </div>
    </div>

    {!locked ? <footer className="hf-dock">
      <form key={shake} className={"hf-form" + (shake ? " shake" : "")} onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <input ref={input} value={entry} onChange={(e) => setEntry(e.target.value)} placeholder="Type one answer…" autoComplete="off" autoCapitalize="off" spellCheck={false} aria-label="Your answer" />
        <button type="submit" disabled={!entry.trim()}>ANSWER</button>
      </form>
      <div className="hf-foot"><p aria-live="polite">{message || board.length + " answers on the board. The more common, the more it scores."}</p><button type="button" onClick={pass}>PASS</button></div>
    </footer> : <footer className="hf-result">
      <div className="hf-verdict">{rank ? <><span>{rank.icon}</span><b>{rank.label.toUpperCase()}</b><strong>+{current!.points}</strong></> : <><span>⬛</span><b>NO ANSWER</b><strong>+0</strong></>}</div>
      <p>{rank ? FLAVOR[rank.label] : "The most common answer was " + board[0].name + " (" + board[0].pct + "%)."} {message}</p>
      <p className="note">{prompt.note}</p>
      <button onClick={next}>{round === HOOF_ROUNDS - 1 ? "SEE MY SCORE" : "NEXT PROMPT ▶"}</button>
      {round > 0 || picks.length > 0 ? <small>Best possible so far: {soFarMax} · you: {total}</small> : null}
    </footer>}
  </div>;

  return <div className="game-layout" data-own-sfx="true">
    {!finished ? (typeof document !== "undefined" ? createPortal(ui, document.body) : null) : <div className="dive-finale">
      <div className="dive-medal">🐴</div><span className="eyebrow">HOOFBEATS COMPLETE</span>
      <h2>{hoofScore(total, max)} / 100</h2><p>{total} of {max} possible points. {total >= max * 0.7 ? "You think like a clinician: horses first." : "Remember: common things are common."}</p>
      <div className="dive-log">{prompts.map((p, i) => <div key={p.id}><span>{picks[i]?.answer ? hoofRank(picks[i].answer!.pct).icon : "⬛"}</span><b>{picks[i]?.answer?.name ?? "—"}</b><strong>+{picks[i]?.points ?? 0}</strong></div>)}</div>
    </div>}
  </div>;
}
