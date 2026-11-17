// Asks Android to redraw the widget now (app opened, settings changed, a new day).

import { Platform } from 'react-native';
import type { Settings } from '../settings/model';
import { FAST_WIDGET_NAME } from './content';

type WidgetSettings = Pick<Settings, 'language' | 'churchId' | 'greekFish'>;

/**
 * The widget library is required lazily: an app build that lacks its native module (an old
 * APK, Expo Go) must start normally and simply have no widget, never fail at import time.
 */
export function refreshWidget(settings: WidgetSettings): void {
  if (Platform.OS !== 'android') return;
  try {
    const { requestWidgetUpdate } = require('react-native-android-widget');
    const { buildFastWidget } = require('./FastWidget');
    Promise.resolve(
      requestWidgetUpdate({
        widgetName: FAST_WIDGET_NAME,
        renderWidget: (info: { width: number }) =>
          buildFastWidget(settings, info.width, new Date()),
      }),
    ).catch(() => {});
  } catch {
    // No native widget support in this build.
  }
}
