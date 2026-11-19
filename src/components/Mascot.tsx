import type { CSSProperties } from "react";

export type MascotMood = "happy" | "cheer" | "think" | "sad" | "wave";
const INK = "#2a1658";

/**
 * Pip, the MedDaily mascot: a friendly two-tone capsule with a blink, a bob, and a handful of moods.
 * Original artwork, pure SVG.
 */
export default function Mascot({ mood = "happy", size = 120, className = "" }: { mood?: MascotMood; size?: number; className?: string }) {
  const mouth = {
    happy: <path d="M47 82q13 13 26 0" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />,
    wave: <path d="M47 82q13 13 26 0" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />,
    cheer: <path d="M45 78q15 24 30 0z" fill="#7a1a3a" stroke={INK} strokeWidth={4} strokeLinejoin="round" />,
    think: <path d="M52 85h16" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />,
    sad: <path d="M48 88q12-11 24 0" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />
  }[mood];
  const armsUp = mood === "cheer";
  const wave = mood === "wave";
  return <svg className={"mascot mascot-" + mood + " " + className} viewBox="0 0 120 150" width={size} height={size * 1.25} role="img" aria-label="Pip the MedDaily mascot" style={{ "--s": size } as CSSProperties}>
    <defs><clipPath id="pipClip"><rect x="30" y="18" width="60" height="112" rx="30" /></clipPath></defs>
    <ellipse cx="60" cy="140" rx="30" ry="6" fill="#00000040" />
    {/* arms */}
    <path d={armsUp ? "M32 78Q14 60 12 44" : "M32 84Q16 90 14 104"} fill="none" stroke={INK} strokeWidth={12} strokeLinecap="round" />
    <path d={armsUp ? "M32 78Q14 60 12 44" : "M32 84Q16 90 14 104"} fill="none" stroke="#fff7ea" strokeWidth={6} strokeLinecap="round" />
    <g className={wave ? "mascot-wave" : ""}>
      <path d={armsUp || wave ? "M88 78Q106 60 108 44" : "M88 84Q104 90 106 104"} fill="none" stroke={INK} strokeWidth={12} strokeLinecap="round" />
      <path d={armsUp || wave ? "M88 78Q106 60 108 44" : "M88 84Q104 90 106 104"} fill="none" stroke="#fff7ea" strokeWidth={6} strokeLinecap="round" />
    </g>
    {/* body */}
    <rect x="30" y="18" width="60" height="112" rx="30" fill="#fff7ea" />
    <g clipPath="url(#pipClip)"><rect x="30" y="18" width="60" height="58" fill="#ff6aa2" /><rect x="30" y="72" width="60" height="5" fill={INK} opacity=".25" /></g>
    <rect x="30" y="18" width="60" height="112" rx="30" fill="none" stroke={INK} strokeWidth={4.5} />
    <ellipse cx="44" cy="36" rx="7" ry="12" fill="#fff" opacity=".55" transform="rotate(14 44 36)" />
    {/* chest plus */}
    <path d="M57 104h6v7h7v6h-7v7h-6v-7h-7v-6h7z" fill="#ff6aa2" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
    {/* face */}
    <g className="mascot-eyes">
      <circle cx="48" cy="62" r="8" fill="#fff" stroke={INK} strokeWidth={3} /><circle cx="72" cy="62" r="8" fill="#fff" stroke={INK} strokeWidth={3} />
      <circle cx={mood === "think" ? 51 : 49} cy={mood === "think" ? 59 : 63} r="3.6" fill={INK} /><circle cx={mood === "think" ? 75 : 73} cy={mood === "think" ? 59 : 63} r="3.6" fill={INK} />
    </g>
    {mood === "think" && <path d="M64 48q8-5 16 0" fill="none" stroke={INK} strokeWidth={3.5} strokeLinecap="round" />}
    {mood === "sad" && <path d="M40 52l14 4M80 52l-14 4" stroke={INK} strokeWidth={3.5} strokeLinecap="round" />}
    {mouth}
    <circle cx="38" cy="76" r="5" fill="#ff8fb5" opacity=".7" /><circle cx="82" cy="76" r="5" fill="#ff8fb5" opacity=".7" />
  </svg>;
}
