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
