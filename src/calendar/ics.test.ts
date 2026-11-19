import { describe, expect, it } from 'vitest';
import { buildIcs, escapeIcsText, foldIcsLine } from './ics';

describe('ics', () => {
  it('escapes special characters', () => {
    expect(escapeIcsText('a,b;c\\d\ne')).toBe('a\\,b\\;c\\\\d\\ne');
  });

  it('folds long lines at 75 octets without splitting characters', () => {
    const folded = foldIcsLine('SUMMARY:' + 'ш'.repeat(60));
    for (const part of folded.split('\r\n')) {
      expect(new TextEncoder().encode(part).length).toBeLessThanOrEqual(75);
    }
    expect(folded.replace(/\r\n /g, '')).toBe('SUMMARY:' + 'ш'.repeat(60));
  });

  it('builds all-day events with an exclusive end, across a month boundary', () => {
    const out = buildIcs(
      [
        {
          uid: 'feast-pascha-2027-05-02',
          date: { year: 2027, month: 5, day: 31 },
          summary: 'Pascha',
        },
      ],
      'Poreia',
      '20261119T100000Z',
    );
    expect(out.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(out.endsWith('END:VCALENDAR\r\n')).toBe(true);
    expect(out).toContain('DTSTART;VALUE=DATE:20270531\r\n');
    expect(out).toContain('DTEND;VALUE=DATE:20270601\r\n');
    expect(out).toContain('UID:feast-pascha-2027-05-02@poreia\r\n');
    expect(out).toContain('SUMMARY:Pascha\r\n');
  });
});
