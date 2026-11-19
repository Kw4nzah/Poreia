'use no memo';
// The 4x1 home-screen widget: one row with the cross mark, today's rule title, a one-line summary
// (feast, or the level of the fast) and the "I am fasting today" check button. It shares the data
// (widgetContentFor), the theme tokens and the primitives of the 4x2 widget in FastWidget.tsx.

import { FlexWidget } from 'react-native-android-widget';
import { CHURCHES } from '../calendar';
import type { Language } from '../i18n';
import type { Settings } from '../settings/model';
import { Theme, themes } from '../ui/theme';
import { RADIUS, checkButton, chip, crossBadge, hex, text } from './FastWidget';
import { WidgetContent, widgetContentFor } from './content';

/** Below this width (dp) the strip leaves out the day chip. */
const NARROW_BELOW_WIDTH_DP = 250;

export interface StripLayout {
  /** Too narrow for the day chip. */
  narrow: boolean;
}

export function stripLayoutFor(width: number): StripLayout {
  return { narrow: width > 0 && width < NARROW_BELOW_WIDTH_DP };
}

/** The second line: the feast if there is one, else the level of the fast, else "no fast". */
export function stripSummary(content: WidgetContent): string {
  return content.feast ?? (content.fasting ? content.levelShort : content.labels.noFast);
}

/** Screen-reader label for the whole strip. */
export function stripLabel(content: WidgetContent): string {
  return [content.title, content.status, content.feast, content.progress?.text]
    .filter(Boolean)
    .join('. ');
}

export function stripWidget(
  content: WidgetContent,
  theme: Theme,
  layout: StripLayout,
  done: boolean,
) {
  const { progress, fasting } = content;
  const summaryColor = content.feast ? theme.feastInk : fasting ? theme.accent : theme.freeInk;
  return (
    <FlexWidget style={{ height: 'match_parent', width: 'match_parent', justifyContent: 'center' }}>
      <FlexWidget
        clickAction="OPEN_APP"
        accessibilityLabel={stripLabel(content)}
        style={{
          width: 'match_parent',
          height: 'match_parent',
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderRadius: RADIUS,
          backgroundColor: hex(theme.surface),
        }}
      >
        {[
          crossBadge(34, theme),
          <FlexWidget style={{ flex: 1, width: 0, marginLeft: 10 }}>
            {[
              text(content.title, { size: 16, color: theme.ink, bold: true, serif: true, lh: 20 }),
              text(stripSummary(content), {
                size: 12,
                color: summaryColor,
                bold: true,
                lh: 16,
                marginTop: 2,
              }),
            ]}
          </FlexWidget>,
          ...(progress && !layout.narrow
            ? [
                <FlexWidget style={{ marginLeft: 8 }}>
                  {chip(progress.badgeShort, theme.feastInk, theme.feastSurface)}
                </FlexWidget>,
              ]
            : []),
          ...(fasting ? [checkButton(content, theme, done, 32)] : []),
        ]}
      </FlexWidget>
    </FlexWidget>
  );
}

type WidgetSettings = Pick<Settings, 'language' | 'churchId' | 'greekFish'>;

/** The strip for a day, in both system themes. */
export function buildStripWidget(
  settings: WidgetSettings,
  size: { width: number; height: number },
  now: Date,
  done: boolean,
) {
  const date = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  const content = widgetContentFor(
    date,
    CHURCHES[settings.churchId],
    settings.language as Language,
    {
      greekFish: settings.greekFish,
    },
  );
  const layout = stripLayoutFor(size.width);
  return {
    light: stripWidget(content, themes.light, layout, done),
    dark: stripWidget(content, themes.dark, layout, done),
  };
}
