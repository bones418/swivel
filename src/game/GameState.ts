import { Board, createBoard } from '../models/Board';
import { Direction } from '../models/Side';
import { PlayerColor, PLAYER_COLORS } from '../constants/players';
import { BOARD_SIZE } from '../constants/theme';

export type TurnPhase = 'moveToken' | 'placePeg';

export interface TokenPosition {
  row: number;
  col: number;
}

export interface GameState {
  board: Board;
  players: PlayerColor[];
  currentPlayerIndex: number;
  tokenPositions: Record<PlayerColor, TokenPosition>;
  turnPhase: TurnPhase;
}

const STARTING_POSITIONS: TokenPosition[] = [
  { row: 1, col: 1 }, // Player 1
  { row: 2, col: 2 }, // Player 2
  { row: 1, col: 2 }, // Player 3
  { row: 2, col: 1 }, // Player 4
];

export function createGame(playerCount: number): GameState {
  const players = PLAYER_COLORS.slice(0, playerCount);
  const tokenPositions = {} as Record<PlayerColor, TokenPosition>;
  players.forEach((p, i) => { tokenPositions[p] = STARTING_POSITIONS[i]; });
  return {
    board: createBoard(),
    players,
    currentPlayerIndex: 0,
    tokenPositions,
    turnPhase: 'moveToken',
  };
}

export function currentPlayer(state: GameState): PlayerColor {
  return state.players[state.currentPlayerIndex];
}

export function getValidMoveTargets(state: GameState): TokenPosition[] {
  const player = currentPlayer(state);
  const pos = state.tokenPositions[player];
  const occupied = new Set(
    state.players.map(p => `${state.tokenPositions[p].row},${state.tokenPositions[p].col}`)
  );

  const adjacent = [
    { row: pos.row - 1, col: pos.col },
    { row: pos.row + 1, col: pos.col },
    { row: pos.row, col: pos.col - 1 },
    { row: pos.row, col: pos.col + 1 },
  ].filter(({ row, col }) =>
    row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE &&
    !occupied.has(`${row},${col}`)
  );

  return adjacent.length > 0 ? adjacent : [pos];
}

export function moveToken(state: GameState, row: number, col: number): GameState {
  const player = currentPlayer(state);
  return {
    ...state,
    tokenPositions: { ...state.tokenPositions, [player]: { row, col } },
    turnPhase: 'placePeg',
  };
}

export function isSideValid(
  state: GameState,
  row: number,
  col: number,
  direction: Direction,
): boolean {
  const side = state.board.tiles[row][col].sides[direction];
  const player = currentPlayer(state);
  const pegs = side.holes.map(h => h.peg);
  const anyFilled = pegs.some(p => p !== null);
  if (!anyFilled) return true;
  return pegs.some(p => p === player) && pegs.some(p => p === null);
}

export function hasValidSides(state: GameState): boolean {
  const player = currentPlayer(state);
  const pos = state.tokenPositions[player];
  const directions: Direction[] = ['top', 'right', 'bottom', 'left'];
  return directions.some(dir => isSideValid(state, pos.row, pos.col, dir));
}

export function advanceTurn(state: GameState): GameState {
  return {
    ...state,
    currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length,
    turnPhase: 'moveToken',
  };
}

// Clockwise fill order per side:
//   top    → left-to-right  (index 0 first)
//   right  → top-to-bottom  (index 0 first)
//   bottom → right-to-left  (last index first)
//   left   → bottom-to-top  (last index first)
export function placePeg(
  state: GameState,
  row: number,
  col: number,
  direction: Direction,
): GameState {
  const tile = state.board.tiles[row][col];
  const side = tile.sides[direction];
  const player = currentPlayer(state);

  let targetIndex: number;
  if (direction === 'top' || direction === 'right') {
    targetIndex = side.holes.findIndex(h => h.peg === null);
  } else {
    targetIndex = -1;
    for (let i = side.holes.length - 1; i >= 0; i--) {
      if (side.holes[i].peg === null) { targetIndex = i; break; }
    }
  }

  if (targetIndex === -1) return state;

  const newHoles = side.holes.map((h, i) =>
    i === targetIndex ? { ...h, peg: player } : h,
  );

  const newBoard: Board = {
    tiles: state.board.tiles.map((tileRow, r) =>
      tileRow.map((t, c) => {
        if (r !== row || c !== col) return t;
        return { ...t, sides: { ...t.sides, [direction]: { ...side, holes: newHoles } } };
      }),
    ),
  };

  return {
    ...state,
    board: newBoard,
    currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length,
    turnPhase: 'moveToken',
  };
}
