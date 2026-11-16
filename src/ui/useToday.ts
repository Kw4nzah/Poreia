import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { CivilDate, civilFromLocalDate } from '../calendar';

/** Today's date, refreshed when the app returns to the foreground on a new day. */
export function useToday(): CivilDate {
  const [today, setToday] = useState(() => civilFromLocalDate(new Date()));

  // Also roll over at local midnight while the app stays open in the foreground.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const arm = () => {
      const now = new Date();
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 1);
      timer = setTimeout(() => {
        setToday(civilFromLocalDate(new Date()));
        arm();
      }, midnight.getTime() - now.getTime());
    };
    arm();
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      const now = civilFromLocalDate(new Date());
      setToday((previous) =>
        previous.year === now.year && previous.month === now.month && previous.day === now.day
          ? previous
          : now,
      );
    });
    return () => subscription.remove();
  }, []);

  return today;
}
