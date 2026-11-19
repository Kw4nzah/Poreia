import { describe, expect, it } from 'vitest';
import { defaultSettings } from '../settings/model';
import {
  BACKUP_VERSION,
  MAX_BACKUP_CHARS,
  MAX_DONE_DAYS,
  cleanDoneDays,
  createBackup,
  isValidIsoDate,
  parseBackup,
  trimInvisible,
} from './backup';

const settings = {
  ...defaultSettings('ru'),
  name: 'Samuel',
  churchId: 'russian' as const,
  onboarded: true,
  notifications: true,
  eveReminder: true,
  persistentNotification: true,
  saints: [{ name: 'Nicholas', topic: 'travel' as const }],
};

const wrap = (extra: Record<string, unknown>) =>
  JSON.stringify({ app: 'poreia', version: BACKUP_VERSION, settings: {}, done: [], ...extra });

describe('isValidIsoDate', () => {
  it('accepts real days and rejects invented or oddly written ones', () => {
    expect(isValidIsoDate('2026-11-18')).toBe(true);
    expect(isValidIsoDate('2028-02-29')).toBe(true);
    for (const bad of [
      '2027-02-29',
      '2026-13-01',
      '2026-00-10',
      '2026-04-31',
      '2026-1-5',
      '2026-11-18T00:00',
      ' 2026-11-18',
      '1999-12-31',
      '2201-01-01',
      '',
      'poreia.done.2026-11-18',
      20261118,
      null,
      undefined,
      {},
    ]) {
      expect(isValidIsoDate(bad), String(bad)).toBe(false);
    }
  });
});

describe('createBackup and parseBackup', () => {
  it('round-trips settings and done days', () => {
    const text = createBackup(settings, ['2026-11-17', '2026-11-15']);
    expect(parseBackup(text, 'en')).toEqual({
      ok: true,
      settings,
      done: ['2026-11-15', '2026-11-17'],
    });
  });

  it('carries a version and the app name', () => {
    const data = JSON.parse(createBackup(settings, []));
    expect(data).toMatchObject({ app: 'poreia', version: 1, done: [] });
  });

  it('reads a backup pasted with a byte order mark, spaces or line breaks around it', () => {
    const text = createBackup(settings, ['2026-11-17']);
    for (const pasted of [`﻿${text}`, `  \n${text}\n\n`, `​${text}`, `﻿\n${text}`]) {
      expect(parseBackup(pasted, 'en'), JSON.stringify(pasted.slice(0, 4))).toMatchObject({
        ok: true,
        done: ['2026-11-17'],
      });
    }
  });

  it('is deterministic and survives parse then create', () => {
    const text = createBackup(settings, ['2026-11-17']);
    const parsed = parseBackup(text, 'en');
    if (!parsed.ok) throw new Error('expected ok');
    expect(createBackup(parsed.settings, parsed.done)).toBe(text);
  });

  it('keeps only the most recent days when a backup is made with too many', () => {
    const many = Array.from({ length: MAX_DONE_DAYS + 50 }, (_, i) => {
      const d = new Date(Date.UTC(2026, 0, 1 + i));
      return d.toISOString().slice(0, 10);
    });
    const parsed = parseBackup(createBackup(settings, many), 'en');
    if (!parsed.ok) throw new Error('expected ok');
    expect(parsed.done).toHaveLength(MAX_DONE_DAYS);
    expect(parsed.done.at(-1)).toBe(many.at(-1));
    expect(parsed.done[0]).toBe(many[50]);
  });

  it('keeps the whole thing well inside the size cap, even with the longest settings', () => {
    const big = {
      ...settings,
      name: 'x'.repeat(40),
      saints: Array.from({ length: 10 }, (_, i) => ({
        name: `${i}`.repeat(60),
        topic: '' as const,
      })),
    };
    const days = Array.from({ length: MAX_DONE_DAYS }, (_, i) =>
      new Date(Date.UTC(2024, 0, 1 + i)).toISOString().slice(0, 10),
    );
    expect(createBackup(big, days).length).toBeLessThan(MAX_BACKUP_CHARS);
    expect(parseBackup(createBackup(big, days), 'en').ok).toBe(true);
  });
});

