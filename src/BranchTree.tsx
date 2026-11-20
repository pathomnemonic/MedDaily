import type { BranchLeaf, BranchSet } from "./dataBranch";
import { candidatesUnder, sharedDepth } from "./branchLogic";

/**
 * The Branch Lab tree: a vertical trunk of the mystery item's lineage (revealed as far as your guesses have proved it)
 * ending in a "???" box, with every wrong guess hanging off the trunk at the point where it diverges.
 */
const W = 360, TRUNK_X = 180, TRUNK_W = 150, TWIG_W = 140, TRUNK_H = 32, TWIG_H = 46;

export default function BranchTree({ set, guesses, target }: { set: BranchSet; guesses: BranchLeaf[]; target: BranchLeaf }) {
  const noun = set === "microbe" ? "microbe" : "drug";
  const rootName = set === "microbe" ? "All microbes" : "All drugs";
  const won = guesses.some((g) => g.name === target.name);
  const wrong = guesses.filter((g) => g.name !== target.name);
  const deepest = won ? target.path.length : wrong.reduce((n, g) => Math.max(n, sharedDepth(g.path, target.path)), 0);
  const trunk = [rootName, ...target.path.slice(0, deepest)];

  // Vertical layout: each trunk node owns a band tall enough for the twigs hanging from it.
  const twigsAt: BranchLeaf[][] = trunk.map(() => []);
  for (const g of wrong) twigsAt[Math.min(sharedDepth(g.path, target.path), trunk.length - 1)].push(g);
  const ys: number[] = [];
  let y = 26;
  trunk.forEach((_, i) => {
    ys.push(y);
    const rows = Math.ceil(twigsAt[i].length / 2);
    y += Math.max(62, 44 + rows * 54);
  });
  const mysteryY = won ? 0 : y + 6;
  const height = (won ? y : mysteryY + 70) + 6;

  const trunkLabel = (i: number) => trunk[i];
  return <svg className="bt" viewBox={"0 0 " + W + " " + height} width="100%" role="img" aria-label={"Family tree of your guesses for the mystery " + noun}>
    {/* trunk line */}
    <line x1={TRUNK_X} y1={ys[0] + TRUNK_H / 2} x2={TRUNK_X} y2={won ? ys[ys.length - 1] : mysteryY + 18} className="bt-trunk" />
    {!won && <line x1={TRUNK_X} y1={ys[ys.length - 1] + TRUNK_H} x2={TRUNK_X} y2={mysteryY} className="bt-trunk dashed" />}
    {/* twigs */}
    {twigsAt.map((list, i) => list.map((g, k) => {
      const left = k % 2 === 0, row = Math.floor(k / 2);
      const cx = left ? TWIG_W / 2 + 2 : W - TWIG_W / 2 - 2;
      const ty = ys[i] + TRUNK_H + 6 + row * 54;
      const sx = TRUNK_X, sy = ys[i] + TRUNK_H;
      const ex = left ? cx + TWIG_W / 2 : cx - TWIG_W / 2, ey = ty + TWIG_H / 2;
      const s = sharedDepth(g.path, target.path);
      const mid = g.path.slice(s, -1).join(" › ");
      return <g key={g.name}>
        <path d={"M" + sx + " " + sy + " Q" + sx + " " + ey + " " + ex + " " + ey} className="bt-link" />
        <foreignObject x={cx - TWIG_W / 2} y={ty} width={TWIG_W} height={TWIG_H}><div className="bt-twig"><b>✕ {g.name}</b>{mid && <small>{mid}</small>}</div></foreignObject>
      </g>;
    }))}
    {/* trunk nodes */}
    {trunk.map((_, i) => {
      const isTarget = won && i === trunk.length - 1;
      const label = trunkLabel(i);
      const left = i === 0 ? null : candidatesUnder(set, target.path.slice(0, i));
      return <foreignObject key={i} x={TRUNK_X - TRUNK_W / 2} y={ys[i]} width={TRUNK_W} height={TRUNK_H}>
        <div className={"bt-node" + (i === 0 ? " root" : "") + (isTarget ? " hit" : "")} style={{ animationDelay: Math.min(i, 6) * 60 + "ms" }}><span>{isTarget ? "★ " : ""}{label}</span>{left !== null && !isTarget && <b>{left}</b>}</div>
      </foreignObject>;
    })}
    {!won && <foreignObject x={TRUNK_X - TRUNK_W / 2} y={mysteryY} width={TRUNK_W} height={52}>
      <div className="bt-mystery"><small>Find this {noun}!</small><b>???</b></div>
    </foreignObject>}
  </svg>;
}
