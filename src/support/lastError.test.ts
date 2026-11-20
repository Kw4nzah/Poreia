import { describe, expect, it } from 'vitest';
import { cleanErrorText, describeLastError, parseLastError, toLastError } from './lastError';

describe('last error', () => {
  it('keeps a short single-line text and hides long number runs', () => {
    expect(cleanErrorText('a\nb\u0000c   d')).toBe('a b c d');
    expect(cleanErrorText('id 1234567890 failed')).toBe('id # failed');
    expect(cleanErrorText('x'.repeat(500))).toHaveLength(160);
    expect(cleanErrorText(42)).toBe('');
  });

  it('turns anything thrown into a record', () => {
    const now = new Date('2026-11-20T19:14:43.000Z');
    expect(toLastError(new TypeError('boom'), now)).toEqual({
      at: '2026-11-20T19:14:43.000Z',
      name: 'TypeError',
      message: 'boom',
    });
    expect(toLastError(null, now).name).toBe('Error');
    expect(toLastError('just text', now).message).toBe('');
  });

  it('describes it on one line', () => {
    const e = toLastError(new RangeError('too big'), new Date('2026-11-20T19:14:43.000Z'));
    expect(describeLastError(e)).toBe('RangeError: too big (2026-11-20T19:14:43Z)');
  });

  it('reads stored text safely', () => {
    expect(parseLastError(null)).toBeNull();
    expect(parseLastError('{')).toBeNull();
    expect(parseLastError('{"at":"nope"}')).toBeNull();
    const stored = JSON.stringify({ at: '2026-11-20T19:14:43.000Z', name: 'E', message: 'm' });
    expect(parseLastError(stored)).toEqual({ at: '2026-11-20T19:14:43.000Z', name: 'E', message: 'm' });
  });
});
