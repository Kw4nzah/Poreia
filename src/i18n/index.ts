import type { CivilDate } from '../calendar';
import { en, Messages } from './en';
import { ru } from './ru';
import { tr } from './tr';

export type { Messages };

export const MESSAGES = { tr, en, ru } as const satisfies Record<string, Messages>;

export type Language = keyof typeof MESSAGES;

export const LANGUAGES = Object.keys(MESSAGES) as Language[];

export const DEFAULT_LANGUAGE: Language = 'en';

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && value in MESSAGES;
}

/** First supported language among the device's preferred ones. */
export function pickLanguage(preferred: readonly (string | null | undefined)[]): Language {
  for (const code of preferred) {
    const base = code?.toLowerCase().split(/[-_]/)[0];
    if (isLanguage(base)) return base;
  }
  return DEFAULT_LANGUAGE;
}

export function formatDate(m: Messages, date: CivilDate): string {
  return m.date(date.day, m.months[date.month - 1], date.year);
}

export function formatDayMonth(m: Messages, date: CivilDate): string {
  return m.dayMonth(date.day, m.months[date.month - 1]);
}
