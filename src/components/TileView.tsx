import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Tile, TileType } from '../models/Tile';
import { Direction } from '../models/Side';
import { SideView } from './SideView';
import { COLORS } from '../constants/theme';

interface Props {
  tile: Tile;
  size: number;
}

const WOOD_COLOR: Record<TileType, string> = {
  corner: COLORS.cornerWood,
  edge:   COLORS.edgeWood,
  middle: COLORS.middleWood,
};

const DIRECTIONS: Direction[] = ['top', 'right', 'bottom', 'left'];

export function TileView({ tile, size }: Props) {
  const bg = WOOD_COLOR[tile.type];

  return (
    <View style={[styles.tile, { width: size, height: size, backgroundColor: bg }]}>
      {/* Subtle wood grain strips */}
      <View style={[styles.grain, styles.grainDark,  { top: size * 0.28 }]} />
      <View style={[styles.grain, styles.grainLight, { top: size * 0.55 }]} />
      <View style={[styles.grain, styles.grainDark,  { top: size * 0.76 }]} />

      {/* Holes for each side, absolutely positioned within this tile */}
      {DIRECTIONS.map((dir) => (
        <SideView key={dir} side={tile.sides[dir]} tileSize={size} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  tile: {
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: COLORS.woodBorder,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 3,
    elevation: 5,
  },
  grain: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1.5,
  },
  grainDark: {
    backgroundColor: COLORS.woodGrainDark,
  },
  grainLight: {
    backgroundColor: COLORS.woodGrainLight,
  },
});
