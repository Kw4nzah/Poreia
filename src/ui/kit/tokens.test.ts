import { describe, expect, it, vi } from 'vitest';

vi.mock('react-native', () => ({ useColorScheme: () => 'light' }));
import { radius, themes } from '../theme';
import {
  BadgeTone,
  ButtonSize,
  ButtonVariant,
  MIN_TARGET,
  badgeColors,
  buttonColors,
  buttonMetrics,
  cardStyle,
  controlState,
  segmentColors,
  withAlpha,
} from './tokens';

function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1, 7), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** `#RRGGBBAA` laid over an opaque `#RRGGBB`. */
function over(fg: string, bg: string): string {
  const alpha = fg.length === 9 ? parseInt(fg.slice(7, 9), 16) / 255 : 1;
  const [f, b] = [rgb(fg), rgb(bg)];
  const mixed = f.map((c, i) => Math.round(c * alpha + b[i] * (1 - alpha)));
  return '#' + mixed.map((c) => c.toString(16).padStart(2, '0')).join('');
}

function luminance(hex: string): number {
  const ch = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const [r, g, b] = rgb(hex);
  return 0.2126 * ch(r) + 0.7152 * ch(g) + 0.0722 * ch(b);
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const VARIANTS: ButtonVariant[] = ['primary', 'secondary', 'ghost', 'danger'];
const SIZES: ButtonSize[] = ['sm', 'md', 'lg'];
const TONES: BadgeTone[] = ['neutral', 'fast', 'free', 'feast', 'warning'];

describe('withAlpha', () => {
  it('appends the alpha byte', () => {
    expect(withAlpha('#7A1F2B', 1)).toBe('#7A1F2BFF');
    expect(withAlpha('#7A1F2B', 0)).toBe('#7A1F2B00');
    expect(withAlpha('#7A1F2B', 0.5)).toBe('#7A1F2B80');
  });
  it('clamps and ignores an existing alpha', () => {
    expect(withAlpha('#7A1F2B1F', 2)).toBe('#7A1F2BFF');
  });
});

describe('buttonMetrics', () => {
  it.each(SIZES)('%s keeps the 44dp target and the field radius', (size) => {
    const m = buttonMetrics(size);
    expect(m.minHeight).toBeGreaterThanOrEqual(MIN_TARGET);
    expect(m.borderRadius).toBe(radius.field);
  });
  it('grows from sm to lg', () => {
    expect(buttonMetrics('sm').minHeight).toBeLessThan(buttonMetrics('lg').minHeight);
    expect(buttonMetrics('sm').fontSize).toBeLessThan(buttonMetrics('lg').fontSize);
  });
});

describe.each([
  ['light', themes.light],
  ['dark', themes.dark],
])('%s theme', (_name, t) => {
  it.each(['primary', 'danger'] as const)(
    'filled %s button text has contrast >= 4.5',
    (variant) => {
      const c = buttonColors(t, variant);
      expect(contrast(c.text, c.background)).toBeGreaterThanOrEqual(4.5);
    },
  );

  it.each(['secondary', 'ghost'] as const)(
    '%s button text reads on surface and background',
    (variant) => {
      const c = buttonColors(t, variant);
      expect(contrast(c.text, t.surface)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(c.text, t.background)).toBeGreaterThanOrEqual(4.5);
    },
  );

  it.each(VARIANTS)('%s pressed overlay is a subtle one', (variant) => {
    const c = buttonColors(t, variant);
    expect(c.overlayOpacity).toBeGreaterThan(0);
    expect(c.overlayOpacity).toBeLessThanOrEqual(0.2);
  });

  it.each(['primary', 'danger'] as const)('%s press makes the fill darker', (variant) => {
    const c = buttonColors(t, variant);
    const pressed = over(withAlpha(c.overlay, c.overlayOpacity), c.background);
    expect(luminance(pressed)).toBeLessThan(luminance(c.background));
  });

  it.each(TONES)(
    '%s badge text has contrast >= 4.5 on its fill, over surface and background',
    (tone) => {
      const c = badgeColors(t, tone);
      for (const base of [t.surface, t.background]) {
        expect(contrast(c.text, over(c.background, base))).toBeGreaterThanOrEqual(4.5);
      }
    },
  );

  it('selected segment is the accent fill, the others are outlined', () => {
    expect(segmentColors(t, true)).toMatchObject({ background: t.accent, text: t.onAccent });
    expect(segmentColors(t, false)).toMatchObject({ background: 'transparent', border: t.outline });
    expect(contrast(segmentColors(t, true).text, t.accent)).toBeGreaterThanOrEqual(4.5);
  });

  it('card style follows the radius tokens', () => {
    expect(cardStyle(t)).toMatchObject({ borderRadius: radius.card, borderWidth: 1, padding: 24 });
    expect(cardStyle(t, 'md', 'field')).toMatchObject({ borderRadius: radius.field, padding: 16 });
    expect(cardStyle(t, 'none').padding).toBe(0);
    expect(cardStyle(t, 'lg', 'card', 'feast').backgroundColor).toBe(t.feastSurface);
  });
});

describe('controlState', () => {
  it('a loading control is busy and not pressable', () => {
    expect(controlState(false, true)).toEqual({ disabled: true, busy: true });
  });
  it('a disabled control is not busy', () => {
    expect(controlState(true, false)).toEqual({ disabled: true, busy: false });
  });
  it('an idle control is enabled', () => {
    expect(controlState(false, false)).toEqual({ disabled: false, busy: false });
  });
});
