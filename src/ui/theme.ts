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
  /** Cautions: a restrained terracotta. */
  warning: string;
  /** Errors: a deep red. */
  danger: string;
  /** Translucent surface of the floating tab bar (shows what scrolls under it). */
  glass: string;
  /** Hairline light edge of glass surfaces. */
  glassEdge: string;
  /** Fill of the selected tab in the bar. */
  pill: string;
}

// Palette (user's spec, 2026-11-18): muted wine for actions, sage for fast information, old gold
// for feasts, terracotta for warnings, dark red for errors.
const light: Theme = {
  dark: false,
  background: '#F7F4ED',
  surface: '#FFFEFA',
  line: '#DED8CD',
  ink: '#292521',
  muted: '#625B52',
  accent: '#713B45',
  onAccent: '#FFF8F0',
  free: '#78866B',
  feast: '#B18A4A',
  feastSurface: '#F1E7D2',
  warning: '#A65F46',
  danger: '#8E2A2A',
  glass: '#FFFEFA8C',
  glassEdge: '#FFFFFFB3',
  pill: '#713B4524',
};

const dark: Theme = {
  dark: true,
  background: '#171719',
  surface: '#222225',
  line: '#39373B',
  ink: '#F2EEE8',
  muted: '#C4BDB5',
  accent: '#D5A0A5',
  onAccent: '#2A1417',
  free: '#A9B99A',
  feast: '#D7B978',
  feastSurface: '#2F2B20',
  warning: '#D9A088',
  danger: '#E59A9A',
  glass: '#2222258C',
  glassEdge: '#FFFFFF2E',
  pill: '#D5A0A52E',
};

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? dark : light;
}

/** System serif (Noto Serif on Android) for titles; covers Latin and Cyrillic. */
export const SERIF = 'serif';

/** Corner radii: cards and panels are large and soft, fields a step smaller, pills fully round. */
export const radius = { card: 24, field: 16, pill: 999 } as const;

export const space = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 } as const;