describe('parseBackup rejects bad input without throwing', () => {
  it('empty input', () => {
    expect(parseBackup('', 'en')).toEqual({ ok: false, error: 'empty' });
    expect(parseBackup('   \n ', 'en')).toEqual({ ok: false, error: 'empty' });
    expect(parseBackup(undefined as unknown as string, 'en')).toEqual({
      ok: false,
      error: 'empty',
    });
  });

  it('garbage and truncated text', () => {
    for (const text of ['hello', '{', '{"app":"poreia"', createBackup(settings, []).slice(0, -3)]) {
      expect(parseBackup(text, 'en'), text).toEqual({ ok: false, error: 'invalid' });
    }
  });

  it('JSON that is not a backup', () => {
    for (const text of ['null', '42', '"poreia"', '[]', '{}', '{"app":"other","version":1}']) {
      expect(parseBackup(text, 'en'), text).toEqual({ ok: false, error: 'notBackup' });
    }
    // The stored settings alone (no wrapper) are not a backup either.
    expect(parseBackup(JSON.stringify(settings), 'en')).toEqual({ ok: false, error: 'notBackup' });
    expect(parseBackup('{"app":"poreia","version":"1"}', 'en')).toEqual({
      ok: false,
      error: 'notBackup',
    });
  });

  it('versions it does not know', () => {
    for (const version of [0, 2, 99, 1.5, -1]) {
      expect(parseBackup(wrap({ version }), 'en'), String(version)).toEqual({
        ok: false,
        error: 'version',
      });
    }
  });

  it('oversized input, before it is even parsed', () => {
    const big = wrap({ padding: 'x'.repeat(MAX_BACKUP_CHARS) });
    expect(big.length).toBeGreaterThan(MAX_BACKUP_CHARS);
    expect(parseBackup(big, 'en')).toEqual({ ok: false, error: 'tooLarge' });
    expect(parseBackup('['.repeat(1_000_000), 'en')).toEqual({ ok: false, error: 'tooLarge' });
  });

  it('too many done days', () => {
    const days = Array.from({ length: MAX_DONE_DAYS + 1 }, () => '2026-11-18');
    expect(parseBackup(wrap({ done: days }), 'en')).toEqual({ ok: false, error: 'tooLarge' });
  });

  it('a done list with any invalid entry', () => {
    for (const done of [
      ['2026-11-18', '2026-02-30'],
      ['2026-11-18', 20261118],
      ['2026-11-18', null],
      ['2026-11-18', { day: 1 }],
      ['poreia.done.2026-11-18'],
      ['2026-11-18<script>'],
      ['../../etc/passwd'],
    ]) {
      expect(parseBackup(wrap({ done }), 'en'), JSON.stringify(done)).toEqual({
        ok: false,
        error: 'invalid',
      });
    }
  });

  it('settings or done of the wrong shape', () => {
    for (const extra of [
      { settings: null },
      { settings: [] },
      { settings: 'x' },
      { done: 'x' },
      { done: {} },
      { done: null },
    ]) {
      expect(parseBackup(wrap(extra), 'en'), JSON.stringify(extra)).toEqual({
        ok: false,
        error: 'invalid',
      });
    }
    expect(parseBackup('{"app":"poreia","version":1}', 'en')).toEqual({
      ok: false,
      error: 'invalid',
    });
  });

  it('settings text over the settings cap', () => {
    const parsed = parseBackup(wrap({ settings: { name: 'x'.repeat(20_000) } }), 'en');
    expect(parsed).toEqual({ ok: false, error: 'tooLarge' });
  });
});

