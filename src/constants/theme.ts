import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const BOARD_PADDING = 20;
export const TILE_GAP = 6;
export const BOARD_SIZE = 4;

export const TILE_SIZE =
  (SCREEN_WIDTH - BOARD_PADDING * 2 - TILE_GAP * (BOARD_SIZE - 1)) / BOARD_SIZE;

export const COLORS = {
  // Tile wood tones (subtle distinction by type)
  cornerWood: '#BF7A35',
  edgeWood: '#C68642',
  middleWood: '#CF8E4F',

  // Shared wood detail
  woodBorder: '#7A4520',
  woodGrainDark: 'rgba(0,0,0,0.07)',
  woodGrainLight: 'rgba(255,200,100,0.12)',

  // Hole
  hole: '#1A0800',
  holeBorder: '#4A2010',

  // Board surface
  boardBg: '#2D1505',
  boardBorder: '#1A0A02',

  // Screen
  screenBg: '#160A02',
  titleText: '#E8C080',
};
