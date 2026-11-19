import { beforeEach, describe, expect, it, vi } from 'vitest';

const store = new Map<string, string>();
let failNextWrite = false;
// Storage answers on a later turn, like the real thing, so overlapping calls can interleave.
const later = () => new Promise<void>((resolve) => setTimeout(resolve, 0));
const batchCalls: string[] = [];

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: async (key: string) => {
      await later();
      return store.get(key) ?? null;
    },
    setItem: async (key: string, value: string) => {
      await later();
      if (failNextWrite) {
        failNextWrite = false;
        throw new Error('disk full');
      }
      store.set(key, value);
    },
    removeItem: async (key: string) => {
      await later();
      store.delete(key);
    },
    multiSet: async (pairs: [string, string][]) => {
      batchCalls.push('multiSet');
      await later();
      if (failNextWrite) {
        failNextWrite = false;
        throw new Error('disk full');
      }
      for (const [key, value] of pairs) store.set(key, value);
    },
    multiRemove: async (keys: string[]) => {
      batchCalls.push('multiRemove');
      await later();
      for (const key of keys) store.delete(key);
    },
  },
}));

const day = { year: 2026, month: 11, day: 17 };
const nextDay = { year: 2026, month: 11, day: 18 };

describe('doneStore', () => {
  beforeEach(() => {
    store.clear();
    batchCalls.length = 0;
  });

  it('a tap marks the day under poreia.done.YYYY-MM-DD and the next tap clears it', async () => {
    const { readDone, toggleDone } = await import('./doneStore');
    expect(await readDone(day)).toBe(false);
    expect(await toggleDone(day)).toBe(true);
    expect([...store.keys()]).toEqual(['poreia.done.2026-11-17']);
    expect(await readDone(day)).toBe(true);
    expect(await toggleDone(day)).toBe(false);
    expect(store.size).toBe(0);
    expect(await readDone(day)).toBe(false);
  });

  it('marks are per day', async () => {
    const { readDone, toggleDone } = await import('./doneStore');
    await toggleDone(day);
    expect(await readDone(nextDay)).toBe(false);
  });

  it('two taps that overlap (widget and app) are two flips, not one lost update', async () => {
    const { readDone, toggleDone } = await import('./doneStore');
    const [first, second] = await Promise.all([toggleDone(day), toggleDone(day)]);
    expect([first, second]).toEqual([true, false]);
    expect(await readDone(day)).toBe(false);
    const three = await Promise.all([toggleDone(day), toggleDone(day), toggleDone(day)]);
    expect(three).toEqual([true, false, true]);
    expect(await readDone(day)).toBe(true);
  });

  it('overlapping taps on different days do not wait for each other or mix', async () => {
    const { readDone, toggleDone } = await import('./doneStore');
    await Promise.all([toggleDone(day), toggleDone(nextDay)]);
    expect(await readDone(day)).toBe(true);
    expect(await readDone(nextDay)).toBe(true);
  });

  it('a failed write reports the stored state and does not block the next tap', async () => {
    const { readDone, toggleDone } = await import('./doneStore');
    failNextWrite = true;
    expect(await toggleDone(day)).toBe(false);
    expect(await readDone(day)).toBe(false);
    expect(await toggleDone(day)).toBe(true);
  });

  it('setDoneMany marks several days in one batched write and clears them in one', async () => {
    const { readDone, setDoneMany } = await import('./doneStore');
    const third = { year: 2026, month: 11, day: 19 };
    expect(await setDoneMany([day, nextDay, third, day], true)).toBe(true);
    expect(batchCalls).toEqual(['multiSet']);
    expect([...store.keys()].sort()).toEqual([
      'poreia.done.2026-11-17',
      'poreia.done.2026-11-18',
      'poreia.done.2026-11-19',
    ]);
    expect([...store.values()]).toEqual(['1', '1', '1']);
    expect(await setDoneMany([day, third], false)).toBe(true);
    expect(batchCalls).toEqual(['multiSet', 'multiRemove']);
    expect(await readDone(day)).toBe(false);
    expect(await readDone(nextDay)).toBe(true);
    expect(await readDone(third)).toBe(false);
  });

  it('setDoneMany with no days writes nothing', async () => {
    const { setDoneMany } = await import('./doneStore');
    expect(await setDoneMany([], true)).toBe(true);
    expect(batchCalls).toEqual([]);
  });

  it('setDoneMany waits for a flip already running on the same day', async () => {
    const { readDone, setDoneMany, toggleDone } = await import('./doneStore');
    const flip = toggleDone(day); // marks the day
    const batch = setDoneMany([day], false); // must run after the flip, so the day ends cleared
    await Promise.all([flip, batch]);
    expect(await readDone(day)).toBe(false);
  });

  it('setDoneMany reports a failed write as false and leaves storage alone', async () => {
    const { readDone, setDoneMany } = await import('./doneStore');
    failNextWrite = true;
    expect(await setDoneMany([day, nextDay], true)).toBe(false);
    expect(await readDone(day)).toBe(false);
    expect(await setDoneMany([day], true)).toBe(true);
  });
});
