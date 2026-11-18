import { beforeEach, describe, expect, it, vi } from 'vitest';

const store = new Map<string, string>();
let failNextWrite = false;
// Storage answers on a later turn, like the real thing, so overlapping calls can interleave.
const later = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

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
  },
}));

const day = { year: 2026, month: 11, day: 17 };
const nextDay = { year: 2026, month: 11, day: 18 };

describe('doneStore', () => {
  beforeEach(() => store.clear());

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
});
