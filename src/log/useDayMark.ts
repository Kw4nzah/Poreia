import { useCallback, useEffect, useRef, useState } from 'react';
import { CivilDate, gregorianToJdn } from '../calendar';
import { useSettings } from '../settings/SettingsProvider';
import { readDone, toggleDone } from '../widget/doneStore';
import { refreshWidget } from '../widget/refresh';

/**
 * The "I am fasting" mark of one day (the day screen), read from storage and flipped by `toggle`.
 * `date` may be null (an invalid link); then nothing is read and `toggle` does nothing. Today's
 * mark is also on the widget, so the widget is redrawn after a change to it.
 */
export function useDayMark(date: CivilDate | null, today: CivilDate) {
  const { settings } = useSettings();
  const [marked, setMarked] = useState(false);
  const busy = useRef(false);
  const key = date ? gregorianToJdn(date.year, date.month, date.day) : null;
  const isToday = key !== null && key === gregorianToJdn(today.year, today.month, today.day);

  useEffect(() => {
    if (!date) {
      setMarked(false);
      return;
    }
    let current = true;
    setMarked(false);
    void readDone(date).then((value) => {
      if (current) setMarked(value);
    });
    return () => {
      current = false;
    };
    // `date` is rebuilt on every render; its day number is the identity that matters.
  }, [key]);

  const toggle = useCallback(async () => {
    if (!date || busy.current) return;
    busy.current = true;
    try {
      setMarked(await toggleDone(date));
      if (isToday) refreshWidget(settings);
    } finally {
      busy.current = false;
    }
  }, [key, isToday, settings]);

  return { marked, toggle };
}
