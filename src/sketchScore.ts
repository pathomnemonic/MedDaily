/** Credit for a Cell Sketch picture that was given up on. Only cells the player actually set count (filled correctly, or marked empty correctly); untouched cells earn nothing. */
export const GIVE_UP_MAX = 35;

export function giveUpPoints(pattern: readonly (readonly number[])[], grid: readonly (readonly number[])[]): number {
  let total = 0, right = 0;
  for (let r = 0; r < pattern.length; r++) for (let c = 0; c < pattern[r].length; c++) {
    total++;
    const want = pattern[r][c], have = grid[r]?.[c] ?? 0;
    if ((want === 1 && have === 1) || (want === 0 && have === 2)) right++;
  }
  // always below the 40-point floor of a solved picture, so giving up can never beat finishing
  return total === 0 ? 0 : Math.min(GIVE_UP_MAX, Math.round((right / total) * GIVE_UP_MAX));
}
