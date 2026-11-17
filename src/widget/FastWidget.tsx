'use no memo';
// The home-screen widget: today's fast, what is allowed, the feast. Built from the library's
// widget primitives (they become Android RemoteViews), not from react-native components.
//
// The library walks this tree itself: no hooks, no fragments, and a component must return an
// element (never null). So the pieces below are plain functions that return elements.
//
// Layout rules: one inner padding (16), card corner 24, a 4dp grid for gaps, one dominant line,
// one or two quiet lines. Every text has a line limit and END truncation, so a long Turkish or
// Russian string shortens instead of pushing the layout around.

import type { ReactElement } from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';
import { CHURCHES } from '../calendar';
import { MESSAGES } from '../i18n';
import type { Settings } from '../settings/model';
import { Theme, themes } from '../ui/theme';
import { WidgetContent, widgetContentFor } from './content';

type Hex = `#${string}`;
const hex = (color: string) => color as Hex;

/** From this width (dp) the widget uses the wide 4x2 layout; narrower is the 2x2 layout. */
const WIDE_FROM_DP = 200;

const PADDING = 16;
const RADIUS = 24;
const BAR = 4;

/** One line of text that shortens with an ellipsis instead of growing. */
function line(
  text: string,
  style: {
    fontSize: number;
    color: string;
    fontWeight?: 'normal' | 'bold';
    marginLeft?: number;
  },
  maxLines = 1,
) {
  return (
    <TextWidget
      text={text}
      maxLines={maxLines}
      truncate="END"
      style={{
        fontSize: style.fontSize,
        // Fixed line height keeps the vertical rhythm the same in every language.
        lineHeight: style.fontSize + 4,
        color: hex(style.color),
        ...(style.fontWeight ? { fontWeight: style.fontWeight } : {}),
        ...(style.marginLeft ? { marginLeft: style.marginLeft } : {}),
      }}
    />
  );
}

/** Small gold label for today's feast. */
function feastLabel(text: string, theme: Theme) {
  return (
    <FlexWidget style={{ width: 'match_parent', flexDirection: 'row' }}>
      <TextWidget
        text={text}
        maxLines={1}
        truncate="END"
        style={{
          fontSize: 11,
          fontWeight: 'bold',
          color: hex(theme.feast),
          backgroundColor: hex(theme.feastSurface),
          borderRadius: 8,
          paddingHorizontal: 8,
          paddingVertical: 2,
        }}
      />
    </FlexWidget>
  );
}

/** Thin rounded track with the accent fill for the days passed. */
function progressBar(day: number, total: number, tone: string, theme: Theme) {
  const rest = total - day;
  const fill = (
    <FlexWidget style={{ flex: day, width: 0, height: BAR, backgroundColor: hex(tone) }} />
  );
  return (
    <FlexWidget
      style={{
        flexDirection: 'row',
        width: 'match_parent',
        height: BAR,
        borderRadius: BAR / 2,
        overflow: 'hidden',
        backgroundColor: hex(theme.line),
      }}
    >
      {rest > 0 ? [fill, <FlexWidget style={{ flex: rest, width: 0, height: BAR }} />] : [fill]}
    </FlexWidget>
  );
}

function wideBody(content: WidgetContent, theme: Theme, tone: string): ReactElement[] {
  const top = (
    <FlexWidget
      style={{
        flexDirection: 'row',
        width: 'match_parent',
        alignItems: 'center',
      }}
    >
      {[
        <FlexWidget style={{ flex: 1, width: 0 }}>
          {line(content.eyebrow, { fontSize: 12, color: theme.muted })}
        </FlexWidget>,
        ...(content.progress
          ? [
              line(content.progress.counter, {
                fontSize: 12,
                color: theme.muted,
                fontWeight: 'bold',
                marginLeft: 8,
              }),
            ]
          : []),
      ]}
    </FlexWidget>
  );
  const status = line(content.status, { fontSize: 20, color: tone, fontWeight: 'bold' }, 2);
  const bottom = (
    <FlexWidget style={{ width: 'match_parent' }}>
      {[
        ...(content.progress
          ? [
              <FlexWidget style={{ width: 'match_parent', marginBottom: 8 }}>
                {progressBar(content.progress.day, content.progress.total, tone, theme)}
              </FlexWidget>,
            ]
          : []),
        content.feast
          ? feastLabel(content.feast, theme)
          : line(content.note, { fontSize: 12, color: theme.muted }),
      ]}
    </FlexWidget>
  );
  return [top, status, bottom];
}

function compactBody(content: WidgetContent, theme: Theme, tone: string): ReactElement[] {
  // Fast name on a fasting day, weekday on a free one; the feast label takes its place.
  const top = content.feast
    ? feastLabel(content.feast, theme)
    : line(content.fasting ? content.eyebrow : content.weekday, {
        fontSize: 11,
        color: theme.muted,
      });
  const hero = (
    <FlexWidget
      style={{
        flexDirection: 'row',
        width: 'match_parent',
        alignItems: 'flex-end',
      }}
    >
      {[
        <TextWidget
          text={content.hero.value}
          maxLines={1}
          allowFontScaling={false}
          style={{
            fontSize: 40,
            lineHeight: 44,
            fontWeight: 'bold',
            color: hex(tone),
          }}
        />,
        <FlexWidget style={{ flex: 1, width: 0, marginLeft: 4, marginBottom: 6 }}>
          {line(content.hero.suffix, { fontSize: 14, color: theme.muted })}
        </FlexWidget>,
      ]}
    </FlexWidget>
  );
  const status = line(content.status, { fontSize: 12, color: theme.ink, fontWeight: 'bold' }, 2);
  return [top, hero, status];
}

export function fastWidget(content: WidgetContent, theme: Theme, wide: boolean) {
  const tone = content.fasting ? theme.accent : theme.free;
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      accessibilityLabel={`${content.title}. ${content.status}`}
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: PADDING,
        borderRadius: RADIUS,
        backgroundColor: hex(theme.surface),
      }}
    >
      {wide ? wideBody(content, theme, tone) : compactBody(content, theme, tone)}
    </FlexWidget>
  );
}

/** The widget for a day, in both system themes; the launcher picks the matching one. */
export function buildFastWidget(
  settings: Pick<Settings, 'language' | 'churchId' | 'greekFish'>,
  widthDp: number,
  now: Date,
) {
  const date = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
  const content = widgetContentFor(date, CHURCHES[settings.churchId], MESSAGES[settings.language], {
    greekFish: settings.greekFish,
  });
  const wide = widthDp >= WIDE_FROM_DP;
  return {
    light: fastWidget(content, themes.light, wide),
    dark: fastWidget(content, themes.dark, wide),
  };
}
