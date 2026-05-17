import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Tile, TileType } from '../models/Tile';
import { Direction } from '../models/Side';
import { SideView } from './SideView';
import { COLORS } from '../constants/theme';

interface Props {
  tile: Tile;
  size: number;
  onSidePress?: (direction: Direction) => void;
  onTilePress?: () => void;
  flashing?: boolean;
  highlighted?: boolean;
}

const WOOD_COLOR: Record<TileType, string> = {
  corner: COLORS.cornerWood,
  edge:   COLORS.edgeWood,
  middle: COLORS.middleWood,
};

const DIRECTIONS: Direction[] = ['top', 'right', 'bottom', 'left'];

// Each side strip covers 28% of tile size along the perpendicular axis,
// anchored to its edge. Left/right strips inset top/bottom by 28% so
// corner overlaps go to top/bottom.
const SIDE_HIT_RATIO = 0.28;

function sideHitStyle(direction: Direction, size: number) {
  const d = size * SIDE_HIT_RATIO;
  switch (direction) {
    case 'top':    return { top: 0,    left: 0,  right: 0,  height: d };
    case 'bottom': return { bottom: 0, left: 0,  right: 0,  height: d };
    case 'left':   return { left: 0,   top: d,   bottom: d, width: d };
    case 'right':  return { right: 0,  top: d,   bottom: d, width: d };
  }
}

export function TileView({ tile, size, onSidePress, onTilePress, flashing, highlighted }: Props) {
  const bg = WOOD_COLOR[tile.type];
  const flashAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!flashing) return;
    // Two pulses of soft red overlay
    Animated.sequence([
      Animated.timing(flashAnim, { toValue: 1, duration: 80,  useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 1, duration: 80,  useNativeDriver: true }),
      Animated.timing(flashAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start();
  }, [flashing]);

  return (
    <View style={[styles.tile, { width: size, height: size, backgroundColor: bg }]}>
      {/* Wood grain */}
      <View style={[styles.grain, styles.grainDark,  { top: size * 0.28 }]} />
      <View style={[styles.grain, styles.grainLight, { top: size * 0.55 }]} />
      <View style={[styles.grain, styles.grainDark,  { top: size * 0.76 }]} />

      {/* Holes */}
      {DIRECTIONS.map((dir) => (
        <SideView key={dir} side={tile.sides[dir]} tileSize={size} />
      ))}

      {/* Full-tile press — rendered first so side strips take precedence over it */}
      {onTilePress && (
        <TouchableOpacity
          activeOpacity={0.2}
          style={StyleSheet.absoluteFill}
          onPress={onTilePress}
        />
      )}

      {/* Touchable strips, one per side */}
      {onSidePress && DIRECTIONS.map((dir) => (
        <TouchableOpacity
          key={dir}
          activeOpacity={0.3}
          style={[styles.sideHit, sideHitStyle(dir, size)]}
          onPress={() => onSidePress(dir)}
        />
      ))}

      {/* Flash overlay */}
      <Animated.View
        pointerEvents="none"
        style={[styles.flashOverlay, { opacity: flashAnim }]}
      />

      {/* Green highlight overlay (static, for valid move targets) */}
      {highlighted && (
        <View pointerEvents="none" style={styles.highlightOverlay} />
      )}
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
  sideHit: {
    position: 'absolute',
  },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(220, 50, 50, 0.45)',
  },
  highlightOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(60, 200, 80, 0.45)',
  },
});
