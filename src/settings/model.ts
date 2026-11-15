// What the app remembers about its user. Pure, so it can be tested without a device.

import { CHURCHES, ChurchId } from '../calendar';
import { Language, isLanguage } from '../i18n';
import { DEFAULT_PRAYER_TEXT_SIZE, PrayerTextSize, isPrayerTextSize } from '../prayers';

export const NOTIFICATION_HOURS = [7, 8, 9, 12] as const;

export type NotificationHour = (typeof NOTIFICATION_HOURS)[number];

export interface Settings {
  language: Language;
  name: string;
  churchId: ChurchId;
  /** False until the user finishes the first-run questions. */
  onboarded: boolean;
  /** Daily notification with the day's fasting rule. */
  notifications: boolean;
  /** Local hour (0-23) at which it is shown. */
  notificationHour: NotificationHour;
  /** Index into PRAYER_TEXT_SIZES. */
  prayerTextSize: PrayerTextSize;
}

export const STORAGE_KEY = 'poreia.settings.v1';

export function defaultSettings(language: Language): Settings {
  return {
    language,
    name: '',
    churchId: 'greek',
    onboarded: false,
    notifications: false,
    notificationHour: 8,
    prayerTextSize: DEFAULT_PRAYER_TEXT_SIZE,
  };
}

function isChurchId(value: unknown): value is ChurchId {
  return typeof value === 'string' && value in CHURCHES;
}

function isNotificationHour(value: unknown): value is NotificationHour {
  return NOTIFICATION_HOURS.includes(value as NotificationHour);
}

/** Reads stored settings, replacing anything missing or invalid with defaults. */
export function parseSettings(raw: string | null, deviceLanguage: Language): Settings {
  const fallback = defaultSettings(deviceLanguage);
  if (!raw) return fallback;
  let stored: unknown;
  try {
    stored = JSON.parse(raw);
  } catch {
    return fallback;
  }
  if (!stored || typeof stored !== 'object') return fallback;
  const s = stored as Record<string, unknown>;
  return {
    language: isLanguage(s.language) ? s.language : fallback.language,
    name: typeof s.name === 'string' ? s.name : fallback.name,
    churchId: isChurchId(s.churchId) ? s.churchId : fallback.churchId,
    onboarded: s.onboarded === true && isChurchId(s.churchId),
    notifications: s.notifications === true,
    notificationHour: isNotificationHour(s.notificationHour)
      ? s.notificationHour
      : fallback.notificationHour,
    prayerTextSize: isPrayerTextSize(s.prayerTextSize)
      ? s.prayerTextSize
      : fallback.prayerTextSize,
  };
}
