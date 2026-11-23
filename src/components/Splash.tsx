import Mascot from "./Mascot";

const FLOATERS = ["💊", "🧬", "🩺", "🧠", "🦠", "🫀", "🔬", "🦴", "🩸", "🧪", "🫁", "🦷"];

/** Title screen shown once per session. Tapping it also unlocks browser audio so music can start. */
export default function Splash({ onStart }: { onStart: () => void }) {
  return <div className="splash" role="dialog" aria-label="Roundsy title screen" onClick={onStart} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onStart(); }} tabIndex={0}>
    <div className="splash-rays" aria-hidden="true" />
    <div className="splash-floaters" aria-hidden="true">{FLOATERS.map((f, i) => <span key={i} style={{ left: (6 + (i * 8.3) % 88) + "%", animationDelay: (-i * 1.3) + "s", fontSize: 22 + (i % 4) * 8 }}>{f}</span>)}</div>
    <div className="splash-center">
      <div className="splash-logo" aria-label="roundsy">{[..."roundsy"].map((ch, i) => <b key={i} style={{ animationDelay: i * 0.07 + "s" }}>{ch}</b>)}<i>.</i></div>
      <div className="splash-tag">THE MEDICAL MINI-GAME ARCADE</div>
      <div className="splash-mascot"><Mascot mood="wave" size={150} /></div>
      <button className="splash-start" onClick={(e) => { e.stopPropagation(); onStart(); }}>TAP TO START</button>
      <div className="splash-hint">🔊 sound &amp; music on · mute any time in the top bar</div>
    </div>
  </div>;
}
