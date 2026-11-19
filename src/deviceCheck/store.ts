// Device check ticks in AsyncStorage under one key. No function here throws: bad storage reads
// as "nothing ticked" and a failed write is ignored.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { DeviceCheckState, parseDeviceCheck, serializeDeviceCheck } from './model';

export const DEVICE_CHECK_KEY = 'poreia.deviceCheck';

export async function loadDeviceCheck(version: string): Promise<DeviceCheckState> {
  try {
    return parseDeviceCheck(await AsyncStorage.getItem(DEVICE_CHECK_KEY), version);
  } catch {
    return parseDeviceCheck(null, version);
  }
}

export async function saveDeviceCheck(state: DeviceCheckState): Promise<void> {
  try {
    await AsyncStorage.setItem(DEVICE_CHECK_KEY, serializeDeviceCheck(state));
  } catch {
    // Not remembering is harmless: the ticks start empty next time.
  }
}
