import { describe, expect, it } from 'vitest';
import { defaultSettings, parseSettings } from './model';

describe('settings saved by older versions', () => {
  it('upgrades the first release (language, name, church, onboarded only) without losing them', () => {
    const old = JSON.stringify({
      language: 'tr',
      name: 'Maria',
      churchId: 'russian',
      onboarded: true,
    });
    expect(parseSettings(old, 'en')).toEqual({
      ...defaultSettings('en'),
      language: 'tr',
      name: 'Maria',
      churchId: 'russian',
      onboarded: true,
    });
  });

  it('upgrades settings from before saints and notification repeat existed', () => {
    const old = JSON.stringify({
      language: 'en',
      name: '',
      churchId: 'greek',
      onboarded: true,
      notifications: true,
      notificationHour: 12,
      prayerTextSize: 2,
    });
    expect(parseSettings(old, 'ru')).toMatchObject({
      notifications: true,
      notificationHour: 12,
      prayerTextSize: 2,
      notificationRepeat: false,
      saints: [],
      greekFish: defaultSettings('ru').greekFish,
    });
  });

  it('is idempotent: parsing what it produced changes nothing', () => {
    const raw = JSON.stringify({
      churchId: 'greek',
      onboarded: true,
      saints: [{ name: ' Nicholas ', topic: 'nope' }],
    });
    const once = parseSettings(raw, 'en');
    expect(parseSettings(JSON.stringify(once), 'ru')).toEqual(once);
  });

  it('does not let a stored __proto__ or constructor key change the result', () => {
    const raw =
      '{"__proto__":{"onboarded":true},"constructor":{"prototype":{"notifications":true}},"churchId":"greek"}';
    const parsed = parseSettings(raw, 'en');
    expect(parsed.onboarded).toBe(false);
    expect(parsed.notifications).toBe(false);
    expect(({} as Record<string, unknown>).onboarded).toBeUndefined();
  });

  it('falls back field by field, not all at once', () => {
    const raw = JSON.stringify({
      language: 'xx',
      name: 5,
      churchId: 'greek',
      onboarded: true,
      notificationHour: 25,
    });
    const parsed = parseSettings(raw, 'ru');
    expect(parsed.language).toBe('ru');
    expect(parsed.name).toBe('');
    expect(parsed.churchId).toBe('greek');
    expect(parsed.onboarded).toBe(true);
    expect(parsed.notificationHour).toBe(8);
  });

  it('survives a truncated write (half a JSON document)', () => {
    expect(parseSettings('{"language":"tr","name":"Ma', 'en')).toEqual(defaultSettings('en'));
  });
});
