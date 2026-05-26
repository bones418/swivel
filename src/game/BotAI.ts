import {
  GameState,
  getValidMoveTargets,
  moveToken,
  isSideValid,
  placePeg,
  rotateTileState,
  computeBattles,
  TokenPosition,
} from './GameState';
import { PlayerColor } from '../constants/players';
import { Direction } from '../models/Side';

const DIRECTIONS: Direction[] = ['top', 'right', 'bottom', 'left'];

function battleScore(
  state: GameState,
  row: number,
  col: number,
  clockwise: boolean,
): number {
  const rotated = rotateTileState(state, row, col, clockwise);
  const battles = computeBattles(rotated, row, col);
  let score = 0;
  for (const b of battles) {
    score += b.playerWins ? 3 : -2;
  }
  return score;
}

function bestRotationScore(state: GameState, row: number, col: number): number {
  return Math.max(
    battleScore(state, row, col, true),
    battleScore(state, row, col, false),
  );
}

function scorePegAndRotation(
  state: GameState,
  row: number,
  col: number,
  dir: Direction,
): number {
  const afterPeg = placePeg(state, row, col, dir);
  return bestRotationScore(afterPeg, row, col);
}

function scoreMoveTarget(state: GameState, target: TokenPosition): number {
  const afterMove = moveToken(state, target.row, target.col);
  let best = -Infinity;
  let hasOption = false;

  for (const dir of DIRECTIONS) {
    if (isSideValid(afterMove, target.row, target.col, dir)) {
      hasOption = true;
      const s = scorePegAndRotation(afterMove, target.row, target.col, dir);
      if (s > best) best = s;
    }
  }

  return hasOption ? best : -1;
}

export function botChooseMove(state: GameState): TokenPosition {
  const targets = getValidMoveTargets(state);
  const scored = targets.map(t => ({
    t,
    score: scoreMoveTarget(state, t) + Math.random() * 0.5,
  }));
  scored.sort((a, b) => b.score - a.score);

  // 15% of the time pick randomly from top-3 for variety
  if (Math.random() < 0.15 && scored.length > 1) {
    return scored[Math.floor(Math.random() * Math.min(3, scored.length))].t;
  }
  return scored[0].t;
}

export function botChoosePeg(
  state: GameState,
  botColor: PlayerColor,
): Direction | null {
  const pos = state.tokenPositions[botColor];
  const valid = DIRECTIONS.filter(dir => isSideValid(state, pos.row, pos.col, dir));
  if (valid.length === 0) return null;

  const scored = valid.map(dir => ({
    dir,
    score: scorePegAndRotation(state, pos.row, pos.col, dir) + Math.random() * 0.5,
  }));
  scored.sort((a, b) => b.score - a.score);

  // 20% of the time pick randomly among valid options
  if (Math.random() < 0.2) {
    return scored[Math.floor(Math.random() * scored.length)].dir;
  }
  return scored[0].dir;
}

export function botChooseRotation(state: GameState, botColor: PlayerColor): boolean {
  const { row, col } = state.tokenPositions[botColor];
  const cw = battleScore(state, row, col, true) + Math.random() * 0.3;
  const ccw = battleScore(state, row, col, false) + Math.random() * 0.3;
  return cw >= ccw;
}
