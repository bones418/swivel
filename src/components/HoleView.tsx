import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { PlayerColor, PLAYER_DISPLAY } from '../constants/players';
import { COLORS } from '../constants/theme';

export type PegAnimHint = {
  mode: 'appear' | 'disappear';
  color: string;
  anim: Animated.Value;
};

interface Props {
  size: number;
  peg: PlayerColor | null;
  animHint?: PegAnimHint;
}

export function HoleView({ size, peg, animHint }: Props) {
  const pegSize = size * 0.65;
  const pegRadius = size * 0.325;

  const staticColor = peg !== null ? PLAYER_DISPLAY[peg].color : null;
  const showStatic = peg !== null && animHint?.mode !== 'disappear';

  return (
    <View style={[styles.hole, { width: size, height: size, borderRadius: size / 2 }]}>
      {showStatic && (
        <View style={[styles.peg, { width: pegSize, height: pegSize, borderRadius: pegRadius, backgroundColor: staticColor! }]} />
      )}
      {animHint && (
        <Animated.View
          style={[
            styles.peg,
            {
              width: pegSize,
              height: pegSize,
              borderRadius: pegRadius,
              backgroundColor: animHint.color,
              opacity: animHint.anim,
              position: 'absolute',
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
