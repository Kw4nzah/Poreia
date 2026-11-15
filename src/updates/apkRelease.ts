// Finds a newer signed APK among the project's GitHub releases. Needed only when a
// release contains native changes; everything else arrives as a bundle update.

export const LATEST_RELEASE_URL = 'https://api.github.com/repos/Kw4nzah/Poreia/releases/latest';

export interface ApkRelease {
  version: string;
  url: string;
  sizeBytes: number;
}

/** Compares dotted versions ("0.10.0" > "0.9.3"); a leading "v" is ignored. */
export function compareVersions(a: string, b: string): number {
  const parts = (v: string) =>
    v
      .replace(/^v/i, '')
      .split('.')
      .map((part) => parseInt(part, 10) || 0);
  const pa = parts(a);
  const pb = parts(b);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const diff = (pa[i] ?? 0) - (pb[i] ?? 0);
    if (diff !== 0) return Math.sign(diff);
  }
  return 0;
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
    if (typeof name === 'string' && name.endsWith('.apk') && typeof url === 'string') {
      return {
        version: tag.replace(/^v/i, ''),
        url,
        sizeBytes: typeof size === 'number' ? size : 0,
      };
    }
  }
  return null;
}
