// Reads and flips the "I am fasting" mark of a day in AsyncStorage (same store as the settings).

import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CivilDate } from '../calendar';
import { MARKED, doneKey, isDone, toggledValue } from './done';

export async function readDone(date: CivilDate): Promise<boolean> {
  try {
    return isDone(await AsyncStorage.getItem(doneKey(date)));
  } catch {
    return false;
  }
}

/**
 * A flip is read, decide, write. Two overlapping flips of one day (the widget's button and the app,
 * or a double tap) would both read the old value and write the same new one, losing a tap. Flips
 * of one day therefore run one after another; different days do not wait for each other.
 */
const queues = new Map<string, Promise<unknown>>();

/** Flips the mark for a day and returns the new state. */
export function toggleDone(date: CivilDate): Promise<boolean> {
  const key = doneKey(date);
  const run = (queues.get(key) ?? Promise.resolve()).then(() => flip(date, key));
  queues.set(key, run);
  const clean = () => {
    if (queues.get(key) === run) queues.delete(key);
  };
  run.then(clean, clean);
  return run;
}

async function flip(date: CivilDate, key: string): Promise<boolean> {
  try {
    const next = toggledValue(await AsyncStorage.getItem(key));
    if (next === null) await AsyncStorage.removeItem(key);
    else await AsyncStorage.setItem(key, next);
    return next !== null;
  } catch {
    return readDone(date);
  }
}

/**
 * Marks (`marked` true) or clears (false) many days in one batched write, for the calendar's
 * "Mark days" mode. It waits for flips already running on those days and holds back later ones, so
 * it never overlaps a single tap. Returns whether the write went through; a failure changes nothing
 * that the caller has not already read back.
 */
export function setDoneMany(dates: readonly CivilDate[], marked: boolean): Promise<boolean> {
  const keys = [...new Set(dates.map(doneKey))];
  if (keys.length === 0) return Promise.resolve(true);
  const waiting = keys.map((key) => queues.get(key) ?? Promise.resolve());
  const run = Promise.allSettled(waiting).then(() => writeMany(keys, marked));
  for (const key of keys) {
    queues.set(key, run);
    const clean = () => {
      if (queues.get(key) === run) queues.delete(key);
    };
    run.then(clean, clean);
  }
  return run;
}

async function writeMany(keys: string[], marked: boolean): Promise<boolean> {
  try {
    if (marked) await AsyncStorage.multiSet(keys.map((key) => [key, MARKED]));
    else await AsyncStorage.multiRemove(keys);
    return true;
  } catch {
    return false;
  }
}
