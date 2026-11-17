// Talks to the system: permission, channel and the scheduled notifications themselves.

import * as Notifications from 'expo-notifications';
import type { DailyNotification } from './content';

const CHANNEL_ID = 'daily';

/**
 * Nothing runs in the background, so the coming days are scheduled ahead each time the
 * app is opened. Past this many days without opening it, the notifications stop.
 */
export const DAYS_AHEAD = 30;

/** Repeats of the daily notification when "keep reminding me" is on. */
export const REPEAT_EVERY_MINUTES = 5;
export const REPEAT_COUNT = 6;
/** Only the first days get repeats, to keep the number of scheduled alarms small. */
const REPEAT_DAYS = 14;

// Without a handler a notification that fires while the app is open is dropped.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

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
) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!plan) return;
  if (!(await Notifications.getPermissionsAsync()).granted) return;
  await ensureChannel(channelName);
  const now = new Date();
  const todayKey = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
  let day = 0;
  for (const { date, title, body } of plan) {
    day++;
    const at = new Date(date.year, date.month - 1, date.day, hour, 0, 0);
    const times = [at];
    // Repeats start only after the app was last closed: opening it today already counts as seen,
    // and this runs on every open, so today's repeats are never scheduled.
    const isToday = `${date.year}-${date.month}-${date.day}` === todayKey;
    if (repeat && !isToday && day <= REPEAT_DAYS) {
      for (let k = 1; k <= REPEAT_COUNT; k++) {
        times.push(new Date(at.getTime() + k * REPEAT_EVERY_MINUTES * 60 * 1000));
      }
    }
    for (const when of times) {
      if (when.getTime() <= now.getTime()) continue;
      await Notifications.scheduleNotificationAsync({
        content: { title, body },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: when,
          channelId: CHANNEL_ID,
        },
      });
    }
  }
}

let queue: Promise<void> = Promise.resolve();

/**
 * Replaces everything scheduled with `plan`, or clears it when `plan` is null.
 * Calls run one after another so two quick setting changes cannot interleave.
 */
export function syncDailyNotifications(
  plan: DailyNotification[] | null,
  hour: number,
  channelName: string,
  repeat = false,
): Promise<void> {
  // A failure only means no notification; the next app start schedules again.
  queue = queue.then(() => replaceAll(plan, hour, channelName, repeat)).catch(() => {});
  return queue;
}
