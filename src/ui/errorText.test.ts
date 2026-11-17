import { describe, expect, it } from 'vitest';
import { ERROR_TEXT, errorTextFor } from './errorText';

describe('errorTextFor', () => {
  it('picks the device language', () => {
    expect(errorTextFor(['ru-RU'])).toBe(ERROR_TEXT.ru);
    expect(errorTextFor(['tr'])).toBe(ERROR_TEXT.tr);
  });
  it('falls back to English', () => {
    expect(errorTextFor([])).toBe(ERROR_TEXT.en);
    expect(errorTextFor(['de', null])).toBe(ERROR_TEXT.en);
  });
});
