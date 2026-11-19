import type { ConnectionGroup } from "./data";
import { connectionPuzzlesExpansion } from "./dataExpansion";
import { connectionPuzzlesExpansion2 } from "./dataClinical2";
import { connectionPuzzlesExpansion3 } from "./dataClinical3";
import { connectionPuzzlesExpansion4 } from "./dataClinical4";
import { connectionPuzzlesExpansion5 } from "./dataClinical5";
import { connectionPuzzlesExpansion6 } from "./dataClinical6";
import { connectionPuzzlesExpansion7 } from "./dataClinical7";
import { connectionPuzzlesExpansion8 } from "./dataClinical8";
import { connectionPuzzlesExpansion9 } from "./dataClinical9";
import { connectionPuzzlesExpansion10 } from "./dataClinical10";
import { connectionPuzzlesExpansion11 } from "./dataYearExpansion";

/**
 * Adds a year-sized second rotation of Connections boards by recombining
 * previously reviewed, internally coherent four-item categories. Each board
 * is assembled only when all 16 tiles are distinct; category definitions
 * retain their original clues and terminology.
 *
 * This is a curated-category remix, not 205 newly authored medical topics.
 */
const sourceBoards = [
  ...connectionPuzzlesExpansion,
  ...connectionPuzzlesExpansion2,
  ...connectionPuzzlesExpansion3,
  ...connectionPuzzlesExpansion4,
  ...connectionPuzzlesExpansion5,
  ...connectionPuzzlesExpansion6,
  ...connectionPuzzlesExpansion7,
  ...connectionPuzzlesExpansion8,
  ...connectionPuzzlesExpansion9,
  ...connectionPuzzlesExpansion10,
  ...connectionPuzzlesExpansion11
];

const categoryPool: ConnectionGroup[] = sourceBoards.flatMap((board) => board);
const normalizeTile = (tile: string) => tile.trim().toLocaleLowerCase();
const boardKey = (board: ConnectionGroup[]) =>
  board.map((group) => group.category.toLocaleLowerCase()).sort().join("|");

const buildBoard = (start: number, stride: number): ConnectionGroup[] | null => {
  const chosen: ConnectionGroup[] = [];
  const usedTiles = new Set<string>();
  for (let offset = 0; offset < categoryPool.length && chosen.length < 4; offset += 1) {
    const candidate = categoryPool[(start + offset * stride) % categoryPool.length];
    if (!candidate || chosen.some((group) => group.category === candidate.category)) continue;
    const tiles = candidate.words.map(normalizeTile);
    if (tiles.some((tile) => usedTiles.has(tile))) continue;
    chosen.push(candidate);
    tiles.forEach((tile) => usedTiles.add(tile));
  }
  return chosen.length === 4 ? chosen : null;
};

export const connectionPuzzlesExpansion12: ConnectionGroup[][] = (() => {
  const boards: ConnectionGroup[][] = [];
  const seen = new Set<string>();
  const target = 205;
  const strides = [1, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43];
  for (let pass = 0; pass < strides.length && boards.length < target; pass += 1) {
    const stride = strides[pass];
    for (let index = 0; index < categoryPool.length * 2 && boards.length < target; index += 1) {
      const start = (index * (pass + 3) + pass * 17) % categoryPool.length;
      const board = buildBoard(start, stride);
      if (!board) continue;
      const key = boardKey(board);
      if (seen.has(key)) continue;
      seen.add(key);
      boards.push(board);
    }
  }
  if (boards.length !== target) {
    throw new Error(`Expected 205 additional Connections boards; generated ${boards.length}.`);
  }
  return boards;
})();
