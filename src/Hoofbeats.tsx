import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import HoofScene from "./components/HoofScene";
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
 * Hoofbeats: "when you hear hoofbeats, think horses, not zebras." Name the most common valid answer to each clinical prompt.
 * Every answer is weighted by approximate prevalence (ten points per percent) and your score is your altitude: common answers
 * lift the balloon capsule highest. The look follows the Noillirk format: a full-screen pixel scene, a prompt card, and a dock.
 */
export default function Hoofbeats({ seed, onDone, onExit }: { seed: number; onDone: Done; onExit?: () => void }) {
  const prompts = useMemo(() => pickHoofPrompts(seed), [seed]);
  const [round, setRound] = useState(0);
  const [entry, setEntry] = useState("");
  const [seconds, setSeconds] = useState(HOOF_SECONDS);
  const [locked, setLocked] = useState(false);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [tried, setTried] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [rise, setRise] = useState(0);
  const [shake, setShake] = useState(0);
  const [finished, setFinished] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const done = useRef(false);
  const prompt = prompts[round];
  const board = useMemo(() => sortedAnswers(prompt), [prompt]);
  const current = picks[round];
  const total = picks.reduce((n, p) => n + p.points, 0);
  const max = prompts.reduce((n, p) => n + promptMax(p), 0);

  useEffect(() => { if (!locked && !finished) input.current?.focus({ preventScroll: true }); }, [round, locked, finished]);
  useEffect(() => {
    if (locked || finished) return;
    const id = window.setInterval(() => setSeconds((v) => Math.max(0, v - 1)), 1000);
    return () => window.clearInterval(id);
  }, [round, locked, finished]);
  useEffect(() => {
    if (locked || finished) return;
    if (seconds > 0 && seconds <= 5) sfx("tick");
    if (seconds === 0) { sfx("whoosh"); setPicks((all) => [...all.slice(0, round), { answer: null, points: 0 }]); setLocked(true); setMessage("Time ran out."); }
  }, [seconds, locked, finished, round]);

  const lockWith = (pick: Pick) => {
    setPicks((all) => [...all.slice(0, round), pick]);
    setLocked(true);
    if (pick.points) setRise((n) => n + 1);
  };
  const submit = () => {
    if (locked || finished || !entry.trim()) return;
    const text = entry.trim();
    if (tried.some((t) => t.toLowerCase() === text.toLowerCase())) { setShake((n) => n + 1); setMessage("You already tried “" + text + "”."); return; }
    const found = matchHoof(text, prompt);
    if (!found) {
      reward(false); setShake((n) => n + 1); setTried((t) => [...t, text]); setEntry("");
      setMessage("“" + text + "” isn't on our list. Try another — the clock is still running.");
      return;
    }
    const points = hoofPoints(found.answer.pct);
    const r = hoofRank(found.answer.pct);
    lockWith({ answer: found.answer, points });
    reward(r.label === "A horse" || r.label === "A pony", null, "+" + points + "m");
    window.setTimeout(() => sfx(r.label === "A horse" ? "badge" : r.label === "A zebra" ? "wrong" : "correct"), 250);
    setMessage(found.fuzzy ? "Counted as “" + found.answer.name + "” (typo forgiven)." : "");
  };
  const pass = () => { if (locked || finished) return; lockWith({ answer: null, points: 0 }); setMessage("You passed."); };
  const next = () => {
    if (round === HOOF_ROUNDS - 1) {
      setFinished(true);
      if (!done.current) {
        done.current = true;
        const score = hoofScore(total, max);
        const icons = picks.map((p) => (p.answer ? hoofRank(p.answer.pct).icon : "⬛")).join("");
        onDone(score, 100, total === max, "Hoofbeats · " + total + " m high\n" + icons + "\n🐴 common → 🦓 rare");
      }
      return;
    }
    setRound((r) => r + 1); setEntry(""); setLocked(false); setSeconds(HOOF_SECONDS); setMessage(""); setTried([]);
  };

  const r = current?.answer ? hoofRank(current.answer.pct) : null;
  const ring = 2 * Math.PI * 17;
  const ui = <div className="hn" role="dialog" aria-label="Hoofbeats">
    <HoofScene frac={total / Math.max(1, max)} seed={seed} />
    <header className="hn-top">
      {onExit && <button className="hn-icon" onClick={onExit} aria-label="Leave Hoofbeats">✕</button>}
      <div className="hn-bar" aria-label={"Question " + (round + 1) + " of " + HOOF_ROUNDS}>{prompts.map((_, i) => <i key={i} className={i < picks.length ? "done" : i === round ? "cur" : ""} />)}</div>
      <div className="hn-alt"><b>{total}</b>m</div>
    </header>

    <section className="hn-q" key={round}>
      <small>{prompt.scope.toUpperCase()}</small>
      <h2>{prompt.prompt}</h2>
      <p>The more common the answer, the higher you go.</p>
    </section>
    {locked && current && current.points > 0 && <div className="hn-rise" key={"r" + rise}>+{current.points} m</div>}

    {!locked ? <footer className="hn-dock">
      {(message || tried.length > 0) && <div className="hn-feedback">
        {message && <p className={"hn-msg" + (message.startsWith("“") && message.includes("isn't") ? " bad" : "")} aria-live="polite">{message}</p>}
        {tried.length > 0 && <div className="hn-tried"><span>Already tried:</span>{tried.map((t) => <i key={t}>{t}</i>)}</div>}
      </div>}
      <form key={shake} className={"hn-form" + (shake ? " shake" : "")} onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <button type="button" className="hn-pass" onClick={pass}>Pass</button>
        <div className={"hn-timer" + (seconds <= 5 ? " urgent" : "")} aria-label={seconds + " seconds left"}>
          <svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="17" /><circle cx="20" cy="20" r="17" className="fg" style={{ strokeDasharray: ring, strokeDashoffset: ring * (1 - seconds / HOOF_SECONDS) }} /></svg><b>{seconds}</b>
        </div>
        <input ref={input} value={entry} onChange={(e) => setEntry(e.target.value)} placeholder="What would most clinicians say?" autoComplete="off" autoCapitalize="off" spellCheck={false} aria-label="Your answer" />
        <button type="submit" className="hn-go" disabled={!entry.trim()} aria-label="Submit answer">→</button>
      </form>
    </footer> : <footer className={"hn-sheet" + (board.length > 12 ? " dense denser" : board.length > 8 ? " dense" : "")}>
      <div className="hn-verdict"><span>{r ? r.icon : "⬛"}</span><b>{r ? r.label.toUpperCase() : "NO ANSWER"}</b><strong>+{current?.points ?? 0} m</strong></div>
      <p className="hn-flavor">{r ? FLAVOR[r.label] : "The most common answer was " + board[0].name + " (" + board[0].pct + "%)."} {message}</p>
      <ol className="hn-list">
        {board.map((a, i) => {
          const mine = current?.answer?.name === a.name;
          return <li key={a.name} className={mine ? "mine" : ""} style={{ animationDelay: i * 70 + "ms" }}>
            <i style={{ width: Math.max(3, a.pct * 2) + "%" }} />
            <span className="ic">{hoofRank(a.pct).icon}</span><span className="nm">{a.name}{mine && <em>YOU</em>}</span><span className="pc">{a.pct}%<small>{hoofPoints(a.pct)} pts</small></span>
          </li>;
        })}
      </ol>
      {(() => { const rest = Math.round((100 - board.reduce((n, a) => n + a.pct, 0)) * 10) / 10; return rest > 0.4 ? <p className="hn-note">Everything else, spread across less common answers: {rest}%</p> : null; })()}
      <p className="hn-note">{prompt.note}</p>
      <button className="hn-next" onClick={next}>{round === HOOF_ROUNDS - 1 ? "See my altitude →" : "Next question →"}</button>
    </footer>}
  </div>;

  return <div className="game-layout" data-own-sfx="true">
    {!finished ? (typeof document !== "undefined" ? createPortal(ui, document.body) : null) : <div className="dive-finale">
      <div className="dive-medal">🎈</div><span className="eyebrow">HOOFBEATS COMPLETE</span>
      <h2>{total} m high</h2><p>{hoofScore(total, max)} / 100 of the best possible. {total >= max * 0.7 ? "You think like a clinician: horses first." : "Remember: common things are common."}</p>
      <div className="dive-log">{prompts.map((p, i) => <div key={p.id}><span>{picks[i]?.answer ? hoofRank(picks[i].answer!.pct).icon : "⬛"}</span><b>{picks[i]?.answer?.name ?? "—"}</b><strong>+{picks[i]?.points ?? 0}</strong></div>)}</div>
    </div>}
  </div>;
}
