import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useSettings } from '../settings/SettingsProvider';
import { useToday } from '../ui/useToday';
import { refreshWidget } from './refresh';

/** Redraws the home-screen widget when the app opens, the settings change or the day changes. */
export function WidgetSync() {
  const { settings } = useSettings();
  const today = useToday();
  const { language, churchId, greekFish } = settings;

  useEffect(() => {
    refreshWidget({ language, churchId, greekFish });
  }, [language, churchId, greekFish, today]);

  // Coming back to the app also redraws, in case the widget was last drawn before midnight.
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refreshWidget({ language, churchId, greekFish });
    });
    return () => subscription.remove();
  }, [language, churchId, greekFish]);

  return null;
}
