import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { CHURCHES } from '../calendar';
import { useSettings } from '../settings/SettingsProvider';
import { useToday } from '../ui/useToday';
import { planNotifications } from './content';
import { DAYS_AHEAD, syncDailyNotifications } from './schedule';

function currentTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? '';
  } catch {
    return '';
  }
}

/**
 * The device's timezone, re-read whenever the app returns to the foreground. Notifications are
 * scheduled as absolute moments, so a trip to another timezone needs them scheduled again.
 */
function useTimeZone(): string {
  const [zone, setZone] = useState(currentTimeZone);
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') setZone(currentTimeZone());
    });
    return () => subscription.remove();
  }, []);
  return zone;
}

/** Keeps the scheduled notifications in step with the date and the settings. Renders nothing. */
export function DailyNotifications() {
  const { settings, messages } = useSettings();
  const today = useToday();
  const zone = useTimeZone();
  const enabled = settings.onboarded && settings.notifications;
  const { churchId, notificationHour, notificationRepeat, greekFish } = settings;

  useEffect(() => {
    // A failure inside the plan or the scheduler is never allowed to become an unhandled rejection.
    try {
      const plan = enabled
        ? planNotifications(today, DAYS_AHEAD, CHURCHES[churchId], messages, { greekFish })
        : null;
      syncDailyNotifications(
        plan,
        notificationHour,
        messages.settings.notificationsChannel,
        notificationRepeat,
      ).catch(() => {});
    } catch {
      // Try again on the next change or app start.
    }
  }, [enabled, churchId, notificationHour, notificationRepeat, greekFish, messages, today, zone]);

  return null;
}
