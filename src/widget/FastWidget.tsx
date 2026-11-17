'use no memo';
// The home-screen widget: today's fast, what is allowed, the feast. Built from the library's
// widget primitives (they become Android RemoteViews), not from react-native components.
//
// The library walks this tree itself: no hooks, no fragments, and a component must return an
// element (never null). So the pieces below are plain functions that return element lists.

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

function progressRows(content: WidgetContent, theme: Theme): ReactElement[] {
  const progress = content.progress;
  if (!progress) return [];
  const tone = content.fasting ? theme.accent : theme.free;
  const rest = progress.total - progress.day;
  const fill = (
    <FlexWidget style={{ flex: progress.day, height: 4, backgroundColor: hex(tone) }} />
  );
  const remainder = rest > 0 ? <FlexWidget style={{ flex: rest, height: 4 }} /> : null;
  return [
    <FlexWidget style={{ width: 'match_parent' }}>
      {[
        <TextWidget
          text={progress.text}
          maxLines={1}
          style={{ fontSize: 11, color: hex(theme.muted), marginBottom: 3 }}
        />,
        <FlexWidget
          style={{
            flexDirection: 'row',
            width: 'match_parent',
            height: 4,
            borderRadius: 2,
            overflow: 'hidden',
            backgroundColor: hex(theme.line),
          }}
        >
          {remainder ? [fill, remainder] : [fill]}
        </FlexWidget>,
      ]}
    </FlexWidget>,
  ];
}

function wideRows(content: WidgetContent, theme: Theme): ReactElement[] {
  const tone = content.fasting ? theme.accent : theme.free;
  const extra = content.feast ?? content.detail;
  const rows: ReactElement[] = [
    <FlexWidget style={{ flexDirection: 'row', width: 'match_parent', alignItems: 'center' }}>
      {[
        <FlexWidget style={{ flex: 1 }}>
          <TextWidget
            text={content.title}
            maxLines={1}
            truncate="END"
            style={{ fontSize: 20, fontWeight: 'bold', color: hex(tone) }}
          />
        </FlexWidget>,
        <TextWidget
          text={content.dateLine}
          maxLines={1}
          style={{ fontSize: 11, color: hex(theme.muted), marginLeft: 8 }}
        />,
      ]}
    </FlexWidget>,
    <TextWidget
      text={content.rule}
      maxLines={1}
      truncate="END"
      style={{ fontSize: 14, color: hex(theme.ink) }}
    />,
  ];
  if (extra) {
    rows.push(
      <TextWidget
        text={extra}
        maxLines={1}
        truncate="END"
        style={{
          fontSize: 12,
          color: hex(content.feast ? theme.feast : theme.muted),
          fontWeight: content.feast ? 'bold' : 'normal',
        }}
      />,
    );
  }
  return [...rows, ...progressRows(content, theme)];
}

function smallRows(content: WidgetContent, theme: Theme): ReactElement[] {
  const tone = content.fasting ? theme.accent : theme.free;
  return [
    <TextWidget
      text={content.title}
      maxLines={2}
      truncate="END"
      style={{ fontSize: 14, fontWeight: 'bold', color: hex(tone) }}
    />,
    <TextWidget
      text={content.feast ?? content.rule}
      maxLines={2}
      truncate="END"
      style={{
        fontSize: 11,
        color: hex(content.feast ? theme.feast : theme.ink),
        fontWeight: content.feast ? 'bold' : 'normal',
      }}
    />,
    ...progressRows(content, theme),
  ];
}

export function fastWidget(content: WidgetContent, theme: Theme, wide: boolean) {
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      accessibilityLabel={`${content.title}. ${content.rule}`}
      style={{
        height: 'match_parent',
        width: 'match_parent',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: wide ? 14 : 10,
        borderRadius: 24,
        borderWidth: 1,
        borderColor: hex(theme.line),
        backgroundColor: hex(theme.surface),
      }}
    >
      {wide ? wideRows(content, theme) : smallRows(content, theme)}
    </FlexWidget>
  );
}

/** The widget for a day, in both system themes; the launcher picks the matching one. */
export function buildFastWidget(
  settings: Pick<Settings, 'language' | 'churchId' | 'greekFish'>,
  widthDp: number,
  now: Date,
) {
  const date = { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
  const content = widgetContentFor(date, CHURCHES[settings.churchId], MESSAGES[settings.language], {
    greekFish: settings.greekFish,
  });
  const wide = widthDp >= WIDE_FROM_DP;
  return {
    light: fastWidget(content, themes.light, wide),
    dark: fastWidget(content, themes.dark, wide),
  };
}
