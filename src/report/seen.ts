// Which reports the user has already opened or dismissed, so Today offers each one only once.
// One AsyncStorage key per fast and year, `poreia.reportSeen.<id>-<year>`, holding "1". Every
// read is validated and no function here throws: bad storage reads as "nothing seen".

import AsyncStorage from '@react-native-async-storage/async-storage';
import { PeriodRef, parsePeriodKey, periodKey } from './periods';

export const SEEN_PREFIX = 'poreia.reportSeen.';
const SEEN = '1';

export const seenStorageKey = (ref: PeriodRef) => `${SEEN_PREFIX}${periodKey(ref)}`;

/** Period keys (`greatLent-2027`) of the seen reports among raw storage entries. Pure. */
export function seenFromEntries(entries: Iterable<readonly [unknown, unknown]>): Set<string> {
  const seen = new Set<string>();
  for (const [key, value] of entries) {
    if (typeof key !== 'string' || !key.startsWith(SEEN_PREFIX) || value !== SEEN) continue;
    const ref = parsePeriodKey(key.slice(SEEN_PREFIX.length));
    if (ref) seen.add(periodKey(ref));
  }
  return seen;
}

export async function readSeenReports(): Promise<Set<string>> {
  try {
    const keys = (await AsyncStorage.getAllKeys()).filter(
      (key) => typeof key === 'string' && key.startsWith(SEEN_PREFIX),
    );
    if (keys.length === 0) return new Set();
    return seenFromEntries(await AsyncStorage.multiGet(keys));
  } catch {
    return new Set();
  }
}

export async function markReportSeen(ref: PeriodRef): Promise<void> {
  try {
    await AsyncStorage.setItem(seenStorageKey(ref), SEEN);
  } catch {
    // Not remembering is harmless: the card shows once more.
  }
}
