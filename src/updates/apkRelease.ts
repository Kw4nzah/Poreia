// Finds a newer signed APK among the project's GitHub releases. Needed only when a
// release contains native changes; everything else arrives as a bundle update.

import { isAllowedApkUrl } from '../security/externalLinks';

export const LATEST_RELEASE_URL = 'https://api.github.com/repos/Kw4nzah/Poreia/releases/latest';

export interface ApkRelease {
  version: string;
  url: string;
  sizeBytes: number;
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
  if (typeof tag !== 'string' || draft === true || prerelease === true) return null;
  if (compareVersions(tag, installedVersion) <= 0) return null;
  if (!Array.isArray(assets)) return null;
  for (const asset of assets as Record<string, unknown>[]) {
    const { name, browser_download_url: url, size } = asset ?? {};
    // Only an APK hosted on this project's own releases is ever offered for download.
    if (typeof name === 'string' && name.endsWith('.apk') && isAllowedApkUrl(url)) {
      return {
        version: tag.replace(/^v/i, ''),
        url,
        sizeBytes: typeof size === 'number' ? size : 0,
      };
    }
  }
  return null;
}
