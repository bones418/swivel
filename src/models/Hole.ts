import { PlayerColor } from '../constants/players';

export interface Hole {
  index: number;
  peg: PlayerColor | null;
}

export function createHole(index: number): Hole {
  return { index, peg: null };
}
