// Text of the daily notification. Pure, so it can be tested without a device.

import {
  Church,
  CivilDate,
  DayInfo,
  DayOptions,
  getDayInfo,
  gregorianToJdn,
  jdnToGregorian,
} from '../calendar';
import type { Messages } from '../i18n';

export interface DailyNotification {
  date: CivilDate;
  title: string;
  body: string;
}

/** The rule goes in the title, so it can be read without expanding the notification. */
export function describeDay(info: DayInfo, m: Messages): { title: string; body: string } {
  const level = m.level[info.level];
  const lines = [level.detail];
  if (info.period) {
    const { day, totalDays } = info.period;
    lines.push(`${m.period[info.period.id]} · ${m.today.dayOf(day, totalDays)}`);
  } else if (info.fastDay) {
    lines.push(m.fastDay[info.fastDay]);
  }
  for (const feast of info.feasts) lines.push(m.feast[feast]);
  return { title: `${m.weekdays[info.weekday]} · ${level.title}`, body: lines.join('\n') };
}

/** One notification per day for `days` consecutive days, starting on `from`. */
export function planNotifications(
  from: CivilDate,
  days: number,
  church: Church,
  m: Messages,
  options?: DayOptions,
): DailyNotification[] {
  const start = gregorianToJdn(from.year, from.month, from.day);
  return Array.from({ length: days }, (_, i) => {
    const date = jdnToGregorian(start + i);
    return { date, ...describeDay(getDayInfo(date, church, options), m) };
  });
}

/** Repeats of the daily notification when "keep reminding me" is on. */
export const REPEAT_EVERY_MINUTES = 5;
export const REPEAT_COUNT = 6;
/** Only the first days get repeats, to keep the number of scheduled alarms small. */
export const REPEAT_DAYS = 14;

export interface ScheduledNotification {
  when: Date;
  title: string;
  body: string;
}

/**
 * Exact moments to schedule: each day at `hour` local time, plus repeats on the days after today when
 * `repeat` is on. Moments that are already past are left out. Opening the app counts as seeing
 * today's notification, and this runs on every open, so today never gets repeats.
 */
export function notificationTimes(
  plan: readonly DailyNotification[],
  hour: number,
  repeat: boolean,
  now: Date,
): ScheduledNotification[] {
  const today = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  const out: ScheduledNotification[] = [];
  plan.forEach(({ date, title, body }, index) => {
    const at = new Date(date.year, date.month - 1, date.day, hour, 0, 0);
    const times = [at];
    const isToday =
      date.year === today.year && date.month === today.month && date.day === today.day;
    if (repeat && !isToday && index + 1 <= REPEAT_DAYS) {
      for (let k = 1; k <= REPEAT_COUNT; k++) {
        times.push(new Date(at.getTime() + k * REPEAT_EVERY_MINUTES * 60 * 1000));
      }
    }
    for (const when of times) {
      if (when.getTime() > now.getTime()) out.push({ when, title, body });
    }
  });
  return out;
}
