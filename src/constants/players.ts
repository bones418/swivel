export type PlayerColor = 'red' | 'blue' | 'yellow' | 'green';

export const PLAYER_COLORS: PlayerColor[] = ['red', 'blue', 'yellow', 'green'];

// Colorblind-safe palette (distinguishable under deuteranopia/protanopia)
export const PLAYER_DISPLAY: Record<PlayerColor, { color: string; name: string }> = {
  red:    { color: '#CC3311', name: 'Red' },
  blue:   { color: '#0077BB', name: 'Blue' },
  yellow: { color: '#FFCC00', name: 'Yellow' },
  green:  { color: '#009E73', name: 'Green' },
};
