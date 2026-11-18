import { useMemo } from 'react';
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
  /** Fill of the selected tab in the bar. */
  pill: string;
}

// Palette (user's spec, 2026-11-18). Backgrounds, cards and lines are the original warm brown tones
// (the spec's cool grey-blue dark read as "Twitter blue"); text, sage, gold and the status colours
// are the spec's. Wine for actions, sage for fast information, old gold
// for feasts, terracotta for warnings, dark red for errors.
const light: Theme = {
  dark: false,
  background: '#F5EFE4',
  surface: '#FFFCF6',
  line: '#E3D8C6',
  ink: '#292521',
  muted: '#625B52',
  accent: '#7A1F2B',
  onAccent: '#FFF8F0',
  free: '#78866B',
  feast: '#9E7835',
  feastSurface: '#F3E6C4',
  warning: '#9C5740',
  danger: '#8E2A2A',
  pill: '#7A1F2B1F',
};

const dark: Theme = {
  dark: true,
  background: '#161210',
  surface: '#211A17',
  line: '#3A2F29',
  ink: '#F2EEE8',
  muted: '#C4BDB5',
  accent: '#E0959D',
  onAccent: '#2A0E13',
  free: '#A9B99A',
  feast: '#D7B978',
  feastSurface: '#3A2E14',
  warning: '#D9A088',
  danger: '#E59A9A',
  pill: '#E0959D2B',
};

/** Both palettes, exported for tests. */
export const themes = { light, dark };

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? dark : light;
}

/** Styles built from the theme, rebuilt only when the theme changes (not on every render). `make` must be a module-level function. */
export function useThemedStyles<T>(make: (theme: Theme) => T): T {
  const theme = useTheme();
  return useMemo(() => make(theme), [make, theme]);
}

/** System serif (Noto Serif on Android) for titles; covers Latin and Cyrillic. */
export const SERIF = 'serif';

/**
 * Corner radii by size: cards, then fields and buttons a step smaller, then small tags. A shape
 * nested in another takes the outer radius minus the padding between them. `pill` is for round
 * things only (switch, radio).
 */
export const radius = { card: 16, field: 12, tag: 8, pill: 999 } as const;

export const space = { xs: 4, sm: 8, smd: 12, md: 16, lg: 24, xl: 32 } as const;

/**
 * Type scale (size / line height on a 4px grid). Spread into a style: `...type.body`.
 * Serif titles add `fontFamily: SERIF` themselves. Prayer text sizes are a user setting and stay separate.
 */
export const type = {
  caption: { fontSize: 13, lineHeight: 20 },
  label: { fontSize: 14, lineHeight: 20 },
  body: { fontSize: 16, lineHeight: 24 },
  bodyLarge: { fontSize: 17, lineHeight: 24 },
  headline: { fontSize: 18, lineHeight: 28 },
  title3: { fontSize: 20, lineHeight: 28 },
  title2: { fontSize: 24, lineHeight: 32 },
  title1: { fontSize: 30, lineHeight: 40 },
  hero: { fontSize: 34, lineHeight: 44 },
  display: { fontSize: 40, lineHeight: 48 },
} as const;
