// The optional persistent notification: talks to the system. What it says is in ongoingContent.ts.
//
// How it stays current, and what can and cannot be promised:
//  - GUARANTEED: it is posted again each time the app opens or returns to the foreground, when the
//    "I am fasting today" mark changes, when the day changes while the app is open and when a
//    setting that it depends on changes. Turning the setting off removes it and its rollover.
//  - BEST EFFORT: while the app stays closed, one rollover is scheduled for just after the next
//    local midnight. Android shows a notification under its identifier as a tag, so a post under
//    the same identifier replaces the one on screen; but a scheduled identifier holds one moment
//    only, so just one midnight can be prepared ahead (several distinct identifiers would pile up
//    instead of replacing each other, and nothing can dismiss the old one without running the app).
//    After that midnight it shows the right day until the app is opened next. Doze may delay it.
//  - Android 14 and later let the user swipe away an ongoing notification that is not tied to a
//    foreground service; it comes back the next time the app opens.
//  - It is never prompted for here: without the notification permission nothing is posted.

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { CHURCHES, civilFromLocalDate } from '../calendar';
import { MESSAGES } from '../i18n';
import type { Settings } from '../settings/model';
import { readDone } from '../widget/doneStore';
import {
  ONGOING_CATEGORY_DONE,
  ONGOING_CATEGORY_TODO,
  ONGOING_CHANNEL_ID,
  ONGOING_ID,
  ONGOING_TOGGLE_ACTION,
  OngoingContent,
  ongoingContentFor,
} from './ongoingContent';
// Imported for its side effect too: it installs the handler that lets a notification show while the
// app is open.
import './schedule';

export type OngoingSettings = Pick<
  Settings,
  'language' | 'churchId' | 'greekFish' | 'persistentNotification' | 'onboarded'
>;

/** The rollover lands this many seconds after local midnight. */
export const ROLLOVER_DELAY_SECONDS = 5;

/** Local moment of the rollover: just after the midnight that follows `now`. */
export function nextRolloverTime(now: Date): Date {
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
    0,
    0,
    ROLLOVER_DELAY_SECONDS,
  );
}

function ensureChannel(name: string) {
  return Notifications.setNotificationChannelAsync(ONGOING_CHANNEL_ID, {
    name,
    // Low: silent, no heads-up banner. Settings of an existing channel are the user's to change.
    importance: Notifications.AndroidImportance.LOW,
    // Secret: nothing on the lock screen. That a person fasts is private, and the notification is
    // long-lived, so it would sit on the lock screen all day.
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.SECRET,
    showBadge: false,
    enableVibrate: false,
    enableLights: false,
    sound: null,
  });
}

/** Registers the two button states; labels are re-registered so a language change reaches them. */
async function ensureCategories(todoLabel: string, undoLabel: string) {
  const action = (buttonTitle: string) => [
    // The tap opens the app: a button that does not is only delivered while the app is running.
    { identifier: ONGOING_TOGGLE_ACTION, buttonTitle, options: { opensAppToForeground: true } },
  ];
  await Notifications.setNotificationCategoryAsync(ONGOING_CATEGORY_TODO, action(todoLabel));
  await Notifications.setNotificationCategoryAsync(ONGOING_CATEGORY_DONE, action(undoLabel));
}

function request(content: OngoingContent, trigger: Notifications.NotificationTriggerInput) {
  return {
    identifier: ONGOING_ID,
    content: {
      title: content.title,
      subtitle: content.subtitle,
      body: content.body,
      sticky: true,
      // A tap on the body opens the app and must not remove the notification.
      autoDismiss: false,
      sound: false,
      priority: Notifications.AndroidNotificationPriority.LOW,
      ...(content.category ? { categoryIdentifier: content.category } : {}),
    },
    trigger,
  };
}

async function remove() {
  // Both are best effort and independent: either may find nothing to remove.
  await Notifications.cancelScheduledNotificationAsync(ONGOING_ID).catch(() => {});
  await Notifications.dismissNotificationAsync(ONGOING_ID).catch(() => {});
}

async function apply(settings: OngoingSettings | null, now: Date) {
  if (Platform.OS !== 'android') return;
  if (!settings || !(settings.onboarded && settings.persistentNotification)) {
    await remove();
    return;
  }
  if (!(await Notifications.getPermissionsAsync()).granted) return;

  const m = MESSAGES[settings.language];
  const church = CHURCHES[settings.churchId];
  const options = { greekFish: settings.greekFish };
  const today = civilFromLocalDate(now);
  const rollover = nextRolloverTime(now);

  await ensureChannel(m.settings.ongoingChannel);
  await ensureCategories(m.widget.complete, m.settings.ongoingUndo);

  const marked = await readDone(today);
  const current = ongoingContentFor(today, church, settings.language, marked, options);
  // Tomorrow is never marked yet.
  const next = ongoingContentFor(
    civilFromLocalDate(rollover),
    church,
    settings.language,
    false,
    options,
  );

  // The rollover goes first: the immediate post below is what the user sees, and a refused alarm
  // must not cost them that.
  await Notifications.scheduleNotificationAsync(
    request(next, {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: rollover,
      channelId: ONGOING_CHANNEL_ID,
    }),
  ).catch(() => {});
  await Notifications.scheduleNotificationAsync(
    request(current, { channelId: ONGOING_CHANNEL_ID }),
  );
}

let latest: OngoingSettings | null = null;
let running: Promise<void> | null = null;
let again = false;

/**
 * Brings the notification in line with the newest settings seen. Runs never overlap, and requests
 * that arrive during a run collapse into one more run afterwards.
 */
function sync(): Promise<void> {
  again = true;
  if (running) return running;
  running = (async () => {
    try {
      while (again) {
        again = false;
        try {
          await apply(latest, new Date());
        } catch {
          // The next open or change tries again.
        }
      }
    } finally {
      running = null;
    }
  })();
  return running;
}

/** Remembers these settings and brings the notification in line with them. */
export function updateOngoing(settings: OngoingSettings): Promise<void> {
  latest = settings;
  return sync();
}

/** Posts it again from the settings last seen: the mark changed or the app came back. */
export function refreshOngoing(): Promise<void> {
  return latest ? sync() : Promise.resolve();
}
