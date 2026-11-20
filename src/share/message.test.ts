import { describe, expect, it } from 'vitest';
import { buildShareMessage } from './message';

describe('buildShareMessage', () => {
  it('adds one source line after the text', () => {
    expect(buildShareMessage('Our Father', 'Lord’s Prayer')).toBe(
      'Our Father\n\n— Lord’s Prayer · Poreia',
    );
  });
  it('trims and normalises line endings', () => {
    expect(buildShareMessage('  a\r\nb \n', ' X ')).toBe('a\nb\n\n— X · Poreia');
  });
  it('drops an empty source and handles empty text', () => {
    expect(buildShareMessage('a', '')).toBe('a\n\n— Poreia');
    expect(buildShareMessage('', 'X')).toBe('X · Poreia');
  });
});
