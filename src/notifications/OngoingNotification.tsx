import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { civilFromLocalDate } from '../calendar';
import { useSettings } from '../settings/SettingsProvider';
import { useToday } from '../ui/useToday';
import { toggleDone } from '../widget/doneStore';
import { refreshWidget } from '../widget/refresh';
import { refreshOngoing, updateOngoing } from './ongoing';
import { ONGOING_ID, ONGOING_TOGGLE_ACTION } from './ongoingContent';

/** Responses already acted on, so a response the system hands over again flips the mark once. */
const handled = new WeakSet<object>();

/**
 * Keeps the persistent notification in step with the settings, the date and the app's state, and
 * carries out its "I am fasting today" button. Renders nothing.
 */
export function OngoingNotification() {
  const { settings } = useSettings();
  const today = useToday();
  const { language, churchId, greekFish, persistentNotification, onboarded } = settings;

  useEffect(() => {
    void updateOngoing({ language, churchId, greekFish, persistentNotification, onboarded });
  }, [language, churchId, greekFish, persistentNotification, onboarded, today]);

  // Back in the foreground: the day may have changed, or the user may have swiped it away.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refreshOngoing();
    });
    return () => subscription.remove();
  }, []);

  // The button opens the app, so the response arrives here, also when the app was not running.
  const response = Notifications.useLastNotificationResponse();
  useEffect(() => {
    if (!response || handled.has(response)) return;
    if (
      response.notification.request.identifier !== ONGOING_ID ||
      response.actionIdentifier !== ONGOING_TOGGLE_ACTION
    ) {
      return;
    }
    handled.add(response);
    toggleDone(civilFromLocalDate(new Date()))
      // Redraws the widget and, through it, this notification.
      .then(() => refreshWidget(settings))
      .catch(() => {});
  }, [response, settings]);

  return null;
}
