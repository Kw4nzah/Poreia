// Runs in the background when Android asks the widget to draw (added, resized, periodic update).
// It reads the settings straight from storage because no React tree exists in that context.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { registerWidgetTaskHandler, type WidgetTaskHandler } from 'react-native-android-widget';
import { civilFromLocalDate } from '../calendar';
import { pickLanguage } from '../i18n';
import { STORAGE_KEY, Settings, defaultSettings, parseSettings } from '../settings/model';
import { buildFastWidget } from './FastWidget';
import { FAST_WIDGET_NAME } from './content';
import { TOGGLE_DONE_ACTION } from './done';
import { readDone, toggleDone } from './doneStore';

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
  clickAction,
  renderWidget,
}) => {
  if (widgetInfo.widgetName !== FAST_WIDGET_NAME || widgetAction === 'WIDGET_DELETED') return;
  const now = new Date();
  const today = civilFromLocalDate(now);
  // The "complete today" button runs here, in the background: flip the mark, then redraw.
  // A tap on the card itself is OPEN_APP, handled natively, and never reaches this handler.
  const done =
    widgetAction === 'WIDGET_CLICK' && clickAction === TOGGLE_DONE_ACTION
      ? await toggleDone(today)
      : await readDone(today);
  const settings = await loadStoredSettings();
  renderWidget(
    buildFastWidget(settings, { width: widgetInfo.width, height: widgetInfo.height }, now, done),
  );
};

registerWidgetTaskHandler(widgetTaskHandler);
