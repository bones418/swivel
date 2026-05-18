import React, { useMemo } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Board } from '../models/Board';
import { Direction } from '../models/Side';
import { PlayerColor, PLAYER_DISPLAY } from '../constants/players';
import { TileView, TilePegHint } from './TileView';
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

export interface RotatingTileInfo {
  row: number;
  col: number;
  rotationDeg: Animated.AnimatedInterpolation<string>;
}

export interface BoardPegHint {
  tileRow: number;
  tileCol: number;
  hint: TilePegHint;
}

export interface BoardBattleHighlight {
  tileRow: number; tileCol: number; tileDir: Direction;
  neighborRow: number; neighborCol: number;
}

// Computes a board-relative bounding rect that wraps all holes on both sides
// of a battle pair. Mirrors the hole-position constants in SideView.
function battleRect(h: BoardBattleHighlight): { top: number; left: number; width: number; height: number } {
  const holeSize = Math.max(7, TILE_SIZE * 0.1);
  const hr = holeSize / 2;
  const fromEdge = 6;
  const borderWidth = 1.5;
  const cornerPad = TILE_SIZE * 0.18;
  const PAD = 6;

  const { tileRow, tileCol, tileDir, neighborRow, neighborCol } = h;

  if (tileDir === 'top' || tileDir === 'bottom') {
    const topRow = tileDir === 'top' ? neighborRow : tileRow;
    const botRow = tileDir === 'top' ? tileRow     : neighborRow;
    const col    = tileCol;

    const top    = BOARD_PADDING + topRow * (TILE_SIZE + TILE_GAP) + TILE_SIZE - borderWidth - fromEdge - hr - PAD;
    const bottom = BOARD_PADDING + botRow * (TILE_SIZE + TILE_GAP) + borderWidth + fromEdge + hr + PAD;
    const left   = BOARD_PADDING + col   * (TILE_SIZE + TILE_GAP) + cornerPad - hr - PAD;
    const right  = BOARD_PADDING + col   * (TILE_SIZE + TILE_GAP) + TILE_SIZE - cornerPad + hr + PAD;
    return { top, left, width: right - left, height: bottom - top };
  } else {
    const leftCol  = tileDir === 'right' ? tileCol     : neighborCol;
    const rightCol = tileDir === 'right' ? neighborCol : tileCol;
    const row      = tileRow;

    const left   = BOARD_PADDING + leftCol  * (TILE_SIZE + TILE_GAP) + TILE_SIZE - borderWidth - fromEdge - hr - PAD;
    const right  = BOARD_PADDING + rightCol * (TILE_SIZE + TILE_GAP) + borderWidth + fromEdge + hr + PAD;
    const top    = BOARD_PADDING + row      * (TILE_SIZE + TILE_GAP) + cornerPad - hr - PAD;
    const bottom = BOARD_PADDING + row      * (TILE_SIZE + TILE_GAP) + TILE_SIZE - cornerPad + hr + PAD;
    return { top, left, width: right - left, height: bottom - top };
  }
}

interface Props {
  board: Board;
  onSidePress?: (row: number, col: number, direction: Direction) => void;
  onTilePress?: (row: number, col: number) => void;
  flashTarget?: FlashTarget | null;
  highlightedTiles?: TileCoord[];
  tokens?: TokenInfo[];
  animatingToken?: AnimatingToken;
  rotatingTile?: RotatingTileInfo;
  pegHint?: BoardPegHint;
  battleHighlights?: BoardBattleHighlight[];
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
  rotatingTile, pegHint, battleHighlights,
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
            const isRotating =
              rotatingTile?.row === rowIndex && rotatingTile?.col === colIndex;
            const tilePegHint =
              pegHint?.tileRow === rowIndex && pegHint?.tileCol === colIndex
                ? pegHint.hint
                : undefined;

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
                  rotationDeg={isRotating ? rotatingTile!.rotationDeg : undefined}
                  pegHint={tilePegHint}
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

      {/* Battle highlight — one rect per battle pair, spanning both sides */}
      {battleHighlights?.map((h, i) => {
        const r = battleRect(h);
        return (
          <View
            key={i}
            pointerEvents="none"
            style={{
              position: 'absolute',
              top: r.top, left: r.left,
              width: r.width, height: r.height,
              borderWidth: 2.5, borderColor: 'white',
              borderRadius: 4,
            }}
          />
        );
      })}
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
