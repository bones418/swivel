import { Side, createSide, Direction } from './Side';
import { BOARD_SIZE } from '../constants/theme';

export type TileType = 'corner' | 'edge' | 'middle';

export interface Tile {
  row: number;
  col: number;
  type: TileType;
  sides: Record<Direction, Side>;
}

/**
 * Hole counts per side based on position in the 4×4 grid.
 *
 * Corner tiles  — outward sides: 2 holes, inward sides: 3 holes
 * Edge tiles    — outward side: 2, inward side: 4, corner-facing sides: 3
 * Middle tiles  — all sides: 4 holes
 */
function holeCountsFor(row: number, col: number): Record<Direction, number> {
  const onTop = row === 0;
  const onBottom = row === BOARD_SIZE - 1;
  const onLeft = col === 0;
  const onRight = col === BOARD_SIZE - 1;

  const isCorner = (onTop || onBottom) && (onLeft || onRight);
  const isEdge = !isCorner && (onTop || onBottom || onLeft || onRight);

  if (isCorner) {
    return {
      top:    onTop    ? 2 : 3,
      bottom: onBottom ? 2 : 3,
      left:   onLeft   ? 2 : 3,
      right:  onRight  ? 2 : 3,
    };
  }

  if (isEdge) {
    return {
      top:    onTop    ? 2 : onBottom ? 4 : 3,
      bottom: onBottom ? 2 : onTop    ? 4 : 3,
      left:   onLeft   ? 2 : onRight  ? 4 : 3,
      right:  onRight  ? 2 : onLeft   ? 4 : 3,
    };
  }

  return { top: 4, bottom: 4, left: 4, right: 4 };
}

export function createTile(row: number, col: number): Tile {
  const onTop = row === 0;
  const onBottom = row === BOARD_SIZE - 1;
  const onLeft = col === 0;
  const onRight = col === BOARD_SIZE - 1;
  const isCorner = (onTop || onBottom) && (onLeft || onRight);
  const isEdge = !isCorner && (onTop || onBottom || onLeft || onRight);

  const type: TileType = isCorner ? 'corner' : isEdge ? 'edge' : 'middle';
  const counts = holeCountsFor(row, col);

  return {
    row,
    col,
    type,
    sides: {
      top:    createSide('top',    counts.top),
      right:  createSide('right',  counts.right),
      bottom: createSide('bottom', counts.bottom),
      left:   createSide('left',   counts.left),
    },
  };
}
