import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { CivilDate, gregorianToJdn } from '../calendar';
import { toggleDone } from '../widget/doneStore';
import { readAllDone } from './logStore';

/**
 * The marked days, kept in step with storage: read on mount and every time the app returns to the
 * foreground, because the widget may have changed a mark while the app was in the background.
 */
export function useFastingLog(today: CivilDate, onToggled: () => void) {
  const [done, setDone] = useState<ReadonlySet<number>>(() => new Set());
  const busy = useRef(false);
  const latest = useRef(0);

  const reload = useCallback(async () => {
    const request = ++latest.current;
    const days = await readAllDone();
    if (request === latest.current) setDone(days);
  }, []);

  useEffect(() => {
    void reload();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void reload();
    });
    return () => {
      latest.current++;
      subscription.remove();
    };
  }, [reload]);

  const toggle = useCallback(async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      await toggleDone(today);
      await reload();
      onToggled();
    } finally {
      busy.current = false;
    }
  }, [today, reload, onToggled]);

  return { done, doneToday: done.has(gregorianToJdn(today.year, today.month, today.day)), toggle };
}
