import { describe, expect, it } from 'vitest';
import { cleanSaints, defaultSettings, parseSettings } from './model';

describe('parseSettings', () => {
  it('returns defaults in the device language when nothing is stored', () => {
    expect(parseSettings(null, 'tr')).toEqual(defaultSettings('tr'));
    expect(parseSettings(null, 'tr').onboarded).toBe(false);
  });

  it('round-trips stored settings', () => {
    const stored = {
      language: 'ru',
      name: 'Samuel',
      churchId: 'russian',
      onboarded: true,
      notifications: true,
      notificationHour: 12,
      notificationRepeat: true,
      prayerTextSize: 2,
      greekFish: 'greece',
      saints: [{ name: 'Nicholas', note: 'travellers' }],
    };
    expect(parseSettings(JSON.stringify(stored), 'en')).toEqual(stored);
  });

  it('keeps notifications off for settings saved before they existed', () => {
    const old = { language: 'ru', name: 'Samuel', churchId: 'russian', onboarded: true };
    const parsed = parseSettings(JSON.stringify(old), 'en');
    expect(parsed).toMatchObject({ ...old, notifications: false, notificationHour: 8 });
  });

  it('rejects an hour that is not offered', () => {
    const raw = JSON.stringify({ notifications: true, notificationHour: 3 });
    expect(parseSettings(raw, 'en').notificationHour).toBe(8);
  });

  it('falls back to the undecided fish rule when the stored one is unknown', () => {
    expect(parseSettings(JSON.stringify({ greekFish: 'x' }), 'en').greekFish).toBe('unsure');
    expect(parseSettings(JSON.stringify({ greekFish: 'studite' }), 'en').greekFish).toBe('studite');
  });

  it('falls back to the middle prayer text size when the stored one is invalid', () => {
    expect(parseSettings(JSON.stringify({ prayerTextSize: 7 }), 'en').prayerTextSize).toBe(1);
    expect(parseSettings(JSON.stringify({ prayerTextSize: 0 }), 'en').prayerTextSize).toBe(0);
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

describe('favorite saints', () => {
  it('defaults to none and drops malformed entries', () => {
    expect(parseSettings(null, 'en').saints).toEqual([]);
    const raw = JSON.stringify({
      saints: [
        { name: '  Nicholas ', note: ' travellers ' },
        { name: '' },
        5,
        { note: 'x' },
        { name: 'Seraphim' },
      ],
    });
    expect(parseSettings(raw, 'en').saints).toEqual([
      { name: 'Nicholas', note: 'travellers' },
      { name: 'Seraphim', note: '' },
    ]);
  });
  it('ignores a name added twice', () => {
    expect(
      cleanSaints([
        { name: 'Nicholas', note: '' },
        { name: 'nicholas', note: 'x' },
      ]),
    ).toHaveLength(1);
  });
  it('keeps at most five', () => {
    const many = Array.from({ length: 9 }, (_, i) => ({ name: 'S' + i, note: '' }));
    expect(cleanSaints(many)).toHaveLength(5);
  });
});

describe('notification repeat', () => {
  it('is off by default and only on for a real true', () => {
    expect(parseSettings(null, 'en').notificationRepeat).toBe(false);
    expect(
      parseSettings(JSON.stringify({ notificationRepeat: 'yes' }), 'en').notificationRepeat,
    ).toBe(false);
    expect(
      parseSettings(JSON.stringify({ notificationRepeat: true }), 'en').notificationRepeat,
    ).toBe(true);
  });
});
