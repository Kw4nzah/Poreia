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
    // A prayer's `note` exists only where its text needs one (the unreviewed Turkish feast hymns).
    // The table prayers follow a different published source in each language (Slavic, St Tikhon's,
    // Antiochian Greek), so their paragraph counts differ; their sections and titles are compared.
    const comparable = (key: string) =>
      !/^en\.prayers\.text\.\w+\.note$/.test(key) &&
      !/^en\.prayers\.text\.meals\w+\.sections\.\d+\.paragraphs\.\d+$/.test(key);
    expect([...own.keys()].filter(comparable).sort()).toEqual(
      [...reference.keys()].filter(comparable).sort(),
    );
    for (const [path, text] of own) {
      // Saint-request prayers are written by the app's author; empty until supplied.
      if (/^en\.saints\.topics\.[a-z]+\.prayer$/.test(path)) continue;
      expect(text.trim(), path).not.toBe('');
    }
  });

  it.each(LANGUAGES)('%s has 7 weekdays and 12 months', (language) => {
    expect(MESSAGES[language].weekdays).toHaveLength(7);
    expect(MESSAGES[language].months).toHaveLength(12);
  });
});

describe('placeholders and generated text', () => {
  const all = Object.fromEntries(
    LANGUAGES.map((language) => [language, leaves(MESSAGES[language], 'm', new Map())]),
  );

  it.each(LANGUAGES)(
    '%s has no broken placeholder, template or "undefined" in any text',
    (language) => {
      for (const [path, text] of all[language]) {
        // Takes a structured argument, so the sample call used here says nothing about its text.
        if (path === 'm.readings.service') continue;
        // The only placeholder is `{name}`; anything else with braces is a typo.
        const stripped = text.replaceAll('{name}', '');
        expect(stripped, path).not.toMatch(/[{}]/);
        expect(text, path).not.toMatch(/\$\{|undefined|NaN|\[object|null\b/);
      }
    },
  );

  it('writes {name} the same number of times in every language', () => {
    const count = (text: string) => text.split('{name}').length - 1;
    // Known gap for the owner: the Turkish health prayer lacks the closing line
    // "O holy {name}, pray to God for me" that the English and Russian texts end with.
    const knownGaps = new Set(['tr m.saints.topics.health.prayer']);
    for (const [path, english] of all.en) {
      for (const language of LANGUAGES) {
        const text = all[language].get(path);
        // A prayer still empty in one language is allowed (see the dictionary test above).
        if (!text || !english) continue;
        if (knownGaps.has(`${language} ${path}`)) {
          expect(count(text)).toBeLessThan(count(english));
          continue;
        }
        expect(count(text), `${language} ${path}`).toBe(count(english));
      }
    }
  });

  it('puts {name} in every saint prayer that has text', () => {
    for (const language of LANGUAGES) {
      for (const [path, text] of all[language]) {
        if (/\.saints\.topics\.[a-z]+\.prayer$/.test(path) && text.trim() !== '') {
          expect(text, `${language} ${path}`).toContain('{name}');
        }
      }
    }
  });

  it('generated texts carry their arguments (a day count says the number)', () => {
    for (const language of LANGUAGES) {
      const m = MESSAGES[language];
      expect(m.today.dayOf(7, 40)).toMatch(/7/);
      expect(m.today.dayOf(7, 40)).toMatch(/40/);
      expect(m.today.daysLeft(5)).toMatch(/5/);
      expect(m.today.startsIn(9)).toMatch(/9/);
      expect(m.today.greeting('Maria')).toContain('Maria');
      expect(m.today.greeting('')).not.toMatch(/,\s*$/);
      expect(m.widget.dayOfTotal(3, 40)).toMatch(/3/);
      expect(m.date(18, m.months[10], 2026)).toMatch(/18/);
    }
  });

  it('keeps the saint topics, prayers and church names complete in every language', () => {
    for (const language of LANGUAGES) {
      const m = MESSAGES[language];
      for (const topic of Object.values(m.saints.topics)) expect(topic.label.trim()).not.toBe('');
      for (const church of Object.values(m.church)) {
        expect(church.name.trim()).not.toBe('');
        expect(church.calendar.trim()).not.toBe('');
      }
    }
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
