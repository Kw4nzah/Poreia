// Reads every "complete today" mark from AsyncStorage (the widget writes the same keys).

import AsyncStorage from '@react-native-async-storage/async-storage';
import { DONE_PREFIX } from '../widget/done';
import { doneDaysFromEntries } from './log';

/** JDNs of all marked days. Never throws: a storage failure reads as "nothing marked". */
export async function readAllDone(): Promise<Set<number>> {
  try {
    const keys = (await AsyncStorage.getAllKeys()).filter(
      (key) => typeof key === 'string' && key.startsWith(DONE_PREFIX),
    );
    if (keys.length === 0) return new Set();
    return doneDaysFromEntries(await AsyncStorage.multiGet(keys));
  } catch {
    return new Set();
  }
}
