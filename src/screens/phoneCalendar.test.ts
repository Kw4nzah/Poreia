import { beforeEach, describe, expect, it, vi } from 'vitest';

const store = vi.hoisted(() => new Map<string, string>());
const cal = vi.hoisted(() => ({
  granted: true,
  calendars: [] as { id: string; title: string; allowsModifications: boolean }[],
  events: [] as { id: string }[],
  created: [] as unknown[],
  deleted: [] as string[],
  deletedCalendars: [] as string[],
  failCreate: false,
}));

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: async (k: string) => store.get(k) ?? null,
    setItem: async (k: string, v: string) => void store.set(k, v),
    removeItem: async (k: string) => void store.delete(k),
  },
}));
vi.mock('expo-calendar/legacy', () => ({
  Availability: { FREE: 'free' },
  CalendarAccessLevel: { OWNER: 'owner' },
  EntityTypes: { EVENT: 'event' },
  SourceType: { LOCAL: 'local' },
  requestCalendarPermissionsAsync: async () => ({ granted: cal.granted }),
  getCalendarsAsync: async () => cal.calendars,
  createCalendarAsync: async () => {
    cal.calendars.push({ id: 'new', title: 'Poreia', allowsModifications: true });
    return 'new';
  },
  deleteCalendarAsync: async (id: string) => {
    cal.deletedCalendars.push(id);
    cal.calendars = cal.calendars.filter((c) => c.id !== id);
  },
  getEventsAsync: async () => cal.events,
  deleteEventAsync: async (id: string) => void cal.deleted.push(id),
  createEventAsync: async (_id: string, e: unknown) => {
    if (cal.failCreate) throw new Error('boom');
    cal.created.push(e);
    return 'e';
  },
}));

import { en } from '../i18n/en';
import { removePhoneCalendar, syncPhoneCalendar } from './phoneCalendar';

const today = { year: 2026, month: 11, day: 20 };

beforeEach(() => {
  store.clear();
  Object.assign(cal, {
    granted: true,
    calendars: [],
    events: [],
    created: [],
    deleted: [],
    deletedCalendars: [],
    failCreate: false,
  });
});

describe('phone calendar sync', () => {
  it('reports a denied permission without touching anything', async () => {
    cal.granted = false;
    expect(await syncPhoneCalendar(today, 'greek', en)).toEqual({ ok: false, reason: 'permission' });
    expect(cal.created).toHaveLength(0);
  });

  it('creates the calendar, remembers its id and writes all-day events', async () => {
    const result = await syncPhoneCalendar(today, 'greek', en);
    expect(result.ok && result.count).toBeGreaterThan(100);
    expect(store.get('poreia.phoneCalendarId')).toBe('new');
    expect(cal.created).toHaveLength(result.ok ? result.count : -1);
    expect(cal.created[0]).toMatchObject({ allDay: true });
  });

  it('deletes the previous events first and reuses the calendar, so nothing duplicates', async () => {
    cal.calendars.push({ id: 'old', title: 'Poreia', allowsModifications: true });
    store.set('poreia.phoneCalendarId', 'old');
    cal.events = [{ id: 'a' }, { id: 'b' }];
    await syncPhoneCalendar(today, 'greek', en);
    expect(cal.deleted).toEqual(['a', 'b']);
    expect(cal.calendars).toHaveLength(1);
  });

  it('turns a write error into a result instead of throwing', async () => {
    cal.failCreate = true;
    expect(await syncPhoneCalendar(today, 'greek', en)).toEqual({ ok: false, reason: 'failed' });
  });

  it('removes the calendar and forgets its id', async () => {
    cal.calendars.push({ id: 'old', title: 'Poreia', allowsModifications: true });
    store.set('poreia.phoneCalendarId', 'old');
    expect(await removePhoneCalendar()).toEqual({ ok: true, removed: true });
    expect(cal.deletedCalendars).toEqual(['old']);
    expect(store.has('poreia.phoneCalendarId')).toBe(false);
    expect(await removePhoneCalendar()).toEqual({ ok: true, removed: false });
  });
});
