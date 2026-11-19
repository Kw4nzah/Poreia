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
import { PrayerId } from '../prayers';
import { PrayerBookmark, cleanFavoritePrayers, cleanPrayerBookmark } from '../prayers/favorites';
import { DEFAULT_SAINT_GENDER, SaintGender, isSaintGender } from '../prayers/saintGender';
import { SaintTopicId, isSaintTopic } from '../prayers/saintTopics';

export const NOTIFICATION_HOURS = [7, 8, 9, 12] as const;

export type NotificationHour = (typeof NOTIFICATION_HOURS)[number];

/** A saint the user asks for intercession, with what they ask help for (or none). */
export interface FavoriteSaint {
  name: string;
  topic: SaintTopicId | '';
  /** Grammatical gender in the prayers; saints saved before it existed are 'm'. */
  gender: SaintGender;
}

export const MAX_FAVORITE_SAINTS = 10;
export const MAX_SAINT_NAME = 60;
export const MAX_USER_NAME = 40;
/** Upper bound on the stored settings text; anything larger is not ours and is ignored. */
export const MAX_SETTINGS_CHARS = 16_384;

const CONTROL_CHARS = /[\p{Cc}\p{Zl}\p{Zp}]/gu;

/** A short single-line text from storage: no control characters, trimmed, length-capped. */
export function cleanText(value: unknown, max: number): string {
  return typeof value === 'string' ? value.replace(CONTROL_CHARS, ' ').trim().slice(0, max) : '';
}

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
  /** Evening reminder (20:00) the day before a fast begins or a feast falls. */
  eveReminder: boolean;
  /** Ongoing notification in the shade with the widget's information, for people without the widget. */
  persistentNotification: boolean;
  /** Index into PRAYER_TEXT_SIZES. */
  prayerTextSize: PrayerTextSize;
  /** Prayer reader in its calm mode: large centred text, no controls. */
  prayerReadingMode: boolean;
  /** Which Greek rule decides fish in the Nativity and Apostles' Fasts. */
  greekFish: GreekFishPractice;
  /** Saints the user asked to be named in the morning and evening prayers. */
  saints: FavoriteSaint[];
  /** Prayers the user starred, shown at the top of the Prayers list. */
  favoritePrayers: PrayerId[];
  /** The prayer last opened and the scroll position in it; null when there is none. */
  lastPrayer: PrayerBookmark | null;
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
    eveReminder: false,
    persistentNotification: false,
    prayerTextSize: DEFAULT_PRAYER_TEXT_SIZE,
    prayerReadingMode: false,
    greekFish: DEFAULT_GREEK_FISH_PRACTICE,
    saints: [],
    favoritePrayers: [],
    lastPrayer: null,
  };
}

function isChurchId(value: unknown): value is ChurchId {
  return typeof value === 'string' && Object.hasOwn(CHURCHES, value);
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
    const { name, topic, gender } = item as Record<string, unknown>;
    const cleanName = cleanText(name, MAX_SAINT_NAME);
    if (!cleanName || out.some((saint) => saint.name.toLowerCase() === cleanName.toLowerCase()))
      continue;
    out.push({
      name: cleanName,
      topic: isSaintTopic(topic) ? topic : '',
      gender: isSaintGender(gender) ? gender : DEFAULT_SAINT_GENDER,
    });
    if (out.length === MAX_FAVORITE_SAINTS) break;
  }
  return out;
}

/** Reads stored settings, replacing anything missing or invalid with defaults. */
export function parseSettings(raw: string | null, deviceLanguage: Language): Settings {
  const fallback = defaultSettings(deviceLanguage);
  if (!raw || raw.length > MAX_SETTINGS_CHARS) return fallback;
  let stored: unknown;
  try {
    stored = JSON.parse(raw);
  } catch {
    return fallback;
  }
  if (!stored || typeof stored !== 'object' || Array.isArray(stored)) return fallback;
  const s = stored as Record<string, unknown>;
  return {
    language: isLanguage(s.language) ? s.language : fallback.language,
    name: cleanText(s.name, MAX_USER_NAME),
    churchId: isChurchId(s.churchId) ? s.churchId : fallback.churchId,
    onboarded: s.onboarded === true && isChurchId(s.churchId),
    notifications: s.notifications === true,
    notificationRepeat: s.notificationRepeat === true,
    eveReminder: s.eveReminder === true,
    persistentNotification: s.persistentNotification === true,
    notificationHour: isNotificationHour(s.notificationHour)
      ? s.notificationHour
      : fallback.notificationHour,
    prayerTextSize: isPrayerTextSize(s.prayerTextSize) ? s.prayerTextSize : fallback.prayerTextSize,
    prayerReadingMode: s.prayerReadingMode === true,
    greekFish: GREEK_FISH_PRACTICES.includes(s.greekFish as GreekFishPractice)
      ? (s.greekFish as GreekFishPractice)
      : fallback.greekFish,
    saints: cleanSaints(s.saints),
    favoritePrayers: cleanFavoritePrayers(s.favoritePrayers),
    lastPrayer: cleanPrayerBookmark(s.lastPrayer),
  };
}
