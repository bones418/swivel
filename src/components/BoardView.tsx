import React, { useMemo } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Board } from '../models/Board';
import { Direction } from '../models/Side';
import { PlayerColor, PLAYER_DISPLAY } from '../constants/players';
import { TileView } from './TileView';
import { TokenChip } from './TokenChip';
import { COLORS, TILE_SIZE, TILE_GAP, BOARD_PADDING, CHIP_SIZE } from '../constants/theme';

interface FlashTarget {
  row: number;
  col: number;
  key: number;
}

interface TileCoord {
  row: number;
  col: number;
}

export interface TokenInfo {
  player: PlayerColor;
  row: number;
  col: number;
}

export interface AnimatingToken {
  player: PlayerColor;
  pos: Animated.ValueXY;
}

interface Props {
  board: Board;
  onSidePress?: (row: number, col: number, direction: Direction) => void;
  onTilePress?: (row: number, col: number) => void;
  flashTarget?: FlashTarget | null;
  highlightedTiles?: TileCoord[];
  tokens?: TokenInfo[];
  animatingToken?: AnimatingToken;
}

// Top-left position of a chip within the board View's own coordinate space.
// Tiles start at BOARD_PADDING from the board View's origin (inside the border).
function chipTL(row: number, col: number) {
  return {
    left: BOARD_PADDING + col * (TILE_SIZE + TILE_GAP) + (TILE_SIZE - CHIP_SIZE) / 2,
    top:  BOARD_PADDING + row * (TILE_SIZE + TILE_GAP) + (TILE_SIZE - CHIP_SIZE) / 2,
  };
}

export function BoardView({
  board, onSidePress, onTilePress, flashTarget, highlightedTiles, tokens, animatingToken,
}: Props) {
  const tileSize = useMemo(() => TILE_SIZE, []);

  return (
    <View style={[styles.board, { padding: BOARD_PADDING }]}>
      {board.tiles.map((row, rowIndex) => (
        <View
          key={rowIndex}
          style={[styles.row, rowIndex > 0 && { marginTop: TILE_GAP }]}
        >
          {row.map((tile, colIndex) => {
            const isFlashing =
              flashTarget?.row === rowIndex && flashTarget?.col === colIndex;
            const isHighlighted = highlightedTiles?.some(
              t => t.row === rowIndex && t.col === colIndex
            ) ?? false;
            return (
              <View
                key={`${tile.row}-${tile.col}`}
                style={colIndex > 0 ? { marginLeft: TILE_GAP } : undefined}
              >
                <TileView
                  tile={tile}
                  size={tileSize}
                  onSidePress={
                    onSidePress
                      ? (dir) => onSidePress(rowIndex, colIndex, dir)
                      : undefined
                  }
                  onTilePress={
                    onTilePress
                      ? () => onTilePress(rowIndex, colIndex)
                      : undefined
                  }
                  flashing={isFlashing}
                  highlighted={isHighlighted}
                />
              </View>
            );
          })}
        </View>
      ))}

      {/* Static token chips — absolutely positioned within the board coordinate space */}
      {tokens?.map(t => (
        <View
          key={t.player}
          pointerEvents="none"
          style={[styles.tokenAbs, chipTL(t.row, t.col)]}
        >
          <TokenChip color={PLAYER_DISPLAY[t.player].color} />
        </View>
      ))}

      {/* Animated token chip — rendered only while a token is in motion */}
      {animatingToken && (
        <Animated.View
          pointerEvents="none"
          style={[styles.tokenAbs, { left: animatingToken.pos.x, top: animatingToken.pos.y }]}
        >
          <TokenChip color={PLAYER_DISPLAY[animatingToken.player].color} />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    backgroundColor: COLORS.boardBg,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.boardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 10,
  },
  row: {
    flexDirection: 'row',
  },
  tokenAbs: {
    position: 'absolute',
  },
});
