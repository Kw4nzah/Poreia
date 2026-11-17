// Text of the home-screen widget. Pure, so it can be tested without a device.

import { Church, CivilDate, DayInfo, DayOptions, getDayInfo } from '../calendar';
import { Messages, formatDayMonth } from '../i18n';

/** Name of the widget in app.json and in the widget task handler. */
export const FAST_WIDGET_NAME = 'PoreiaFast';

export interface WidgetProgress {
  /** "Day 3 of 40" in the app language. */
  text: string;
  day: number;
  total: number;
}

export interface WidgetContent {
  /** Weekday and date, e.g. "Tuesday · 17 November". */
  dateLine: string;
  /** The fast's name, or the rule itself when no named fast applies. */
  title: string;
  /** What is allowed today, in one line. */
  rule: string;
  /** The rest of the rule (fish, for instance); null when the title already said it. */
  detail: string | null;
  /** Position inside the current fasting period, if any. */
  progress: WidgetProgress | null;
  /** Names of today's feasts, joined; null on an ordinary day. */
  feast: string | null;
  /** False on a day without fasting; the widget colours the title accordingly. */
  fasting: boolean;
}

export function describeWidget(info: DayInfo, m: Messages): WidgetContent {
  const level = m.level[info.level];
  const heading = info.period
    ? m.period[info.period.id]
    : info.fastDay
      ? m.fastDay[info.fastDay]
      : null;
  return {
    dateLine: `${m.weekdays[info.weekday]} · ${formatDayMonth(m, info.date)}`,
    title: heading ?? level.title,
    rule: heading ? level.title : level.detail,
    detail: heading ? level.detail : null,
    progress: info.period
      ? {
          text: m.today.dayOf(info.period.day, info.period.totalDays),
          day: info.period.day,
          total: info.period.totalDays,
        }
      : null,
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
