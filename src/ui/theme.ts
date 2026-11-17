import { useColorScheme } from 'react-native';

export interface Theme {
  dark: boolean;
  background: string;
  surface: string;
  line: string;
  ink: string;
  muted: string;
  /** Wine red: fasting days, primary actions. */
  accent: string;
  onAccent: string;
  /** Olive: fast-free days and permitted foods. */
  free: string;
  /** Gold: feasts. */
  feast: string;
  feastSurface: string;
  /** Translucent surface of the floating tab bar (shows what scrolls under it). */
  glass: string;
  /** Hairline light edge of glass surfaces. */
  glassEdge: string;
  /** Fill of the selected tab in the bar. */
  pill: string;
}

const light: Theme = {
  dark: false,
  background: '#F5EFE4',
  surface: '#FFFCF6',
  line: '#E3D8C6',
  ink: '#2A211C',
  muted: '#75695D',
  accent: '#7A1F2B',
  onAccent: '#FFF8F0',
  free: '#566534',
  feast: '#8C6A1F',
  feastSurface: '#F3E6C4',
  glass: '#FFFCF68C',
  glassEdge: '#FFFFFFB3',
  pill: '#7A1F2B1F',
};

const dark: Theme = {
  dark: true,
  background: '#161210',
  surface: '#211A17',
  line: '#3A2F29',
  ink: '#F0E7DB',
  muted: '#A99C8F',
  accent: '#E0959D',
  onAccent: '#2A0E13',
  free: '#B4C389',
  feast: '#DDBB6C',
  feastSurface: '#3A2E14',
  glass: '#211A178C',
  glassEdge: '#FFFFFF2E',
  pill: '#E0959D2B',
};

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? dark : light;
}

/** System serif (Noto Serif on Android) for titles; covers Latin and Cyrillic. */
export const SERIF = 'serif';

/** Corner radii: cards and panels are large and soft, fields a step smaller, pills fully round. */
export const radius = { card: 24, field: 16, pill: 999 } as const;

export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
