import * as Application from 'expo-application';
import { File, Paths } from 'expo-file-system';
import { startActivityAsync } from 'expo-intent-launcher';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { ApkRelease, LATEST_RELEASE_URL, pickNewerApk } from './apkRelease';

export type ApkStatus = 'idle' | 'downloading' | 'failed';

const FLAG_GRANT_READ_URI_PERMISSION = 1;

/**
 * Looks for a newer APK release once per mount. `install` downloads it and hands it to
 * the system installer, which asks the user to confirm.
 */
export function useApkUpdate() {
  const [release, setRelease] = useState<ApkRelease | null>(null);
  const [status, setStatus] = useState<ApkStatus>('idle');

  useEffect(() => {
    const installed = Application.nativeApplicationVersion;
    if (Platform.OS !== 'android' || !installed) return;
    let cancelled = false;
    fetch(LATEST_RELEASE_URL, { headers: { Accept: 'application/vnd.github+json' } })
      .then((response) => response.json())
      .then((json) => {
        if (!cancelled) setRelease(pickNewerApk(json, installed));
      })
      // Offline or rate-limited: no notice is shown, the next launch checks again.
      .catch(() => {});
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
