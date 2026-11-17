// What the app remembers about its user. Pure, so it can be tested without a device.

import {
  CHURCHES,
  ChurchId,
  DEFAULT_GREEK_FISH_PRACTICE,
  GREEK_FISH_PRACTICES,
  GreekFishPractice,
} from '../calendar';
import { Language, isLanguage } from '../i18n';
import { DEFAULT_PRAYER_TEXT_SIZE, PrayerTextSize, isPrayerTextSize } from '../prayers';

export const NOTIFICATION_HOURS = [7, 8, 9, 12] as const;

export type NotificationHour = (typeof NOTIFICATION_HOURS)[number];

/** A saint the user asks for intercession, with an optional note of what to ask. */
export interface FavoriteSaint {
  name: string;
  note: string;
}

export const MAX_FAVORITE_SAINTS = 5;
export const MAX_SAINT_NAME = 60;
export const MAX_SAINT_NOTE = 100;

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
  /** Repeat the daily notification every few minutes until the app is opened that day. */
  notificationRepeat: boolean;
  /** Index into PRAYER_TEXT_SIZES. */
  prayerTextSize: PrayerTextSize;
  /** Which Greek rule decides fish in the Nativity and Apostles' Fasts. */
  greekFish: GreekFishPractice;
  /** Saints the user asked to be named in the morning and evening prayers. */
  saints: FavoriteSaint[];
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
    notificationRepeat: false,
    prayerTextSize: DEFAULT_PRAYER_TEXT_SIZE,
    greekFish: DEFAULT_GREEK_FISH_PRACTICE,
    saints: [],
  };
}

function isChurchId(value: unknown): value is ChurchId {
  return typeof value === 'string' && value in CHURCHES;
}

function isNotificationHour(value: unknown): value is NotificationHour {
  return NOTIFICATION_HOURS.includes(value as NotificationHour);
}

/** Keeps well-formed saints only: trimmed, non-empty names, limited in number and length. */
export function cleanSaints(value: unknown): FavoriteSaint[] {
  if (!Array.isArray(value)) return [];
  const out: FavoriteSaint[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object') continue;
    const { name, note } = item as Record<string, unknown>;
    const cleanName = typeof name === 'string' ? name.trim().slice(0, MAX_SAINT_NAME) : '';
    if (!cleanName || out.some((saint) => saint.name.toLowerCase() === cleanName.toLowerCase()))
      continue;
    out.push({
      name: cleanName,
      note: typeof note === 'string' ? note.trim().slice(0, MAX_SAINT_NOTE) : '',
    });
    if (out.length === MAX_FAVORITE_SAINTS) break;
  }
  return out;
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
    notificationRepeat: s.notificationRepeat === true,
    notificationHour: isNotificationHour(s.notificationHour)
      ? s.notificationHour
      : fallback.notificationHour,
    prayerTextSize: isPrayerTextSize(s.prayerTextSize) ? s.prayerTextSize : fallback.prayerTextSize,
    greekFish: GREEK_FISH_PRACTICES.includes(s.greekFish as GreekFishPractice)
      ? (s.greekFish as GreekFishPractice)
      : fallback.greekFish,
    saints: cleanSaints(s.saints),
  };
}
