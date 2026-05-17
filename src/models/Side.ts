import { Hole, createHole } from './Hole';

export type Direction = 'top' | 'right' | 'bottom' | 'left';

export interface Side {
  direction: Direction;
  holes: Hole[];
}

export function createSide(direction: Direction, holeCount: number): Side {
  return {
    direction,
    holes: Array.from({ length: holeCount }, (_, i) => createHole(i)),
  };
}
