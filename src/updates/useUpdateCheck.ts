import * as Updates from 'expo-updates';
import { useCallback, useState } from 'react';

export type UpdateStatus = 'idle' | 'disabled' | 'checking' | 'upToDate' | 'downloading' | 'failed';

/** Manual update check: downloads a newer bundle and restarts into it. */
export function useUpdateCheck() {
  const [status, setStatus] = useState<UpdateStatus>('idle');

  const check = useCallback(async () => {
    if (!Updates.isEnabled) {
      setStatus('disabled');
      return;
    }
    try {
      setStatus('checking');
      const result = await Updates.checkForUpdateAsync();
      if (!result.isAvailable) {
        setStatus('upToDate');
        return;
      }
      setStatus('downloading');
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    } catch {
      setStatus('failed');
    }
  }, []);

  const busy = status === 'checking' || status === 'downloading';
  return { status, busy, check };
}
