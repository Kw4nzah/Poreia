// Runs in the background when Android asks the widget to draw (added, resized, periodic update).
// It reads the settings straight from storage because no React tree exists in that context.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerWidgetTaskHandler, type WidgetTaskHandler } from 'react-native-android-widget';
import { civilFromLocalDate } from '../calendar';
import { deviceLanguage } from '../settings/deviceLanguage';
import { STORAGE_KEY, Settings, defaultSettings, parseSettings } from '../settings/model';
import { buildFastWidget } from './FastWidget';
import { buildStripWidget } from './StripWidget';
import { FAST_WIDGET_NAME, STRIP_WIDGET_NAME } from './content';
import { TOGGLE_DONE_ACTION } from './done';
import { readDone, toggleDone } from './doneStore';

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
  const isStrip = widgetInfo.widgetName === STRIP_WIDGET_NAME;
  if ((widgetInfo.widgetName !== FAST_WIDGET_NAME && !isStrip) || widgetAction === 'WIDGET_DELETED')
    return;
  // Nothing may escape: a rejected background task would only leave the widget blank, and the
  // next periodic update draws it again.
  try {
    const now = new Date();
    const today = civilFromLocalDate(now);
    // The "I am fasting today" button runs here, in the background: flip the mark, then redraw.
    // A tap on the card itself is OPEN_APP, handled natively, and never reaches this handler.
    const done =
      widgetAction === 'WIDGET_CLICK' && clickAction === TOGGLE_DONE_ACTION
        ? await toggleDone(today)
        : await readDone(today);
    const settings = await loadStoredSettings();
    const size = { width: widgetInfo.width, height: widgetInfo.height };
    renderWidget(
      isStrip
        ? buildStripWidget(settings, size, now, done)
        : buildFastWidget(settings, size, now, done),
    );
  } catch {
    // Keep the last drawing.
  }
};

registerWidgetTaskHandler(widgetTaskHandler);
