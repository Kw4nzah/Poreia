// Writes the fasting days and feasts into the phone's own calendar. A dedicated local calendar
// named "Poreia" holds them; its id is remembered, and every sync first empties it, so repeated
// syncs never duplicate. Nothing here throws: every outcome is a result the UI can show.

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Availability,
  CalendarAccessLevel,
  EntityTypes,
  SourceType,
  createCalendarAsync,
  createEventAsync,
  deleteCalendarAsync,
  deleteEventAsync,
  getCalendarsAsync,
  getEventsAsync,
  requestCalendarPermissionsAsync,
} from 'expo-calendar/legacy';
import {
  CHURCHES,
  CalendarEventPlan,
  CivilDate,
  ChurchId,
  buildPhoneCalendarPlan,
  gregorianToJdn,
  jdnToGregorian,
} from '../calendar';
import type { Messages } from '../i18n';

export const PHONE_CALENDAR_TITLE = 'Poreia';
export const CALENDAR_ID_KEY = 'poreia.phoneCalendarId';
const CALENDAR_COLOR = '#7A1F2B';
/** Events are written and deleted in small groups to keep the native bridge responsive. */
const BATCH = 20;
/** Window searched for leftovers of an earlier sync. */
const CLEAN_BEFORE_DAYS = 400;
const CLEAN_AFTER_DAYS = 1100;

export type PhoneCalendarResult =
  | { ok: true; count: number }
  | { ok: false; reason: 'permission' | 'noCalendar' | 'failed' };

export type PhoneCalendarRemoveResult =
  | { ok: true; removed: boolean }
  | { ok: false; reason: 'permission' | 'failed' };

async function inBatches<T>(items: readonly T[], work: (item: T) => Promise<unknown>) {
  for (let i = 0; i < items.length; i += BATCH) {
    await Promise.all(items.slice(i, i + BATCH).map(work));
  }
}

async function hasPermission(): Promise<boolean> {
  try {
    const response = await requestCalendarPermissionsAsync();
    return response.granted;
  } catch {
    return false;
  }
}

/** The id of our calendar if it still exists: the stored one first, else one found by title. */
async function findCalendarId(): Promise<string | null> {
  const calendars = await getCalendarsAsync(EntityTypes.EVENT);
  const stored = await AsyncStorage.getItem(CALENDAR_ID_KEY);
  if (stored && calendars.some((c) => c.id === stored)) return stored;
  const byTitle = calendars.find((c) => c.title === PHONE_CALENDAR_TITLE && c.allowsModifications);
  return byTitle?.id ?? null;
}

async function createCalendar(): Promise<string> {
  const id = await createCalendarAsync({
    title: PHONE_CALENDAR_TITLE,
    name: PHONE_CALENDAR_TITLE,
    color: CALENDAR_COLOR,
    entityType: EntityTypes.EVENT,
    source: { isLocalAccount: true, name: PHONE_CALENDAR_TITLE, type: SourceType.LOCAL },
    ownerAccount: PHONE_CALENDAR_TITLE,
    accessLevel: CalendarAccessLevel.OWNER,
  });
  await AsyncStorage.setItem(CALENDAR_ID_KEY, id);
  return id;
}

/** All-day events are stored at UTC midnight; the end day is exclusive. */
export function allDayRange(date: CivilDate): { start: Date; end: Date } {
  const start = new Date(Date.UTC(date.year, date.month - 1, date.day));
  return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
}

async function clearCalendar(calendarId: string, today: CivilDate): Promise<void> {
  const jdn = gregorianToJdn(today.year, today.month, today.day);
  const from = jdnToGregorian(jdn - CLEAN_BEFORE_DAYS);
  const to = jdnToGregorian(jdn + CLEAN_AFTER_DAYS);
  const old = await getEventsAsync(
    [calendarId],
    allDayRange(from).start,
    allDayRange(to).end,
  );
  await inBatches(old, (event) => deleteEventAsync(event.id));
}

async function writeEvent(calendarId: string, event: CalendarEventPlan): Promise<void> {
  const { start, end } = allDayRange(event.date);
  await createEventAsync(calendarId, {
    title: event.title,
    notes: event.notes,
    startDate: start,
    endDate: end,
    allDay: true,
    timeZone: 'UTC',
    availability: Availability.FREE,
  });
}

/** Replaces the events of the "Poreia" calendar with the next 12 months. */
export async function syncPhoneCalendar(
  today: CivilDate,
  churchId: ChurchId,
  m: Messages,
): Promise<PhoneCalendarResult> {
  if (!(await hasPermission())) return { ok: false, reason: 'permission' };
  let calendarId: string | null;
  try {
    calendarId = (await findCalendarId()) ?? (await createCalendar());
  } catch {
    return { ok: false, reason: 'noCalendar' };
  }
  try {
    const plan = buildPhoneCalendarPlan(today, CHURCHES[churchId], m);
    await clearCalendar(calendarId, today);
    await inBatches(plan, (event) => writeEvent(calendarId, event));
    return { ok: true, count: plan.length };
  } catch {
    return { ok: false, reason: 'failed' };
  }
}

/** Deletes the "Poreia" calendar and everything in it. */
export async function removePhoneCalendar(): Promise<PhoneCalendarRemoveResult> {
  if (!(await hasPermission())) return { ok: false, reason: 'permission' };
  try {
    const calendarId = await findCalendarId();
    await AsyncStorage.removeItem(CALENDAR_ID_KEY);
    if (!calendarId) return { ok: true, removed: false };
    await deleteCalendarAsync(calendarId);
    return { ok: true, removed: true };
  } catch {
    return { ok: false, reason: 'failed' };
  }
}
