// Reads and flips the "I am fasting" mark of a day in AsyncStorage (same store as the settings).

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CivilDate } from '../calendar';
import { doneKey, isDone, toggledValue } from './done';

export async function readDone(date: CivilDate): Promise<boolean> {
  try {
    return isDone(await AsyncStorage.getItem(doneKey(date)));
  } catch {
    return false;
  }
}

/** Flips the mark for a day and returns the new state. */
export async function toggleDone(date: CivilDate): Promise<boolean> {
  const key = doneKey(date);
  try {
    const next = toggledValue(await AsyncStorage.getItem(key));
    if (next === null) await AsyncStorage.removeItem(key);
    else await AsyncStorage.setItem(key, next);
    return next !== null;
  } catch {
    return readDone(date);
  }
}
