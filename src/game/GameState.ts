import { Board, createBoard } from '../models/Board';
import { Side, Direction } from '../models/Side';
import { PlayerColor, PLAYER_COLORS } from '../constants/players';
import { BOARD_SIZE } from '../constants/theme';

export type TurnPhase = 'moveToken' | 'placePeg' | 'rotateTile';

export const TOTAL_ROUNDS = 25;

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
  roundsRemaining: number;
  gameOver: boolean;
}

const STARTING_POSITIONS: TokenPosition[] = [
  { row: 0, col: 0 }, // Player 1 – top left
  { row: 2, col: 2 }, // Player 2 – bottom right
  { row: 0, col: 2 }, // Player 3 – top right
  { row: 2, col: 0 }, // Player 4 – bottom left
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
    roundsRemaining: TOTAL_ROUNDS,
    gameOver: false,
  };
}

export function currentPlayer(state: GameState): PlayerColor {
  return state.players[state.currentPlayerIndex];
}

const CENTER_SQUARES = new Set(['1,1']);

function isCenter(row: number, col: number): boolean {
  return CENTER_SQUARES.has(`${row},${col}`);
}

export function getValidMoveTargets(state: GameState): TokenPosition[] {
  const player = currentPlayer(state);
  const pos = state.tokenPositions[player];
  const occupied = new Set(
    state.players.map(p => `${state.tokenPositions[p].row},${state.tokenPositions[p].col}`)
  );

  const adjacent = [
    { row: pos.row - 1, col: pos.col - 1 },
    { row: pos.row - 1, col: pos.col },
    { row: pos.row - 1, col: pos.col + 1 },
    { row: pos.row,     col: pos.col - 1 },
    { row: pos.row,     col: pos.col + 1 },
    { row: pos.row + 1, col: pos.col - 1 },
    { row: pos.row + 1, col: pos.col },
    { row: pos.row + 1, col: pos.col + 1 },
  ].filter(({ row, col }) =>
    row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE &&
    !occupied.has(`${row},${col}`) &&
    !(isCenter(pos.row, pos.col) && isCenter(row, col))
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
  const isEndOfRound = state.currentPlayerIndex === state.players.length - 1;
  const newRoundsRemaining = isEndOfRound ? state.roundsRemaining - 1 : state.roundsRemaining;
  return {
    ...state,
    currentPlayerIndex: (state.currentPlayerIndex + 1) % state.players.length,
    turnPhase: 'moveToken',
    roundsRemaining: newRoundsRemaining,
    gameOver: newRoundsRemaining <= 0,
  };
}

export function computeScores(state: GameState): Record<PlayerColor, number> {
  const scores = {} as Record<PlayerColor, number>;
  state.players.forEach(p => { scores[p] = 0; });

  for (const tileRow of state.board.tiles) {
    for (const tile of tileRow) {
      for (const side of Object.values(tile.sides) as Side[]) {
        const full = side.holes.every(h => h.peg !== null);
        let sideOwner: PlayerColor | null = null;
        for (const hole of side.holes) {
          if (hole.peg !== null && hole.peg in scores) {
            scores[hole.peg] += hole.index + 1;
            sideOwner = hole.peg;
          }
        }
        if (full && sideOwner !== null) {
          scores[sideOwner] += 2;
        }
      }
    }
  }

  return scores;
}

// Pegs always fill from hole index 0 upward, regardless of the tile's current rotation.
export function placePeg(
  state: GameState,
  row: number,
  col: number,
  direction: Direction,
): GameState {
  const tile = state.board.tiles[row][col];
  const side = tile.sides[direction];
  const player = currentPlayer(state);

  const targetIndex = side.holes.findIndex(h => h.peg === null);

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

  return { ...state, board: newBoard, turnPhase: 'rotateTile' };
}

// ── Tile rotation ─────────────────────────────────────────────────────────────

export function rotateTileState(
  state: GameState,
  row: number,
  col: number,
  clockwise: boolean,
): GameState {
  const { top, right, bottom, left } = state.board.tiles[row][col].sides;
  const newSides: Record<Direction, Side> = clockwise
    ? {
        top:    { ...left,   direction: 'top'    },
        right:  { ...top,    direction: 'right'  },
        bottom: { ...right,  direction: 'bottom' },
        left:   { ...bottom, direction: 'left'   },
      }
    : {
        top:    { ...right,  direction: 'top'    },
        right:  { ...bottom, direction: 'right'  },
        bottom: { ...left,   direction: 'bottom' },
        left:   { ...top,    direction: 'left'   },
      };

  const newBoard: Board = {
    tiles: state.board.tiles.map((tileRow, r) =>
      tileRow.map((t, c) =>
        r === row && c === col ? { ...t, sides: newSides } : t,
      ),
    ),
  };
  return { ...state, board: newBoard };
}

// ── Battle resolution ─────────────────────────────────────────────────────────

const OPPOSITE: Record<Direction, Direction> = {
  top: 'bottom', bottom: 'top', left: 'right', right: 'left',
};

const NEIGHBOR_DELTA: Record<Direction, { dr: number; dc: number }> = {
  top:    { dr: -1, dc:  0 },
  right:  { dr:  0, dc:  1 },
  bottom: { dr:  1, dc:  0 },
  left:   { dr:  0, dc: -1 },
};

function isFull(side: Side): boolean {
  return side.holes.every(h => h.peg !== null);
}

// Add to the first empty hole by index (fill order is always 0 → N).
function addPegToSide(side: Side, player: PlayerColor): { newSide: Side; holeIndex: number } {
  const idx = side.holes.findIndex(h => h.peg === null);
  return {
    newSide: { ...side, holes: side.holes.map((h, i) => i === idx ? { ...h, peg: player } : h) },
    holeIndex: idx,
  };
}

// Remove from the last filled hole by index (reverse of fill order).
function removePegFromSide(side: Side): { newSide: Side; holeIndex: number } {
  let idx = -1;
  for (let i = side.holes.length - 1; i >= 0; i--) {
    if (side.holes[i].peg !== null) { idx = i; break; }
  }
  return {
    newSide: { ...side, holes: side.holes.map((h, i) => i === idx ? { ...h, peg: null } : h) },
    holeIndex: idx,
  };
}

function updateSideOnBoard(board: Board, row: number, col: number, dir: Direction, side: Side): Board {
  return {
    tiles: board.tiles.map((tileRow, r) =>
      tileRow.map((t, c) =>
        r === row && c === col
          ? { ...t, sides: { ...t.sides, [dir]: side } }
          : t,
      ),
    ),
  };
}

export interface BattleInfo {
  tileRow: number; tileCol: number; tileDir: Direction;
  neighborRow: number; neighborCol: number; neighborDir: Direction;
  activeWins: boolean;
  playerWins: boolean;
  gainHoleIndex: number;
  loseHoleIndex: number;
  otherPlayer: PlayerColor;
  stateAfter: GameState;
}

export function computeBattles(state: GameState, row: number, col: number): BattleInfo[] {
  const player = currentPlayer(state);
  const battles: BattleInfo[] = [];
  let working = state;

  for (const dir of ['top', 'right', 'bottom', 'left'] as Direction[]) {
    const { dr, dc } = NEIGHBOR_DELTA[dir];
    const nr = row + dr;
    const nc = col + dc;
    if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) continue;

    const neighborDir = OPPOSITE[dir];
    const activeSide = working.board.tiles[row][col].sides[dir];
    const neighborSide = working.board.tiles[nr][nc].sides[neighborDir];

    // Battle requires exactly one side to carry the rotating player's pegs.
    const activeHasPlayer   = activeSide.holes.some(h => h.peg === player);
    const neighborHasPlayer = neighborSide.holes.some(h => h.peg === player);
    if (activeHasPlayer === neighborHasPlayer) continue; // both or neither → no battle

    // Identify which side belongs to the player and which to the opponent.
    const playerSide   = activeHasPlayer ? activeSide   : neighborSide;
    const opponentSide = activeHasPlayer ? neighborSide : activeSide;

    const opponentHoles = opponentSide.holes.filter(h => h.peg !== null && h.peg !== player);
    if (opponentHoles.length === 0) continue;
    const otherPlayer = opponentHoles[0].peg as PlayerColor;

    const playerCount   = playerSide.holes.filter(h => h.peg !== null).length;
    const opponentCount = opponentSide.holes.filter(h => h.peg !== null).length;
    const playerWins    = playerCount >= opponentCount;

    // Battle only proceeds if the losing side is not full.
    const loserSide = playerWins ? opponentSide : playerSide;
    if (isFull(loserSide)) continue;

    // activeWins = true means the active tile's side is the one that gains a peg.
    // That happens when (player is on active AND player wins) OR
    //                   (player is on neighbor AND player loses).
    const activeWins = activeHasPlayer === playerWins;

    // The gaining side always receives a peg of its own existing color.
    const gainPlayer = playerWins ? player : otherPlayer;

    let newBoard = working.board;
    let gainHoleIndex: number = -1;
    let loseHoleIndex: number;

    if (activeWins) {
      // Active side gains, neighbor side loses.
      const { newSide: lost, holeIndex: li } = removePegFromSide(neighborSide);
      loseHoleIndex = li;
      newBoard = updateSideOnBoard(newBoard, nr, nc, neighborDir, lost);
      if (!isFull(activeSide)) {
        const { newSide: gained, holeIndex: gi } = addPegToSide(activeSide, gainPlayer);
        gainHoleIndex = gi;
        newBoard = updateSideOnBoard(newBoard, row, col, dir, gained);
      }
    } else {
      // Neighbor side gains, active side loses.
      const { newSide: lost, holeIndex: li } = removePegFromSide(activeSide);
      loseHoleIndex = li;
      newBoard = updateSideOnBoard(newBoard, row, col, dir, lost);
      if (!isFull(neighborSide)) {
        const { newSide: gained, holeIndex: gi } = addPegToSide(neighborSide, gainPlayer);
        gainHoleIndex = gi;
        newBoard = updateSideOnBoard(newBoard, nr, nc, neighborDir, gained);
      }
    }

    working = { ...working, board: newBoard };

    battles.push({
      tileRow: row, tileCol: col, tileDir: dir,
      neighborRow: nr, neighborCol: nc, neighborDir,
      activeWins, playerWins, gainHoleIndex, loseHoleIndex,
      otherPlayer,
      stateAfter: working,
    });
  }

  return battles;
}
