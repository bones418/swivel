import { Tile, createTile } from './Tile';
import { BOARD_SIZE } from '../constants/theme';

export interface Board {
  tiles: Tile[][];
}

export function createBoard(): Board {
  return {
    tiles: Array.from({ length: BOARD_SIZE }, (_, row) =>
      Array.from({ length: BOARD_SIZE }, (_, col) => createTile(row, col)),
    ),
  };
}
