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
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

interface Props {
  onStartGame: () => void;
  onShowAuth: () => void;
}

export function MenuScreen({ onStartGame, onShowAuth }: Props) {
  const { session, username } = useAuth();

  function handleExit() {
    if (Platform.OS === 'android') {
      BackHandler.exitApp();
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SWIVEL</Text>

      {session && username && (
        <Text style={styles.welcomeText} numberOfLines={1}>
          Welcome {username}
        </Text>
      )}

      <View style={styles.menu}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={onStartGame}
          activeOpacity={0.7}
        >
          <Text style={styles.menuButtonText}>Start Game</Text>
        </TouchableOpacity>

        {session ? (
          <TouchableOpacity
            style={[styles.menuButton, styles.menuButtonSecondary]}
            onPress={() => supabase.auth.signOut()}
            activeOpacity={0.7}
          >
            <Text style={[styles.menuButtonText, styles.menuButtonTextSecondary]}>
              Sign Out
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.menuButton, styles.menuButtonSecondary]}
            onPress={onShowAuth}
            activeOpacity={0.7}
          >
            <Text style={[styles.menuButtonText, styles.menuButtonTextSecondary]}>
              Sign Up / Log In
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={handleExit}
          style={styles.exitLink}
          activeOpacity={0.7}
        >
          <Text style={styles.exitLinkText}>Exit</Text>
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
  welcomeText: {
    color: COLORS.titleText,
    fontSize: 13,
    opacity: 0.6,
    fontWeight: '500',
    marginTop: -24,
    maxWidth: 220,
    textAlign: 'center',
  },
  menu: {
    gap: 16,
    width: 220,
    alignItems: 'stretch',
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
  exitLink: {
    alignItems: 'center',
    paddingVertical: 8,
    marginTop: -4,
  },
  exitLinkText: {
    color: COLORS.titleText,
    fontSize: 14,
    opacity: 0.35,
    fontWeight: '500',
  },
});
