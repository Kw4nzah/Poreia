// iCalendar (.ics) export of upcoming feasts and fasts as all-day events. Pure: the caller
// supplies the already translated names, so no user-facing text lives here.

import { CivilDate, gregorianToJdn, jdnToGregorian } from './dates';

export interface IcsEvent {
  /** Stable id, so importing the file twice updates events instead of duplicating them. */
  uid: string;
  date: CivilDate;
  summary: string;
}

const pad = (n: number, width = 2) => String(n).padStart(width, '0');

function ymd(d: CivilDate): string {
  return `${pad(d.year, 4)}${pad(d.month)}${pad(d.day)}`;
}

/** Escapes text per RFC 5545 section 3.3.11. */
export function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/** Folds a content line at 75 octets (UTF-8), continuing with a leading space. */
export function foldIcsLine(line: string): string {
  const encoder = new TextEncoder();
  const parts: string[] = [];
  let current = '';
  let bytes = 0;
  // The first line may carry 75 octets; continuation lines 74, because of the leading space.
  let limit = 75;
  for (const ch of line) {
    const size = encoder.encode(ch).length;
    if (bytes + size > limit) {
      parts.push(current);
      current = '';
      bytes = 0;
      limit = 74;
    }
    current += ch;
    bytes += size;
  }
  parts.push(current);
  return parts.join('\r\n ');
}

/** `stamp` is the creation time as `YYYYMMDDTHHMMSSZ`. */
export function buildIcs(events: readonly IcsEvent[], calendarName: string, stamp: string): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Poreia//Fasting calendar//EN',
    'CALSCALE:GREGORIAN',
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
  ];
  for (const event of events) {
    const { year, month, day } = event.date;
    const next = jdnToGregorian(gregorianToJdn(year, month, day) + 1);
    lines.push(
      'BEGIN:VEVENT',
      `UID:${event.uid}@poreia`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${ymd(event.date)}`,
      // All-day events end on the following day (exclusive end).
      `DTEND;VALUE=DATE:${ymd(next)}`,
      `SUMMARY:${escapeIcsText(event.summary)}`,
      'TRANSP:TRANSPARENT',
      'END:VEVENT',
    );
  }
  lines.push('END:VCALENDAR');
  return lines.map(foldIcsLine).join('\r\n') + '\r\n';
}
