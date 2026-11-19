'use no memo';
// The home-screen widget: today's fast, its progress, what is allowed and what is avoided,
// the day's reading and an "I am fasting today" button. Built from the library's widget primitives
// (they become Android RemoteViews / a bitmap), not from react-native components.
//
// The library walks this tree itself: no hooks, no fragments, and a component must return an
// element (never null). So the pieces below are plain functions that return elements.
//
// Layouts (chosen from the size the launcher gives the widget):
//  - wide    (4x2): title, day badge with a thin progress bar, cross badge; two columns
//                   "allowed / avoided"; reading reference and the fasting button.
//  - compact (2x2): cross and day badges, title, status with percent, progress bar, reading and a
//                   round fasting button.
// Titles are serif: the library only loads fonts bundled as native assets, so Noto Serif Bold
// (the face the app's SERIF resolves to) is shipped through the plugin's `fonts` option in app.json.
// Small text stays sans. Every text has a line limit and END truncation, so a long Turkish or
// Russian string shortens instead of pushing the layout around.

import type { ReactElement } from 'react';
import { FlexWidget, SvgWidget, TextWidget } from 'react-native-android-widget';
import { CHURCHES } from '../calendar';
import type { Language } from '../i18n';
import type { Settings } from '../settings/model';
import { Theme, themes } from '../ui/theme';
import { WidgetContent, widgetContentFor } from './content';
import { TOGGLE_DONE_ACTION } from './done';

export type Hex = `#${string}`;
export const hex = (color: string) => color as Hex;
/** A colour with an alpha channel appended (alpha as two hex digits). */
const tint = (color: string, alpha: string) => hex(color.slice(0, 7) + alpha);

/** From this width (dp) and height the widget uses the wide 4x2 layout; else the compact one. */
const WIDE_FROM_WIDTH_DP = 200;
const WIDE_FROM_HEIGHT_DP = 158;
/** Below this height the wide layout drops to one line per food list and tighter gaps. */
const DENSE_BELOW_HEIGHT_DP = 182;
/** Below this height the compact layout drops the status line and the second title line. */
const ROOMY_FROM_HEIGHT_DP = 150;
/** Below this width the compact layout leaves out the day badge. */
const NARROW_BELOW_WIDTH_DP = 130;

/**
 * Widget title font: the file name (without extension) of assets/fonts/NotoSerif-Bold.ttf, which
 * the react-native-android-widget plugin copies into the app's native assets. A name the app does
 * not carry falls back to the system sans, so a missing font only costs the look.
 */
export const WIDGET_SERIF = 'NotoSerif-Bold';

export const RADIUS = 24;
const BAR = 6;

export interface WidgetLayout {
  wide: boolean;
  /** Wide: little height, so lists get one line. Compact: enough height for the status line. */
  tight: boolean;
  /** Compact only: too narrow for the day badge beside the cross. */
  narrow: boolean;
  /** Compact only: edge (dp) of the square card, centred in the widget area. 0 when wide. */
  side: number;
}

/** Which layout fits the size (dp) the launcher gave the widget. */
export function layoutFor(width: number, height: number): WidgetLayout {
  const h = height > 0 ? height : 160;
  const wide = width >= WIDE_FROM_WIDTH_DP && h >= WIDE_FROM_HEIGHT_DP;
  // Launcher cells are rarely square, so the compact card is a square of the shorter edge.
  const side = wide ? 0 : Math.round(width > 0 ? Math.min(width, h) : h);
  return {
    wide,
    tight: wide ? h < DENSE_BELOW_HEIGHT_DP : side < ROOMY_FROM_HEIGHT_DP,
    narrow: !wide && side < NARROW_BELOW_WIDTH_DP,
    side,
  };
}

// --- icons -------------------------------------------------------------------------------

