// The download half of the APK update: fetch the file, and leave nothing behind unless it is a
// complete file the user still wants. Kept apart from the hook so the cancel and failure paths are
// tested without a device; the file system itself is passed in.

import { isAllowedApkUrl } from '../security/externalLinks';
import type { ApkRelease } from './apkRelease';

export interface DownloadedApk {
  uri: string;
  /** Size on disk in bytes, or null when it cannot be read. */
  size: number | null;
}

export interface ApkFiles {
  /** Removes the downloaded file if it is there. */
  discard(): void;
  download(
    url: string,
    signal: AbortSignal,
    onProgress: (bytesWritten: number, totalBytes: number | null) => void,
  ): Promise<DownloadedApk>;
  /** SHA-256 of the downloaded file as lower-case hex. Rejects when it cannot be computed. */
  sha256(): Promise<string>;
}

export type ApkFetchResult =
  { ok: true; uri: string } | { ok: false; reason: 'cancelled' | 'failed' };

const failed: ApkFetchResult = { ok: false, reason: 'failed' };
const cancelled: ApkFetchResult = { ok: false, reason: 'cancelled' };

/**
 * Downloads the release's APK. A cancel, even one that lands just as the last byte arrives, ends in
 * `cancelled` with the file removed, so the installer never opens after the user said stop. A file
 * whose size differs from the release listing is a cut-off download: removed and `failed`.
 */
export async function fetchApk(
  release: ApkRelease,
  signal: AbortSignal,
  files: ApkFiles,
  onProgress: (bytesWritten: number, totalBytes: number | null) => void,
): Promise<ApkFetchResult> {
  const discard = () => {
    try {
      files.discard();
    } catch {
      // A half-written file that cannot be removed is overwritten by the next attempt.
    }
  };
  // The listing was already filtered; checking again here keeps the download itself safe.
  if (!isAllowedApkUrl(release.url)) return failed;
  // No hash listed, no install: the content check below is what ties the file to the release.
  if (release.sha256 === null) return failed;
  if (signal.aborted) return cancelled;
  try {
    discard();
    const apk = await files.download(release.url, signal, (written, total) => {
      if (!signal.aborted) onProgress(written, total);
    });
    if (signal.aborted) {
      discard();
      return cancelled;
    }
    if (release.sizeBytes > 0 && apk.size !== null && apk.size !== release.sizeBytes) {
      discard();
      return failed;
    }
    // The download may have been redirected to another host, so what counts is the content: it must
    // be the file GitHub listed. (Android still checks the signing key before it installs.)
    if (release.sha256 !== null) {
      const actual = await files.sha256();
      if (signal.aborted) {
        discard();
        return cancelled;
      }
      if (actual.toLowerCase() !== release.sha256) {
        discard();
        return failed;
      }
    }
    return { ok: true, uri: apk.uri };
  } catch {
    discard();
    return signal.aborted ? cancelled : failed;
  }
}
