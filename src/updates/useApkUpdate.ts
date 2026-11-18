import * as Application from 'expo-application';
import { File, Paths } from 'expo-file-system';
import { startActivityAsync } from 'expo-intent-launcher';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { isAllowedApkUrl } from '../security/externalLinks';
import { ApkRelease, LATEST_RELEASE_URL, pickNewerApk } from './apkRelease';
import { ProgressView, computeProgress } from './downloadProgress';

export type ApkStatus = 'idle' | 'downloading' | 'failed';

const FLAG_GRANT_READ_URI_PERMISSION = 1;
/** Progress is pushed to the screen at most once per this many bytes. */
const PROGRESS_STEP_BYTES = 256 * 1024;

let pending: Promise<ApkRelease | null> | null = null;

/** One GitHub request per app session, shared by every screen that asks (rate limit). */
function sharedCheck(installed: string): Promise<ApkRelease | null> {
  pending ??= fetch(LATEST_RELEASE_URL, { headers: { Accept: 'application/vnd.github+json' } })
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((json) => pickNewerApk(json, installed))
    .catch(() => {
      // Offline or rate-limited: stay silent and let the next screen visit try again.
      pending = null;
      return null;
    });
  return pending;
}

/**
 * Looks for a newer APK release once per app session (shared between screens). `install` downloads
 * it (reporting `progress`, cancellable with `cancel`) and hands it to the system installer, which
 * asks the user to confirm. `dismiss` clears a failed state.
 */
export function useApkUpdate() {
  const [release, setRelease] = useState<ApkRelease | null>(null);
  const [status, setStatus] = useState<ApkStatus>('idle');
  const [progress, setProgress] = useState<ProgressView | null>(null);
  const controller = useRef<AbortController | null>(null);

  useEffect(() => {
    const installed = Application.nativeApplicationVersion;
    if (Platform.OS !== 'android' || !installed) return;
    let cancelled = false;
    sharedCheck(installed).then((found) => {
      if (!cancelled) setRelease(found);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Leaving the screen mid-download stops it, so nothing keeps running without a popup to show it.
  useEffect(() => () => controller.current?.abort(), []);

  const install = useCallback(async () => {
    if (!release || controller.current) return;
    // The listing was already filtered; checking again here keeps the download itself safe.
    if (!isAllowedApkUrl(release.url)) {
      setStatus('failed');
      return;
    }
    const abort = new AbortController();
    controller.current = abort;
    const target = new File(Paths.cache, 'poreia-update.apk');
    let lastStep = -1;
    setProgress(computeProgress(0, null, release.sizeBytes));
    setStatus('downloading');
    let apk: File;
    try {
      if (target.exists) target.delete();
      apk = await File.downloadFileAsync(release.url, target, {
        idempotent: true,
        signal: abort.signal,
        onProgress: ({ bytesWritten, totalBytes }) => {
          const step = Math.floor(bytesWritten / PROGRESS_STEP_BYTES);
          if (step === lastStep || abort.signal.aborted) return;
          lastStep = step;
          setProgress(computeProgress(bytesWritten, totalBytes, release.sizeBytes));
        },
      });
    } catch {
      try {
        if (target.exists) target.delete();
      } catch {
        // A half-written file that cannot be removed is overwritten by the next attempt.
      }
      controller.current = null;
      setProgress(null);
      // A cancel by the user is not an error.
      setStatus(abort.signal.aborted ? 'idle' : 'failed');
      return;
    }
    controller.current = null;
    setProgress(null);
    // Closed before the installer opens, so the popup is never left behind it.
    setStatus('idle');
    try {
      await startActivityAsync('android.intent.action.VIEW', {
        data: apk.contentUri,
        type: 'application/vnd.android.package-archive',
        flags: FLAG_GRANT_READ_URI_PERMISSION,
      });
    } catch {
      setStatus('failed');
    }
  }, [release]);

  const cancel = useCallback(() => controller.current?.abort(), []);
  const dismiss = useCallback(() => setStatus((s) => (s === 'failed' ? 'idle' : s)), []);

  return { release, status, progress, install, cancel, dismiss };
}
