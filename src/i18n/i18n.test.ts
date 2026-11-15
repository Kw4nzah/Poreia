import { describe, expect, it } from 'vitest';
import { LANGUAGES, MESSAGES, formatDate, pickLanguage } from './index';
import { pluralRu } from './ru';

/** Every leaf of a dictionary, with functions called on sample arguments. */
function leaves(value: unknown, path: string, out: Map<string, string>): Map<string, string> {
  if (typeof value === 'string') {
    out.set(path, value);
  } else if (typeof value === 'function') {
    out.set(path, String(value(3, 'x', 2026)));
  } else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) leaves(child, `${path}.${key}`, out);
  }
  return out;
}

describe('dictionaries', () => {
  const reference = leaves(MESSAGES.en, 'en', new Map());

  it.each(LANGUAGES)('%s has every key with non-empty text', (language) => {
    const own = leaves(MESSAGES[language], 'en', new Map());
    expect([...own.keys()].sort()).toEqual([...reference.keys()].sort());
    for (const [path, text] of own) expect(text.trim(), path).not.toBe('');
  });

  it.each(LANGUAGES)('%s has 7 weekdays and 12 months', (language) => {
    expect(MESSAGES[language].weekdays).toHaveLength(7);
    expect(MESSAGES[language].months).toHaveLength(12);
  });
});

describe('pickLanguage', () => {
  it('takes the first supported device language', () => {
    expect(pickLanguage(['de', 'ru-RU', 'tr'])).toBe('ru');
    expect(pickLanguage(['tr_TR'])).toBe('tr');
  });

  it('falls back to English', () => {
    expect(pickLanguage(['el', null, undefined])).toBe('en');
    expect(pickLanguage([])).toBe('en');
  });
});

describe('formatting', () => {
  it('formats dates with the month name', () => {
    const date = { year: 2026, month: 11, day: 15 };
    expect(formatDate(MESSAGES.tr, date)).toBe('15 Kasım 2026');
    expect(formatDate(MESSAGES.ru, date)).toBe('15 ноября 2026');
  });

  it('picks Russian plural forms', () => {
    const form = (n: number) => pluralRu(n, 'день', 'дня', 'дней');
    expect([1, 2, 5, 11, 12, 21, 22, 25, 111].map(form)).toEqual([
      'день',
      'дня',
      'дней',
      'дней',
      'дней',
      'день',
      'дня',
      'дней',
      'дней',
    ]);
    expect(MESSAGES.ru.today.daysLeft(21)).toBe('Остался 21 день');
  });
});
