import { describe, expect, it, vi } from 'vitest';

vi.mock('react-native', () => ({ useColorScheme: () => 'light' }));
import { themes } from './theme';

function channel(v: number): number {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1, 7), 16);
  return (
    0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255)
  );
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** `fg` at `alpha` laid over the opaque `bg`. */
function over(fg: string, alpha: number, bg: string): string {
  const f = parseInt(fg.slice(1, 7), 16);
  const b = parseInt(bg.slice(1, 7), 16);
  const mixed = [16, 8, 0].map((shift) => {
    const fc = (f >> shift) & 255;
    const bc = (b >> shift) & 255;
    return Math.round(fc * alpha + bc * (1 - alpha));
  });
  return '#' + mixed.map((v) => v.toString(16).padStart(2, '0')).join('');
}

describe.each([
  ['light', themes.light],
  ['dark', themes.dark],
])('%s theme contrast', (_name, t) => {
  for (const bg of ['surface', 'background'] as const) {
    for (const fg of ['ink', 'muted', 'accent', 'danger', 'warning'] as const) {
      it(`${fg} on ${bg} >= 4.5`, () => {
        expect(contrast(t[fg], t[bg])).toBeGreaterThanOrEqual(4.5);
      });
    }
    for (const fg of ['free', 'feast'] as const) {
      it(`${fg} on ${bg} >= 3`, () => {
        expect(contrast(t[fg], t[bg])).toBeGreaterThanOrEqual(3);
      });
    }
  }
  it('onAccent on accent >= 4.5', () => {
    expect(contrast(t.onAccent, t.accent)).toBeGreaterThanOrEqual(4.5);
  });
  it('onAccent on danger >= 4.5 (danger button)', () => {
    expect(contrast(t.onAccent, t.danger)).toBeGreaterThanOrEqual(4.5);
  });

  // Small text on the gold feast card and in the widget's gold and olive chips.
  for (const fg of ['ink', 'muted', 'feastInk', 'accent'] as const) {
    it(`${fg} on feastSurface >= 4.5`, () => {
      expect(contrast(t[fg], t.feastSurface)).toBeGreaterThanOrEqual(4.5);
    });
  }
  for (const bg of ['surface', 'background'] as const) {
    for (const fg of ['feastInk', 'freeInk'] as const) {
      it(`${fg} on ${bg} >= 4.5`, () => {
        expect(contrast(t[fg], t[bg])).toBeGreaterThanOrEqual(4.5);
      });
    }
    // Field borders, outlined buttons and unselected radio rings are UI components: 3:1.
    it(`outline on ${bg} >= 3`, () => {
      expect(contrast(t.outline, t[bg])).toBeGreaterThanOrEqual(3);
    });
  }
  it('freeInk on its 18% chip tint >= 4.5 (widget "no fast" chip)', () => {
    expect(contrast(t.freeInk, over(t.free, 0.18, t.surface))).toBeGreaterThanOrEqual(4.5);
  });
  it('accent on the 12% accent pill >= 4.5 (selected tab, widget chips)', () => {
    expect(contrast(t.accent, over(t.accent, 0.12, t.surface))).toBeGreaterThanOrEqual(4.5);
  });
  it('ink on every badge tint >= 4.5', () => {
    for (const base of [t.accent, t.free, t.warning]) {
      for (const bg of [t.surface, t.background]) {
        expect(contrast(t.ink, over(base, 0.14, bg))).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
  it('the switch thumb (onAccent) stands out from the accent track >= 3', () => {
    expect(contrast(t.onAccent, t.accent)).toBeGreaterThanOrEqual(3);
  });
  it('the food mark glyph (surface on free) >= 3', () => {
    expect(contrast(t.surface, t.free)).toBeGreaterThanOrEqual(3);
  });
});
