import { beforeEach, describe, expect, it, vi } from 'vitest';

const store = new Map<string, string>();
let failing = false;

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getAllKeys: async () => {
      if (failing) throw new Error('storage down');
      return [...store.keys()];
    },
    multiGet: async (keys: string[]) => keys.map((key) => [key, store.get(key) ?? null]),
  },
}));

describe('readAllDone', () => {
  beforeEach(() => {
    store.clear();
    failing = false;
  });

  it('returns only valid marked days and ignores foreign keys and bad values', async () => {
    const { readAllDone } = await import('./logStore');
    const { gregorianToJdn } = await import('../calendar');
    store.set('poreia.done.2026-11-17', '1');
    store.set('poreia.done.2026-11-18', 'yes');
    store.set('poreia.done.2026-02-31', '1');
    store.set('poreia.done.garbage', '1');
    store.set('poreia.settings', '{"language":"tr"}');
    expect([...(await readAllDone())]).toEqual([gregorianToJdn(2026, 11, 17)]);
  });

  it('never throws: a storage failure reads as no marks', async () => {
    const { readAllDone } = await import('./logStore');
    failing = true;
    expect((await readAllDone()).size).toBe(0);
  });
});
