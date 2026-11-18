import { describe, expect, it, vi } from 'vitest';
import { CHURCHES, gregorianToJdn } from '../calendar';
import { LANGUAGES, MESSAGES } from '../i18n';
import { themes } from '../ui/theme';
import { contrast, mix, reportPalettes } from './palette';
import { getFastPeriod } from './periods';
import { buildReport } from './report';
import { reportDates, reportHeading, reportShareText } from './text';

vi.mock('react-native', () => ({ useColorScheme: () => 'light' }));

const lent = getFastPeriod('greatLent', 2027, CHURCHES.greek)!;
const report = buildReport(
  lent,
  new Set([lent.startJdn, lent.startJdn + 1, lent.startJdn + 2]),
  CHURCHES.greek,
  gregorianToJdn(2027, 9, 1),
);

describe('report text', () => {
  it('names the fast and its year', () => {
    expect(reportHeading(report, MESSAGES.en)).toBe('Great Lent 2027');
    expect(reportHeading(report, MESSAGES.tr)).toBe('Büyük Oruç 2027');
    expect(reportDates(report, MESSAGES.en)).toBe('15 March 2027 – 1 May 2027');
  });

  it('the share text is plain, has the count and one line per week', () => {
    const text = reportShareText(report, MESSAGES.en);
    const lines = text.split('\n');
    expect(lines[0]).toBe('Great Lent 2027');
    expect(text).toContain(`3 of ${report.fastingDays} days`);
    expect(text).toContain('Week 1: 3/7');
    expect(text).toContain('Week 7: 0/6');
    expect(lines.at(-1)).toBe('Poreia');
  });

  it.each(LANGUAGES)('%s wording is complete and the numbers appear', (language) => {
    const m = MESSAGES[language];
    for (const value of Object.values(m.report)) {
      if (typeof value === 'string') expect(value.trim()).not.toBe('');
    }
    expect(m.report.count(32, 41)).toContain('32');
    expect(m.report.count(32, 41)).toContain('41');
    expect(m.report.countOf(40)).toContain('40');
    expect(m.report.week(3)).toContain('3');
    expect(m.report.page(2, 5)).toMatch(/2/);
    expect(m.report.page(2, 5)).toMatch(/5/);
    expect(m.report.readyTitle(m.majorFast.greatLent)).toContain(m.majorFast.greatLent);
    expect(reportShareText(report, m)).toContain(m.majorFast.greatLent);
    // Calm tone: no streaks, no scores.
    const all = JSON.stringify(m.report).toLowerCase();
    for (const word of ['streak', 'badge', 'esenlik', 'seri ', 'рекорд']) {
      expect(all).not.toContain(word);
    }
  });

  it('Russian counts days in the right form', () => {
    expect(MESSAGES.ru.report.count(3, 41)).toBe('3 из 41 дня');
    expect(MESSAGES.ru.report.count(3, 40)).toBe('3 из 40 дней');
    expect(MESSAGES.ru.report.count(3, 22)).toBe('3 из 22 дней');
  });

  it('the marking labels exist in every language', () => {
    for (const language of LANGUAGES) {
      const { log, widget } = MESSAGES[language];
      for (const text of [log.mark, log.marked, log.markPast, log.markedPast, widget.complete]) {
        expect(text.trim()).not.toBe('');
      }
      expect(log.mark).not.toBe(log.marked);
      expect(widget.complete).not.toBe(widget.completed);
    }
    expect(MESSAGES.tr.log.mark).toBe('Bugün oruç tutuyorum');
    expect(MESSAGES.tr.log.marked).toBe('Oruç tutuyorum ✓');
    expect(MESSAGES.en.log.mark).toBe('I’m fasting today');
    expect(MESSAGES.ru.log.mark).toBe('Сегодня пощусь');
  });
});

describe('report palettes', () => {
  it.each([
    ['light', themes.light],
    ['dark', themes.dark],
  ])('%s: text and muted lines are readable on both page colours', (_name, theme) => {
    const { wine, gold } = reportPalettes(theme);
    for (const page of [wine, gold]) {
      expect(contrast(page.text, page.background)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(page.muted, page.background)).toBeGreaterThanOrEqual(4.5);
      // Bars and dots are graphics: 3:1 is the floor.
      expect(contrast(page.fill, page.background)).toBeGreaterThanOrEqual(3);
    }
    expect(wine.background).not.toBe(gold.background);
  });

  it('mixes colours', () => {
    expect(mix('#000000', '#FFFFFF', 0.5)).toBe('#808080');
    expect(mix('#102030', '#102030', 0.7)).toBe('#102030');
    expect(contrast('#000000', '#FFFFFF')).toBeCloseTo(21, 0);
  });
});
