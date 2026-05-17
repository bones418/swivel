export interface Hole {
  /** Zero-based index of this hole within its Side */
  index: number;
}

export function createHole(index: number): Hole {
  return { index };
}
