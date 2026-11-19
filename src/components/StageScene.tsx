import type { ReactNode } from "react";
import type { GameId } from "../lib";

type Scene = "library" | "clinic" | "lab" | "anatomy" | "party";
const SCENE_OF: Record<GameId, Scene> = {
  medle: "library", connections: "library", splice: "library", ladder: "library", hive: "library", lettergrid: "library", crossword: "library", trail: "library",
  diagnosis: "clinic", triage: "clinic", casefile: "clinic", pairs: "clinic",
  labline: "lab", microbe: "lab", higher: "lab", riddle: "lab", glyph: "lab",
  bodymap: "anatomy", dive: "anatomy",
  trivia: "party", mime: "party"
};
const W = "rgba(255,255,255,.9)";
const SCENES: Record<Scene, ReactNode> = {
  library: <g fill="none" stroke={W} strokeWidth={3} strokeLinejoin="round">
    {[0, 1].map((r) => <g key={r}><path d={`M10 ${120 + r * 110}H390`} />{Array.from({ length: 16 }, (_, i) => <rect key={i} x={14 + i * 23.5} y={(70 + r * 110) - (i * 7) % 24} width={17 + (i % 3) * 2} height={50 + (i * 7) % 24} rx={2} />)}</g>)}
    <circle cx={350} cy={30} r={16} /><path d="M340 30h20M350 20v20" />
  </g>,
  clinic: <g fill="none" stroke={W} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round">
    <rect x={24} y={20} width={90} height={80} rx={6} /><path d="M69 20v80M24 60h90" />
    <path d="M150 12H390" /><path d="M300 12c-6 40 6 70 0 100M330 12c-8 40 8 70 0 100M360 12c-6 40 6 70 0 100" />
    <path d="M10 240h60l10-30 14 60 14-80 14 50h40" /><path d="M200 250v-80M170 250h60M200 170h28v18" /><rect x={226} y={188} width={16} height={26} rx={5} />
    <rect x={290} y={210} width={100} height={36} rx={8} /><path d="M296 246v18M384 246v18" />
  </g>,
  lab: <g fill="none" stroke={W} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round">
    <path d="M10 262H390M10 110H390" />
    <path d="M40 110V70h26v40M54 70V54" /><path d="M96 110l12-36h22l12 36" /><path d="M100 90h40" /><path d="M180 110V80h8M180 80h40M220 80v30" /><circle cx={200} cy={96} r={6} />
    <path d="M270 110V60M270 60h26M296 60v14" /><circle cx={296} cy={86} r={11} />
    <path d="M300 262v-70l20-14 20 14v70M310 192h20" /><circle cx={320} cy={226} r={14} />
    <path d="M60 262V232h28v30M120 262V220h18v42M156 262V240h24v22" />
  </g>,
  anatomy: <g fill="none" stroke={W} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round">
    <circle cx={290} cy={50} r={26} /><path d="M268 80q-40 8-44 60l8 90h116l8-90q-4-52-44-60" /><path d="M278 150q12-14 24 0q-6 18-12 24q-6-6-12-24" />
    <path d="M60 60H228M60 150H252M60 220H230" strokeDasharray="4 8" /><circle cx={60} cy={60} r={5} /><circle cx={60} cy={150} r={5} /><circle cx={60} cy={220} r={5} />
    <path d="M30 276h340M70 40v10M70 130v10M70 200v10" />
  </g>,
  party: <g fill="none" stroke={W} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round">
    <path d="M0 22Q100 70 200 22T400 22" />{Array.from({ length: 10 }, (_, i) => { const x = 20 + i * 40, y = 22 + Math.sin(i * 0.85) * 20 + 18; return <path key={i} d={`M${x - 10} ${y - 14}L${x + 10} ${y - 14}L${x} ${y + 8}z`} />; })}
    {[[60, 170], [330, 140], [120, 250], [280, 230], [200, 120], [360, 260]].map(([x, y], i) => i % 2 ? <path key={i} d={`M${x} ${y - 8}l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z`} /> : <circle key={i} cx={x} cy={y} r={7} />)}
  </g>
};
/** Faint line-art setting behind each game board (library, clinic, lab, anatomy chart, party). */
export default function StageScene({ game }: { game: GameId }) {
  return <svg className="stage-scene" viewBox="0 0 400 290" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">{SCENES[SCENE_OF[game]]}</svg>;
}
