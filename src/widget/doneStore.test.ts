import { beforeEach, describe, expect, it, vi } from 'vitest';

const store = new Map<string, string>();

vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: async (key: string) => store.get(key) ?? null,
    setItem: async (key: string, value: string) => void store.set(key, value),
    removeItem: async (key: string) => void store.delete(key),
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
});
