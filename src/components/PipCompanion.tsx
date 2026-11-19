import { useEffect, useRef, useState } from "react";
import Mascot, { type MascotMood } from "./Mascot";

const LINES = { cheer: ["Nice!", "Yes!", "Boom!", "Brilliant!", "Got it!"], sad: ["Oops!", "Not quite…", "Try again!", "Hmm!"] };
/** Pip hangs out in the corner while you play and reacts to rights and wrongs (see `reward` in juice.ts). */
export default function PipCompanion() {
  const [mood, setMood] = useState<MascotMood>("happy");
  const [line, setLine] = useState("");
  const timer = useRef<number | null>(null);
  useEffect(() => {
    const onPip = (e: Event) => {
      const kind = (e as CustomEvent<"cheer" | "sad">).detail;
      const list = LINES[kind];
      setMood(kind === "cheer" ? "cheer" : "sad"); setLine(list[Math.floor(Math.random() * list.length)]);
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => { setMood("happy"); setLine(""); }, 1500);
    };
    window.addEventListener("pip", onPip);
    return () => { window.removeEventListener("pip", onPip); if (timer.current) window.clearTimeout(timer.current); };
  }, []);
  return <div className="pip-companion" aria-hidden="true">{line && <div className={"pip-bubble " + mood}>{line}</div>}<Mascot mood={mood} size={58} /></div>;
}
