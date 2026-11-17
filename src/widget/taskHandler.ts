// Runs in the background when Android asks the widget to draw (added, resized, periodic update).
// It reads the settings straight from storage because no React tree exists in that context.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { registerWidgetTaskHandler, type WidgetTaskHandler } from 'react-native-android-widget';
import { pickLanguage } from '../i18n';
import { STORAGE_KEY, Settings, defaultSettings, parseSettings } from '../settings/model';
import { buildFastWidget } from './FastWidget';
import { FAST_WIDGET_NAME } from './content';

function deviceLanguage() {
  try {
    return pickLanguage(getLocales().map((locale) => locale.languageCode));
  } catch {
    return pickLanguage([]);
  }
}

export async function loadStoredSettings(): Promise<Settings> {
  try {
    return parseSettings(await AsyncStorage.getItem(STORAGE_KEY), deviceLanguage());
  } catch {
    return defaultSettings(deviceLanguage());
  }
}

export const widgetTaskHandler: WidgetTaskHandler = async ({
  widgetInfo,
  widgetAction,
  renderWidget,
}) => {
  if (widgetInfo.widgetName !== FAST_WIDGET_NAME || widgetAction === 'WIDGET_DELETED') return;
  const settings = await loadStoredSettings();
  renderWidget(buildFastWidget(settings, widgetInfo.width, new Date()));
};

registerWidgetTaskHandler(widgetTaskHandler);
