// Reads what the system says about this app's notifications, and sends a test one. Every read is
// independent and never throws: what cannot be read stays `null` ("unknown" on screen).

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { ONGOING_ID } from './ongoingContent';
import { CHANNEL_ID, requestPermission } from './schedule';
import {
  Diagnostics,
  UNKNOWN_DIAGNOSTICS,
  nextTriggerTime,
  permissionState,
} from './diagnosticsFormat';

/** The test notification arrives this many seconds after the button is pressed. */
export const TEST_DELAY_SECONDS = 5;

async function safe<T>(read: () => Promise<T>): Promise<T | null> {
  try {
    return await read();
  } catch {
    return null;
  }
}

export async function readDiagnostics(now = new Date()): Promise<Diagnostics> {
  if (Platform.OS !== 'android') return UNKNOWN_DIAGNOSTICS;
  const [permissions, channel, scheduled, exact] = await Promise.all([
    safe(() => Notifications.getPermissionsAsync()),
    safe(() => Notifications.getNotificationChannelAsync(CHANNEL_ID)),
    // The persistent notification's rollover is not a reminder; it must not count or show as "next".
    safe(async () =>
      (await Notifications.getAllScheduledNotificationsAsync()).filter(
        (request) => request.identifier !== ONGOING_ID,
      ),
    ),
    safe(() => Notifications.getExactAlarmPermissionsAsync()),
  ]);
  return {
    permission: permissionState(permissions?.status),
    importance: typeof channel?.importance === 'number' ? channel.importance : null,
    scheduledCount: scheduled ? scheduled.length : null,
    nextAt: scheduled
      ? nextTriggerTime(
          scheduled.map((request) => request.trigger),
          now,
        )
      : null,
    exactAlarms: typeof exact?.granted === 'boolean' ? exact.granted : null,
  };
}

export type TestResult = 'scheduled' | 'blocked' | 'failed';

/** Schedules one notification a few seconds from now, asking for permission first if needed. */
export async function sendTestNotification(
  channelName: string,
  title: string,
  body: string,
): Promise<TestResult> {
  try {
    if (!(await requestPermission(channelName))) return 'blocked';
    await Notifications.scheduleNotificationAsync({
      content: { title, body },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: TEST_DELAY_SECONDS,
        channelId: CHANNEL_ID,
      },
    });
    return 'scheduled';
  } catch {
    return 'failed';
  }
}
