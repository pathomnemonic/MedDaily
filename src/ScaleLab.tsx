import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SCALE_CATEGORIES } from "./dataScale";
import { formatScale, pickScaleRounds, scaleFactor, scaleScore, tickLabel, SCALE_ROUNDS } from "./scaleLogic";
import { reward } from "./juice";
import { sfx } from "./audio";

type Done = (score: number, maxScore: number, perfect: boolean, shareText?: string) => void;
interface Result { name: string; icon: string; guess: number; actual: number; points: number }

const COLORS = ["#4cc9f0", "#ffb347"] as const;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

/**
 * Scale Lab: "how big is it, really?" Two things per round sit on one fixed log ruler (every notch is 10x the last).
 * Drag the markers, nudge them, or type an exact number in any unit. Closeness is scored on the log scale.
 */
export default function ScaleLab({ seed, onDone, onExit }: { seed: number; onDone: Done; onExit?: () => void }) {
  const rounds = useMemo(() => pickScaleRounds(seed), [seed]);
  const [round, setRound] = useState(0);
  const { cat, items } = rounds[round];
  const info = SCALE_CATEGORIES[cat];
  const lo = Math.log10(info.min), hi = Math.log10(info.max);
  const startPos = (): [number, number] => [lo + (hi - lo) * 0.28, lo + (hi - lo) * 0.72];
  const [pos, setPos] = useState<[number, number]>(startPos);
  const [touched, setTouched] = useState<[boolean, boolean]>([false, false]);
  const [sel, setSel] = useState<0 | 1>(0);
  const [typed, setTyped] = useState("");
  const [unitIdx, setUnitIdx] = useState(1);
  const [reveal, setReveal] = useState(false);
  const [results, setResults] = useState<Result[][]>([]);
  const [finished, setFinished] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const done = useRef(false);
  const total = results.flat().reduce((n, r) => n + r.points, 0);
  const pct = (logv: number) => clamp(((logv - lo) / (hi - lo)) * 100, 0, 100);

  // The unit picker defaults to a sensible unit for the selected marker's current value.
  useEffect(() => {
    const v = Math.pow(10, pos[sel]);
    let best = 0;
    info.units.forEach((u, i) => { if (v / u.factor >= 1) best = i; });
    setUnitIdx(best);
    setTyped("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel, round]);

  const setOne = (i: 0 | 1, logv: number) => {
    const next = clamp(logv, lo, hi);
    setPos((p) => (i === 0 ? [next, p[1]] : [p[0], next]));
    setTouched((t) => (i === 0 ? [true, t[1]] : [t[0], true]));
  };
  const fromPointer = (clientX: number): number => {
    const r = track.current!.getBoundingClientRect();
    return lo + clamp((clientX - r.left) / r.width, 0, 1) * (hi - lo);
  };
  const down = (e: React.PointerEvent) => {
    if (reveal || !track.current) return;
    const r = track.current.getBoundingClientRect();
    const px = (i: 0 | 1) => r.left + ((pos[i] - lo) / (hi - lo)) * r.width;
    const near = [0, 1].map((i) => Math.abs(px(i as 0 | 1) - e.clientX)).map((d, i) => ({ d, i: i as 0 | 1 })).sort((a, b) => a.d - b.d)[0];
    const target = near.d < 34 ? near.i : sel;
    setSel(target);
    dragging.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    setOne(target, fromPointer(e.clientX));
    sfx("tick");
  };
  const move = (e: React.PointerEvent) => { if (dragging.current && !reveal) setOne(sel, fromPointer(e.clientX)); };
  const up = () => { dragging.current = false; };
  const nudge = (dlog: number) => { if (!reveal) { setOne(sel, pos[sel] + dlog); sfx("tick"); } };
  const commitTyped = () => {
    const n = Number(typed.replace(/,/g, ""));
    if (!(n > 0) || !Number.isFinite(n)) return;
    setOne(sel, Math.log10(n * info.units[unitIdx].factor));
    setTyped("");
  };

  const lock = () => {
    if (reveal || !touched[0] || !touched[1]) return;
    const out: Result[] = items.map((item, i) => {
      const guess = Math.pow(10, pos[i]);
      return { name: item.name, icon: item.icon, guess, actual: item.value, points: scaleScore(guess, item.value) };
    });
    setResults((all) => [...all, out]);
    setReveal(true);
    const best = Math.max(...out.map((r) => r.points));
    reward(best >= 60, null, best >= 100 ? "BULLSEYE!" : "+" + out.reduce((n, r) => n + r.points, 0));
    window.setTimeout(() => sfx(best >= 100 ? "badge" : best >= 60 ? "correct" : "wrong"), 200);
  };
  const next = () => {
    if (!reveal) return;
    if (round === SCALE_ROUNDS - 1) {
      setFinished(true);
      if (!done.current) {
        done.current = true;
        const squares = results.map((r) => r.map((x) => (x.points >= 90 ? "🟩" : x.points >= 60 ? "🟨" : x.points >= 30 ? "🟧" : "🟥")).join("")).join(" ");
        onDone(total, SCALE_ROUNDS * 200, total === SCALE_ROUNDS * 200, "Scale Lab " + total + "/" + SCALE_ROUNDS * 200 + "\n" + squares);
      }
      return;
    }
    const nextInfo = SCALE_CATEGORIES[rounds[round + 1].cat];
    const nlo = Math.log10(nextInfo.min), nhi = Math.log10(nextInfo.max);
    setRound((r) => r + 1);
    setPos([nlo + (nhi - nlo) * 0.28, nlo + (nhi - nlo) * 0.72]);
    setTouched([false, false]); setSel(0); setReveal(false);
  };

  // Decade ticks (every other one for the very wide count ruler).
  const decades = Math.round(hi - lo);
  const every = decades > 11 ? 2 : 1;
  const ticks: number[] = [];
  for (let k = Math.ceil(lo); k <= hi + 1e-9; k++) if ((k - Math.ceil(lo)) % every === 0) ticks.push(k);
  const sum = reveal ? results[round].reduce((n, r) => n + r.points, 0) : 0;
  const value = Math.pow(10, pos[sel]);

  const ui = <div className="sl" role="dialog" aria-label="Scale Lab">
    <header className="sl-hud">
      {onExit && <button className="sl-exit" onClick={onExit} aria-label="Leave Scale Lab">✕</button>}
      <div className="sl-dots">{rounds.map((r, i) => <i key={i} className={i === round ? "cur" : i < round ? "done" : ""} title={SCALE_CATEGORIES[r.cat].title}>{SCALE_CATEGORIES[r.cat].icon}</i>)}</div>
      <div className="sl-score"><small>SCORE</small><b>{total}</b></div>
    </header>
    <div className="sl-title" key={round}><small>ROUND {round + 1} OF {SCALE_ROUNDS}</small><h2>{info.icon} {info.title.toUpperCase()}</h2><p>{info.ask} Place both on the ruler. Every notch is 10× the last.</p></div>

    <div className="sl-bench">
      <div className="sl-ruler" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <div className="sl-track" ref={track}>
          <div className="sl-line" />
          {ticks.map((k) => <i key={k} className="sl-tick" style={{ left: pct(k) + "%" }}><span>{tickLabel(cat, Math.pow(10, k))}</span></i>)}
          {info.landmarks.map((l, i) => <div key={l.name} className={"sl-land row" + (i % 2)} style={{ left: pct(Math.log10(l.value)) + "%" }}><span>{l.name}</span></div>)}
          {reveal && items.map((item, i) => {
            const a = pct(pos[i]), b = pct(Math.log10(item.value)), p = results[round][i].points;
            return <div key={"c" + i} className={"sl-link " + (p >= 90 ? "g" : p >= 50 ? "y" : "r")} style={{ left: Math.min(a, b) + "%", width: Math.abs(a - b) + "%", top: i ? "58%" : "42%" }} />;
          })}
          {reveal && items.map((item, i) => <div key={"p" + i} className="sl-pin" style={{ left: pct(Math.log10(item.value)) + "%", top: i ? "58%" : "42%", borderColor: COLORS[i] }}><b>{item.icon}</b><span>{formatScale(cat, item.value)}</span></div>)}
          {[0, 1].map((i) => <button key={i} className={"sl-token" + (sel === i ? " on" : "") + (touched[i as 0 | 1] ? "" : " fresh")} style={{ left: pct(pos[i]) + "%", top: i ? "58%" : "42%", background: COLORS[i] }} onClick={(e) => { e.stopPropagation(); if (!reveal) setSel(i as 0 | 1); }} aria-label={"Marker " + "AB"[i] + ": " + items[i].name}>{items[i].icon}<em>{"AB"[i]}</em></button>)}
        </div>
      </div>
      {!touched[0] && !touched[1] && !reveal && <p className="sl-hint">drag the markers</p>}
    </div>

    <div className="sl-legend">{items.map((item, i) => <button key={item.id} className={"sl-chip" + (sel === i ? " on" : "")} style={{ ["--c" as string]: COLORS[i] }} onClick={() => !reveal && setSel(i as 0 | 1)}><em>{"AB"[i]}</em><span>{item.name}</span>{!reveal && <b>{touched[i as 0 | 1] ? formatScale(cat, Math.pow(10, pos[i])) : "?"}</b>}</button>)}</div>

    {!reveal ? <div className="sl-panel">
      <div className="sl-readout" style={{ color: COLORS[sel] }}>{touched[sel] ? formatScale(cat, value) : "drag or type"}</div>
      <div className="sl-ctrl">
        <button onClick={() => nudge(-1)} aria-label="Ten times smaller">÷10</button>
        <button onClick={() => nudge(-0.05)} aria-label="A little smaller">−</button>
        <button onClick={() => nudge(0.05)} aria-label="A little bigger">+</button>
        <button onClick={() => nudge(1)} aria-label="Ten times bigger">×10</button>
      </div>
      <form className="sl-type" onSubmit={(e) => { e.preventDefault(); commitTyped(); }}>
        <input value={typed} inputMode="decimal" onChange={(e) => setTyped(e.target.value)} placeholder="or type a number" aria-label="Exact number" />
        <select value={unitIdx} onChange={(e) => setUnitIdx(Number(e.target.value))} aria-label="Unit">{info.units.map((u, i) => <option key={u.label} value={i}>{u.label}</option>)}</select>
        <button type="submit" disabled={!typed.trim()}>SET</button>
      </form>
      <button className="sl-lock" onClick={lock} disabled={!touched[0] || !touched[1]}>{touched[0] && touched[1] ? "LOCK IN" : (touched[0] || touched[1] ? "1 LEFT TO PLACE" : "2 LEFT TO PLACE")}</button>
    </div> : <div className="sl-panel sl-rev">
      {results[round].map((r, i) => <div key={i} className={"sl-res " + (r.points >= 90 ? "g" : r.points >= 50 ? "y" : "r")}>
        <span className="sl-ic">{r.icon}</span>
        <div><b>{r.name}</b><small>You said {formatScale(cat, r.guess)} · actual {formatScale(cat, r.actual)} · {r.points >= 100 ? "bullseye" : scaleFactor(r.guess, r.actual).toFixed(scaleFactor(r.guess, r.actual) < 10 ? 1 : 0) + "× off"}</small><i>{items[i].fact}</i></div>
        <strong>+{r.points}</strong>
      </div>)}
      <button className="sl-lock" onClick={next}>{round === SCALE_ROUNDS - 1 ? "FINISH · " + total + " PTS" : "NEXT ROUND · +" + sum}</button>
    </div>}
  </div>;

  return <div className="game-layout" data-own-sfx="true">
    {!finished ? (typeof document !== "undefined" ? createPortal(ui, document.body) : null) : <div className="dive-finale">
      <div className="dive-medal">📏</div><span className="eyebrow">SCALE LAB COMPLETE</span>
      <h2>{total} / {SCALE_ROUNDS * 200}</h2><p>{total >= 600 ? "You have a real feel for scale." : "Every round sharpens your sense of scale."}</p>
      <div className="dive-log">{results.flat().map((r, i) => <div key={i}><span>{r.icon}</span><b>{r.name}</b><strong>+{r.points}</strong></div>)}</div>
    </div>}
  </div>;
}
