import * as Application from 'expo-application';
import { File, Paths } from 'expo-file-system';
import { startActivityAsync } from 'expo-intent-launcher';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { ApkRelease, LATEST_RELEASE_URL, pickNewerApk } from './apkRelease';

export type ApkStatus = 'idle' | 'downloading' | 'failed';

const FLAG_GRANT_READ_URI_PERMISSION = 1;

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
 * Looks for a newer APK release once per app session (shared between screens). `install` downloads it and hands it to
 * the system installer, which asks the user to confirm.
 */
export function useApkUpdate() {
  const [release, setRelease] = useState<ApkRelease | null>(null);
  const [status, setStatus] = useState<ApkStatus>('idle');

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

  const install = useCallback(async () => {
    if (!release) return;
    try {
      setStatus('downloading');
      const target = new File(Paths.cache, 'poreia-update.apk');
      if (target.exists) target.delete();
      const apk = await File.downloadFileAsync(release.url, target);
      await startActivityAsync('android.intent.action.VIEW', {
        data: apk.contentUri,
        type: 'application/vnd.android.package-archive',
        flags: FLAG_GRANT_READ_URI_PERMISSION,
      });
      setStatus('idle');
    } catch {
      setStatus('failed');
    }
  }, [release]);

  return { release, status, install };
}
