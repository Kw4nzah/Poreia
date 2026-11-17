import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import {
  CivilDate,
  civilFromLocalDate,
  isSameCivilDate,
  msUntilNextLocalMidnight,
} from '../calendar';

/**
 * Today's date. It changes at local midnight while the app is open and when the app returns to the
 * foreground (the clock or timezone may have changed meanwhile). The same object is kept while the
 * date is unchanged, so effects that depend on it do not run again for nothing.
 */
export function useToday(): CivilDate {
  const [today, setToday] = useState(() => civilFromLocalDate(new Date()));

  useEffect(() => {
    const refresh = () => {
      const now = civilFromLocalDate(new Date());
      setToday((previous) => (isSameCivilDate(previous, now) ? previous : now));
    };
    let timer: ReturnType<typeof setTimeout>;
    const arm = () => {
      timer = setTimeout(() => {
        refresh();
        arm();
      }, msUntilNextLocalMidnight(new Date()));
    };
    arm();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      refresh();
      // The timer may have been paused while the app slept; start it again from the real clock.
      clearTimeout(timer);
      arm();
    });
    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, []);

  return today;
}
