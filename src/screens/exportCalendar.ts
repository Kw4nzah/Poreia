// Writes the coming year's feasts and fasts as an .ics file and hands it to the calendar app.

import { File, Paths } from 'expo-file-system';
import { startActivityAsync } from 'expo-intent-launcher';
import { CHURCHES, CivilDate, buildIcs, getUpcomingEvents } from '../calendar';
import type { Messages } from '../i18n';
import type { ChurchId } from '../calendar';

const FLAG_GRANT_READ_URI_PERMISSION = 1;
/** Enough for every feast and fast of a year with room to spare. */
const MAX_EVENTS = 400;

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function utcStamp(now: Date): string {
  return (
    `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}` +
    `T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`
  );
}

/** Resolves true when a calendar app was opened, false when nothing could handle the file. */
export async function exportUpcomingToCalendar(
  today: CivilDate,
  churchId: ChurchId,
  m: Messages,
): Promise<boolean> {
  try {
    const events = getUpcomingEvents(today, CHURCHES[churchId], { limit: MAX_EVENTS }).map(
      (event) => ({
        uid: `${event.kind}-${event.id}-${event.date.year}${pad(event.date.month)}${pad(event.date.day)}`,
        date: event.date,
        summary: event.kind === 'feast' ? m.feast[event.id] : m.majorFast[event.id],
      }),
    );
    const file = new File(Paths.cache, 'poreia-calendar.ics');
    file.create({ overwrite: true });
    await file.write(buildIcs(events, m.upcoming.calendarName, utcStamp(new Date())));
    await startActivityAsync('android.intent.action.VIEW', {
      data: file.contentUri,
      type: 'text/calendar',
      flags: FLAG_GRANT_READ_URI_PERMISSION,
    });
    return true;
  } catch {
    return false;
  }
}
