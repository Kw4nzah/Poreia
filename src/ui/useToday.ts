import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { CivilDate, civilFromLocalDate } from '../calendar';

/** Today's date, refreshed when the app returns to the foreground on a new day. */
export function useToday(): CivilDate {
  const [today, setToday] = useState(() => civilFromLocalDate(new Date()));

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
