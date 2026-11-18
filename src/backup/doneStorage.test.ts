import { beforeEach, describe, expect, it, vi } from 'vitest';
import { doneKey } from '../widget/done';

const store = new Map<string, string>();
let failing = false;

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getAllKeys: async () => {
      if (failing) throw new Error('storage down');
      return [...store.keys()];
    },
    multiGet: async (keys: string[]) => keys.map((key) => [key, store.get(key) ?? null]),
    multiSet: async (pairs: [string, string][]) => {
      if (failing) throw new Error('storage down');
      for (const [key, value] of pairs) store.set(key, value);
    },
  },
}));

const { doneKeyOf, readDoneDays, writeDoneDays } = await import('./doneStorage');

beforeEach(() => {
  store.clear();
  failing = false;
});

describe('done storage for backups', () => {
  it('uses the same key format as the widget and the Today screen', () => {
    expect(doneKeyOf('2026-11-17')).toBe(doneKey({ year: 2026, month: 11, day: 17 }));
    expect(doneKeyOf('2026-01-05')).toBe(doneKey({ year: 2026, month: 1, day: 5 }));
  });

  it('reads only valid marked days, sorted, ignoring other keys and values', () => {
    store.set('poreia.done.2026-11-17', '1');
    store.set('poreia.done.2026-11-15', '1');
    store.set('poreia.done.2026-11-16', '0');
    store.set('poreia.done.2026-02-30', '1');
    store.set('poreia.done.junk', '1');
    store.set('poreia.settings.v1', '{"done":1}');
    store.set('other.poreia.done.2026-11-18', '1');
    return expect(readDoneDays()).resolves.toEqual(['2026-11-15', '2026-11-17']);
  });

  it('reads nothing, without throwing, when storage fails', async () => {
    store.set('poreia.done.2026-11-17', '1');
    failing = true;
    expect(await readDoneDays()).toEqual([]);
  });

  it('writes marks under the day keys and keeps the ones already there', async () => {
    store.set('poreia.done.2026-11-01', '1');
    expect(await writeDoneDays(['2026-11-17', 'bad', '2026-11-18'])).toBe(true);
    expect([...store.keys()].sort()).toEqual([
      'poreia.done.2026-11-01',
      'poreia.done.2026-11-17',
      'poreia.done.2026-11-18',
    ]);
    expect(store.get('poreia.done.2026-11-17')).toBe('1');
  });

  it('reports false when storage refuses the write', async () => {
    failing = true;
    expect(await writeDoneDays(['2026-11-17'])).toBe(false);
  });

  it('writing nothing is a success', async () => {
    expect(await writeDoneDays([])).toBe(true);
    expect(store.size).toBe(0);
  });
});
