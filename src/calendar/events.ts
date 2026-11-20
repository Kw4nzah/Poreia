// The all-day events written to a calendar: feasts, the start of each major fast and every day
// of fasting with its rule. The ids come from the engine; the caller supplies the translations,
// so the same plan feeds both the .ics file and the phone's own calendar.

import type { Messages } from '../i18n';
import type { Church } from './churches';
import { CivilDate, gregorianToJdn, jdnToGregorian } from './dates';
import { getDayInfo } from './fasting';
import { UpcomingEvent, getUpcomingEvents } from './upcoming';

export interface CalendarEventPlan {
  /** Stable id of the event, unique within one plan. */
  uid: string;
  date: CivilDate;
  title: string;
  notes: string;
}

/** Enough for every feast and fast of a year with room to spare. */
export const MAX_UPCOMING_EVENTS = 400;
/** Length of the synced window, in days counted from today. */
export const SYNC_DAYS = 365;

const pad = (n: number) => String(n).padStart(2, '0');

function compact(date: CivilDate): string {
  return `${date.year}${pad(date.month)}${pad(date.day)}`;
}

/** Id shared by the .ics export and the phone calendar for a feast or the start of a fast. */
export function upcomingEventUid(event: UpcomingEvent): string {
  return `${event.kind}-${event.id}-${compact(event.date)}`;
}

/** Translated name of a feast or major fast. */
export function upcomingEventName(event: UpcomingEvent, m: Messages): string {
  return event.kind === 'feast' ? m.feast[event.id] : m.majorFast[event.id];
}

/** Feasts and the start of each major fast from `today` on, as events. */
export function buildUpcomingPlan(
  today: CivilDate,
  church: Church,
  m: Messages,
  horizonDays = SYNC_DAYS,
): CalendarEventPlan[] {
  const todayJdn = gregorianToJdn(today.year, today.month, today.day);
  // getUpcomingEvents starts strictly after its date; step back a day to include today.
  const from = jdnToGregorian(todayJdn - 1);
  return getUpcomingEvents(from, church, {
    limit: MAX_UPCOMING_EVENTS,
    horizonDays: horizonDays + 1,
  }).map((event) => ({
    uid: upcomingEventUid(event),
    date: event.date,
    title:
      event.kind === 'feast'
        ? upcomingEventName(event, m)
        : `${m.upcoming.kindFast}: ${upcomingEventName(event, m)}`,
    notes: '',
  }));
}

/** One event per day of fasting, titled with the rule of that day. */
export function buildFastDayPlan(
  today: CivilDate,
  church: Church,
  m: Messages,
  horizonDays = SYNC_DAYS,
): CalendarEventPlan[] {
  const todayJdn = gregorianToJdn(today.year, today.month, today.day);
  const plan: CalendarEventPlan[] = [];
  for (let offset = 0; offset <= horizonDays; offset++) {
    const date = jdnToGregorian(todayJdn + offset);
    const info = getDayInfo(date, church);
    if (info.level === 'none') continue;
    const level = m.level[info.level];
    const lines = [level.detail];
    if (info.fastDay) lines.push(m.fastDay[info.fastDay]);
    if (info.period) lines.push(m.period[info.period.id]);
    for (const note of info.notes) lines.push(m.note[note]);
    plan.push({
      uid: `fastday-${compact(date)}`,
      date,
      title: m.upcoming.fastDayTitle(level.title),
      notes: lines.join('\n'),
    });
  }
  return plan;
}

/** Everything the phone calendar gets for the next 12 months, in date order. */
export function buildPhoneCalendarPlan(
  today: CivilDate,
  church: Church,
  m: Messages,
): CalendarEventPlan[] {
  const key = (e: CalendarEventPlan) => gregorianToJdn(e.date.year, e.date.month, e.date.day);
  return [...buildUpcomingPlan(today, church, m), ...buildFastDayPlan(today, church, m)].sort(
    (a, b) => key(a) - key(b),
  );
}
