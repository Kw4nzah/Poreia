// Backup and restore of the settings and the "done" days. Pure, so it can be tested without a
// device. The backup is one JSON text the user copies and pastes; everything read back from it is
// untrusted and goes through the same validation as stored settings.

import type { Language } from '../i18n';
import { MAX_SETTINGS_CHARS, Settings, parseSettings } from '../settings/model';

export const BACKUP_APP = 'poreia';
export const BACKUP_VERSION = 1;
/** Upper bound on pasted text; anything larger is not one of our backups. */
export const MAX_BACKUP_CHARS = 65_536;
/** Most done days a backup carries (about four years). The most recent ones are kept. */
export const MAX_DONE_DAYS = 1500;

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
/** Zero-width characters and the byte order mark; `trim` does not remove them. */
const INVISIBLE = /[\u200b-\u200d\u2060\ufeff]/;

/**
 * Whitespace and invisible characters off both ends of pasted text. A scan from each end, not a
 * regular expression: `/\s+$/` backtracks quadratically on a long run of spaces inside the text
 * (65 536 of them froze the paste box for seconds), and the text is untrusted.
 */
export function trimInvisible(text: string): string {
  const blank = (char: string) => char.trim() === '' || INVISIBLE.test(char);
  let start = 0;
  let end = text.length;
  while (start < end && blank(text[start])) start++;
  while (end > start && blank(text[end - 1])) end--;
  return text.slice(start, end);
}
const MIN_YEAR = 2000;
const MAX_YEAR = 2200;

/** True for a real calendar day written `YYYY-MM-DD`, in a sensible year range. */
export function isValidIsoDate(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const match = ISO_DATE.exec(value);
  if (!match) return false;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  if (year < MIN_YEAR || year > MAX_YEAR) return false;
  // Date normalises 31 February to March, so a round trip tells a real day from an invented one.
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day
  );
}

/** Valid, unique, sorted; when over the cap the oldest are dropped. Never throws. */
export function cleanDoneDays(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const days = [...new Set(value.filter(isValidIsoDate))].sort();
  return days.slice(-MAX_DONE_DAYS);
}

/** The backup text for the settings and the days marked done. */
export function createBackup(settings: Settings, doneDays: readonly string[]): string {
  return JSON.stringify({
    app: BACKUP_APP,
    version: BACKUP_VERSION,
    // Re-validated on the way out, so a backup never carries more than parseSettings would keep.
    settings: parseSettings(JSON.stringify(settings), settings.language),
    done: cleanDoneDays(doneDays),
  });
}

export type BackupError =
  /** Nothing to read. */
  | 'empty'
  /** Over the size or day-count cap. */
  | 'tooLarge'
  /** Not JSON, or a part of it is malformed. */
  | 'invalid'
  /** JSON, but not a Poreia backup. */
  | 'notBackup'
  /** A backup version this app does not know. */
  | 'version';

export type ParsedBackup =
  { ok: true; settings: Settings; done: string[] } | { ok: false; error: BackupError };

const fail = (error: BackupError): ParsedBackup => ({ ok: false, error });

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Reads a pasted backup. Never throws. The settings are validated field by field by
 * `parseSettings`; the done list must hold only valid dates (one bad entry rejects the backup,
 * since it means the text was damaged) and no more than `MAX_DONE_DAYS`.
 */
export function parseBackup(raw: string, fallbackLanguage: Language): ParsedBackup {
  try {
    if (typeof raw !== 'string' || raw.trim() === '') return fail('empty');
    if (raw.length > MAX_BACKUP_CHARS) return fail('tooLarge');
    let data: unknown;
    try {
      // Text copied out of a chat or an editor can carry a byte order mark or zero-width characters.
      data = JSON.parse(trimInvisible(raw));
    } catch {
      return fail('invalid');
    }
    if (!isPlainObject(data)) return fail('notBackup');
    // Own properties only: a `__proto__` or `constructor` key in the text must not be read as ours.
    const own = (key: string) => (Object.hasOwn(data as object, key) ? data[key] : undefined);
    if (own('app') !== BACKUP_APP || typeof own('version') !== 'number') return fail('notBackup');
    if (own('version') !== BACKUP_VERSION) return fail('version');

    const settings = own('settings');
    const done = own('done');
    if (!isPlainObject(settings) || !Array.isArray(done)) return fail('invalid');
    if (done.length > MAX_DONE_DAYS) return fail('tooLarge');
    if (!done.every(isValidIsoDate)) return fail('invalid');

    const settingsText = JSON.stringify(settings);
    if (settingsText.length > MAX_SETTINGS_CHARS) return fail('tooLarge');
    return {
      ok: true,
      settings: parseSettings(settingsText, fallbackLanguage),
      done: cleanDoneDays(done),
    };
  } catch {
    return fail('invalid');
  }
}