describe('parseBackup hardening', () => {
  it('runs settings through the same validation as stored settings', () => {
    const parsed = parseBackup(
      wrap({
        settings: {
          language: 'xx',
          name: ` \u0000Ma\nria ${'z'.repeat(100)}`,
          churchId: 'nope',
          onboarded: true,
          notificationHour: 3,
          prayerTextSize: 99,
          saints: [{ name: 'A', topic: 'bad' }, 'str', null, { name: '' }],
          unknown: 'dropped',
        },
      }),
      'tr',
    );
    if (!parsed.ok) throw new Error('expected ok');
    expect(parsed.settings.language).toBe('tr');
    expect(parsed.settings.churchId).toBe('greek');
    expect(parsed.settings.onboarded).toBe(false);
    expect(parsed.settings.notificationHour).toBe(8);
    expect(parsed.settings.name.length).toBeLessThanOrEqual(40);
    expect(parsed.settings.name).not.toMatch(/[\u0000\n]/);
    expect(parsed.settings.saints).toEqual([{ name: 'A', topic: '' }]);
    expect(parsed.settings).not.toHaveProperty('unknown');
  });

  it('ignores prototype pollution keys and does not touch Object.prototype', () => {
    const text =
      '{"app":"poreia","version":1,' +
      '"__proto__":{"app":"x","polluted":true},' +
      '"settings":{"__proto__":{"onboarded":true,"churchId":"russian"},' +
      '"constructor":{"prototype":{"polluted":true}},"prototype":{"polluted":true}},' +
      '"done":["2026-11-18"],"constructor":{"prototype":{"polluted":true}}}';
    const parsed = parseBackup(text, 'en');
    if (!parsed.ok) throw new Error('expected ok');
    expect(parsed.settings).toEqual(defaultSettings('en'));
    expect(parsed.done).toEqual(['2026-11-18']);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    expect(({} as Record<string, unknown>).onboarded).toBeUndefined();
    expect(Object.prototype).not.toHaveProperty('polluted');
  });

  it('does not read app, version, settings or done from the prototype chain', () => {
    // A top-level `__proto__` key is only an own property of the parsed object, never its prototype.
    const text = '{"__proto__":{"app":"poreia","version":1,"settings":{},"done":[]}}';
    expect(parseBackup(text, 'en')).toEqual({ ok: false, error: 'notBackup' });
  });

  it('never throws on hostile input', () => {
    const inputs: unknown[] = [
      null,
      undefined,
      42,
      {},
      '\u0000',
      '{"app":"poreia","version":1,"settings":{"saints":[[[[[[[[[[]]]]]]]]]]},"done":[]}',
      '{"a":'.repeat(20_000),
    ];
    for (const input of inputs) {
      expect(() => parseBackup(input as string, 'en')).not.toThrow();
    }
  });
});

describe('trimInvisible', () => {
  it('removes whitespace, zero-width characters and the byte order mark at both ends only', () => {
    expect(trimInvisible('﻿ ​\n{"a": 1}⁠ \r\n')).toBe('{"a": 1}');
    expect(trimInvisible('  a  b  ')).toBe('a  b');
    expect(trimInvisible('')).toBe('');
    expect(trimInvisible(' ​﻿ ')).toBe('');
  });

  it('is linear: a long run of spaces inside the text must not stall the paste box', () => {
    // The previous regular expression took seconds on this input (quadratic backtracking).
    const hostile = '{' + ' '.repeat(MAX_BACKUP_CHARS - 2) + 'x';
    const started = Date.now();
    expect(trimInvisible(hostile)).toBe(hostile);
    expect(parseBackup(hostile, 'en')).toEqual({ ok: false, error: 'invalid' });
    expect(Date.now() - started).toBeLessThan(250);
  });
});

describe('cleanDoneDays', () => {
  it('drops invalid entries, de-duplicates and sorts', () => {
    expect(cleanDoneDays(['2026-11-18', 'x', '2026-11-17', '2026-11-18', 5])).toEqual([
      '2026-11-17',
      '2026-11-18',
    ]);
    expect(cleanDoneDays('2026-11-18')).toEqual([]);
    expect(cleanDoneDays(null)).toEqual([]);
  });
});
