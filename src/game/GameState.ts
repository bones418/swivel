import { Board, createBoard } from '../models/Board';
import { Direction } from '../models/Side';
import { PlayerColor, PLAYER_COLORS } from '../constants/players';

export interface GameState {
  board: Board;
  players: PlayerColor[];
  currentPlayerIndex: number;
}

export function createGame(playerCount: number): GameState {
  return {
    board: createBoard(),
    players: PLAYER_COLORS.slice(0, playerCount),
    currentPlayerIndex: 0,
  };
}

export function currentPlayer(state: GameState): PlayerColor {
  return state.players[state.currentPlayerIndex];
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
  };
}
