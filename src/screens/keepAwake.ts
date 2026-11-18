// Keeps the screen on while a prayer is read in reading mode. Failing to do so is never worth an
// error: a device without the native module, a rejected request or a release after the screen
// is gone all end quietly and the screen simply times out as usual.

import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

const TAG = 'poreia-prayer-reading';

/** Asks for the screen to stay on; returns the function that gives it back. Never throws. */
export function holdScreenAwake(): () => void {
  try {
    activateKeepAwakeAsync(TAG).catch(() => {});
  } catch {
    // Ignored: see the note at the top.
  }
  return () => {
    try {
      deactivateKeepAwake(TAG).catch(() => {});
    } catch {
      // Ignored: see the note at the top.
    }
  };
}
