import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { MenuScreen } from './src/screens/MenuScreen';
import { GameScreen } from './src/screens/GameScreen';
import { AuthScreen } from './src/screens/AuthScreen';
import { COLORS } from './src/constants/theme';
import { PlayerColor } from './src/constants/players';

type Screen = 'menu' | 'game' | 'auth';

function AppNavigator() {
  const { loading } = useAuth();
  const [screen, setScreen] = useState<Screen>('menu');
  const [botColor, setBotColor] = useState<PlayerColor | null>(null);

  function handleStartBotGame() {
    const humanColor: PlayerColor = Math.random() < 0.5 ? 'red' : 'blue';
    setBotColor(humanColor === 'red' ? 'blue' : 'red');
    setScreen('game');
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.titleText} size="large" />
      </View>
    );
  }

  if (screen === 'game') {
    return (
      <GameScreen
        playerCount={2}
        onEndGame={() => { setBotColor(null); setScreen('menu'); }}
        botColor={botColor ?? undefined}
      />
    );
  }

  if (screen === 'auth') {
    return (
      <AuthScreen onBack={() => setScreen('menu')} onSuccess={() => setScreen('menu')} />
    );
  }

  return (
    <MenuScreen
      onStartGame={handleStartBotGame}
      onShowAuth={() => setScreen('auth')}
    />
  );
}

export default function App() {
  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="light" />
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.screenBg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
