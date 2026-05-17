import React from 'react';
import { View } from 'react-native';
import { Side, Direction } from '../models/Side';
import { HoleView } from './HoleView';

interface Props {
  side: Side;
  tileSize: number;
}

function holePositions(
  direction: Direction,
  count: number,
  tileSize: number,
  holeSize: number,
): Array<{ left: number; top: number }> {
  const hr = holeSize / 2;
  const cornerPad = tileSize * 0.18;
  const usable = tileSize - 2 * cornerPad;
  const fromEdge = 6;
  const borderWidth = 1.5;
  const contentSize = tileSize - 2 * borderWidth;

  return Array.from({ length: count }, (_, i) => {
    const along = cornerPad + (i + 0.5) * usable / count - hr;

    switch (direction) {
      case 'top':    return { left: along, top: fromEdge - hr };
      case 'bottom': return { left: along, top: contentSize - fromEdge - hr };
      case 'left':   return { left: fromEdge - hr,             top: along };
      case 'right':  return { left: contentSize - fromEdge - hr, top: along };
    }
  });
}

export function SideView({ side, tileSize }: Props) {
  const holeSize = Math.max(7, tileSize * 0.1);
  const positions = holePositions(side.direction, side.holes.length, tileSize, holeSize);

  return (
    <>
      {side.holes.map((hole, i) => (
        <View
          key={hole.index}
          style={{ position: 'absolute', left: positions[i].left, top: positions[i].top }}
        >
          <HoleView size={holeSize} peg={hole.peg} />
        </View>
      ))}
    </>
  );
}
