import { describe, expect, it } from 'vitest';
import { CHURCHES, gregorianToJdn, paschaJdn } from '../calendar';
import { getFastPeriod } from './periods';
import { READY_WINDOW_DAYS, buildReport, listReports, pendingReport, reportFor } from './report';

const { greek, russian } = CHURCHES;
const jdn = (year: number, month: number, day: number) => gregorianToJdn(year, month, day);
const range = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);

const lent2027 = getFastPeriod('greatLent', 2027, greek)!;
const afterLent = jdn(2027, 9, 1);

describe('buildReport', () => {
  it('counts nothing when nothing is marked', () => {
    const report = buildReport(lent2027, new Set(), greek, afterLent);
    expect(report.markedDays).toBe(0);
    expect(report.percent).toBe(0);
    expect(report.fastingDays).toBeGreaterThan(30);
    expect(report.days.every((d) => d.state !== 'marked')).toBe(true);
    expect(report.ended).toBe(true);
  });

  it('counts the marked fasting days and rounds the percent', () => {
    const marked = new Set(range(lent2027.startJdn, lent2027.startJdn + 9));
    const report = buildReport(lent2027, marked, greek, afterLent);
    expect(report.markedDays).toBe(10);
    expect(report.percent).toBe(Math.round((10 / report.fastingDays) * 100));
    expect(report.days.filter((d) => d.state === 'marked')).toHaveLength(10);
  });

  it('a fully marked fast is 100 percent', () => {
    const all = new Set(range(lent2027.startJdn, lent2027.endJdn));
    const report = buildReport(lent2027, all, greek, afterLent);
    expect(report.markedDays).toBe(report.fastingDays);
    expect(report.percent).toBe(100);
  });

  it('ignores marks before and after the fast', () => {
    const outside = new Set([lent2027.startJdn - 1, lent2027.endJdn + 1, jdn(2026, 1, 1)]);
    const report = buildReport(lent2027, outside, greek, afterLent);
    expect(report.markedDays).toBe(0);
    expect(report.totalDays).toBe(48);
  });

  it('the day list covers the stretch day by day, without gaps', () => {
    const report = buildReport(lent2027, new Set(), greek, afterLent);
    expect(report.days).toHaveLength(report.totalDays);
    report.days.forEach((day, i) => expect(day.jdn).toBe(lent2027.startJdn + i));
  });

  it('a day without fasting is never counted, even when marked', () => {
    // Bright Week has no fasting at all: a stretch made of it has nothing to count.
    const pascha = paschaJdn(2027);
    const bright = { id: 'greatLent', year: 2027, startJdn: pascha, endJdn: pascha + 6 } as const;
    const report = buildReport(bright, new Set(range(pascha, pascha + 6)), greek, pascha + 30);
    expect(report.fastingDays).toBe(0);
    expect(report.markedDays).toBe(0);
    expect(report.percent).toBe(0);
    expect(report.days.every((d) => d.state === 'free')).toBe(true);
  });

  it('days after today are upcoming, not unmarked, and the fast is not ended', () => {
    const today = lent2027.startJdn + 9;
    const report = buildReport(lent2027, new Set([lent2027.startJdn]), greek, today);
    expect(report.started).toBe(true);
    expect(report.ended).toBe(false);
    expect(report.days.filter((d) => d.state === 'unmarked')).toHaveLength(9);
    expect(report.days.filter((d) => d.state === 'upcoming')).toHaveLength(48 - 10);
    // The percent is over all fasting days, so it only grows as the fast goes on.
    expect(report.percent).toBe(Math.round((1 / report.fastingDays) * 100));
  });

  it('today itself counts as a day that can be unmarked, and the last day ends the fast a day later', () => {
    const onLastDay = buildReport(lent2027, new Set(), greek, lent2027.endJdn);
    expect(onLastDay.ended).toBe(false);
    expect(onLastDay.days.at(-1)!.state).toBe('unmarked');
    expect(buildReport(lent2027, new Set(), greek, lent2027.endJdn + 1).ended).toBe(true);
  });

  it('a fast that has not begun is not started and has nothing unmarked', () => {
    const report = buildReport(lent2027, new Set(), greek, lent2027.startJdn - 1);
    expect(report.started).toBe(false);
    expect(report.days.every((d) => d.state === 'upcoming' || d.state === 'free')).toBe(true);
  });

  it('weeks are runs of seven days from the first day and add up to the totals', () => {
    const marked = new Set(range(lent2027.startJdn, lent2027.startJdn + 15));
    const report = buildReport(lent2027, marked, greek, afterLent);
    expect(report.weeks).toHaveLength(7); // 48 days: six full weeks and six more
    expect(report.weeks.map((w) => w.index)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(report.weeks.slice(0, 6).every((w) => w.days === 7)).toBe(true);
    expect(report.weeks[6].days).toBe(6);
    expect(report.weeks.reduce((sum, w) => sum + w.markedDays, 0)).toBe(report.markedDays);
    expect(report.weeks.reduce((sum, w) => sum + w.fastingDays, 0)).toBe(report.fastingDays);
    expect(report.weeks[0].markedDays).toBe(7);
    expect(report.weeks[2].markedDays).toBe(2);
    expect(report.weeks[3].markedDays).toBe(0);
  });

  it('a fast across New Year is read day by day without a break', () => {
    const fast = getFastPeriod('nativityFast', 2026, russian)!;
    const marked = new Set([jdn(2026, 12, 31), jdn(2027, 1, 1), jdn(2027, 1, 2)]);
    const report = buildReport(fast, marked, russian, jdn(2027, 2, 1));
    expect(report.start).toEqual({ year: 2026, month: 11, day: 28 });
    expect(report.end).toEqual({ year: 2027, month: 1, day: 6 });
    expect(report.totalDays).toBe(40);
    expect(report.markedDays).toBe(3);
    expect(report.ended).toBe(true);
  });

  it('a leap-year Great Lent has the extra day in its list', () => {
    const lent = getFastPeriod('greatLent', 2028, greek)!;
    const report = buildReport(lent, new Set([jdn(2028, 2, 29)]), greek, jdn(2028, 9, 1));
    expect(report.totalDays).toBe(48);
    expect(report.days[1].jdn).toBe(jdn(2028, 2, 29));
    expect(report.days[1].state).toBe('marked');
  });
});

describe('reportFor', () => {
  it('builds the report of a named fast', () => {
    const report = reportFor({ id: 'greatLent', year: 2027 }, new Set(), greek, afterLent);
    expect(report?.period.id).toBe('greatLent');
    expect(report?.period.year).toBe(2027);
  });

  it('has no report for a fast that has not begun (a link to next year, a far future year)', () => {
    const before = lent2027.startJdn - 1;
    expect(reportFor({ id: 'greatLent', year: 2027 }, new Set(), greek, before)).toBeNull();
    expect(reportFor({ id: 'greatLent', year: 2199 }, new Set(), greek, before)).toBeNull();
    // The first day of the fast is a report already.
    expect(
      reportFor({ id: 'greatLent', year: 2027 }, new Set(), greek, lent2027.startJdn),
    ).not.toBeNull();
  });
});

describe('listReports', () => {
  it('has nothing before a mark when only this year is in play and no fast has ended', () => {
    // 5 January 2026: the 2026 fasts have not begun.
    expect(listReports(new Set(), greek, jdn(2026, 1, 5))).toEqual([]);
  });

  it('lists ended fasts of this year, newest first, even without marks', () => {
    const reports = listReports(new Set(), greek, jdn(2026, 11, 18));
    // The Nativity Fast is under way and has no mark yet, so it is not listed (see below).
    expect(reports.map((r) => r.period.id)).toEqual(['dormitionFast', 'apostlesFast', 'greatLent']);
    for (let i = 1; i < reports.length; i++) {
      expect(reports[i].period.startJdn).toBeLessThan(reports[i - 1].period.startJdn);
    }
  });

  it('lists a fast under way once it has a mark', () => {
    const today = jdn(2026, 11, 18);
    const reports = listReports(new Set([jdn(2026, 11, 17)]), greek, today);
    expect(reports[0].period.id).toBe('nativityFast');
    expect(reports[0].ended).toBe(false);
    expect(reports[0].markedDays).toBe(1);
  });

  it('goes back to the earliest mark and no further', () => {
    const today = jdn(2027, 11, 18);
    const first = jdn(2026, 11, 20); // inside the Nativity Fast of 2026
    const reports = listReports(new Set([first]), greek, today);
    const oldest = reports.at(-1)!;
    expect(oldest.period.id).toBe('nativityFast');
    expect(oldest.period.year).toBe(2026);
    expect(oldest.markedDays).toBe(1);
    // Great Lent 2026 ended before the first mark.
    expect(reports.some((r) => r.period.id === 'greatLent' && r.period.year === 2026)).toBe(false);
  });

  it('keeps a Julian Nativity Fast of last year that ends after New Year', () => {
    const today = jdn(2027, 1, 3); // still inside it
    const reports = listReports(new Set([jdn(2026, 12, 1)]), russian, today);
    expect(reports[0]).toMatchObject({ ended: false });
    expect(reports[0].period).toMatchObject({ id: 'nativityFast', year: 2026 });
  });
});

describe('pendingReport', () => {
  const marks = new Set(range(lent2027.startJdn, lent2027.startJdn + 20));

  it('offers a fast that ended recently, has marks and has not been seen', () => {
    const today = lent2027.endJdn + 2;
    const pending = pendingReport(marks, new Set(), greek, today);
    expect(pending?.period).toMatchObject({ id: 'greatLent', year: 2027 });
  });

  it('is quiet while the fast is still going', () => {
    expect(pendingReport(marks, new Set(), greek, lent2027.endJdn)).toBeNull();
  });

  it('is quiet once seen, and once it is more than a month old', () => {
    const today = lent2027.endJdn + 2;
    expect(pendingReport(marks, new Set(['greatLent-2027']), greek, today)).toBeNull();
    expect(
      pendingReport(marks, new Set(), greek, lent2027.endJdn + READY_WINDOW_DAYS + 1),
    ).toBeNull();
    expect(
      pendingReport(marks, new Set(), greek, lent2027.endJdn + READY_WINDOW_DAYS),
    ).not.toBeNull();
  });

  it('is quiet when nothing was marked', () => {
    expect(pendingReport(new Set(), new Set(), greek, lent2027.endJdn + 2)).toBeNull();
  });

  it('finds a Julian Nativity Fast that ended in January of the next year', () => {
    const fast = getFastPeriod('nativityFast', 2026, russian)!;
    const done = new Set([fast.startJdn + 3]);
    const pending = pendingReport(done, new Set(), russian, jdn(2027, 1, 8));
    expect(pending?.period).toMatchObject({ id: 'nativityFast', year: 2026 });
  });
});
