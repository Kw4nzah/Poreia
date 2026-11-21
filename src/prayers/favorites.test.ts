import { describe, expect, it } from 'vitest';
import { createBackup, parseBackup } from '../backup/backup';
import { defaultSettings, parseSettings } from '../settings/model';
import { PRAYER_IDS } from '.';
import {
  MAX_FAVORITE_PRAYERS,
  MAX_SCROLL_OFFSET,
  cleanFavoritePrayers,
  cleanPrayerBookmark,
  toggleFavoritePrayer,
} from './favorites';

describe('cleanFavoritePrayers', () => {
  it('keeps known ids once each, in order', () => {
    expect(cleanFavoritePrayers(['creed', 'morning', 'creed', 'lordsPrayer'])).toEqual([
      'creed',
      'morning',
      'lordsPrayer',
    ]);
  });
  it('maps the old single "meals" id to the lunch page, once', () => {
    expect(cleanFavoritePrayers(['meals', 'creed', 'mealsLunch'])).toEqual(['mealsLunch', 'creed']);
    expect(cleanPrayerBookmark({ id: 'meals', scroll: 40 })).toEqual({
      id: 'mealsLunch',
      scroll: 40,
    });
  });
  it('drops unknown ids and non-strings', () => {
    expect(cleanFavoritePrayers(['nope', 5, null, {}, ['creed'], 'creed', '__proto__'])).toEqual([
      'creed',
    ]);
  });
  it('returns an empty list for anything that is not an array', () => {
    for (const bad of [undefined, null, 'creed', 7, { 0: 'creed' }, true]) {
      expect(cleanFavoritePrayers(bad)).toEqual([]);
    }
  });
  it('is capped and cheap on a huge array', () => {
    const huge = Array.from({ length: 200_000 }, (_, i) => PRAYER_IDS[i % PRAYER_IDS.length]);
    expect(cleanFavoritePrayers(huge).length).toBeLessThanOrEqual(MAX_FAVORITE_PRAYERS);
  });
});

describe('toggleFavoritePrayer', () => {
  it('adds a prayer that is not there and removes one that is', () => {
    const added = toggleFavoritePrayer([], 'creed');
    expect(added).toEqual(['creed']);
    expect(toggleFavoritePrayer(added, 'morning')).toEqual(['creed', 'morning']);
    expect(toggleFavoritePrayer(['creed', 'morning'], 'creed')).toEqual(['morning']);
  });
  it('does not change the list it is given', () => {
    const list = ['creed'] as const;
    toggleFavoritePrayer(list, 'morning');
    expect(list).toEqual(['creed']);
  });
});

describe('cleanPrayerBookmark', () => {
  it('accepts a known prayer with a sane offset and rounds it', () => {
    expect(cleanPrayerBookmark({ id: 'creed', scroll: 120.6 })).toEqual({
      id: 'creed',
      scroll: 121,
    });
  });
  it('clamps and defaults the offset', () => {
    expect(cleanPrayerBookmark({ id: 'creed', scroll: -5 })?.scroll).toBe(0);
    expect(cleanPrayerBookmark({ id: 'creed', scroll: 1e12 })?.scroll).toBe(MAX_SCROLL_OFFSET);
    expect(cleanPrayerBookmark({ id: 'creed', scroll: Infinity })?.scroll).toBe(0);
    expect(cleanPrayerBookmark({ id: 'creed', scroll: '40' })?.scroll).toBe(0);
    expect(cleanPrayerBookmark({ id: 'creed' })?.scroll).toBe(0);
  });
  it('is cleared when the prayer no longer exists or the shape is wrong', () => {
    for (const bad of [
      { id: 'gone', scroll: 10 },
      null,
      undefined,
      'creed',
      [],
      5,
      { scroll: 3 },
    ]) {
      expect(cleanPrayerBookmark(bad)).toBeNull();
    }
  });
});

describe('in the settings', () => {
  it('defaults to no favourites and no bookmark', () => {
    const s = parseSettings(null, 'en');
    expect(s.favoritePrayers).toEqual([]);
    expect(s.lastPrayer).toBeNull();
  });
  it('reads stored values and survives corrupt ones', () => {
    const good = JSON.stringify({
      favoritePrayers: ['morning', 'bogus'],
      lastPrayer: { id: 'evening', scroll: 300 },
    });
    const s = parseSettings(good, 'en');
    expect(s.favoritePrayers).toEqual(['morning']);
    expect(s.lastPrayer).toEqual({ id: 'evening', scroll: 300 });
    const bad = parseSettings('{"favoritePrayers":"x","lastPrayer":{"id":{"a":1}}}', 'en');
    expect(bad.favoritePrayers).toEqual([]);
    expect(bad.lastPrayer).toBeNull();
  });
  it('does not share the default list between calls', () => {
    const a = defaultSettings('en');
    a.favoritePrayers.push('creed');
    expect(defaultSettings('en').favoritePrayers).toEqual([]);
  });
});

describe('in a backup', () => {
  const settings = {
    ...defaultSettings('en'),
    favoritePrayers: ['creed' as const, 'morning' as const],
    lastPrayer: { id: 'creed' as const, scroll: 50 },
  };
  it('carries the favourites but not the device-bound bookmark', () => {
    const parsed = parseBackup(createBackup(settings, []), 'en');
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.settings.favoritePrayers).toEqual(['creed', 'morning']);
    expect(parsed.settings.lastPrayer).toBeNull();
  });
  it('validates favourites it reads back', () => {
    const text = JSON.stringify({
      app: 'poreia',
      version: 1,
      settings: { favoritePrayers: ['creed', 'nope', 9, 'creed'], lastPrayer: { id: 'nope' } },
      done: [],
    });
    const parsed = parseBackup(text, 'en');
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.settings.favoritePrayers).toEqual(['creed']);
    expect(parsed.settings.lastPrayer).toBeNull();
  });
});

describe('feast prayers', () => {
  it('can be favourites, in the list and in the settings', () => {
    expect(cleanFavoritePrayers(['dormition', 'creed', 'pascha', 'dormition'])).toEqual([
      'dormition',
      'creed',
      'pascha',
    ]);
    expect(toggleFavoritePrayer(['creed'], 'theophany')).toEqual(['creed', 'theophany']);
    const s = parseSettings(
      JSON.stringify({ favoritePrayers: ['pascha', 'feasts', 'creed'] }),
      'en',
    );
    expect(s.favoritePrayers).toEqual(['pascha', 'creed']);
  });
  it('can be the bookmark; a group name is not a prayer', () => {
    expect(cleanPrayerBookmark({ id: 'annunciation', scroll: 80 })).toEqual({
      id: 'annunciation',
      scroll: 80,
    });
    expect(cleanPrayerBookmark({ id: 'feasts', scroll: 80 })).toBeNull();
    const s = parseSettings(JSON.stringify({ lastPrayer: { id: 'pentecost', scroll: 12 } }), 'en');
    expect(s.lastPrayer).toEqual({ id: 'pentecost', scroll: 12 });
  });
  it('survive a backup round trip', () => {
    const settings = { ...defaultSettings('en'), favoritePrayers: ['pascha' as const] };
    const parsed = parseBackup(createBackup(settings, []), 'en');
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.settings.favoritePrayers).toEqual(['pascha']);
  });
  it('raise the favourites cap to cover every prayer', () => {
    expect(MAX_FAVORITE_PRAYERS).toBe(PRAYER_IDS.length);
    expect(cleanFavoritePrayers(PRAYER_IDS)).toEqual([...PRAYER_IDS]);
  });
});
