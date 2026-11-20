import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { branchSets, type BranchLeaf } from "./dataBranch";
import { BRANCH_GUESSES, branchScore, branchSquare, candidatesUnder, pickBranchTarget, sharedDepth } from "./branchLogic";
import { matchAnswer } from "./arcadeLogic";
import BranchTree from "./BranchTree";
import { reward } from "./juice";
import { sfx } from "./audio";

type Done = (score: number, maxScore: number, perfect: boolean, shareText?: string) => void;

/**
 * Branch Lab: a mystery microbe or drug hides in a family tree. Every guess grows the tree and shows how much of its
 * lineage it shares with the mystery item, so each miss still narrows the search, the way a differential does.
 */
export default function BranchLab({ seed, onDone, onExit }: { seed: number; onDone: Done; onExit?: () => void }) {
  const { set, target } = useMemo(() => pickBranchTarget(seed), [seed]);
  const pool = branchSets[set];
  const [guesses, setGuesses] = useState<BranchLeaf[]>([]);
  const [text, setText] = useState("");
  const [note, setNote] = useState("");
  const [clue, setClue] = useState(false);
  const [over, setOver] = useState<"won" | "lost" | null>(null);
  const [finished, setFinished] = useState(false);
  const [shake, setShake] = useState(0);
  const done = useRef(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  useEffect(() => { const el = bodyRef.current; if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" }); }, [/* eslint-disable-line */ guesses.length, over]);
  const won = guesses.some((g) => g.name === target.name);
  const best = guesses.reduce((n, g) => Math.max(n, sharedDepth(g.path, target.path)), 0);
  const left = BRANCH_GUESSES - guesses.length;
  const noun = set === "microbe" ? "microbe" : "drug";

  const suggestions = useMemo(() => {
    const q = text.trim().toLowerCase();
    if (!q) return [];
    const used = new Set(guesses.map((g) => g.name));
    return pool.filter((l) => !used.has(l.name) && l.name.toLowerCase().includes(q)).sort((a, b) => Number(b.name.toLowerCase().startsWith(q)) - Number(a.name.toLowerCase().startsWith(q))).slice(0, 5);
  }, [text, pool, guesses]);

  const guess = (leaf: BranchLeaf) => {
    if (over) return;
    const next = [...guesses, leaf];
    const shared = sharedDepth(leaf.path, target.path);
    setGuesses(next); setText("");
    if (leaf.name === target.name) {
      setOver("won"); reward(true, null, "FOUND IT"); sfx("badge");
      setNote("");
      return;
    }
    const groups = target.path.slice(0, shared);
    const open = candidatesUnder(set, groups);
    setNote(shared === 0 ? "Nothing shared at the very top. Try another branch." : "Shared lineage: " + groups.join(" › ") + " · " + open + " possible " + (open === 1 ? "answer" : "answers") + " in that group.");
    if (shared >= 2) { reward(true, null, "+"); sfx("correct"); } else { reward(false); sfx("wrong"); }
    if (next.length >= BRANCH_GUESSES) setOver("lost");
  };
  const submit = () => {
    if (over) return;
    const q = text.trim();
    if (!q) return;
    const used = new Set(guesses.map((g) => g.name));
    const exact = pool.find((l) => l.name.toLowerCase() === q.toLowerCase());
    const found = exact ?? matchAnswer(q, pool.filter((l) => !used.has(l.name)).map((l) => ({ answer: l.name, leaf: l })))?.match.leaf ?? (suggestions.length === 1 ? suggestions[0] : undefined);
    if (!found) { setShake((n) => n + 1); setNote("Pick one of the listed " + noun + "s."); sfx("wrong"); return; }
    if (used.has(found.name)) { setShake((n) => n + 1); setNote("You already tried that one."); return; }
    guess(found);
  };
  const finish = () => {
    setFinished(true);
    if (done.current) return;
    done.current = true;
    const points = branchScore(won, guesses.length, clue, best);
    const squares = guesses.map((g) => branchSquare(sharedDepth(g.path, target.path), target.path.length, g.name === target.name)).join("");
    onDone(points, 100, won && guesses.length === 1, "Branch Lab · mystery " + noun + (won ? " · " + guesses.length + "/" + BRANCH_GUESSES : " · missed") + "\n" + squares);
  };

  const ui = <div className="bl" role="dialog" aria-label="Branch Lab">
    <header className="bl-hud">
      {onExit && <button className="bl-exit" onClick={onExit} aria-label="Leave Branch Lab">✕</button>}
      <div className="bl-title"><small>MYSTERY {noun.toUpperCase()}</small><b>BRANCH LAB</b></div>
      <div className="bl-pips" aria-label={left + " guesses left"}>{Array.from({ length: BRANCH_GUESSES }, (_, i) => <i key={i} className={i < guesses.length ? (guesses[i].name === target.name ? "hit" : "used") : ""} />)}</div>
    </header>
    <div className="bl-body" ref={bodyRef}>
      {guesses.length === 0 && <div className="bl-intro"><span>🧫</span><h2>Name the mystery {noun}</h2><p>Every guess grows a family tree. <b className="g">Green</b> branches are real ancestors of the answer, so each miss narrows the search.</p></div>}
      <div className="bl-treewrap"><BranchTree set={set} guesses={guesses} target={target} /></div>
      {note && <p className="bl-note" aria-live="polite">{note}</p>}
      {clue && !over && <p className="bl-clue">🔎 {target.clue}</p>}
      {!clue && !over && guesses.length >= 2 && <button className="bl-clue-btn" onClick={() => setClue(true)}>🔎 Reveal a clue (−10 points)</button>}
    </div>

    {!over ? <footer className="bl-dock">
      {suggestions.length > 0 && <div className="bl-sugg">{suggestions.map((s) => <button key={s.name} onClick={() => guess(s)}>{s.name}</button>)}</div>}
      <form key={shake} className={"bl-form" + (shake ? " shake" : "")} onSubmit={(e) => { e.preventDefault(); submit(); }}>
        <input value={text} onChange={(e) => setText(e.target.value)} autoComplete="off" autoCapitalize="off" spellCheck={false} placeholder={"Type a " + noun + "…"} aria-label={"Guess the mystery " + noun} />
        <button type="submit" disabled={!text.trim()}>GUESS</button>
      </form>
      <p className="bl-left">{left} guess{left === 1 ? "" : "es"} left</p>
    </footer> : <section className="bl-over">
      <small>{over === "won" ? "FOUND IN " + guesses.length + (guesses.length === 1 ? " GUESS" : " GUESSES") : "THE ANSWER WAS"}</small>
      <h2>{target.name}</h2>
      <p className="path">{target.path.slice(0, -1).join(" › ")}</p>
      <p>{target.clue}</p>
      <button onClick={finish}>{over === "won" ? "COLLECT · " + branchScore(true, guesses.length, clue, best) + " PTS" : "FINISH · " + branchScore(false, guesses.length, clue, best) + " PTS"}</button>
    </section>}
  </div>;

  return <div className="game-layout" data-own-sfx="true">
    {!finished ? (typeof document !== "undefined" ? createPortal(ui, document.body) : null) : <div className="dive-finale">
      <div className="dive-medal">🌳</div><span className="eyebrow">BRANCH LAB COMPLETE</span>
      <h2>{target.name}</h2><p>{won ? "Found in " + guesses.length + " of " + BRANCH_GUESSES + " guesses." : "Not this time. The answer sits under " + target.path.slice(0, -1).join(" › ") + "."}</p>
    </div>}
  </div>;
}
