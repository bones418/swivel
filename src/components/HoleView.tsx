import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

interface Props {
  size: number;
}

export function HoleView({ size }: Props) {
  return (
    <View
      style={[
        styles.hole,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  hole: {
    backgroundColor: COLORS.hole,
    borderWidth: 0.5,
    borderColor: COLORS.holeBorder,
    // Inner-shadow illusion: elevation creates a slight pressed-in look
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 1,
    elevation: 3,
  },
});
