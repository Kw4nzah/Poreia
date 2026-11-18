// Talks to the system: permission, channel and the scheduled notifications themselves.

import * as Notifications from 'expo-notifications';
import { type DailyNotification, type ScheduledNotification, notificationTimes } from './content';

export const CHANNEL_ID = 'daily';

/**
 * Nothing runs in the background, so the coming days are scheduled ahead each time the
 * app is opened. Past this many days without opening it, the notifications stop.
 */
export const DAYS_AHEAD = 30;

// Without a handler a notification that fires while the app is open is dropped. Setting it is
// best effort: a build without the module must still start.
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
} catch {
  // No notification support in this build.
}

function ensureChannel(name: string) {
  return Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name,
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

/** Asks for permission if needed. False when the user has refused. */
export async function requestPermission(channelName: string): Promise<boolean> {
  // Android 13+ only shows its prompt once a channel exists.
  await ensureChannel(channelName);
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  return (await Notifications.requestPermissionsAsync()).granted;
}

async function replaceAll(
  plan: DailyNotification[] | null,
  hour: number,
  channelName: string,
  repeat: boolean,
  eve: readonly ScheduledNotification[],
) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!plan && eve.length === 0) return;
  if (!(await Notifications.getPermissionsAsync()).granted) return;
  await ensureChannel(channelName);
  const now = new Date();
  // The few evening reminders go first, so a refused alarm never costs one of them.
  const moments = [
    ...eve.filter(({ when }) => when.getTime() > now.getTime()),
    ...(plan ? notificationTimes(plan, hour, repeat, now) : []),
  ];
  for (const { when, title, body } of moments) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: { title, body },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: when,
          channelId: CHANNEL_ID,
        },
      });
    } catch {
      // One refused alarm (for example the system's alarm limit) must not drop the days after it.
    }
  }
}

type Request = Parameters<typeof replaceAll>;

let queue: Promise<void> = Promise.resolve();
let waiting: Request | null = null;

/**
 * Replaces everything scheduled with `plan` (the daily notifications) and `eve` (the evening-before
 * reminders), or clears it when `plan` is null and `eve` is empty.
 * Calls run one after another so two quick setting changes cannot interleave, and while one is
 * running only the newest waiting request is kept (the older ones would be overwritten anyway).
 */
export function syncDailyNotifications(
  plan: DailyNotification[] | null,
  hour: number,
  channelName: string,
  repeat = false,
  eve: readonly ScheduledNotification[] = [],
): Promise<void> {
  waiting = [plan, hour, channelName, repeat, eve];
  queue = queue
    .then(() => {
      const request = waiting;
      waiting = null;
      return request ? replaceAll(...request) : undefined;
    })
    // A failure only means no notification; the next app start schedules again.
    .catch(() => {});
  return queue;
}
