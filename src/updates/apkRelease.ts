// Finds a newer signed APK among the project's GitHub releases. Needed only when a
// release contains native changes; everything else arrives as a bundle update.

import { APK_URL_PREFIX, isAllowedApkUrl } from '../security/externalLinks';

export const LATEST_RELEASE_URL = 'https://api.github.com/repos/Kw4nzah/Poreia/releases/latest';

export interface ApkRelease {
  version: string;
  url: string;
  sizeBytes: number;
  /**
   * SHA-256 of the APK (64 lower-case hex characters) as GitHub lists it for the asset, or null when
   * the listing carries none. A download that does not match is thrown away.
   */
  sha256: string | null;
}

/** A release tag as this project writes it, such as `v0.6.1`, with an optional `-rc.1` suffix. */
const TAG = /^v?\d{1,4}(?:\.\d{1,4}){0,3}(?:-[0-9A-Za-z.]{1,20})?$/;
const SHA256_DIGEST = /^sha256:([0-9a-f]{64})$/i;

/** The hash out of GitHub's `digest` field (`sha256:<hex>`), or null for anything else. */
export function parseSha256Digest(digest: unknown): string | null {
  if (typeof digest !== 'string') return null;
  const match = SHA256_DIGEST.exec(digest);
  return match ? match[1].toLowerCase() : null;
}

/**
 * Compares dotted versions ("0.10.0" > "0.9.3"); a leading "v" is ignored. A pre-release suffix
 * ("-rc.1") is older than the same version without it, and build metadata ("+5") is ignored.
 */
export function compareVersions(a: string, b: string): number {
  const split = (v: string) => {
    const text = v.trim().replace(/^v/i, '');
    const dash = text.search(/[-+]/);
    const core = dash === -1 ? text : text.slice(0, dash);
    return {
      numbers: core.split('.').map((part) => parseInt(part, 10) || 0),
      preRelease: dash !== -1 && text[dash] === '-',
    };
  };
  const va = split(a);
  const vb = split(b);
  for (let i = 0; i < Math.max(va.numbers.length, vb.numbers.length); i++) {
    const diff = (va.numbers[i] ?? 0) - (vb.numbers[i] ?? 0);
    if (diff !== 0) return Math.sign(diff);
  }
  return Math.sign(Number(vb.preRelease) - Number(va.preRelease));
}

/** The release's APK if it is newer than the installed version, otherwise null. */
export function pickNewerApk(release: unknown, installedVersion: string): ApkRelease | null {
  if (!release || typeof release !== 'object') return null;
  const { tag_name: tag, assets, draft, prerelease } = release as Record<string, unknown>;
  // The tag is shown on screen and decides the download path: only a plain version number passes.
  if (typeof tag !== 'string' || !TAG.test(tag) || draft === true || prerelease === true) {
    return null;
  }
  if (compareVersions(tag, installedVersion) <= 0) return null;
  if (!Array.isArray(assets)) return null;
  for (const asset of assets as Record<string, unknown>[]) {
    const { name, browser_download_url: url, size, digest } = asset ?? {};
    // Only an APK hosted on this project's own releases, under this release's own tag, is ever
    // offered for download.
    if (
      typeof name === 'string' &&
      name.endsWith('.apk') &&
      isAllowedApkUrl(url) &&
      url.startsWith(`${APK_URL_PREFIX}${tag}/`)
    ) {
      return {
        version: tag.replace(/^v/i, ''),
        url,
        sizeBytes: typeof size === 'number' && Number.isSafeInteger(size) && size > 0 ? size : 0,
        sha256: parseSha256Digest(digest),
      };
    }
  }
  return null;
}
