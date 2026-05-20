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
import {
  BoardView,
  TokenInfo,
  AnimatingToken,
  RotatingTileInfo,
  BoardPegHint,
  BoardBattleHighlight,
} from '../components/BoardView';
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
  rotateTileState,
  computeBattles,
  computeScores,
  BattleInfo,
  TokenPosition,
} from '../game/GameState';
import { PlayerColor, PLAYER_COLORS, PLAYER_DISPLAY } from '../constants/players';
import { COLORS, TILE_SIZE, TILE_GAP, BOARD_PADDING, CHIP_SIZE } from '../constants/theme';
import { TilePegHint } from '../components/TileView';
import { SidePegHint } from '../components/SideView';
import { PegAnimHint } from '../components/HoleView';

// Must match STARTING_POSITIONS in GameState.ts
const TOKEN_STARTS = [
  { row: 1, col: 1 },
  { row: 2, col: 2 },
  { row: 1, col: 2 },
  { row: 2, col: 1 },
];

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

  // Token glide animation
  const animTokenPos = useRef<Animated.ValueXY | null>(null);

  // Tile rotation animation
  const rotAnim = useRef<Animated.Value | null>(null);
  const [rotatingTile, setRotatingTile] = useState<RotatingTileInfo | null>(null);

  // Battle display state
  const [pegHint, setPegHint] = useState<BoardPegHint | null>(null);
  const [battleHighlights, setBattleHighlights] = useState<BoardBattleHighlight[]>([]);

  const players = useMemo(() => PLAYER_COLORS.slice(0, playerCount), [playerCount]);
  const player = currentPlayer(gameState);
  const { color: playerColor, name: playerName } = PLAYER_DISPLAY[player];

  const highlightedTiles = useMemo((): TokenPosition[] => {
    if (pendingMove) return [pendingMove];
    if (gameState.turnPhase === 'moveToken') return getValidMoveTargets(gameState);
    return [gameState.tokenPositions[player]];
  }, [gameState, pendingMove, player]);

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

  // Run battle sequence (called after rotation state is applied)
  const runBattles = useCallback((battles: BattleInfo[], afterState: GameState) => {
    if (battles.length === 0) {
      setGameState(advanceTurn(afterState));
      setIsAnimating(false);
      return;
    }

    let idx = 0;

    function runNext(state: GameState) {
      if (idx >= battles.length) {
        setBattleHighlights([]);
        setPegHint(null);
        setGameState(advanceTurn(state));
        setIsAnimating(false);
        return;
      }

      const battle = battles[idx];
      idx++;

      // Determine gain/lose tile+side info
      const gainTileRow    = battle.activeWins ? battle.tileRow      : battle.neighborRow;
      const gainTileCol    = battle.activeWins ? battle.tileCol      : battle.neighborCol;
      const gainDir        = battle.activeWins ? battle.tileDir      : battle.neighborDir;
      const loseTileRow    = battle.activeWins ? battle.neighborRow  : battle.tileRow;
      const loseTileCol    = battle.activeWins ? battle.neighborCol  : battle.tileCol;
      const loseDir        = battle.activeWins ? battle.neighborDir  : battle.tileDir;
      const gainColor      = battle.playerWins
        ? PLAYER_DISPLAY[player].color
        : PLAYER_DISPLAY[battle.otherPlayer].color;
      const loseColor      = battle.playerWins
        ? PLAYER_DISPLAY[battle.otherPlayer].color
        : PLAYER_DISPLAY[player].color;

      // Show battle highlight border spanning both sides
      setBattleHighlights([{
        tileRow: battle.tileRow, tileCol: battle.tileCol, tileDir: battle.tileDir,
        neighborRow: battle.neighborRow, neighborCol: battle.neighborCol,
      }]);

      // Brief pause to show the highlight before peg animation
      setTimeout(() => {
        const runDisappear = (afterState: GameState) => {
          setGameState(afterState);
          const disappearAnim = new Animated.Value(1);
          const disappearHint: PegAnimHint = { mode: 'disappear', color: loseColor, anim: disappearAnim };
          const sidePegHintDisappear: SidePegHint = { holeIndex: battle.loseHoleIndex, hint: disappearHint };
          const tilePegHintDisappear: TilePegHint = { dir: loseDir, hint: sidePegHintDisappear };
          setPegHint({ tileRow: loseTileRow, tileCol: loseTileCol, hint: tilePegHintDisappear });
          Animated.timing(disappearAnim, { toValue: 0, duration: 500, useNativeDriver: true }).start(() => {
            setPegHint(null);
            setBattleHighlights([]);
            runNext(battle.stateAfter);
          });
        };

        if (battle.gainHoleIndex === -1) {
          // Winner is already full — skip appear animation, go straight to disappear
          runDisappear(battle.stateAfter);
        } else {
          // Animate peg appearing on gaining side
          const appearAnim = new Animated.Value(0);
          const appearHint: PegAnimHint = { mode: 'appear', color: gainColor, anim: appearAnim };
          const sidePegHintAppear: SidePegHint = { holeIndex: battle.gainHoleIndex, hint: appearHint };
          const tilePegHintAppear: TilePegHint = { dir: gainDir, hint: sidePegHintAppear };
          setPegHint({ tileRow: gainTileRow, tileCol: gainTileCol, hint: tilePegHintAppear });
          Animated.timing(appearAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start(() => {
            runDisappear(battle.stateAfter);
          });
        }
      }, 300);
    }

    runNext(afterState);
  }, [player]);

  const handleRotate = useCallback((clockwise: boolean) => {
    if (isAnimating || gameState.turnPhase !== 'rotateTile') return;

    const tokenPos = gameState.tokenPositions[player];
    const { row, col } = tokenPos;

    setIsAnimating(true);

    const anim = new Animated.Value(0);
    rotAnim.current = anim;
    const rotationDeg = anim.interpolate({
      inputRange:  [0, 1],
      outputRange: ['0deg', clockwise ? '90deg' : '-90deg'],
    });
    setRotatingTile({ row, col, rotationDeg });

    Animated.timing(anim, { toValue: 1, duration: 1000, useNativeDriver: true }).start(() => {
      rotAnim.current = null;
      setRotatingTile(null);

      const rotated = rotateTileState(gameState, row, col, clockwise);
      // Apply rotated state immediately so the tile renders correctly from data
      setGameState(rotated);

      const battles = computeBattles(rotated, row, col);
      runBattles(battles, rotated);
    });
  }, [gameState, isAnimating, player, runBattles]);

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
        const newState = moveToken(gameState, row, col);
        setGameState(hasValidSides(newState) ? newState : { ...newState, turnPhase: 'rotateTile' });
        return;
      }

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
        setGameState(hasValidSides(newState) ? newState : { ...newState, turnPhase: 'rotateTile' });
      });
    },
    [gameState, isAnimating, player, triggerFlash],
  );

  const handleSidePress = useCallback(
    (row: number, col: number, direction: Direction) => {
      if (isAnimating) return;

      if (gameState.turnPhase === 'moveToken') {
        handleTilePress(row, col);
      } else if (gameState.turnPhase === 'placePeg') {
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

  const isRotatePhase = gameState.turnPhase === 'rotateTile';

  const scores = computeScores(gameState);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.menuButton} onPress={() => setMenuOpen(true)}>
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
        </TouchableOpacity>
        <Text style={styles.roundsText}>
          {gameState.roundsRemaining} round{gameState.roundsRemaining !== 1 ? 's' : ''} remaining
        </Text>
      </View>

      <BoardView
        board={gameState.board}
        onSidePress={handleSidePress}
        onTilePress={gameState.turnPhase === 'moveToken' ? handleTilePress : undefined}
        flashTarget={flashTarget}
        highlightedTiles={highlightedTiles}
        tokens={tokens}
        animatingToken={animatingToken}
        rotatingTile={rotatingTile ?? undefined}
        pegHint={pegHint ?? undefined}
        battleHighlights={battleHighlights.length > 0 ? battleHighlights : undefined}
      />

      <View style={styles.turnArea}>
        {isRotatePhase ? (
          <View style={styles.rotateRow}>
            <TouchableOpacity
              style={styles.rotateBtn}
              onPress={() => handleRotate(false)}
              disabled={isAnimating}
            >
              <Text style={[styles.rotateIcon, { color: playerColor }]}>↺</Text>
            </TouchableOpacity>

            <View style={styles.turnCenter}>
              <Text style={[styles.turnText, { color: playerColor }]}>
                {playerName}'s turn
              </Text>
              <Text style={[styles.actionText, { color: playerColor }]}>
                Rotate tile
              </Text>
            </View>

            <TouchableOpacity
              style={styles.rotateBtn}
              onPress={() => handleRotate(true)}
              disabled={isAnimating}
            >
              <Text style={[styles.rotateIcon, { color: playerColor }]}>↻</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={[styles.turnText, { color: playerColor }]}>
              {playerName}'s turn
            </Text>
            <Text style={[styles.actionText, { color: playerColor }]}>
              {gameState.turnPhase === 'moveToken' ? 'Move token' : 'Place a peg'}
            </Text>
          </>
        )}
      </View>

      <View style={styles.scoreboard}>
        {players.map(p => (
          <View key={p} style={styles.scoreEntry}>
            <Text style={[styles.scoreLabel, { color: PLAYER_DISPLAY[p].color }]}>
              {PLAYER_DISPLAY[p].name}
            </Text>
            <Text style={[styles.scoreValue, { color: PLAYER_DISPLAY[p].color }]}>
              {scores[p]}
            </Text>
          </View>
        ))}
      </View>

      <Modal
        transparent
        visible={gameState.gameOver}
        animationType="fade"
      >
        <View style={styles.gameOverBackdrop}>
          <View style={styles.gameOverCard}>
            <Text style={styles.gameOverTitle}>Game Over</Text>
            <View style={styles.gameOverScores}>
              {[...players]
                .sort((a, b) => scores[b] - scores[a])
                .map((p, i) => (
                  <View key={p} style={styles.gameOverRow}>
                    <Text style={[styles.gameOverRank, { color: PLAYER_DISPLAY[p].color }]}>
                      {i + 1}.
                    </Text>
                    <Text style={[styles.gameOverName, { color: PLAYER_DISPLAY[p].color }]}>
                      {PLAYER_DISPLAY[p].name}
                    </Text>
                    <Text style={[styles.gameOverScore, { color: PLAYER_DISPLAY[p].color }]}>
                      {scores[p]} pts
                    </Text>
                  </View>
                ))}
            </View>
            <TouchableOpacity style={styles.gameOverBtn} onPress={onEndGame}>
              <Text style={styles.gameOverBtnText}>Back to Menu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roundsText: {
    color: COLORS.titleText,
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
    opacity: 0.9,
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
  rotateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  rotateBtn: {
    padding: 8,
  },
  rotateIcon: {
    fontSize: 36,
    lineHeight: 40,
  },
  turnCenter: {
    alignItems: 'center',
    gap: 6,
  },
  scoreboard: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  scoreEntry: {
    alignItems: 'center',
    gap: 2,
    minWidth: 56,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    opacity: 0.85,
  },
  scoreValue: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  gameOverBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameOverCard: {
    backgroundColor: COLORS.cornerWood,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.woodBorder,
    padding: 28,
    minWidth: 240,
    alignItems: 'center',
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 20,
  },
  gameOverTitle: {
    color: COLORS.titleText,
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 1,
  },
  gameOverScores: {
    width: '100%',
    gap: 10,
  },
  gameOverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  gameOverRank: {
    fontSize: 16,
    fontWeight: '700',
    width: 22,
  },
  gameOverName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  gameOverScore: {
    fontSize: 16,
    fontWeight: '700',
  },
  gameOverBtn: {
    backgroundColor: COLORS.woodBorder,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 28,
    marginTop: 4,
  },
  gameOverBtnText: {
    color: COLORS.titleText,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
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
