import { describe, expect, it } from 'vitest';
import { defaultSettings, parseSettings } from './model';

describe('parseSettings', () => {
  it('returns defaults in the device language when nothing is stored', () => {
    expect(parseSettings(null, 'tr')).toEqual(defaultSettings('tr'));
    expect(parseSettings(null, 'tr').onboarded).toBe(false);
  });

  it('round-trips stored settings', () => {
    const stored = { language: 'ru', name: 'Samuel', churchId: 'russian', onboarded: true };
    expect(parseSettings(JSON.stringify(stored), 'en')).toEqual(stored);
  });

  it('survives corrupt data', () => {
    expect(parseSettings('{not json', 'en')).toEqual(defaultSettings('en'));
    expect(parseSettings('"text"', 'en')).toEqual(defaultSettings('en'));
  });

  it('replaces invalid fields and asks the questions again without a valid church', () => {
    const raw = JSON.stringify({ language: 'xx', name: 5, churchId: 'unknown', onboarded: true });
    expect(parseSettings(raw, 'tr')).toEqual(defaultSettings('tr'));
  });
});
