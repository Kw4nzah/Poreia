// The words of a report: its heading and the plain-text summary the Share button hands to the
// system share sheet. Pure; all wording comes from the i18n layer.

import { formatDate } from '../i18n';
import type { Messages } from '../i18n';
import type { PeriodReport } from './report';

/** "Great Lent 2027". */
export function reportHeading(report: PeriodReport, m: Messages): string {
  return m.report.heading(m.majorFast[report.period.id], report.period.year);
}

/** "1 March 2027 – 17 April 2027". */
export function reportDates(report: PeriodReport, m: Messages): string {
  return `${formatDate(m, report.start)} – ${formatDate(m, report.end)}`;
}

/** A quiet summary as plain text: heading, dates, the count and one line per week. */
export function reportShareText(report: PeriodReport, m: Messages): string {
  const lines = [
    reportHeading(report, m),
    reportDates(report, m),
    '',
    `${m.report.count(report.markedDays, report.fastingDays)} (${m.report.percent(report.percent)})`,
  ];
  if (report.weeks.length > 1) {
    lines.push('');
    for (const week of report.weeks) {
      lines.push(`${m.report.week(week.index)}: ${week.markedDays}/${week.fastingDays}`);
    }
  }
  lines.push('', 'Poreia');
  return lines.join('\n');
}
