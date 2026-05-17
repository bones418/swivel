import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Board } from '../models/Board';
import { Direction } from '../models/Side';
import { TileView } from './TileView';
import { COLORS, TILE_SIZE, TILE_GAP, BOARD_PADDING } from '../constants/theme';

interface FlashTarget {
  row: number;
  col: number;
  key: number; // changes each time to re-trigger flash
}

interface Props {
  board: Board;
  onSidePress?: (row: number, col: number, direction: Direction) => void;
  flashTarget?: FlashTarget | null;
}

export function BoardView({ board, onSidePress, flashTarget }: Props) {
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
                  flashing={isFlashing}
                />
              </View>
            );
          })}
        </View>
      ))}
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
});
