// Turns what the phone reports about notifications into short rows of plain text. Pure, so it can
// be tested without a device. Anything the phone did not report is shown as "unknown", never guessed.

import type { Messages } from '../i18n';

export type PermissionState = 'granted' | 'denied' | 'undetermined';

/** What could be read from the system. `null` means it could not be read. */
export interface Diagnostics {
  permission: PermissionState | null;
  /** Android channel importance, the `AndroidImportance` number. */
  importance: number | null;
  scheduledCount: number | null;
  /** The earliest scheduled moment still ahead, if any. */
  nextAt: Date | null;
  exactAlarms: boolean | null;
}

export const UNKNOWN_DIAGNOSTICS: Diagnostics = {
  permission: null,
  importance: null,
  scheduledCount: null,
  nextAt: null,
  exactAlarms: null,
};

export type RowTone = 'ok' | 'warning' | 'neutral';

export interface DiagnosticRow {
  id: 'permission' | 'channel' | 'scheduled' | 'next' | 'exact';
  label: string;
  value: string;
  tone: RowTone;
}

/** Maps the expo permission status string; anything else is unknown. */
export function permissionState(status: unknown): PermissionState | null {
  return status === 'granted' || status === 'denied' || status === 'undetermined' ? status : null;
}

type S = Messages['support'];

/** Android importance number (NONE 2 ... MAX 7) to words; 0 and 1 are "unknown/unspecified". */
export function importanceLabel(importance: number | null, s: S): { text: string; tone: RowTone } {
  switch (importance) {
    case 2:
      return { text: s.importanceOff, tone: 'warning' };
    case 3:
      return { text: s.importanceMin, tone: 'warning' };
    case 4:
      return { text: s.importanceLow, tone: 'warning' };
    case 5:
      return { text: s.importanceDefault, tone: 'ok' };
    case 6:
    case 7:
      return { text: s.importanceHigh, tone: 'ok' };
    default:
      return { text: s.unknown, tone: 'neutral' };
  }
}

const two = (n: number) => String(n).padStart(2, '0');

/** "19 November, 08:00" in the interface language. */
export function formatMoment(when: Date, m: Messages): string {
  return `${m.dayMonth(when.getDate(), m.months[when.getMonth()])}, ${two(when.getHours())}:${two(when.getMinutes())}`;
}

/**
 * Earliest moment after `now` among scheduled triggers as the system lists them. Date triggers carry
 * `value` (milliseconds) or a Date; triggers of other kinds say nothing about a moment and are skipped.
 */
export function nextTriggerTime(triggers: readonly unknown[], now: Date): Date | null {
  let best: number | null = null;
  for (const trigger of triggers) {
    if (!trigger || typeof trigger !== 'object') continue;
    const { value, date } = trigger as { value?: unknown; date?: unknown };
    const raw = value ?? date;
    const ms = raw instanceof Date ? raw.getTime() : typeof raw === 'number' ? raw : NaN;
    if (!Number.isFinite(ms) || ms <= now.getTime()) continue;
    if (best === null || ms < best) best = ms;
  }
  return best === null ? null : new Date(best);
}

/** The rows of the check card, in the order they are shown. */
export function describeDiagnostics(d: Diagnostics, m: Messages): DiagnosticRow[] {
  const s = m.support;
  const rows: DiagnosticRow[] = [];

  rows.push({
    id: 'permission',
    label: s.rowPermission,
    ...(d.permission === 'granted'
      ? { value: s.permissionGranted, tone: 'ok' as const }
      : d.permission === 'denied'
        ? { value: s.permissionDenied, tone: 'warning' as const }
        : d.permission === 'undetermined'
          ? { value: s.permissionUndetermined, tone: 'warning' as const }
          : { value: s.unknown, tone: 'neutral' as const }),
  });

  const channel = importanceLabel(d.importance, s);
  rows.push({ id: 'channel', label: s.rowChannel, value: channel.text, tone: channel.tone });

  rows.push({
    id: 'scheduled',
    label: s.rowScheduled,
    value: d.scheduledCount === null ? s.unknown : String(d.scheduledCount),
    tone: d.scheduledCount === null ? 'neutral' : d.scheduledCount > 0 ? 'ok' : 'warning',
  });

  rows.push({
    id: 'next',
    label: s.rowNext,
    value: d.nextAt ? formatMoment(d.nextAt, m) : d.scheduledCount === null ? s.unknown : s.none,
    tone: d.nextAt ? 'ok' : d.scheduledCount === null ? 'neutral' : 'warning',
  });

  rows.push({
    id: 'exact',
    label: s.rowExact,
    ...(d.exactAlarms === null
      ? { value: s.unknown, tone: 'neutral' as const }
      : d.exactAlarms
        ? { value: s.exactAllowed, tone: 'ok' as const }
        : { value: s.exactBlocked, tone: 'warning' as const }),
  });

  return rows;
}
