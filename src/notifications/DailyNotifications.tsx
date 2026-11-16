import { useEffect } from 'react';
import { CHURCHES } from '../calendar';
import { useSettings } from '../settings/SettingsProvider';
import { useToday } from '../ui/useToday';
import { planNotifications } from './content';
import { DAYS_AHEAD, syncDailyNotifications } from './schedule';

/** Keeps the scheduled notifications in step with the date and the settings. Renders nothing. */
export function DailyNotifications() {
  const { settings, messages } = useSettings();
  const today = useToday();
  const enabled = settings.onboarded && settings.notifications;
  const { churchId, notificationHour, greekFish } = settings;

  useEffect(() => {
    const plan = enabled
      ? planNotifications(today, DAYS_AHEAD, CHURCHES[churchId], messages, { greekFish })
      : null;
    syncDailyNotifications(plan, notificationHour, messages.settings.notificationsChannel);
  }, [enabled, churchId, notificationHour, greekFish, messages, today]);

  return null;
}
