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
    setItem: async (key: string, value: string) => {
      if (failing) throw new Error('storage down');
      store.set(key, value);
    },
  },
}));

describe('seen reports', () => {
  beforeEach(() => {
    store.clear();
    failing = false;
  });

  it('remembers a report per fast and year', async () => {
    const { markReportSeen, readSeenReports } = await import('./seen');
    await markReportSeen({ id: 'greatLent', year: 2027 });
    expect(store.get('poreia.reportSeen.greatLent-2027')).toBe('1');
    expect([...(await readSeenReports())]).toEqual(['greatLent-2027']);
    await markReportSeen({ id: 'nativityFast', year: 2026 });
    expect((await readSeenReports()).size).toBe(2);
  });

  it('ignores invalid keys, other values and foreign keys', async () => {
    const { readSeenReports } = await import('./seen');
    store.set('poreia.reportSeen.greatLent-2027', '1');
    store.set('poreia.reportSeen.greatLent-2028', 'yes');
    store.set('poreia.reportSeen.holyWeek-2027', '1');
    store.set('poreia.reportSeen.greatLent-27', '1');
    store.set('poreia.reportSeen.', '1');
    store.set('poreia.done.2027-03-15', '1');
    expect([...(await readSeenReports())]).toEqual(['greatLent-2027']);
  });

  it('never throws on a broken store', async () => {
    const { markReportSeen, readSeenReports } = await import('./seen');
    failing = true;
    expect((await readSeenReports()).size).toBe(0);
    await expect(markReportSeen({ id: 'greatLent', year: 2027 })).resolves.toBeUndefined();
  });
});
