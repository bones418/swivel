import React, { useState, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Vibration,
  Animated,
} from 'react-native';
import { BoardView, TokenInfo, AnimatingToken } from '../components/BoardView';
import { Direction } from '../models/Side';
import {
  GameState,
  createGame,
  currentPlayer,
  isSideValid,
  placePeg,
  getValidMoveTargets,
  moveToken,
  hasValidSides,
  advanceTurn,
  TokenPosition,
} from '../game/GameState';
import { PlayerColor, PLAYER_COLORS, PLAYER_DISPLAY } from '../constants/players';
import { COLORS, TILE_SIZE, TILE_GAP, BOARD_PADDING, CHIP_SIZE } from '../constants/theme';

// Must match STARTING_POSITIONS in GameState.ts
const TOKEN_STARTS = [
  { row: 1, col: 1 },
  { row: 2, col: 2 },
  { row: 1, col: 2 },
  { row: 2, col: 1 },
];

// Top-left position of a chip within the board's coordinate space
function chipTL(row: number, col: number) {
  return {
    x: BOARD_PADDING + col * (TILE_SIZE + TILE_GAP) + (TILE_SIZE - CHIP_SIZE) / 2,
    y: BOARD_PADDING + row * (TILE_SIZE + TILE_GAP) + (TILE_SIZE - CHIP_SIZE) / 2,
  };
}

interface Props {
  playerCount: number;
  onEndGame: () => void;
}

interface FlashTarget {
  row: number;
  col: number;
  key: number;
}

export function GameScreen({ playerCount, onEndGame }: Props) {
  const [gameState, setGameState] = useState<GameState>(() => createGame(playerCount));
  const [flashTarget, setFlashTarget] = useState<FlashTarget | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pendingMove, setPendingMove] = useState<TokenPosition | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const flashKeyRef = useRef(0);

  // A single ValueXY used only while a token is gliding; null otherwise.
  const animTokenPos = useRef<Animated.ValueXY | null>(null);

  const players = useMemo(() => PLAYER_COLORS.slice(0, playerCount), [playerCount]);

  const player = currentPlayer(gameState);
  const { color: playerColor, name: playerName } = PLAYER_DISPLAY[player];

  // Green-highlighted tiles
  const highlightedTiles = useMemo((): TokenPosition[] => {
    if (pendingMove) return [pendingMove];
    if (gameState.turnPhase === 'moveToken') return getValidMoveTargets(gameState);
    return [gameState.tokenPositions[player]];
  }, [gameState, pendingMove, player]);

  // Static token list — hide the moving player's chip while animation runs
  const tokens = useMemo((): TokenInfo[] =>
    players
      .filter(p => !isAnimating || p !== player)
      .map(p => ({
        player: p,
        row: gameState.tokenPositions[p].row,
        col: gameState.tokenPositions[p].col,
      })),
    [players, gameState, isAnimating, player],
  );

  // Animated token — only during movement
  const animatingToken = useMemo((): AnimatingToken | undefined => {
    if (!isAnimating || !animTokenPos.current) return undefined;
    return { player, pos: animTokenPos.current };
  }, [isAnimating, player]);

  const triggerFlash = useCallback((row: number, col: number) => {
    Vibration.vibrate(80);
    flashKeyRef.current += 1;
    setFlashTarget({ row, col, key: flashKeyRef.current });
    setTimeout(() => setFlashTarget(null), 600);
  }, []);

  const handleTilePress = useCallback(
    (row: number, col: number) => {
      if (isAnimating || gameState.turnPhase !== 'moveToken') return;

      const targets = getValidMoveTargets(gameState);
      const isValid = targets.some(t => t.row === row && t.col === col);
      if (!isValid) {
        triggerFlash(row, col);
        return;
      }

      const tokenPos = gameState.tokenPositions[player];
      const isSameTile = tokenPos.row === row && tokenPos.col === col;

      if (isSameTile) {
        // Forced stay — no adjacent moves available, skip animation
        const newState = moveToken(gameState, row, col);
        setGameState(hasValidSides(newState) ? newState : advanceTurn(newState));
        return;
      }

      // Start glide animation
      const from = chipTL(tokenPos.row, tokenPos.col);
      animTokenPos.current = new Animated.ValueXY({ x: from.x, y: from.y });
      const to = chipTL(row, col);

      setPendingMove({ row, col });
      setIsAnimating(true);

      Animated.timing(animTokenPos.current, {
        toValue: { x: to.x, y: to.y },
        duration: 1000,
        useNativeDriver: false,
      }).start(() => {
        animTokenPos.current = null;
        setIsAnimating(false);
        setPendingMove(null);
        const newState = moveToken(gameState, row, col);
        setGameState(hasValidSides(newState) ? newState : advanceTurn(newState));
      });
    },
    [gameState, isAnimating, player, triggerFlash],
  );

  const handleSidePress = useCallback(
    (row: number, col: number, direction: Direction) => {
      if (isAnimating) return;

      if (gameState.turnPhase === 'moveToken') {
        handleTilePress(row, col);
      } else {
        // placePeg phase — only valid on the player's current tile
        const tokenPos = gameState.tokenPositions[player];
        if (row !== tokenPos.row || col !== tokenPos.col) {
          triggerFlash(row, col);
          return;
        }
        if (isSideValid(gameState, row, col, direction)) {
          setGameState(prev => placePeg(prev, row, col, direction));
        } else {
          triggerFlash(row, col);
        }
      }
    },
    [gameState, isAnimating, player, handleTilePress, triggerFlash],
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.menuButton} onPress={() => setMenuOpen(true)}>
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
        </TouchableOpacity>
      </View>

      <BoardView
        board={gameState.board}
        onSidePress={handleSidePress}
        onTilePress={gameState.turnPhase === 'moveToken' ? handleTilePress : undefined}
        flashTarget={flashTarget}
        highlightedTiles={highlightedTiles}
        tokens={tokens}
        animatingToken={animatingToken}
      />

      <View style={styles.turnArea}>
        <Text style={[styles.turnText, { color: playerColor }]}>
          {playerName}'s turn
        </Text>
        <Text style={[styles.actionText, { color: playerColor }]}>
          {gameState.turnPhase === 'moveToken' ? 'Move token' : 'Place a peg'}
        </Text>
      </View>

      <Modal
        transparent
        visible={menuOpen}
        animationType="fade"
        onRequestClose={() => setMenuOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setMenuOpen(false)}
        >
          <View style={styles.dropdown}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => {
                setMenuOpen(false);
                onEndGame();
              }}
            >
              <Text style={styles.dropdownText}>End Game</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    width: '100%',
    paddingHorizontal: 20,
    paddingBottom: 12,
    alignItems: 'flex-start',
  },
  menuButton: {
    padding: 8,
    gap: 5,
  },
  hamburgerLine: {
    width: 24,
    height: 2.5,
    backgroundColor: COLORS.titleText,
    borderRadius: 2,
    marginVertical: 2,
  },
  turnArea: {
    marginTop: 28,
    alignItems: 'center',
    gap: 6,
  },
  turnText: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 1,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.5,
    opacity: 0.85,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    paddingTop: 100,
    paddingLeft: 20,
  },
  dropdown: {
    backgroundColor: COLORS.cornerWood,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.woodBorder,
    overflow: 'hidden',
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 12,
  },
  dropdownItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  dropdownText: {
    color: COLORS.titleText,
    fontSize: 16,
    fontWeight: '600',
  },
});
