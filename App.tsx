import React, { useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { BoardView } from './src/components/BoardView';
import { createBoard } from './src/models/Board';
import { COLORS } from './src/constants/theme';

export default function App() {
  const board = useMemo(() => createBoard(), []);

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="light" />
      <Text style={styles.title}>SWIVEL</Text>
      <View style={styles.boardWrapper}>
        <BoardView board={board} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.screenBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: COLORS.titleText,
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 6,
    marginBottom: 32,
  },
  boardWrapper: {
    alignItems: 'center',
  },
});
