import { describe, expect, it } from 'vitest';
import { LANGUAGES, MESSAGES } from '../i18n';
import {
  DEVICE_CHECK_ITEMS,
  doneCount,
  emptyState,
  parseDeviceCheck,
  reduceDeviceCheck,
  serializeDeviceCheck,
} from './model';

describe('device check state', () => {
  it('toggles a tick on and off, keeping list order', () => {
    let s = emptyState('0.8.2');
    s = reduceDeviceCheck(s, { type: 'toggle', id: 'femaleSaint' });
    s = reduceDeviceCheck(s, { type: 'toggle', id: 'widgets' });
    expect(s.done).toEqual(['widgets', 'femaleSaint']);
    expect(doneCount(s)).toBe(2);
    s = reduceDeviceCheck(s, { type: 'toggle', id: 'widgets' });
    expect(s.done).toEqual(['femaleSaint']);
  });

  it('ignores unknown ids', () => {
    const s = emptyState('1.0.0');
    // @ts-expect-error not an item id
    expect(reduceDeviceCheck(s, { type: 'toggle', id: 'nope' })).toBe(s);
  });

  it('resets ticks but keeps the version', () => {
    const s = reduceDeviceCheck(emptyState('0.8.2'), { type: 'toggle', id: 'widgets' });
    expect(reduceDeviceCheck(s, { type: 'reset' })).toEqual({ version: '0.8.2', done: [] });
  });

  it('a new version clears ticks; the same version keeps them', () => {
    const s = reduceDeviceCheck(emptyState('0.8.2'), { type: 'toggle', id: 'widgets' });
    expect(reduceDeviceCheck(s, { type: 'version', version: '0.8.2' })).toBe(s);
    expect(reduceDeviceCheck(s, { type: 'version', version: '0.9.0' })).toEqual({
      version: '0.9.0',
      done: [],
    });
  });

  it('merges stored ticks with ticks made while loading', () => {
    const early = reduceDeviceCheck(emptyState('0.8.2'), { type: 'toggle', id: 'otaReopen' });
    const stored = { version: '0.8.2', done: ['widgets'] } as const;
    expect(reduceDeviceCheck(early, { type: 'load', stored }).done).toEqual([
      'widgets',
      'otaReopen',
    ]);
    expect(reduceDeviceCheck(early, { type: 'load', stored: { ...stored, version: 'x' } })).toBe(
      early,
    );
  });

  it('round-trips through storage text', () => {
    const s = reduceDeviceCheck(emptyState('0.8.2'), { type: 'toggle', id: 'otaReopen' });
    expect(parseDeviceCheck(serializeDeviceCheck(s), '0.8.2')).toEqual(s);
  });

  it('reads stale, foreign or broken storage as empty', () => {
    const stored = serializeDeviceCheck({ version: '0.8.1', done: ['widgets'] });
    expect(parseDeviceCheck(stored, '0.8.2').done).toEqual([]);
    for (const bad of [null, undefined, '', '{', '[]', '3', '{"version":"0.8.2","done":5}']) {
      expect(parseDeviceCheck(bad, '0.8.2')).toEqual(emptyState('0.8.2'));
    }
    const mixed = '{"version":"0.8.2","done":["widgets","x",7,"widgets"]}';
    expect(parseDeviceCheck(mixed, '0.8.2').done).toEqual(['widgets']);
  });
});

describe('device check texts', () => {
  it.each(LANGUAGES)('%s has a title and steps for every item', (language) => {
    const d = MESSAGES[language].deviceCheck;
    for (const id of DEVICE_CHECK_ITEMS) {
      expect(d.items[id].title.trim(), id).not.toBe('');
      expect(d.items[id].steps.length, id).toBeGreaterThanOrEqual(1);
      expect(d.items[id].steps.length, id).toBeLessThanOrEqual(2);
    }
    expect(d.summary(2, 6)).toContain('2');
    expect(d.summary(2, 6)).toContain('6');
  });
});
