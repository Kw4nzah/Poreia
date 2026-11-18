// Page colours of the report: warm wine and old gold, both made from the theme's own tokens so the
// report follows light and dark like the rest of the app. Pure (no React), so contrast can be
// tested.

import type { Theme } from '../ui/theme';

export interface PagePalette {
  background: string;
  /** Large numbers and titles. */
  text: string;
  /** Secondary lines; still readable on the background. */
  muted: string;
  /** Bars and filled dots. */
  fill: string;
  /** The empty part of a bar and the ring of an unmarked dot. */
  track: string;
  /** Icons of the system status bar that read on this background. */
  statusBar: 'light' | 'dark';
}

function channels(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1, 7), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** `from` moved `amount` (0..1) of the way towards `to`, as `#RRGGBB`. */
export function mix(from: string, to: string, amount: number): string {
  const a = channels(from);
  const b = channels(to);
  const out = a.map((value, i) => Math.round(value + (b[i] - value) * amount));
  return (
    '#' +
    out
      .map((value) => value.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()
  );
}

/** WCAG contrast ratio of two `#RRGGBB` colours. */
export function contrast(foreground: string, background: string): number {
  const luminance = (hex: string) => {
    const [r, g, b] = channels(hex).map((v) => {
      const s = v / 255;
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [light, dark] = [luminance(foreground), luminance(background)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

export interface ReportPalettes {
  wine: PagePalette;
  gold: PagePalette;
}

export function reportPalettes(t: Theme): ReportPalettes {
  if (t.dark) {
    // On the dark theme the colour is a tint of the app's own dark background.
    const wineBg = mix(t.background, t.accent, 0.3);
    const goldBg = mix(t.background, t.feast, 0.26);
    return {
      wine: {
        background: wineBg,
        text: t.ink,
        muted: mix(t.ink, wineBg, 0.2),
        fill: t.accent,
        track: mix(wineBg, t.ink, 0.22),
        statusBar: 'light',
      },
      gold: {
        background: goldBg,
        text: t.ink,
        muted: mix(t.ink, goldBg, 0.2),
        fill: t.feast,
        track: mix(goldBg, t.ink, 0.22),
        statusBar: 'light',
      },
    };
  }
  return {
    wine: {
      background: t.accent,
      text: t.onAccent,
      muted: mix(t.onAccent, t.accent, 0.2),
      fill: t.feastSurface,
      track: mix(t.accent, t.onAccent, 0.28),
      statusBar: 'light',
    },
    gold: {
      background: t.feastSurface,
      text: t.accent,
      muted: mix(t.accent, t.feastSurface, 0.15),
      fill: t.accent,
      track: mix(t.feastSurface, t.accent, 0.22),
      statusBar: 'dark',
    },
  };
}
