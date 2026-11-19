// Asks Android to redraw the widget now (app opened, settings changed, a new day).

import { Platform } from 'react-native';
import { civilFromLocalDate } from '../calendar';
import type { Settings } from '../settings/model';
import { FAST_WIDGET_NAME } from './content';
import { readDone } from './doneStore';

type WidgetSettings = Pick<Settings, 'language' | 'churchId' | 'greekFish'>;

/**
 * The widget library is required lazily: an app build that lacks its native module (an old
 * APK, Expo Go) must start normally and simply have no widget, never fail at import time.
 */
export function refreshWidget(settings: WidgetSettings): void {
  if (Platform.OS !== 'android') return;
  // The persistent notification shows what the widget shows, so it is redrawn at the same moments
  // (the mark changed, the app opened, settings or a backup restore changed what is shown).
  try {
    void require('../notifications/ongoing').refreshOngoing();
  } catch {
    // No notification support in this build.
  }
  try {
    const { requestWidgetUpdate } = require('react-native-android-widget');
    const { buildFastWidget } = require('./FastWidget');
    Promise.resolve(
      requestWidgetUpdate({
        widgetName: FAST_WIDGET_NAME,
        renderWidget: async (info: { width: number; height: number }) => {
          const now = new Date();
          const done = await readDone(civilFromLocalDate(now));
          return buildFastWidget(settings, { width: info.width, height: info.height }, now, done);
        },
      }),
    ).catch(() => {});
  } catch {
    // No native widget support in this build.
  }
}
