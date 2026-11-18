// Reads and writes the "done" days (`poreia.done.YYYY-MM-DD`) for backup and restore. Kept apart
// from the Today screen so it can be used and tested on its own.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { cleanDoneDays, isValidIsoDate } from './backup';

const PREFIX = 'poreia.done.';
const MARKED = '1';

/** Storage key of a day written `YYYY-MM-DD`. */
export const doneKeyOf = (isoDate: string) => `${PREFIX}${isoDate}`;

/** Days marked done, as sorted `YYYY-MM-DD`. Anything else under the prefix is ignored. Never throws. */
export async function readDoneDays(): Promise<string[]> {
  try {
    const keys = (await AsyncStorage.getAllKeys()).filter(
      (key) => key.startsWith(PREFIX) && isValidIsoDate(key.slice(PREFIX.length)),
    );
    if (keys.length === 0) return [];
    const pairs = await AsyncStorage.multiGet(keys);
    return cleanDoneDays(
      pairs.filter(([, value]) => value === MARKED).map(([key]) => key.slice(PREFIX.length)),
    );
  } catch {
    return [];
  }
}

/** Marks the days done, keeping the ones already marked. False if storage refused. */
export async function writeDoneDays(days: readonly string[]): Promise<boolean> {
  try {
    const valid = cleanDoneDays(days);
    if (valid.length > 0) {
      await AsyncStorage.multiSet(valid.map((day) => [doneKeyOf(day), MARKED]));
    }
    return true;
  } catch {
    return false;
  }
}
