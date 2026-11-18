import { useCallback, useMemo } from 'react';
import { CHURCHES, CivilDate, gregorianToJdn } from '../calendar';
import { useSettings } from '../settings/SettingsProvider';
import { periodKey } from './periods';
import { pendingReport } from './report';
import { markReportSeen } from './seen';
import { useReportInputs } from './useReportInputs';

/**
 * The report Today should offer once (a fast that ended and has not been seen), and `markSeen`
 * for when the user opens or dismisses it.
 */
export function usePendingReport(today: CivilDate) {
  const { settings } = useSettings();
  const { done, seen, loaded, addSeen } = useReportInputs();
  const todayJdn = gregorianToJdn(today.year, today.month, today.day);

  const pending = useMemo(
    () =>
      loaded
        ? pendingReport(done, seen, CHURCHES[settings.churchId], todayJdn, {
            greekFish: settings.greekFish,
          })
        : null,
    [loaded, done, seen, settings.churchId, settings.greekFish, todayJdn],
  );

  const markSeen = useCallback(() => {
    if (!pending) return;
    addSeen(periodKey(pending.period));
    void markReportSeen(pending.period);
  }, [pending, addSeen]);

  return { pending, markSeen };
}
