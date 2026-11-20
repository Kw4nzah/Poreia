// AsyncStorage side of progress.ts. Never throws: reading falls back to empty, writing is best effort.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { LiturgyProgress, emptyProgress, parseProgress } from './progress';

export const PROGRESS_KEY = 'poreia.liturgy.progress';

export async function readProgress(): Promise<LiturgyProgress> {
  try {
    return parseProgress(await AsyncStorage.getItem(PROGRESS_KEY));
  } catch {
    return emptyProgress();
  }
}

export async function writeProgress(progress: LiturgyProgress): Promise<void> {
  try {
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
  } catch {
    // Losing a reading position is not worth an error.
  }
}
