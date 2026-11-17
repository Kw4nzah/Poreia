// Allowlist for everything the app opens outside itself. Pure, so it can be tested without a device.
//
// Only https links to a short list of hosts are ever handed to the system. No other scheme
// (http, intent:, file:, content:, javascript:, tel:, ...) can be opened from inside the app, even
// if a link were built from corrupted data.

/** Hosts a link may point to (exact match, no subdomains). */
export const ALLOWED_LINK_HOSTS: readonly string[] = ['www.bible.com', 'bible.com', 'github.com'];

/** The only place an APK may be downloaded from: this project's own GitHub releases. */
export const APK_URL_PREFIX = 'https://github.com/Kw4nzah/Poreia/releases/download/';

const MAX_URL_LENGTH = 2048;

// scheme "https", then a bare host (letters, digits, dots, hyphens) with an optional ":443",
// then an optional path, query and fragment of printable ASCII without backslashes. No
// credentials ("user@host"), no whitespace, no control characters.
const HTTPS_URL = /^https:\/\/([a-z0-9.-]+)(?::443)?(?:\/[\x21-\x5b\x5d-\x7e]*)?$/i;

/** Lower-cased host of a well-formed https URL, or null. */
export function httpsHost(url: unknown): string | null {
  if (typeof url !== 'string' || url.length > MAX_URL_LENGTH) return null;
  const match = HTTPS_URL.exec(url);
  return match ? match[1].toLowerCase() : null;
}

/** True for an https URL whose host is on the allowlist. */
export function isAllowedExternalUrl(url: unknown): url is string {
  const host = httpsHost(url);
  return host !== null && ALLOWED_LINK_HOSTS.includes(host);
}

/** True for an https URL of an APK attached to a release of this project. */
export function isAllowedApkUrl(url: unknown): url is string {
  if (typeof url !== 'string' || httpsHost(url) !== 'github.com') return false;
  if (!url.startsWith(APK_URL_PREFIX)) return false;
  const path = url.slice(APK_URL_PREFIX.length).split(/[?#]/)[0];
  return path.endsWith('.apk') && !path.includes('..') && !/%2e/i.test(path);
}
