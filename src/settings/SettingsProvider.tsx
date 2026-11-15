import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { ReactNode, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { MESSAGES, Messages, pickLanguage } from '../i18n';
import { STORAGE_KEY, Settings, defaultSettings, parseSettings } from './model';

interface SettingsContextValue {
  settings: Settings;
  messages: Messages;
  update: (patch: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

function deviceLanguage() {
  return pickLanguage(getLocales().map((locale) => locale.languageCode));
}

/** Loads settings once, then renders children; nothing is shown while loading. */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => parseSettings(raw, deviceLanguage()))
      .catch(() => defaultSettings(deviceLanguage()))
      .then((loaded) => {
        if (!cancelled) setSettings(loaded);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const update = useCallback((patch: Partial<Settings>) => {
    setSettings((current) => {
      if (!current) return current;
      const next = { ...current, ...patch };
      // A failed write only costs the user re-entering their choices next launch.
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo(
    () => (settings ? { settings, messages: MESSAGES[settings.language], update } : null),
    [settings, update],
  );

  if (!value) return null;
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsContextValue {
  const value = useContext(SettingsContext);
  if (!value) throw new Error('useSettings must be used inside SettingsProvider');
  return value;
}
