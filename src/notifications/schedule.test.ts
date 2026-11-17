import { beforeEach, describe, expect, it, vi } from 'vitest';

const calls: string[] = [];
let permissionGranted = true;
let failScheduleAt: number | null = null;
let scheduled = 0;
let release: (() => void) | null = null;

vi.mock('expo-notifications', () => ({
  AndroidImportance: { DEFAULT: 3 },
  SchedulableTriggerInputTypes: { DATE: 'date' },
  setNotificationHandler: () => {},
  setNotificationChannelAsync: async () => {
    calls.push('channel');
  },
  getPermissionsAsync: async () => ({ granted: permissionGranted, canAskAgain: true }),
  requestPermissionsAsync: async () => ({ granted: permissionGranted }),
  cancelAllScheduledNotificationsAsync: async () => {
    calls.push('cancel');
    // Lets a test hold the first sync open while it queues more.
    if (release === null && holdFirst) await new Promise<void>((resolve) => (release = resolve));
  },
  scheduleNotificationAsync: async () => {
    scheduled++;
    if (failScheduleAt !== null && scheduled === failScheduleAt) throw new Error('alarm limit');
    calls.push('schedule');
  },
}));

let holdFirst = false;

const { syncDailyNotifications } = await import('./schedule');
const { CHURCHES } = await import('../calendar');
const { en } = await import('../i18n/en');
const { planNotifications } = await import('./content');

// Far enough ahead that every moment is in the future whatever today's date is.
const plan = (days: number) =>
  planNotifications({ year: 2099, month: 1, day: 1 }, days, CHURCHES.greek, en);

beforeEach(() => {
  calls.length = 0;
  permissionGranted = true;
  failScheduleAt = null;
  scheduled = 0;
  release = null;
  holdFirst = false;
});

describe('syncDailyNotifications', () => {
  it('cancels everything, then schedules one notification per day', async () => {
    await syncDailyNotifications(plan(3), 8, 'Daily');
    expect(calls).toEqual(['cancel', 'channel', 'schedule', 'schedule', 'schedule']);
  });

  it('only cancels when the plan is null (notifications switched off)', async () => {
    await syncDailyNotifications(null, 8, 'Daily');
    expect(calls).toEqual(['cancel']);
  });

  it('schedules nothing without permission', async () => {
    permissionGranted = false;
    await syncDailyNotifications(plan(3), 8, 'Daily');
    expect(calls).toEqual(['cancel']);
  });

  it('keeps scheduling the days after one the system refused', async () => {
    failScheduleAt = 2;
    await expect(syncDailyNotifications(plan(4), 8, 'Daily')).resolves.toBeUndefined();
    expect(calls.filter((c) => c === 'schedule')).toHaveLength(3);
  });

  it('runs one sync at a time and drops the requests it would overwrite anyway', async () => {
    holdFirst = true;
    const first = syncDailyNotifications(plan(2), 8, 'Daily');
    // The first is held inside cancel; the next two arrive while it runs.
    await vi.waitFor(() => expect(release).not.toBeNull());
    expect(calls).toEqual(['cancel']);
    const second = syncDailyNotifications(plan(5), 8, 'Daily');
    const third = syncDailyNotifications(plan(1), 8, 'Daily');
    holdFirst = false;
    release!();
    await Promise.all([first, second, third]);
    // First: 2 days. Second request was replaced by the third: 1 day.
    expect(calls.filter((c) => c === 'cancel')).toHaveLength(2);
    expect(calls.filter((c) => c === 'schedule')).toHaveLength(3);
  });
});
