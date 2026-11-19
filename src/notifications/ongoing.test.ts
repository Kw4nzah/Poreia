import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

interface Posted {
  identifier?: string;
  content: Record<string, unknown>;
  trigger: Record<string, unknown> | null;
}

const posted: Posted[] = [];
const cancelled: string[] = [];
const dismissed: string[] = [];
const categories: string[] = [];
const channels: Record<string, unknown>[] = [];
let granted = true;
let pending: { identifier: string }[] = [];
let storedDone: string | null = null;
let failRollover = false;

vi.mock('react-native', () => ({ Platform: { OS: 'android' } }));
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: { getItem: async () => storedDone },
}));
vi.mock('expo-notifications', () => ({
  AndroidImportance: { DEFAULT: 3, LOW: 2 },
  AndroidNotificationVisibility: { SECRET: -1 },
  AndroidNotificationPriority: { LOW: 'low' },
  SchedulableTriggerInputTypes: { DATE: 'date' },
  setNotificationHandler: () => {},
  setNotificationChannelAsync: async (_id: string, channel: Record<string, unknown>) => {
    channels.push(channel);
  },
  setNotificationCategoryAsync: async (id: string) => {
    categories.push(id);
  },
  getPermissionsAsync: async () => ({ granted, canAskAgain: true }),
  getAllScheduledNotificationsAsync: async () => pending,
  cancelAllScheduledNotificationsAsync: async () => {
    cancelled.push('ALL');
  },
  cancelScheduledNotificationAsync: async (id: string) => {
    cancelled.push(id);
  },
  dismissNotificationAsync: async (id: string) => {
    dismissed.push(id);
  },
  scheduleNotificationAsync: async (request: Posted) => {
    if (failRollover && request.trigger && 'date' in request.trigger) throw new Error('no alarm');
    posted.push(request);
  },
}));

const { updateOngoing, nextRolloverTime } = await import('./ongoing');
const { ONGOING_ID, ONGOING_CHANNEL_ID, ONGOING_CATEGORY_TODO, ONGOING_CATEGORY_DONE } =
  await import('./ongoingContent');
const { syncDailyNotifications } = await import('./schedule');

const on = {
  language: 'en' as const,
  churchId: 'greek' as const,
  greekFish: 'greece' as const,
  persistentNotification: true,
  onboarded: true,
};

beforeEach(() => {
  posted.length = 0;
  cancelled.length = 0;
  dismissed.length = 0;
  categories.length = 0;
  channels.length = 0;
  granted = true;
  pending = [];
  storedDone = null;
  failRollover = false;
  // A fasting Tuesday (day 3 of the Nativity Fast), whatever the date really is.
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 10, 17, 12, 0, 0));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('nextRolloverTime', () => {
  it('is a few seconds after the next local midnight, also across month and year ends', () => {
    expect(nextRolloverTime(new Date(2026, 10, 19, 15, 30))).toEqual(
      new Date(2026, 10, 20, 0, 0, 5),
    );
    expect(nextRolloverTime(new Date(2026, 10, 30, 23, 59, 59))).toEqual(
      new Date(2026, 11, 1, 0, 0, 5),
    );
    expect(nextRolloverTime(new Date(2026, 11, 31, 0, 0, 0))).toEqual(
      new Date(2027, 0, 1, 0, 0, 5),
    );
  });
});

describe('updateOngoing', () => {
  it('posts a silent, sticky notification now and prepares the next midnight', async () => {
    await updateOngoing(on);
    expect(channels).toHaveLength(1);
    expect(channels[0]).toMatchObject({
      importance: 2,
      lockscreenVisibility: -1,
      enableVibrate: false,
      showBadge: false,
      sound: null,
    });
    expect(categories.sort()).toEqual([ONGOING_CATEGORY_DONE, ONGOING_CATEGORY_TODO].sort());
    expect(posted).toHaveLength(2);
    const [rollover, now] = posted;
    // Same identifier for both: the later post replaces the one on screen.
    expect(rollover.identifier).toBe(ONGOING_ID);
    expect(now.identifier).toBe(ONGOING_ID);
    expect(rollover.trigger).toMatchObject({ type: 'date', channelId: ONGOING_CHANNEL_ID });
    expect(now.trigger).toEqual({ channelId: ONGOING_CHANNEL_ID });
    for (const { content } of posted) {
      expect(content).toMatchObject({ sticky: true, autoDismiss: false, sound: false });
    }
    expect(String(now.content.title).length).toBeGreaterThan(0);
  });

  it('shows the marked state, then the unmarked state at the rollover', async () => {
    storedDone = '1';
    await updateOngoing(on);
    const [rollover, now] = posted;
    expect(now.content.categoryIdentifier).toBe(ONGOING_CATEGORY_DONE);
    expect(String(now.content.title).startsWith('✓')).toBe(true);
    // Tomorrow (18 November, still in the fast) starts unmarked.
    expect(rollover.content.categoryIdentifier).toBe(ONGOING_CATEGORY_TODO);
    expect(String(rollover.content.title).startsWith('✓')).toBe(false);
    expect(rollover.trigger).toMatchObject({ date: new Date(2026, 10, 18, 0, 0, 5) });
  });

  it('still posts now when the rollover alarm is refused', async () => {
    failRollover = true;
    await updateOngoing(on);
    expect(posted).toHaveLength(1);
    expect(posted[0].trigger).toEqual({ channelId: ONGOING_CHANNEL_ID });
  });

  it('posts nothing without the notification permission, and never asks for it', async () => {
    granted = false;
    await updateOngoing(on);
    expect(posted).toHaveLength(0);
    expect(channels).toHaveLength(0);
  });

  it('removes the notification and its rollover when turned off', async () => {
    await updateOngoing({ ...on, persistentNotification: false });
    expect(posted).toHaveLength(0);
    expect(cancelled).toEqual([ONGOING_ID]);
    expect(dismissed).toEqual([ONGOING_ID]);
  });

  it('is off before onboarding finishes', async () => {
    await updateOngoing({ ...on, onboarded: false });
    expect(posted).toHaveLength(0);
    expect(dismissed).toEqual([ONGOING_ID]);
  });

  it('collapses requests that arrive during a run into one more run', async () => {
    const runs = [updateOngoing(on), updateOngoing(on), updateOngoing({ ...on, language: 'tr' })];
    await Promise.all(runs);
    // First run, then one run with the newest settings: two posts each.
    expect(posted).toHaveLength(4);
    expect(String(posted[3].content.body)).toContain('Serbest');
  });
});

describe('the daily notifications and the persistent one', () => {
  it('rescheduling the daily ones leaves the persistent rollover alone', async () => {
    pending = [{ identifier: 'a' }, { identifier: ONGOING_ID }, { identifier: 'b' }];
    await syncDailyNotifications(null, 8, 'Daily');
    expect(cancelled).toEqual(['a', 'b']);
  });

  it('falls back to cancelling everything if the list cannot be read', async () => {
    pending = null as unknown as typeof pending;
    await syncDailyNotifications(null, 8, 'Daily');
    expect(cancelled).toEqual(['ALL']);
  });
});
