import { describe, expect, it } from 'vitest';
import { LANGUAGES, MESSAGES } from '../i18n';
import {
  UNKNOWN_DIAGNOSTICS,
  describeDiagnostics,
  formatMoment,
  importanceLabel,
  nextTriggerTime,
  permissionState,
} from './diagnosticsFormat';

const NOW = new Date(2026, 10, 19, 12, 0);

describe('permissionState', () => {
  it('accepts the three statuses and nothing else', () => {
    expect(permissionState('granted')).toBe('granted');
    expect(permissionState('denied')).toBe('denied');
    expect(permissionState('undetermined')).toBe('undetermined');
    expect(permissionState('maybe')).toBeNull();
    expect(permissionState(undefined)).toBeNull();
  });
});

describe('nextTriggerTime', () => {
  it('picks the earliest moment still ahead', () => {
    const later = new Date(2026, 10, 21, 8, 0).getTime();
    const sooner = new Date(2026, 10, 20, 8, 0).getTime();
    const past = new Date(2026, 10, 18, 8, 0).getTime();
    const next = nextTriggerTime(
      [{ type: 'date', value: later }, { type: 'date', value: past }, { date: new Date(sooner) }],
      NOW,
    );
    expect(next?.getTime()).toBe(sooner);
  });

  it('ignores triggers without a moment and malformed ones', () => {
    expect(
      nextTriggerTime([null, undefined, 5, 'x', {}, { type: 'timeInterval' }, { value: NaN }], NOW),
    ).toBeNull();
    expect(nextTriggerTime([], NOW)).toBeNull();
  });
});

describe('importanceLabel', () => {
  const s = MESSAGES.en.support;

  it('names the Android importance levels and flags the quiet ones', () => {
    expect(importanceLabel(5, s)).toEqual({ text: s.importanceDefault, tone: 'ok' });
    expect(importanceLabel(7, s).text).toBe(s.importanceHigh);
    expect(importanceLabel(2, s)).toEqual({ text: s.importanceOff, tone: 'warning' });
    expect(importanceLabel(4, s).tone).toBe('warning');
  });

  it('says unknown for what it cannot read', () => {
    for (const value of [null, 0, 1, 99]) {
      expect(importanceLabel(value, s)).toEqual({ text: s.unknown, tone: 'neutral' });
    }
  });
});

describe('formatMoment', () => {
  it('writes day, month name and a two-digit time in each language', () => {
    const when = new Date(2026, 10, 9, 8, 5);
    expect(formatMoment(when, MESSAGES.en)).toBe('9 November, 08:05');
    expect(formatMoment(when, MESSAGES.tr)).toBe('9 Kasım, 08:05');
    expect(formatMoment(when, MESSAGES.ru)).toBe('9 ноября, 08:05');
  });
});

describe('describeDiagnostics', () => {
  it.each(LANGUAGES)('%s shows "unknown" for everything it could not read', (language) => {
    const m = MESSAGES[language];
    const rows = describeDiagnostics(UNKNOWN_DIAGNOSTICS, m);
    expect(rows.map((row) => row.id)).toEqual([
      'permission',
      'channel',
      'scheduled',
      'next',
      'exact',
    ]);
    for (const row of rows) {
      expect(row.value).toBe(m.support.unknown);
      expect(row.tone).toBe('neutral');
      expect(row.label.trim()).not.toBe('');
    }
  });

  it('reports a healthy setup', () => {
    const rows = describeDiagnostics(
      {
        permission: 'granted',
        importance: 5,
        scheduledCount: 30,
        nextAt: new Date(2026, 10, 20, 8, 0),
        exactAlarms: true,
      },
      MESSAGES.en,
    );
    expect(rows.map((row) => row.value)).toEqual([
      'Allowed',
      'Default',
      '30',
      '20 November, 08:00',
      'Allowed',
    ]);
    expect(rows.every((row) => row.tone === 'ok')).toBe(true);
  });

  it('warns about a blocked permission, nothing scheduled and blocked exact alarms', () => {
    const rows = describeDiagnostics(
      { permission: 'denied', importance: 2, scheduledCount: 0, nextAt: null, exactAlarms: false },
      MESSAGES.en,
    );
    expect(rows.map((row) => row.value)).toEqual(['Blocked', 'Off', '0', 'None', 'Not allowed']);
    expect(rows.every((row) => row.tone === 'warning')).toBe(true);
  });

  it('does not call a missing next moment "none" when the count is unknown', () => {
    const rows = describeDiagnostics(
      { ...UNKNOWN_DIAGNOSTICS, permission: 'undetermined' },
      MESSAGES.en,
    );
    expect(rows[0].value).toBe('Not asked yet');
    expect(rows[3].value).toBe('Unknown');
  });
});
