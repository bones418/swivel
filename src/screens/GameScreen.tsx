import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Vibration,
} from 'react-native';
import { BoardView } from '../components/BoardView';
import { Direction } from '../models/Side';
import {
  GameState,
  createGame,
  currentPlayer,
  isSideValid,
  placePeg,
} from '../game/GameState';
import { PLAYER_DISPLAY } from '../constants/players';
import { COLORS } from '../constants/theme';

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
  const flashKeyRef = useRef(0);

  const player = currentPlayer(gameState);
  const { color: playerColor, name: playerName } = PLAYER_DISPLAY[player];

  const handleSidePress = useCallback(
    (row: number, col: number, direction: Direction) => {
      if (isSideValid(gameState, row, col, direction)) {
        setGameState(prev => placePeg(prev, row, col, direction));
      } else {
        // Invalid: vibrate + flash tile
        Vibration.vibrate(80);
        flashKeyRef.current += 1;
        setFlashTarget({ row, col, key: flashKeyRef.current });
        setTimeout(() => setFlashTarget(null), 600);
      }
    },
    [gameState],
  );

  return (
    <View style={styles.container}>
      {/* In-game menu button */}
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.menuButton} onPress={() => setMenuOpen(true)}>
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
          <View style={styles.hamburgerLine} />
        </TouchableOpacity>
      </View>

      {/* Board */}
      <BoardView
        board={gameState.board}
        onSidePress={handleSidePress}
        flashTarget={flashTarget}
      />

      {/* Turn indicator */}
      <View style={styles.turnArea}>
        <Text style={[styles.turnText, { color: playerColor }]}>
          {playerName}'s turn
        </Text>
        <Text style={[styles.actionText, { color: playerColor }]}>
          Place a peg
        </Text>
      </View>

      {/* In-game menu dropdown */}
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
