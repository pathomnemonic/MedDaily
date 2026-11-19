import { useEffect, useRef, useState } from "react";
import Mascot, { type MascotMood } from "./Mascot";

const LINES = { cheer: ["Nice!", "Yes!", "Boom!", "Brilliant!", "Got it!"], sad: ["Oops!", "Not quite…", "Try again!", "Hmm!"] };
/** Pip hangs out in the corner while you play and reacts to rights and wrongs (see `reward` in juice.ts). */
export default function PipCompanion() {
  const [mood, setMood] = useState<MascotMood>("happy");
  const [line, setLine] = useState("");
  const [combo, setCombo] = useState(0);
  const [bump, setBump] = useState(0);
  const timer = useRef<number | null>(null);
  useEffect(() => {
    const onPip = (e: Event) => {
      const { kind, combo: c } = (e as CustomEvent<{ kind: "cheer" | "sad"; combo: number }>).detail;
      setCombo(c); setBump((n) => n + 1);
      const list = LINES[kind];
      setMood(kind === "cheer" ? "cheer" : "sad"); setLine(list[Math.floor(Math.random() * list.length)]);
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => { setMood("happy"); setLine(""); }, 1500);
    };
    const onReset = () => setCombo(0);
    window.addEventListener("pip", onPip); window.addEventListener("pip-reset", onReset);
    return () => { window.removeEventListener("pip", onPip); window.removeEventListener("pip-reset", onReset); if (timer.current) window.clearTimeout(timer.current); };
  }, []);
  return <div className="pip-companion" aria-hidden="true">{combo >= 2 && <div key={bump} className="combo-badge">×{combo}<small>COMBO</small></div>}{line && <div className={"pip-bubble " + mood}>{line}</div>}<Mascot mood={mood} size={58} /></div>;
}
