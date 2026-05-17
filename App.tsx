import React, { useState } from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { MenuScreen } from './src/screens/MenuScreen';
import { GameScreen } from './src/screens/GameScreen';
import { COLORS } from './src/constants/theme';

type Screen = 'menu' | 'game';

export default function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [playerCount, setPlayerCount] = useState(2);

  function handleStartGame(count: number) {
    setPlayerCount(count);
    setScreen('game');
  }

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="light" />
      {screen === 'menu' ? (
        <MenuScreen onStartGame={handleStartGame} />
      ) : (
        <GameScreen
          playerCount={playerCount}
          onEndGame={() => setScreen('menu')}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.screenBg,
  },
});
