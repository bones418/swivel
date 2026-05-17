import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  BackHandler,
  Platform,
} from 'react-native';
import { COLORS } from '../constants/theme';

interface Props {
  onStartGame: (playerCount: number) => void;
}

type MenuView = 'main' | 'player-select';

export function MenuScreen({ onStartGame }: Props) {
  const [view, setView] = useState<MenuView>('main');

  function handleExit() {
    if (Platform.OS === 'android') {
      BackHandler.exitApp();
    }
    // iOS doesn't allow programmatic exit
  }

  if (view === 'player-select') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>SWIVEL</Text>
        <Text style={styles.subtitle}>How many players?</Text>
        <View style={styles.playerOptions}>
          {[2, 3, 4].map((count) => (
            <TouchableOpacity
              key={count}
              style={styles.playerButton}
              onPress={() => onStartGame(count)}
              activeOpacity={0.7}
            >
              <Text style={styles.playerButtonText}>{count}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setView('main')}
          activeOpacity={0.7}
        >
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SWIVEL</Text>
      <View style={styles.menu}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setView('player-select')}
          activeOpacity={0.7}
        >
          <Text style={styles.menuButtonText}>Start Game</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.menuButton, styles.menuButtonSecondary]}
          onPress={handleExit}
          activeOpacity={0.7}
        >
          <Text style={[styles.menuButtonText, styles.menuButtonTextSecondary]}>
            Exit
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
  },
  title: {
    color: COLORS.titleText,
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: 12,
  },
  subtitle: {
    color: COLORS.titleText,
    fontSize: 20,
    fontWeight: '500',
    letterSpacing: 1,
    opacity: 0.85,
    marginBottom: -16,
  },
  menu: {
    gap: 16,
    width: 220,
  },
  menuButton: {
    backgroundColor: COLORS.cornerWood,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.woodBorder,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
  menuButtonSecondary: {
    backgroundColor: 'transparent',
    borderColor: COLORS.woodBorder,
    shadowOpacity: 0,
    elevation: 0,
  },
  menuButtonText: {
    color: COLORS.titleText,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 1,
  },
  menuButtonTextSecondary: {
    opacity: 0.6,
  },
  playerOptions: {
    flexDirection: 'row',
    gap: 16,
  },
  playerButton: {
    backgroundColor: COLORS.cornerWood,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.woodBorder,
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
  playerButtonText: {
    color: COLORS.titleText,
    fontSize: 28,
    fontWeight: '800',
  },
  backButton: {
    marginTop: -16,
    padding: 12,
  },
  backButtonText: {
    color: COLORS.titleText,
    fontSize: 15,
    opacity: 0.6,
    fontWeight: '500',
  },
});
