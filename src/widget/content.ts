// Text of the home-screen widget. Pure, so it can be tested without a device.

import { Church, CivilDate, DayInfo, DayOptions, getDayInfo } from '../calendar';
import { Messages, formatDayMonth } from '../i18n';

/** Name of the widget in app.json and in the widget task handler. */
export const FAST_WIDGET_NAME = 'PoreiaFast';

export interface WidgetProgress {
  /** "Day 3 of 40" in the app language (accessibility label). */
  text: string;
  day: number;
  total: number;
  /** Language-neutral position, "3 / 40". */
  counter: string;
  /** What remains, e.g. "37 days left" or "Last day". */
  left: string;
}

export interface WidgetContent {
  /** Weekday and date, e.g. "Tuesday · 17 November". */
  dateLine: string;
  /** The fast's name, or the level's title when no named fast applies. */
  title: string;
  /** Small line above the status: the fast's name, or the date on a day without fasting. */
  eyebrow: string;
  /** What is allowed today, in one line, e.g. "Wine and oil allowed". */
  status: string;
  /** One quiet line below: the fish note, what remains, or what the day allows. */
  note: string;
  /** The big number of the compact layout: the day in the fast, else the day of the month. */
  hero: { value: string; suffix: string };
  /** Weekday name, shown instead of the fast's name in the compact layout on a free day. */
  weekday: string;
  /** Position inside the current fasting period, if any. */
  progress: WidgetProgress | null;
  /** Names of today's feasts, joined; null on an ordinary day. */
  feast: string | null;
  /** False on a day without fasting; the widget colours it calmly instead of in wine. */
  fasting: boolean;
}

export function describeWidget(info: DayInfo, m: Messages): WidgetContent {
  const level = m.level[info.level];
  const heading = info.period
    ? m.period[info.period.id]
    : info.fastDay
      ? m.fastDay[info.fastDay]
      : null;
  const dateLine = `${m.weekdays[info.weekday]} · ${formatDayMonth(m, info.date)}`;
  const progress: WidgetProgress | null = info.period
    ? {
        text: m.today.dayOf(info.period.day, info.period.totalDays),
        day: info.period.day,
        total: info.period.totalDays,
        counter: `${info.period.day} / ${info.period.totalDays}`,
        left:
          info.period.day >= info.period.totalDays
            ? m.today.lastDay
            : m.today.daysLeft(info.period.totalDays - info.period.day),
      }
    : null;
  return {
    dateLine,
    title: heading ?? level.title,
    eyebrow: heading ?? dateLine,
    status: level.title,
    // On a day without fish the fish rule is what people ask; otherwise say what remains.
    note: info.level === 'oil' ? level.detail : (progress?.left ?? level.detail),
    hero: progress
      ? { value: String(progress.day), suffix: `/ ${progress.total}` }
      : { value: String(info.date.day), suffix: m.months[info.date.month - 1] },
    weekday: m.weekdays[info.weekday],
    progress,
    feast: info.feasts.length > 0 ? info.feasts.map((feast) => m.feast[feast]).join(' · ') : null,
    fasting: info.level !== 'none',
  };
}

/** Widget text for a date: runs the existing rule engine, then words the result. */
export function widgetContentFor(
  date: CivilDate,
  church: Church,
  m: Messages,
  options?: DayOptions,
): WidgetContent {
  return describeWidget(getDayInfo(date, church, options), m);
}
