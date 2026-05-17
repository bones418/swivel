import React from 'react';
import { View, StyleSheet } from 'react-native';
import { PlayerColor, PLAYER_DISPLAY } from '../constants/players';
import { COLORS } from '../constants/theme';

interface Props {
  size: number;
  peg: PlayerColor | null;
}

export function HoleView({ size, peg }: Props) {
  return (
    <View
      style={[
        styles.hole,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      {peg !== null && (
        <View
          style={[
            styles.peg,
            {
              width: size * 0.65,
              height: size * 0.65,
              borderRadius: size * 0.325,
              backgroundColor: PLAYER_DISPLAY[peg].color,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  hole: {
    backgroundColor: COLORS.hole,
    borderWidth: 0.5,
    borderColor: COLORS.holeBorder,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 1,
    elevation: 3,
  },
  peg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 1,
    elevation: 2,
  },
});
