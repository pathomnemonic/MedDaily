import type { ReactNode } from "react";
import type { GameId } from "../lib";

/**
 * Original cover art for each game: chunky outlined shapes in one shared cartoon style
 * (thick ink stroke, flat bright fills, a hard highlight) so every card reads as its own world
 * while the arcade stays cohesive. Pure SVG, no external assets.
 */
const INK = "#2a1658";
const S = { stroke: INK, strokeWidth: 3, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

const Tile = ({ x, y, w = 26, fill, letter, rot = 0 }: { x: number; y: number; w?: number; fill: string; letter?: string; rot?: number }) => (
  <g transform={`rotate(${rot} ${x + w / 2} ${y + w / 2})`}>
    <rect x={x} y={y + 3} width={w} height={w} rx={6} fill={INK} />
    <rect x={x} y={y} width={w} height={w} rx={6} fill={fill} {...S} />
    {letter && <text x={x + w / 2} y={y + w * 0.72} textAnchor="middle" fontFamily="Lilita One, Fredoka, sans-serif" fontSize={w * 0.62} fill="#fff" stroke={INK} strokeWidth={2} paintOrder="stroke">{letter}</text>}
  </g>
);

const Hex = ({ cx, cy, r = 17, fill, children }: { cx: number; cy: number; r?: number; fill: string; children?: ReactNode }) => {
  const pts = Array.from({ length: 6 }, (_, i) => `${cx + r * Math.cos(Math.PI / 3 * i + Math.PI / 6)},${cy + r * Math.sin(Math.PI / 3 * i + Math.PI / 6)}`).join(" ");
  return <g><polygon points={pts} fill={fill} {...S} />{children}</g>;
};

const ART: Record<GameId, () => ReactNode> = {
  medle: () => <g>
    {["M", "E", "D", "L", "E"].map((l, i) => <Tile key={i} x={13 + i * 36} y={14} fill={["#3ec28f", "#ffc83d", "#7b76a6", "#3ec28f", "#7b76a6"][i]} letter={l} w={31} rot={[-4, 3, -2, 4, -3][i]} />)}
    {[0, 1, 2, 3, 4].map((i) => <Tile key={i} x={13 + i * 36} y={62} fill={i < 3 ? "#3ec28f" : "#fff4"} w={31} letter={i < 3 ? "MED"[i] : undefined} rot={[2, -3, 3, 0, 0][i]} />)}
  </g>,
  connections: () => <g>
    {Array.from({ length: 16 }, (_, i) => {
      const r = Math.floor(i / 4), c = i % 4;
      return <Tile key={i} x={38 + c * 33} y={5 + r * 26} w={26} fill={["#ffc83d", "#4fc3f7", "#3ec28f", "#c28bff"][r]} rot={((i * 7) % 5) - 2} />;
    })}
  </g>,
  diagnosis: () => <g>
    <rect x={56} y={7} width={88} height={98} rx={10} fill={INK} transform="translate(0 4)" />
    <rect x={56} y={7} width={88} height={98} rx={10} fill="#fff7ea" {...S} />
    <rect x={82} y={2} width={36} height={14} rx={5} fill="#ff6aa2" {...S} />
    <path d="M66 58h14l6-18 10 36 8-26 6 8h20" fill="none" stroke="#ff4f86" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M100 82v14M93 89h14" stroke="#3ec28f" strokeWidth={6} strokeLinecap="round" />
    <text x={30} y={68} fontSize={34} fontFamily="Lilita One, sans-serif" fill="#ffd54a" stroke={INK} strokeWidth={2.5} paintOrder="stroke" transform="rotate(-12 30 68)">?</text>
    <text x={172} y={50} fontSize={26} fontFamily="Lilita One, sans-serif" fill="#7dffd0" stroke={INK} strokeWidth={2.5} paintOrder="stroke" transform="rotate(12 172 50)">Dx</text>
  </g>,
  microbe: () => <g>
    <rect x={44} y={6} width={112} height={98} rx={12} fill="#f4fbff" {...S} />
    {Array.from({ length: 5 }, (_, r) => Array.from({ length: 6 }, (_, c) => <text key={r + "-" + c} x={58 + c * 17.5} y={30 + r * 19} textAnchor="middle" fontFamily="Lilita One, sans-serif" fontSize={14} fill="#5a4a96">{"MEDICSLABGENEXRAYBONEHEARTVIRUS".charAt((r * 6 + c) % 32)}</text>))}
    <rect x={50} y={52} width={104} height={18} rx={9} fill="#ff6aa2" opacity={0.55} />
  </g>,
  labline: () => <g>
    <path d="M30 70h140" stroke={INK} strokeWidth={5} strokeLinecap="round" />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => <path key={i} d={`M${34 + i * 22} 70v${i % 3 === 0 ? 14 : 8}`} stroke={INK} strokeWidth={3} strokeLinecap="round" />)}
    <path d="M100 18l22 28H78z" fill="#ffd54a" {...S} />
    <rect x={92} y={44} width={16} height={20} fill="#ffd54a" {...S} />
    <path d="M72 26h26v22l14 22H58l14-22z" fill="#7cf0cf" {...S} transform="translate(-48 -6) scale(.9)" />
    <circle cx={30} cy={42} r={3} fill="#fff" opacity={0.7} />
    <text x={150} y={42} fontFamily="Lilita One, sans-serif" fontSize={26} fill="#fff" stroke={INK} strokeWidth={2.5} paintOrder="stroke" transform="rotate(8 150 42)">7.4</text>
  </g>,
  pairs: () => <g>
    <g transform="rotate(-9 64 56)"><rect x={30} y={14} width={64} height={84} rx={9} fill={INK} transform="translate(0 4)" /><rect x={30} y={14} width={64} height={84} rx={9} fill="#fff7ea" {...S} />
      <path d="M62 70c-14-9-18-20-10-26 5-3 10-1 10 5 0-6 5-8 10-5 8 6 4 17-10 26z" fill="#ff5d8f" {...S} transform="translate(0 -2)" /></g>
    <g transform="rotate(8 138 56)"><rect x={106} y={14} width={64} height={84} rx={9} fill={INK} transform="translate(0 4)" /><rect x={106} y={14} width={64} height={84} rx={9} fill="#fff7ea" {...S} />
      <rect x={120} y={42} width={36} height={18} rx={9} fill="#4fc3f7" {...S} transform="rotate(-30 138 51)" /><path d="M138 51l10-15" stroke={INK} strokeWidth={3} /></g>
    <text x={100} y={64} textAnchor="middle" fontFamily="Lilita One, sans-serif" fontSize={26} fill="#ffd54a" stroke={INK} strokeWidth={2.5} paintOrder="stroke">=</text>
  </g>,
  triage: () => <g>
    {[["#ff5d5d", 150, "1"], ["#ffc83d", 120, "2"], ["#3ec28f", 90, "3"]].map(([fill, w, n], i) => <g key={i}>
      <rect x={24} y={12 + i * 32 + 3} width={Number(w)} height={26} rx={9} fill={INK} />
      <rect x={24} y={12 + i * 32} width={Number(w)} height={26} rx={9} fill={String(fill)} {...S} />
      <text x={40} y={31 + i * 32} fontFamily="Lilita One, sans-serif" fontSize={19} fill="#fff" stroke={INK} strokeWidth={2.5} paintOrder="stroke">{n}</text></g>)}
    <path d="M178 22v66M168 78l10 12 10-12" fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
  </g>,
  splice: () => <g>
    {["S", "P", "L", "I", "C", "E"].map((l, i) => <Tile key={i} x={10 + i * 31} y={[40, 18, 52, 22, 46, 20][i]} w={28} fill={["#3ec28f", "#c28bff", "#ffc83d", "#4fc3f7", "#ff6aa2", "#ff9251"][i]} letter={l} rot={[-14, 10, -6, 14, -10, 8][i]} />)}
    <path d="M20 96c30-14 30 8 60-6s30 8 60-6 30 6 40-4" fill="none" stroke="#fff" strokeWidth={3} strokeDasharray="2 7" strokeLinecap="round" />
  </g>,
  glyph: () => <g>
    {Array.from({ length: 25 }, (_, i) => {
      const r = Math.floor(i / 5), c = i % 5;
      const on = [1, 3, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 22].includes(i);
      return <rect key={i} x={66 + c * 20} y={10 + r * 19} width={18} height={17} rx={3} fill={on ? "#ff5d8f" : "#fff8"} stroke={INK} strokeWidth={2} />;
    })}
    {[2, 1, 3, 2, 1].map((n, i) => <text key={i} x={48} y={24 + i * 19} textAnchor="middle" fontFamily="Fredoka, sans-serif" fontWeight={700} fontSize={12} fill="#fff" stroke={INK} strokeWidth={2} paintOrder="stroke">{n}</text>)}
  </g>,
  higher: () => <g>
    <path d="M100 22v70M72 94h56" stroke={INK} strokeWidth={6} strokeLinecap="round" />
    <path d="M36 36l128-8" stroke={INK} strokeWidth={6} strokeLinecap="round" />
    <path d="M36 36L16 70h40zM164 28l-20 34h40z" fill="none" stroke={INK} strokeWidth={3} />
    <path d="M12 70h48c-2 16-10 20-24 20s-22-4-24-20z" fill="#ffc83d" {...S} />
    <path d="M140 62h48c-2 16-10 20-24 20s-22-4-24-20z" fill="#4fc3f7" {...S} />
    <circle cx={36} cy={56} r={10} fill="#ff9251" {...S} /><rect x={156} y={44} width={16} height={9} rx={4.5} fill="#ff6aa2" {...S} transform="rotate(-30 164 48)" />
    <circle cx={100} cy={20} r={7} fill="#ffd54a" {...S} />
  </g>,
  ladder: () => <g>
    <path d="M60 6v98M140 6v98" stroke={INK} strokeWidth={8} strokeLinecap="round" />
    <path d="M60 6v98M140 6v98" stroke="#ffc07a" strokeWidth={3.5} strokeLinecap="round" />
    {["COLD", "CORD", "CARD", "WARD", "WARM"].map((w, i) => <g key={w}><rect x={66} y={8 + i * 20} width={68} height={17} rx={6} fill={["#ff6aa2", "#ffc83d", "#3ec28f", "#4fc3f7", "#c28bff"][i]} {...S} strokeWidth={2.5} />
      <text x={100} y={21 + i * 20} textAnchor="middle" fontFamily="Lilita One, sans-serif" fontSize={13} letterSpacing={3} fill="#fff" stroke={INK} strokeWidth={2} paintOrder="stroke">{w}</text></g>)}
  </g>,
  hive: () => <g>
    {[[100, 55, "#ffd54a", "A"], [70, 38, "#fff4c9", "R"], [130, 38, "#fff4c9", "T"], [70, 72, "#fff4c9", "N"], [130, 72, "#fff4c9", "E"], [100, 21, "#fff4c9", "I"], [100, 89, "#fff4c9", "O"]].map(([x, y, f, l], i) =>
      <Hex key={i} cx={Number(x)} cy={Number(y)} r={19} fill={String(f)}><text x={Number(x)} y={Number(y) + 6} textAnchor="middle" fontFamily="Lilita One, sans-serif" fontSize={19} fill={INK}>{String(l)}</text></Hex>)}
  </g>,
  casefile: () => <g>
    <rect x={28} y={12} width={110} height={86} rx={10} fill="#fff7ea" {...S} />
    {[0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={r + "" + c} x={40 + c * 30} y={22 + r * 24} width={26} height={20} rx={4} fill={(r + c) % 3 === 0 ? "#7cf0cf" : "#e9e0ff"} stroke={INK} strokeWidth={2} />))}
    <path d="M47 32l6 6 10-12" fill="none" stroke="#1f9a6e" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M82 56l12 12m0-12L82 68" stroke="#ff4f86" strokeWidth={4} strokeLinecap="round" />
    <circle cx={148} cy={64} r={24} fill="#bfefff" fillOpacity={0.55} {...S} strokeWidth={5} />
    <path d="M165 82l22 22" stroke={INK} strokeWidth={9} strokeLinecap="round" /><path d="M165 82l22 22" stroke="#ffb347" strokeWidth={4} strokeLinecap="round" />
  </g>,
  dive: () => <g>
    <path d="M0 16q25-12 50 0t50 0 50 0 50 0V0H0z" fill="#fff" opacity={0.85} />
    {[[40, 50, 6], [58, 74, 4], [150, 44, 7], [168, 78, 5], [128, 94, 3]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#d7f6ff" fillOpacity={0.65} stroke="#fff" strokeWidth={2} />)}
    <ellipse cx={100} cy={64} rx={34} ry={21} fill="#ffb347" {...S} />
    <path d="M132 64l24-16v32z" fill="#ff8f3d" {...S} /><circle cx={84} cy={58} r={5} fill="#fff" {...S} strokeWidth={2.5} /><circle cx={85} cy={58} r={2} fill={INK} />
    <path d="M100 46q8 10 0 36" fill="none" stroke="#ff8f3d" strokeWidth={3} />
    <text x={178} y={106} fontFamily="Lilita One, sans-serif" fontSize={13} fill="#fff" textAnchor="end">1000 m</text>
  </g>,
  trivia: () => <g>
    {["#4fc3f7", "#8d70ff", "#ff628d", "#ffb547", "#35cf9c", "#ff7d45"].map((fill, i) => {
      const a0 = (i * 60 - 90) * Math.PI / 180, a1 = ((i + 1) * 60 - 90) * Math.PI / 180, R = 46, cx = 100, cy = 58;
      return <path key={i} d={`M${cx} ${cy}L${cx + R * Math.cos(a0)} ${cy + R * Math.sin(a0)}A${R} ${R} 0 0 1 ${cx + R * Math.cos(a1)} ${cy + R * Math.sin(a1)}z`} fill={fill} {...S} />;
    })}
    <circle cx={100} cy={58} r={11} fill="#fff7ea" {...S} /><text x={100} y={63} textAnchor="middle" fontFamily="Lilita One, sans-serif" fontSize={13} fill={INK}>GO</text>
    <path d="M92 4l16 0-8 14z" fill="#ffd54a" {...S} />
    <text x={32} y={100} fontSize={22} fontFamily="Lilita One, sans-serif" fill="#ffd54a" stroke={INK} strokeWidth={2.5} paintOrder="stroke" transform="rotate(-12 32 100)">?</text>
    <text x={172} y={38} fontSize={22} fontFamily="Lilita One, sans-serif" fill="#7dffd0" stroke={INK} strokeWidth={2.5} paintOrder="stroke" transform="rotate(12 172 38)">!</text>
  </g>,
  riddle: () => <g>
    <circle cx={100} cy={52} r={38} fill="#fff7ea" {...S} />
    <path d="M64 40q36-34 72 0" fill="#2a1658" {...S} />
    <circle cx={86} cy={52} r={6} fill="#fff" {...S} strokeWidth={2.5} /><circle cx={114} cy={52} r={6} fill="#fff" {...S} strokeWidth={2.5} />
    <circle cx={87} cy={53} r={2.5} fill={INK} /><circle cx={115} cy={53} r={2.5} fill={INK} />
    <path d="M90 70q10 6 20 0" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
    <path d="M28 84a30 30 0 0 1 50-14" fill="none" stroke="#fff" strokeWidth={0} />
    <text x={160} y={44} fontSize={40} fontFamily="Lilita One, sans-serif" fill="#ffd54a" stroke={INK} strokeWidth={3} paintOrder="stroke" transform="rotate(14 160 44)">?</text>
    <text x={36} y={70} fontSize={28} fontFamily="Lilita One, sans-serif" fill="#7dffd0" stroke={INK} strokeWidth={3} paintOrder="stroke" transform="rotate(-14 36 70)">?</text>
    <rect x={52} y={86} width={96} height={18} rx={9} fill="#ff6aa2" {...S} /><text x={100} y={100} textAnchor="middle" fontFamily="Lilita One, sans-serif" fontSize={13} fill="#fff" stroke={INK} strokeWidth={2} paintOrder="stroke">WHO AM I?</text>
  </g>,
  bodymap: () => <g>
    <circle cx={100} cy={20} r={14} fill="#ffd9b8" {...S} />
    <path d="M70 38q30-8 60 0 8 4 8 20l-2 38q-2 14-36 14t-36-14l-2-38q0-16 8-20z" fill="#ffd9b8" {...S} />
    <path d="M100 54c-10-8-16-2-14 6 2 8 14 16 14 16s12-8 14-16c2-8-4-14-14-6z" fill="#ff4f6e" {...S} />
    <ellipse cx={82} cy={58} rx={9} ry={17} fill="#8fd7ff" {...S} strokeWidth={2.5} /><ellipse cx={118} cy={58} rx={9} ry={17} fill="#8fd7ff" {...S} strokeWidth={2.5} />
    <path d="M70 80q16-8 34-2 6 10-4 14-20 3-30-4z" fill="#b5602f" {...S} strokeWidth={2.5} />
    <circle cx={150} cy={30} r={13} fill="none" stroke="#fff" strokeWidth={4} /><path d="M160 40l14 14" stroke="#fff" strokeWidth={5} strokeLinecap="round" />
    <path d="M142 30h16M150 22v16" stroke="#ffd54a" strokeWidth={0} />
  </g>,
  crossword: () => <g>
    {Array.from({ length: 7 }, (_, r) => Array.from({ length: 9 }, (_, c) => {
      const on = (r === 3) || (c === 2 && r < 6) || (c === 6 && r > 0) || (r === 0 && c >= 4 && c <= 8) || (r === 5 && c >= 0 && c <= 4);
      return on ? <g key={r + "-" + c}><rect x={22 + c * 17} y={4 + r * 15} width={16} height={14} rx={2.5} fill={c === 2 && r === 3 ? "#ffd54a" : "#fff7ea"} stroke={INK} strokeWidth={2} />{(r === 3 && c % 3 === 0) && <text x={30 + c * 17} y={15 + r * 15} textAnchor="middle" fontFamily="Lilita One, sans-serif" fontSize={10} fill={INK}>{"MEDICAL"[c % 7]}</text>}</g> : null;
    }))}
    <path d="M168 92l18-18 6 6-18 18-9 3z" fill="#ff6aa2" {...S} strokeWidth={2.5} />
  </g>,
  mime: () => <g>
    <ellipse cx={100} cy={96} rx={52} ry={7} fill="#2a165855" />
    <path d="M62 30c0-18 20-24 38-24s38 6 38 24c0 26-14 52-38 52S62 56 62 30z" fill="#fff7ea" {...S} />
    <path d="M70 12q30-14 60 0l-8 10q-22-8-44 0z" fill="#2a1658" />
    <circle cx={84} cy={38} r={5} fill={INK} /><circle cx={116} cy={38} r={5} fill={INK} />
    <path d="M82 58q18 14 36 0" fill="none" stroke="#ff4f86" strokeWidth={4} strokeLinecap="round" />
    <path d="M54 84l-24-18m116 18l24-18" stroke="#fff" strokeWidth={9} strokeLinecap="round" />
    <circle cx={26} cy={62} r={8} fill="#fff" {...S} /><circle cx={174} cy={62} r={8} fill="#fff" {...S} />
    <text x={176} y={22} fontSize={24} fontFamily="Lilita One, sans-serif" fill="#ffd54a" stroke={INK} strokeWidth={2.5} paintOrder="stroke" transform="rotate(12 176 22)">?!</text>
  </g>,
  lettergrid: () => <g>
    {Array.from({ length: 16 }, (_, i) => {
      const r = Math.floor(i / 4), c = i % 4, on = [4, 5, 10, 11].includes(i) || i === 1;
      return <Tile key={i} x={51 + c * 25} y={8 + r * 25} w={22} fill={on ? "#ffc83d" : "#fff6dc"} letter={"RLABTESDONIMKCUH"[i]} />;
    })}
    <path d="M89 28L64 53l25 0 25 25" fill="none" stroke="#ff4f86" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" opacity={0.9} />
  </g>
};

export default function GameArt({ game }: { game: GameId }) {
  return <svg className="game-art-svg" viewBox="0 0 200 110" role="img" aria-hidden="true" focusable="false">{ART[game]()}</svg>;
}

export function DxArt() {
  return <svg className="game-art-svg" viewBox="0 0 200 110" aria-hidden="true" focusable="false">
    <path d="M10 92h180" stroke={INK} strokeWidth={4} strokeLinecap="round" strokeDasharray="2 10" />
    <text x={100} y={74} textAnchor="middle" fontFamily="Lilita One, Fredoka, sans-serif" fontSize={68} fill="#ffd54a" stroke={INK} strokeWidth={4} paintOrder="stroke" transform="rotate(-5 100 60)">DX</text>
    <path d="M150 28l18-14m0 0h-14m14 0v14" fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
    <path d="M20 40h20l6-14 8 28 6-14h12" fill="none" stroke="#ff4f86" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}
