import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { readAllDone } from '../log/logStore';
import { readSeenReports } from './seen';

/**
 * What the reports are made from: the marked days and the reports already seen, read from storage
 * on mount, when the screen regains focus and when the app returns to the foreground. `loaded`
 * turns true after the first read, so a screen can tell "nothing marked" from "not read yet".
 */
export function useReportInputs() {
  const [done, setDone] = useState<ReadonlySet<number>>(() => new Set());
  const [seen, setSeen] = useState<ReadonlySet<string>>(() => new Set());
  const [loaded, setLoaded] = useState(false);
  const latest = useRef(0);

  const reload = useCallback(async () => {
    const request = ++latest.current;
    const [days, seenReports] = await Promise.all([readAllDone(), readSeenReports()]);
    if (request !== latest.current) return;
    setDone(days);
    setSeen(seenReports);
    setLoaded(true);
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void reload();
    });
    return () => {
      latest.current++;
      subscription.remove();
    };
  }, [reload]);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload]),
  );

  /** Records a report as seen at once, ahead of the next read. */
  const addSeen = useCallback((key: string) => {
    setSeen((previous) => new Set(previous).add(key));
  }, []);

  return { done, seen, loaded, addSeen };
}
