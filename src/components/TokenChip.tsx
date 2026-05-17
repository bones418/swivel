import React from 'react';
import { View } from 'react-native';
import { CHIP_SIZE } from '../constants/theme';

interface Props {
  color: string;
  size?: number;
}

export function TokenChip({ color, size = CHIP_SIZE }: Props) {
  const inner = size * 0.5;
  return (
    <View style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: color,
      borderWidth: size * 0.08,
      borderColor: 'rgba(255,255,255,0.65)',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.55,
      shadowRadius: 3,
      elevation: 8,
    }}>
      <View style={{
        width: inner,
        height: inner,
        borderRadius: inner / 2,
        borderWidth: size * 0.05,
        borderColor: 'rgba(255,255,255,0.35)',
      }} />
    </View>
  );
}
