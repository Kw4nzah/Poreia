// Text of the home-screen widget. Pure, so it can be tested without a device.

import {
  Church,
  ChurchId,
  CivilDate,
  DayInfo,
  DayOptions,
  FOOD_IDS,
  getDayInfo,
  isFoodAllowed,
} from '../calendar';
import { getCommemoration, readingReference, type Reading } from '../commemorations';
import { Language, MESSAGES, Messages, formatDayMonth } from '../i18n';

/** Name of the widget in app.json and in the widget task handler. */
export const FAST_WIDGET_NAME = 'PoreiaFast';
/** Name of the 4x1 strip widget in app.json and in the widget task handler. */
export const STRIP_WIDGET_NAME = 'PoreiaStrip';

export interface WidgetProgress {
  /** "Day 3 of 40" in the app language (accessibility label). */
  text: string;
  day: number;
  total: number;
  /** Wide badge, e.g. "35 / 40. Gün". */
  badge: string;
  /** Compact badge, e.g. "35. Gün". */
  badgeShort: string;
  /** Whole percent of the period passed, 0-100. */
  percent: number;
  /** The percent in the app language, e.g. "%88". */
  percentText: string;
}

export interface WidgetLabels {
  allowed: string;
  avoided: string;
  complete: string;
  completed: string;
  noFast: string;
}

export interface WidgetContent {
  /** Weekday and date, e.g. "Tuesday · 17 November". */
  dateLine: string;
  /** The fast's name; on a day without fasting the weekday. */
  title: string;
  /** Weekday name. */
  weekday: string;
  /** What the day allows, in full (accessibility label). */
  status: string;
  /** One short phrase for the compact layout, e.g. "No Meat & Dairy". */
  levelShort: string;
  /** What the day allows, in a sentence, for the calm layout of a day without fasting. */
  calmNote: string;
  /** Permitted foods, comma separated, for the "allowed" column. */
  allowedFoods: string;
  /** Restricted foods, comma separated, for the "avoided" column. */
  avoidedFoods: string;
  /** Position inside the current fasting period, if any. */
  progress: WidgetProgress | null;
  /** Names of today's feasts, joined; null on an ordinary day. */
  feast: string | null;
  /** Reference of the day's main reading ("Matta 6:16-18"), without verse text. */
  reading: string | null;
  /** False on a day without fasting; the widget colours it calmly instead of in wine. */
  fasting: boolean;
  labels: WidgetLabels;
}

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/**
 * The reading to show in one line: the Gospel first, then the Epistle, then whatever the day
 * has (on Lenten weekdays only the Vespers readings). Null when there is none.
 */
export function pickReading(readings: readonly Reading[], language: Language): string | null {
  const ordered = [
    ...readings.filter((r) => r.kind === 'gospel'),
    ...readings.filter((r) => r.kind === 'epistle'),
    ...readings.filter((r) => r.kind !== 'gospel' && r.kind !== 'epistle'),
  ];
  for (const reading of ordered) {
    const reference = readingReference(reading, language);
    if (reference) return reference;
  }
  return null;
}

export function describeWidget(
  info: DayInfo,
  m: Messages,
  reading: string | null = null,
): WidgetContent {
  const level = m.level[info.level];
  const heading = info.period
    ? m.period[info.period.id]
    : info.fastDay
      ? m.fastDay[info.fastDay]
      : null;
  const fasting = info.level !== 'none';
  const dateLine = `${m.weekdays[info.weekday]} · ${formatDayMonth(m, info.date)}`;
  // A period without fasting (Svyatki, Bright Week) is a calm day: no counter, no bar.
  const progress: WidgetProgress | null = fasting && info.period
    ? (() => {
        const { day, totalDays } = info.period;
        const percent = Math.round((day / totalDays) * 100);
        return {
          text: m.today.dayOf(day, totalDays),
          day,
          total: totalDays,
          badge: m.widget.dayOfTotal(day, totalDays),
          badgeShort: m.widget.dayShort(day),
          percent,
          percentText: m.widget.percent(percent),
        };
      })()
    : null;
  const names = (allowed: boolean) =>
    FOOD_IDS.filter((food) => isFoodAllowed(info.level, food) === allowed).map(
      (food) => m.widget.foods[food],
    );
  return {
    dateLine,
    // A day without fasting has no fast to name: say the weekday instead.
    title: fasting ? (heading ?? level.title) : m.weekdays[info.weekday],
    weekday: m.weekdays[info.weekday],
    status: level.title,
    levelShort: m.widget.levelShort[info.level],
    calmNote: level.detail,
    allowedFoods: capitalize([...names(true), m.widget.staples].join(', ')),
    avoidedFoods: capitalize(names(false).join(', ') || m.widget.nothing),
    progress,
    feast: info.feasts.length > 0 ? info.feasts.map((feast) => m.feast[feast]).join(' · ') : null,
    reading,
    fasting,
    labels: {
      allowed: m.widget.allowed,
      avoided: m.widget.avoided,
      complete: m.widget.complete,
      completed: m.widget.completed,
      noFast: m.widget.noFast,
    },
  };
}

/** Widget text for a date: runs the existing rule engine, then words the result. */
export function widgetContentFor(
  date: CivilDate,
  church: Church,
  language: Language,
  options?: DayOptions,
): WidgetContent {
  const commemoration = getCommemoration(date, church.id as ChurchId);
  return describeWidget(
    getDayInfo(date, church, options),
    MESSAGES[language],
    commemoration ? pickReading(commemoration.readings, language) : null,
  );
}
