import { describe, expect, it, vi } from 'vitest';

vi.mock('react-native', () => ({ useColorScheme: () => 'light' }));
import { themes } from './theme';

function channel(v: number): number {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1, 7), 16);
  return 0.2126 * channel((n >> 16) & 255) + 0.7152 * channel((n >> 8) & 255) + 0.0722 * channel(n & 255);
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
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
  it('onAction on action >= 4.5', () => {
    expect(contrast(t.onAction, t.action)).toBeGreaterThanOrEqual(4.5);
  });
});
