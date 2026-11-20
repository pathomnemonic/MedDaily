import { useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { blackoutScore, isStop, pickBlackoutCase, stem, titleWords, tokenize } from "./blackoutLogic";
import { matchAnswer } from "./arcadeLogic";
import { reward } from "./juice";
import { sfx } from "./audio";

type Done = (score: number, maxScore: number, perfect: boolean, shareText?: string) => void;
interface Guess { word: string; hits: number }

/**
 * Blackout Chart: a case report with the diagnosis blacked out. Guess words to reveal every matching word in the chart, or
 * name the diagnosis outright. Redaction bars show each hidden word's length.
 */
export default function BlackoutChart({ seed, onDone, onExit }: { seed: number; onDone: Done; onExit?: () => void }) {
  const kase = useMemo(() => pickBlackoutCase(seed), [seed]);
  const body = useMemo(() => tokenize(kase.text), [kase]);
  const title = useMemo(() => titleWords(kase.title), [kase]);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [last, setLast] = useState("");
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [count, setCount] = useState(0);
  const [hints, setHints] = useState(0);
  const [mode, setMode] = useState<"word" | "diagnosis">("word");
  const [text, setText] = useState("");
  const [note, setNote] = useState("");
  const [over, setOver] = useState<"won" | "lost" | null>(null);
  const [finished, setFinished] = useState(false);
  const [shake, setShake] = useState(0);
  const done = useRef(false);

  const hit = (w: string) => isStop(w) || over !== null || revealed.has(stem(w));
  const titleDone = (set: Set<string>) => title.every((w) => isStop(w) || set.has(stem(w)));
  const countOf = (s: string) => body.filter((t) => t.kind === "word" && stem(t.text) === s).length + title.filter((w) => stem(w) === s).length;

  const win = (n: number) => { setOver("won"); setCount(n); reward(true, null, "SOLVED"); sfx("badge"); };
  const guessWord = () => {
    const pieces = text.toLowerCase().split(/[^a-z'-]+/).filter((p) => p.length >= 2);
    if (!pieces.length) { setShake((n) => n + 1); setNote("Type a word from the chart."); return; }
    const next = new Set(revealed);
    const added: Guess[] = [];
    let n = count, msg = "";
    for (const piece of pieces) {
      const s = stem(piece);
      if (isStop(piece)) { msg = "“" + piece + "” is already showing."; continue; }
      if (next.has(s) || guesses.some((g) => stem(g.word) === s)) { msg = "You already tried “" + piece + "”."; continue; }
      next.add(s); n++;
      const hits = countOf(s);
      added.push({ word: piece, hits });
      setLast(s);
      if (hits) { sfx("correct"); } else { sfx("wrong"); }
    }
    setText("");
    if (!added.length) { setShake((v) => v + 1); setNote(msg); return; }
    setRevealed(next); setGuesses((g) => [...added, ...g]); setCount(n);
    const total = added.reduce((a, g) => a + g.hits, 0);
    setNote(total ? "Found " + total + " match" + (total === 1 ? "" : "es") + "." : "No match for that word.");
    if (titleDone(next)) win(n);
  };
  const guessDiagnosis = () => {
    const q = text.trim();
    if (!q) return;
    const n = count + 1;
    const ok = matchAnswer(q, [{ answer: kase.title, aliases: kase.aliases }]);
    setText("");
    if (ok) { win(n); return; }
    setCount(n); setShake((v) => v + 1); setNote("That is not the diagnosis. Keep revealing words.");
    reward(false); sfx("wrong");
  };
  const submit = () => { if (over) return; if (mode === "word") guessWord(); else guessDiagnosis(); };
  const hint = () => {
    if (over) return;
    const pool = body.filter((t) => t.kind === "word" && t.text.length >= 5 && !isStop(t.text) && !revealed.has(stem(t.text)));
    if (!pool.length) { setNote("Nothing left to reveal."); return; }
    const pick = pool[(count * 7 + hints * 3 + seed) % pool.length];
    const s = stem(pick.text);
    const next = new Set(revealed); next.add(s);
    setRevealed(next); setLast(s); setHints((h) => h + 1);
    setGuesses((g) => [{ word: pick.text.toLowerCase() + " (hint)", hits: countOf(s) }, ...g]);
    setNote("A colleague points at “" + pick.text.toLowerCase() + "”. That costs 8 points.");
    sfx("pop");
  };
  const giveUp = () => { if (!over) setOver("lost"); };
  const finish = () => {
    setFinished(true);
    if (done.current) return;
    done.current = true;
    const won = over === "won";
    const points = won ? blackoutScore(count, hints) : 0;
    const squares = guesses.slice().reverse().slice(0, 12).map((g) => (g.hits >= 2 ? "🟩" : g.hits === 1 ? "🟨" : "⬛")).join("");
    onDone(points, 100, won && count <= 8 && hints === 0, "Blackout Chart · " + (won ? "solved in " + count + (count === 1 ? " guess" : " guesses") : "gave up") + (hints ? " · " + hints + " hint" + (hints === 1 ? "" : "s") : "") + "\n" + squares);
  };

  const bar = (w: string, key: string | number, extra = "") => {
    const shown = hit(w);
    return shown
      ? <span key={key} className={"bo-word" + (last && stem(w) === last && over === null ? " new" : "") + extra}>{w}</span>
      : <span key={key} className={"bo-bar" + extra} style={{ width: Math.max(1.5, w.length * 0.6) + "em" }} aria-label={w.length + " letter word"}>{w.length}</span>;
  };
  const pts = over === "won" ? blackoutScore(count, hints) : 0;

  const ui = <div className="bo" role="dialog" aria-label="Blackout Chart">
    <header className="bo-hud">
      {onExit && <button className="bo-exit" onClick={onExit} aria-label="Leave Blackout Chart">✕</button>}
      <div className="bo-brand"><small>CONFIDENTIAL</small><b>BLACKOUT CHART</b></div>
      <div className="bo-stat"><b>{count}</b><small>guesses</small></div>
    </header>
    <div className="bo-scroll">
      <article className="bo-sheet">
        <div className="bo-stamp">PATIENT CHART</div>
        <p className="bo-dx"><span>DIAGNOSIS</span>{title.map((w, i) => bar(w, i))}</p>
        <p className="bo-text">{body.map((t, i) => (t.kind === "word" ? bar(t.text, i) : <span key={i}>{t.text}</span>))}</p>
      </article>
      {guesses.length > 0 && <div className="bo-tried"><b>WORDS TRIED</b>{guesses.map((g, i) => <span key={i} className={g.hits ? "yes" : "no"}>{g.word}<i>{g.hits}</i></span>)}</div>}
      {note && <p className="bo-note" aria-live="polite">{note}</p>}
    </div>

    {!over ? <footer className="bo-dock">
      <div className="bo-tabs"><button className={mode === "word" ? "on" : ""} onClick={() => setMode("word")}>GUESS A WORD</button><button className={mode === "diagnosis" ? "on" : ""} onClick={() => setMode("diagnosis")}>NAME THE DIAGNOSIS</button></div>
      <form key={shake} className={"bo-form" + (shake ? " shake" : "")} onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <input value={text} onChange={(e) => setText(e.target.value)} autoComplete="off" autoCapitalize="off" spellCheck={false} placeholder={mode === "word" ? "Type a word…" : "Type the diagnosis…"} aria-label={mode === "word" ? "Guess a word" : "Name the diagnosis"} />
        <button type="submit" disabled={!text.trim()}>{mode === "word" ? "REVEAL" : "ACCUSE"}</button>
      </form>
      <div className="bo-tools"><button onClick={hint}>💡 HINT · −8 PTS ({hints})</button><button onClick={giveUp}>GIVE UP</button></div>
    </footer> : <section className="bo-over">
      <small>{over === "won" ? "DIAGNOSIS CONFIRMED" : "THE DIAGNOSIS WAS"}</small>
      <h2>{kase.title}</h2>
      <p>{over === "won" ? "Solved in " + count + (count === 1 ? " guess" : " guesses") + (hints ? " with " + hints + " hint" + (hints === 1 ? "" : "s") : "") + "." : "The full chart is now readable above."}</p>
      <button onClick={finish}>{over === "won" ? "COLLECT · " + pts + " PTS" : "CLOSE THE CHART"}</button>
    </section>}
  </div>;

  return <div className="game-layout" data-own-sfx="true">
    {!finished ? (typeof document !== "undefined" ? createPortal(ui, document.body) : null) : <div className="dive-finale">
      <div className="dive-medal">🗂️</div><span className="eyebrow">BLACKOUT CHART</span>
      <h2>{kase.title}</h2><p>{over === "won" ? "Solved in " + count + " guesses." : "Not this time."}</p>
    </div>}
  </div>;
}
