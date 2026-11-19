// Text of the optional persistent notification. Pure, so it can be tested without a device.
//
// It carries what the home-screen widget shows, built from the widget's own content (so the two
// never disagree): the fast and its progress, the feast, what is allowed and avoided, the day's
// reading and whether the user marked "I am fasting today". Android shows the title and the first
// body line collapsed; the rest of the body shows when the notification is expanded.

import { Church, CivilDate, DayOptions } from '../calendar';
import { Language, MESSAGES, Messages } from '../i18n';
import { WidgetContent, widgetContentFor } from '../widget/content';

/** Identifier of the notification: one tag, so each post replaces the one already shown. */
export const ONGOING_ID = 'poreia_ongoing';
/** Own channel: low importance (silent, no heads-up), hidden on the lock screen. */
export const ONGOING_CHANNEL_ID = 'ongoing';
/** Categories (action buttons), one per state of the mark so the button always says the right thing. */
export const ONGOING_CATEGORY_TODO = 'poreia_ongoing_todo';
export const ONGOING_CATEGORY_DONE = 'poreia_ongoing_done';
/** Identifier of the button; its tap flips the same mark as the widget's button. */
export const ONGOING_TOGGLE_ACTION = 'toggle_done';

export interface OngoingContent {
  /** Bold first line. */
  title: string;
  /** Weekday and date, shown next to the app name. */
  subtitle: string;
  /** First line is the collapsed text; the rest shows when expanded. */
  body: string;
  /** The day has a fast, so the "I am fasting today" button is offered. */
  actionable: boolean;
  /** Label of that button: sets the mark, or clears it when already set. */
  actionLabel: string;
  /** Category that carries the button; null when there is none. */
  category: string | null;
}

const CHECK = '✓';

/**
 * Wording of one day from the widget's content. `marked` is the "I am fasting today" mark and
 * `m` the app's language (for the button that clears the mark).
 */
export function describeOngoing(
  content: WidgetContent,
  m: Messages,
  marked: boolean,
): OngoingContent {
  const { labels, progress, feast, fasting } = content;
  const confirmed = fasting && marked;
  const heading = feast ?? (fasting ? content.title : `${content.weekday} · ${labels.noFast}`);
  const title = confirmed ? `${CHECK} ${heading}` : heading;

  const lines: string[] = [];
  if (fasting) {
    const status = [
      // Under a feast the title is the feast, so the fast itself is named here.
      feast ? content.title : null,
      content.levelShort,
      progress?.badge ?? null,
      progress?.percentText ?? null,
    ];
    lines.push(status.filter((part): part is string => Boolean(part)).join(' · '));
    lines.push(`${labels.allowed}: ${content.allowedFoods}`);
    lines.push(`${labels.avoided}: ${content.avoidedFoods}`);
  } else {
    lines.push(content.calmNote);
  }
  if (content.reading) lines.push(content.reading);
  if (confirmed) lines.push(`${CHECK} ${labels.completed}`);

  return {
    title,
    subtitle: content.dateLine,
    body: lines.join('\n'),
    actionable: fasting,
    actionLabel: confirmed ? m.settings.ongoingUndo : labels.complete,
    category: !fasting ? null : confirmed ? ONGOING_CATEGORY_DONE : ONGOING_CATEGORY_TODO,
  };
}

/** The notification for a date: the widget's content for it, worded for the shade. */
export function ongoingContentFor(
  date: CivilDate,
  church: Church,
  language: Language,
  marked: boolean,
  options?: DayOptions,
): OngoingContent {
  return describeOngoing(
    widgetContentFor(date, church, language, options),
    MESSAGES[language],
    marked,
  );
}
