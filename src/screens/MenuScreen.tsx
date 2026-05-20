import React from 'react';
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
  onStartGame: () => void;
}

export function MenuScreen({ onStartGame }: Props) {
  function handleExit() {
    if (Platform.OS === 'android') {
      BackHandler.exitApp();
    }
    // iOS doesn't allow programmatic exit
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SWIVEL</Text>
      <View style={styles.menu}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={onStartGame}
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
});
