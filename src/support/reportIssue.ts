// Builds the link of a pre-filled GitHub issue ("Report a problem"). Pure, so it can be tested.
//
// Only technical facts about the installation go in: app version, content (runtime) version, Android
// version, device model and the interface language. Never a name, a saint, a setting or a date.

import { PROJECT_URL } from '../security/constants';
import { isAllowedExternalUrl } from '../security/externalLinks';

export const ISSUES_URL = `${PROJECT_URL}/issues`;
export const NEW_ISSUE_URL = `${ISSUES_URL}/new`;

export interface ReportInfo {
  appVersion?: string | null;
  runtimeVersion?: string | null;
  androidVersion?: string | null;
  deviceModel?: string | null;
  /** Interface language code ("tr", "en", "ru"). */
  language?: string | null;
}

/** The localized words of the issue (see `m.support`). */
export interface ReportTexts {
  title: string;
  what: string;
  write: string;
  details: string;
  app: string;
  runtime: string;
  android: string;
  device: string;
  language: string;
}

/** Keeps letters, digits, spaces and a few version/model characters; cut to `max`. Empty becomes null. */
export function cleanValue(value: unknown, max = 40): string | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const text = String(value)
    .replace(/[^\p{L}\p{N} ._+()/-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max)
    .trim();
  return text === '' ? null : text;
}

function detailLines(info: ReportInfo, texts: ReportTexts): string[] {
  const language = typeof info.language === 'string' && /^[a-z]{2}$/.test(info.language);
  const rows: [string, string | null][] = [
    [texts.app, cleanValue(info.appVersion, 32)],
    [texts.runtime, cleanValue(info.runtimeVersion, 32)],
    [texts.android, cleanValue(info.androidVersion, 32)],
    [texts.device, cleanValue(info.deviceModel)],
    [texts.language, language ? (info.language as string) : null],
  ];
  return rows
    .filter((row): row is [string, string] => row[1] !== null)
    .map(([k, v]) => `- ${k}: ${v}`);
}

function urlFor(title: string, body: string): string {
  return `${NEW_ISSUE_URL}?title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`;
}

/**
 * `https://github.com/Kw4nzah/Poreia/issues/new?title=...&body=...`. The link must pass the app's
 * link allowlist (https, github.com, printable ASCII, 2048 characters at most); if the text is too
 * long once encoded (Cyrillic costs six characters a letter), it falls back to a shorter body.
 */
export function buildReportUrl(info: ReportInfo, texts: ReportTexts): string {
  const title = [texts.title, cleanValue(info.appVersion, 32)].filter(Boolean).join(' ');
  const details = `## ${texts.details}\n${detailLines(info, texts).join('\n')}`;
  const full = urlFor(title, `## ${texts.what}\n${texts.write}\n\n${details}`);
  if (isAllowedExternalUrl(full)) return full;
  const short = urlFor(title, details);
  return isAllowedExternalUrl(short) ? short : NEW_ISSUE_URL;
}
