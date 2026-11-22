/** Player level from total XP. Each level needs a little more than the last. */
export const LEVEL_TITLES = ["Pre-med", "Med student", "Intern", "Resident", "Fellow", "Attending", "Chief", "Professor", "Dean", "Legend"];
/** XP required to reach level n (n >= 1): 0, 100, 250, 450, 700, ... */
export const xpForLevel = (n: number): number => 50 * (n - 1) * (n + 2);
export function levelFor(xp: number): { level: number; title: string; into: number; span: number; pct: number } {
  // corrupted or hand-edited saves can hold NaN, negatives or astronomically large values; keep the loop bounded
  xp = Number.isFinite(xp) ? Math.max(0, Math.min(xp, 1e9)) : 0;
  let level = 1;
  while (level < 5000 && xp >= xpForLevel(level + 1)) level++;
  const into = xp - xpForLevel(level), span = xpForLevel(level + 1) - xpForLevel(level);
  return { level, title: LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)], into, span, pct: Math.min(100, Math.round(into / span * 100)) };
}
/** XP for finishing a round: daily rounds pay most, free play a little, party rooms in between. */
export function xpForResult(opts: { score: number; maxScore: number; perfect: boolean; practice: boolean; party: boolean }): number {
  const ratio = opts.maxScore > 0 ? Math.max(0, Math.min(1, opts.score / opts.maxScore)) : 0;
  const base = opts.practice ? 10 : opts.party ? 20 : 40;
  return Math.round(base + ratio * (opts.practice ? 10 : 30) + (opts.perfect ? 25 : 0));
}
/** 0–3 stars for a finished round. */
export function starsFor(score: number, maxScore: number, perfect: boolean): number {
  if (perfect) return 3;
  const ratio = maxScore > 0 ? score / maxScore : 0;
  return ratio >= 0.85 ? 3 : ratio >= 0.5 ? 2 : ratio > 0 ? 1 : 0;
}