/** The project's three-bar Orthodox cross (geometry of scripts/make-icons.py). */
const crossSvg = (color: string, width: number, height: number) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="362 205 300 455">` +
  `<g fill="${color}"><rect x="488" y="215" width="48" height="435"/>` +
  `<rect x="436" y="258" width="152" height="34"/><rect x="372" y="346" width="280" height="44"/>` +
  `<rect x="432" y="551" width="160" height="30" transform="rotate(14 512 566)"/></g></svg>`;

const strokeSvg = (color: string, size: number, paths: string, width = 2.2) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" ` +
  `stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

const CHECK = '<path d="M5 12.5l4.5 4.5L19 7.5"/>';
const CROSS_MARK = '<path d="M6 6l12 12M18 6L6 18"/>';
const BOOK =
  '<path d="M6 3h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M4 17a2 2 0 0 1 2-2h15"/>';

function icon(svg: string, size: number, marginLeft = 0) {
  return (
    <SvgWidget
      svg={svg}
      style={{ width: size, height: size, ...(marginLeft ? { marginLeft } : {}) }}
    />
  );
}

// --- small pieces ------------------------------------------------------------------------

export interface TextStyle {
  size: number;
  color: string;
  bold?: boolean;
  italic?: boolean;
  /** Titles: the bundled serif (bold). */
  serif?: boolean;
  /** Line height; defaults to the size plus 4. */
  lh?: number;
  marginLeft?: number;
  marginTop?: number;
}

/** Text that shortens with an ellipsis instead of growing. */
export function text(value: string, style: TextStyle, maxLines = 1) {
  return (
    <TextWidget
      text={value}
      maxLines={maxLines}
      truncate="END"
      style={{
        fontSize: style.size,
        // Fixed line height keeps the vertical rhythm the same in every language.
        lineHeight: style.lh ?? style.size + 4,
        color: hex(style.color),
        ...(style.serif ? { fontFamily: WIDGET_SERIF } : {}),
        ...(style.bold ? { fontWeight: 'bold' as const } : {}),
        ...(style.italic ? { fontStyle: 'italic' as const } : {}),
        ...(style.marginLeft ? { marginLeft: style.marginLeft } : {}),
        ...(style.marginTop ? { marginTop: style.marginTop } : {}),
      }}
    />
  );
}

/** Small rounded label (day badge, status badge). */
export function chip(value: string, color: string, background: string, size = 12) {
  return (
    <TextWidget
      text={value}
      maxLines={1}
      truncate="END"
      style={{
        fontSize: size,
        lineHeight: size + 4,
        fontWeight: 'bold',
        color: hex(color),
        backgroundColor: hex(background),
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 3,
      }}
    />
  );
}

/** Round badge with the cross. */
export function crossBadge(size: number, theme: Theme) {
  const height = Math.round(size * 0.46);
  return (
    <FlexWidget
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: hex(theme.pill),
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <SvgWidget
        svg={crossSvg(theme.accent, Math.round(height * 0.66), height)}
        style={{ width: Math.round(height * 0.66), height }}
      />
    </FlexWidget>
  );
}

/** Thin rounded track with the accent fill for the days passed. */
function progressBar(day: number, total: number, theme: Theme) {
  const rest = total - day;
  const fill = (
    <FlexWidget style={{ flex: day, width: 0, height: BAR, backgroundColor: hex(theme.accent) }} />
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

/** Round "I am fasting today" button for the compact layout: outline until done, then filled. */
export function checkButton(content: WidgetContent, theme: Theme, done: boolean, size: number) {
  const mark = Math.round(size * 0.5);
  return (
    <FlexWidget
      clickAction={TOGGLE_DONE_ACTION}
      accessibilityLabel={done ? content.labels.completed : content.labels.complete}
      style={{
        width: size,
        height: size,
        marginLeft: 8,
        borderRadius: size / 2,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: hex(done ? theme.accent : theme.pill),
      }}
    >
      {icon(strokeSvg(done ? theme.surface : theme.accent, mark, CHECK, 2.6), mark)}
    </FlexWidget>
  );
}

function divider(theme: Theme, margin: number) {
  return (
    <FlexWidget
      style={{
        width: 'match_parent',
        height: 1,
        backgroundColor: hex(theme.line),
        marginVertical: margin,
      }}
    />
  );
}

/** Column heading: icon and title in one colour. */
function columnHead(label: string, svg: string, color: string) {
  return (
    <FlexWidget style={{ flexDirection: 'row', width: 'match_parent', alignItems: 'center' }}>
      {[
        icon(svg, 14),
        <FlexWidget style={{ flex: 1, width: 0, marginLeft: 6 }}>
          {text(label, { size: 14, color, bold: true })}
        </FlexWidget>,
      ]}
    </FlexWidget>
  );
}

function column(
  label: string,
  svg: string,
  headColor: string,
  list: string,
  listColor: string,
  lines: number,
) {
  return (
    <FlexWidget style={{ flex: 1, width: 0 }}>
      {[
        columnHead(label, svg, headColor),
        text(list, { size: 12, color: listColor, lh: 16, marginTop: 3 }, lines),
      ]}
    </FlexWidget>
  );
}

/** The "I am fasting today" pill: solid accent until marked, then a soft, filled-in confirmation. */
function doneButton(content: WidgetContent, theme: Theme, done: boolean) {
  const color = done ? theme.accent : theme.onAccent;
  return (
    <FlexWidget
      clickAction={TOGGLE_DONE_ACTION}
      accessibilityLabel={done ? content.labels.completed : content.labels.complete}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 16,
        backgroundColor: done ? hex(theme.pill) : hex(theme.accent),
        marginLeft: 8,
      }}
    >
      {[
        icon(strokeSvg(color, 12, CHECK, 2.6), 12),
        text(done ? content.labels.completed : content.labels.complete, {
          size: 12,
          color,
          bold: true,
          marginLeft: 6,
        }),
      ]}
    </FlexWidget>
  );
}

// --- wide (4x2) --------------------------------------------------------------------------

function wideBody(
  content: WidgetContent,
  theme: Theme,
  done: boolean,
  tight: boolean,
): ReactElement[] {
  const { progress, feast, reading, fasting, labels } = content;

  // Badge row under the title: day badge + bar (or the feast / status in their place).
  const badge = progress
    ? chip(progress.badge, theme.feastInk, theme.feastSurface)
    : fasting
      ? chip(content.levelShort, theme.accent, theme.pill)
      : chip(labels.noFast, theme.freeInk, tint(theme.free, '2E'));
  const beside = progress ? (
    feast ? (
      text(feast, { size: 12, color: theme.feastInk, bold: true, marginLeft: 8 })
    ) : (
      <FlexWidget style={{ flex: 1, width: 0, marginLeft: 10 }}>
        {progressBar(progress.day, progress.total, theme)}
      </FlexWidget>
    )
  ) : null;

  const top = (
    <FlexWidget style={{ flexDirection: 'row', width: 'match_parent', alignItems: 'center' }}>
      {[
        <FlexWidget style={{ flex: 1, width: 0 }}>
          {[
            text(content.title, { size: 18, color: theme.ink, bold: true, serif: true, lh: 22 }),
            <FlexWidget
              style={{
                flexDirection: 'row',
                width: 'match_parent',
                alignItems: 'center',
                marginTop: 6,
              }}
            >
              {beside ? [badge, beside] : [badge]}
            </FlexWidget>,
          ]}
        </FlexWidget>,
        <FlexWidget style={{ marginLeft: 12 }}>{crossBadge(36, theme)}</FlexWidget>,
      ]}
    </FlexWidget>
  );

  // Middle: the two food columns; on a day without fasting one calm sentence instead.
  const middle = fasting ? (
    <FlexWidget style={{ flexDirection: 'row', width: 'match_parent' }}>
      {[
        column(
          labels.allowed,
          strokeSvg(theme.freeInk, 14, CHECK, 2.6),
          theme.freeInk,
          content.allowedFoods,
          theme.ink,
          tight ? 1 : 2,
        ),
        <FlexWidget
          style={{
            width: 1,
            height: 'match_parent',
            backgroundColor: hex(theme.line),
            marginHorizontal: 12,
          }}
        />,
        column(
          labels.avoided,
          strokeSvg(theme.danger, 14, CROSS_MARK, 2.6),
          theme.danger,
          content.avoidedFoods,
          theme.muted,
          tight ? 1 : 2,
        ),
      ]}
    </FlexWidget>
  ) : (
    <FlexWidget style={{ width: 'match_parent' }}>
      {feast
        ? text(feast, { size: 14, color: theme.feastInk, bold: true, lh: 20 }, 2)
        : text(content.calmNote, { size: 14, color: theme.ink, lh: 20 }, 2)}
    </FlexWidget>
  );

  // Bottom: the reading on the left, the fasting button on the right (fasting days only).
  const bottom = (
    <FlexWidget style={{ flexDirection: 'row', width: 'match_parent', alignItems: 'center' }}>
      {[
        ...(reading ? [icon(strokeSvg(theme.muted, 16, BOOK, 1.8), 16)] : []),
        <FlexWidget style={{ flex: 1, width: 0, ...(reading ? { marginLeft: 6 } : {}) }}>
          {text(reading ?? content.dateLine, {
            size: 12,
            color: theme.muted,
            italic: Boolean(reading),
          })}
        </FlexWidget>,
        ...(fasting ? [doneButton(content, theme, done)] : []),
      ]}
    </FlexWidget>
  );

  return [top, divider(theme, tight ? 2 : 4), middle, divider(theme, tight ? 2 : 4), bottom];
}

// --- compact (2x2) -----------------------------------------------------------------------

function compactBody(
  content: WidgetContent,
  theme: Theme,
  roomy: boolean,
  narrow: boolean,
  done: boolean,
): ReactElement[] {
  const { progress, feast, reading, fasting } = content;
  const dot = feast ? theme.feast : theme.free;
  // The status line is small text: it uses the darker "ink" variant of the dot's colour.
  const statusColor = feast ? theme.feastInk : theme.freeInk;
  const status = feast ?? (fasting ? content.levelShort : content.labels.noFast);

  const top = (
    <FlexWidget style={{ flexDirection: 'row', width: 'match_parent', alignItems: 'center' }}>
      {[
        crossBadge(roomy ? 32 : 28, theme),
        <FlexWidget style={{ flex: 1, width: 0 }} />,
        ...(progress && !narrow
          ? [chip(progress.badgeShort, theme.feastInk, theme.feastSurface)]
          : []),
      ]}
    </FlexWidget>
  );

  const middle = (
    <FlexWidget style={{ width: 'match_parent' }}>
      {[
        text(
          content.title,
          {
            size: roomy ? 17 : 15,
            color: theme.ink,
            bold: true,
            serif: true,
            lh: roomy ? 21 : 19,
            marginTop: roomy ? 6 : 4,
          },
          roomy ? 2 : 1,
        ),
        ...(roomy
          ? [
              <FlexWidget
                style={{
                  flexDirection: 'row',
                  width: 'match_parent',
                  alignItems: 'center',
                  marginTop: 4,
                }}
              >
                {[
                  <FlexWidget
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: hex(dot),
                    }}
                  />,
                  <FlexWidget style={{ flex: 1, width: 0, marginLeft: 6 }}>
                    {text(status, { size: 12, color: statusColor, bold: true })}
                  </FlexWidget>,
                  ...(progress
                    ? [
                        text(progress.percentText, {
                          size: 12,
                          color: theme.muted,
                          bold: true,
                          marginLeft: 6,
                        }),
                      ]
                    : []),
                ]}
              </FlexWidget>,
            ]
          : []),
      ]}
    </FlexWidget>
  );

  const footer = (
    <FlexWidget style={{ flexDirection: 'row', width: 'match_parent', alignItems: 'center' }}>
      {[
        <FlexWidget style={{ flex: 1, width: 0 }}>
          {text(reading ?? (fasting ? '' : content.dateLine), {
            size: 11,
            color: theme.muted,
            lh: 14,
          })}
        </FlexWidget>,
        ...(fasting ? [checkButton(content, theme, done, roomy ? 32 : 28)] : []),
      ]}
    </FlexWidget>
  );

  const bottom = (
    <FlexWidget style={{ width: 'match_parent' }}>
      {progress
        ? [
            <FlexWidget style={{ width: 'match_parent', marginBottom: 6 }}>
              {progressBar(progress.day, progress.total, theme)}
            </FlexWidget>,
            footer,
          ]
        : [footer]}
    </FlexWidget>
  );

  return [top, middle, bottom];
}

// --- root --------------------------------------------------------------------------------

/**
 * What a screen reader says for the whole card. The card is one tap target, so TalkBack reads this
 * and not the texts inside it: it carries everything the card shows (the food lists only where the
 * layout has them).
 */
export function cardLabel(content: WidgetContent, layout: WidgetLayout): string {
  const parts = [content.title, content.status, content.feast, content.progress?.text];
  if (layout.wide && content.fasting) {
    parts.push(
      `${content.labels.allowed}: ${content.allowedFoods}`,
      `${content.labels.avoided}: ${content.avoidedFoods}`,
    );
  }
  parts.push(content.reading);
  return parts.filter(Boolean).join('. ');
}

export function fastWidget(
  content: WidgetContent,
  theme: Theme,
  layout: WidgetLayout,
  done: boolean,
) {
  const card = (
    <FlexWidget
      clickAction="OPEN_APP"
      accessibilityLabel={cardLabel(content, layout)}
      style={{
        ...(layout.wide
          ? { height: 'match_parent' as const, width: 'match_parent' as const }
          : { height: layout.side, width: layout.side }),
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: layout.wide ? 16 : layout.tight ? 12 : 14,
        borderRadius: RADIUS,
        backgroundColor: hex(theme.surface),
      }}
    >
      {layout.wide
        ? wideBody(content, theme, done, layout.tight)
        : compactBody(content, theme, !layout.tight, layout.narrow, done)}
    </FlexWidget>
  );
  if (layout.wide) return card;
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {card}
    </FlexWidget>
  );
}

type WidgetSettings = Pick<Settings, 'language' | 'churchId' | 'greekFish'>;

/** The widget for a day, in both system themes; the launcher picks the matching one. */
export function buildFastWidget(
  settings: WidgetSettings,
  size: { width: number; height: number },
  now: Date,
  done: boolean,
) {
  const date = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
  const content = widgetContentFor(
    date,
    CHURCHES[settings.churchId],
    settings.language as Language,
    {
      greekFish: settings.greekFish,
    },
  );
  const layout = layoutFor(size.width, size.height);
  return {
    light: fastWidget(content, themes.light, layout, done),
    dark: fastWidget(content, themes.dark, layout, done),
  };
}
