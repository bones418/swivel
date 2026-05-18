import React from 'react';
import { View } from 'react-native';
import { Side, Direction } from '../models/Side';
import { HoleView, PegAnimHint } from './HoleView';

export interface SidePegHint {
  holeIndex: number;
  hint: PegAnimHint;
}

interface Props {
  side: Side;
  tileSize: number;
  pegHint?: SidePegHint;
  battleHighlight?: boolean;
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

function battleOverlayStyle(direction: Direction, size: number) {
  const d = size * 0.28;
  switch (direction) {
    case 'top':    return { top: 0,    left: 0,  right: 0,  height: d };
    case 'bottom': return { bottom: 0, left: 0,  right: 0,  height: d };
    case 'left':   return { left: 0,   top: d,   bottom: d, width: d };
    case 'right':  return { right: 0,  top: d,   bottom: d, width: d };
  }
}

export function SideView({ side, tileSize, pegHint, battleHighlight }: Props) {
  const holeSize = Math.max(7, tileSize * 0.1);
  const positions = holePositions(side.direction, side.holes.length, tileSize, holeSize);

  return (
    <>
      {side.holes.map((hole, i) => (
        <View
          key={hole.index}
          style={{ position: 'absolute', left: positions[i].left, top: positions[i].top }}
        >
          <HoleView
            size={holeSize}
            peg={hole.peg}
            animHint={pegHint?.holeIndex === i ? pegHint.hint : undefined}
          />
        </View>
      ))}
      {battleHighlight && (
        <View
          pointerEvents="none"
          style={[
            { position: 'absolute', borderWidth: 2, borderColor: 'white' },
            battleOverlayStyle(side.direction, tileSize),
          ]}
        />
      )}
    </>
  );
}
