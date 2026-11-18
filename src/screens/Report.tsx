// The report of one fast, in the manner of a year-end summary: full-screen pages you swipe through,
// large serif numbers on warm wine and gold. It is a quiet look back, not a score: no streaks, no
// comparison, only what the user marked. Built from React Native's own Animated (no native module).

import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { ComponentRef, useEffect, useMemo, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  Animated,
  Easing,
  NativeScrollEvent,
  NativeSyntheticEvent,
  PixelRatio,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CHURCHES, gregorianToJdn } from '../calendar';
import type { Messages } from '../i18n';
import { titleFontSize, TITLE_MAX_FONT_SCALE } from '../report/layout';
import { PagePalette, reportPalettes } from '../report/palette';
import { parsePeriodKey } from '../report/periods';
import { PeriodReport, ReportDayState, reportFor } from '../report/report';
import { markReportSeen } from '../report/seen';
import { reportDates, reportHeading, reportShareText } from '../report/text';
import { useReportInputs } from '../report/useReportInputs';
import { useSettings } from '../settings/SettingsProvider';
import { FadeIn, useReduceMotion } from '../ui/motion';
import { SERIF, space, useTheme } from '../ui/theme';
import { useToday } from '../ui/useToday';

const PAGE_COUNT = 5;
const CLOSE_SIZE = 44;
const DOTS_HEIGHT = 56;
const DAYS_PER_ROW = 7;
/** Each page stays this long before the report turns to the next one by itself. */
export const PAGE_SECONDS = 10;
/** Longest a page may stay held after the finger lifts if no "momentum end" arrives. */
const HELD_FAILSAFE_MS = 1500;
const STORY_BAR_HEIGHT = 3;

export function Report({ periodKey }: { periodKey: string | undefined }) {
  const { settings, messages: m } = useSettings();
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const reduceMotion = useReduceMotion();
  const today = useToday();
  const { done, loaded } = useReportInputs();
  const palettes = useMemo(() => reportPalettes(theme), [theme]);

  const scrollX = useRef(new Animated.Value(0)).current;
  const scroller = useRef<ComponentRef<typeof ScrollView>>(null);
  const [page, setPage] = useState(0);
  // The timer holds while a finger is on the pages, like a story.
  const [held, setHeld] = useState(false);
  // Normally the momentum end lets go of the hold. If a platform never reports it (a drag that
  // ends without moving the page), this timer does, so the report cannot stay stuck for good.
  const releaseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearReleaseTimer = () => {
    if (releaseTimer.current) clearTimeout(releaseTimer.current);
    releaseTimer.current = null;
  };
  useEffect(() => clearReleaseTimer, []);
  const countdown = useRef(new Animated.Value(0)).current;
  const [screenReader, setScreenReader] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isScreenReaderEnabled()
      .then((value) => alive && setScreenReader(value))
      .catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('screenReaderChanged', setScreenReader);
    return () => {
      alive = false;
      subscription.remove();
    };
  }, []);
  // Pages that move on their own are no help to a screen reader or to someone who asked for less
  // motion: for them the report stays put and is turned by hand.
  const auto = !reduceMotion && !screenReader;

  const todayJdn = gregorianToJdn(today.year, today.month, today.day);
  const report = useMemo(() => {
    const ref = parsePeriodKey(periodKey);
    if (!ref || !loaded) return null;
    return reportFor(ref, done, CHURCHES[settings.churchId], todayJdn, {
      greekFish: settings.greekFish,
    });
  }, [periodKey, loaded, done, settings.churchId, settings.greekFish, todayJdn]);

  // Opening a finished report is what "seen" means: Today stops offering it.
  const ended = report?.ended ?? false;
  useEffect(() => {
    const ref = parsePeriodKey(periodKey);
    if (ref && ended) void markReportSeen(ref);
  }, [periodKey, ended]);

  const lastPage = page >= PAGE_COUNT - 1;
  // Only whether there is a report matters here: a re-read of the marks (coming back from the share
  // sheet) builds a new report object and must not restart the page's countdown.
  const hasReport = report !== null;
  useEffect(() => {
    countdown.setValue(0);
    if (!hasReport || !auto || held || lastPage) return;
    const animation = Animated.timing(countdown, {
      toValue: 1,
      duration: PAGE_SECONDS * 1000,
      easing: Easing.linear,
      useNativeDriver: true,
    });
    animation.start(({ finished }) => {
      if (finished) scroller.current?.scrollTo({ x: (page + 1) * width, animated: true });
    });
    return () => animation.stop();
  }, [page, held, auto, lastPage, hasReport, width, countdown]);

  function close() {
    if (router.canGoBack()) router.back();
    else router.replace('/today');
  }

  const pageStyles = [palettes.wine, palettes.gold, palettes.wine, palettes.gold, palettes.wine];
  const palette = pageStyles[Math.min(page, PAGE_COUNT - 1)];

  function onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const next = Math.round(event.nativeEvent.contentOffset.x / Math.max(1, width));
    setPage((previous) => (previous === next ? previous : next));
  }

  async function share() {
    if (!report) return;
    try {
      await Share.share({ message: reportShareText(report, m) });
    } catch {
      // The share sheet failing is not worth a message.
    }
  }

  if (!report) {
    // Not read yet, or no such report: a plain page with a way out.
    return (
      <View style={[styles.screen, { backgroundColor: palettes.wine.background }]}>
        <StatusBar style={palettes.wine.statusBar} />
        <CloseButton
          palette={palettes.wine}
          top={insets.top}
          label={m.report.close}
          onPress={close}
        />
        {loaded ? (
          <View style={[styles.page, { width, paddingTop: insets.top + CLOSE_SIZE + space.lg }]}>
            <Text style={[styles.body, { color: palettes.wine.text }]} accessibilityRole="alert">
              {m.report.notFound}
            </Text>
          </View>
        ) : (
          // The done days are still being read: a spinner instead of a blank screen.
          <View style={styles.loading}>
            <ActivityIndicator color={palettes.wine.text} />
          </View>
        )}
      </View>
    );
  }

  const content = [
    <TitlePage key="title" report={report} m={m} palette={palettes.wine} width={width} />,
    <CountPage key="count" report={report} m={m} palette={palettes.gold} />,
    <WeeksPage key="weeks" report={report} m={m} palette={palettes.wine} />,
    <GridPage key="grid" report={report} m={m} palette={palettes.gold} width={width} />,
    <ClosingPage
      key="closing"
      m={m}
      palette={palettes.wine}
      width={width}
      onShare={() => void share()}
      onClose={close}
    />,
  ];

  return (
    <View style={[styles.screen, { backgroundColor: palette.background }]}>
      <StatusBar style={palette.statusBar} />
      {/* First in the tree so a screen reader reaches it first; zIndex keeps it above the pages. */}
      <CloseButton palette={palette} top={insets.top} label={m.report.close} onPress={close} />
      <Animated.ScrollView
        ref={scroller}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        scrollEventThrottle={16}
        onScrollBeginDrag={() => {
          clearReleaseTimer();
          setHeld(true);
        }}
        onScrollEndDrag={(event) => {
          clearReleaseTimer();
          // A drag that ends without momentum settles on its own page right away.
          if (event.nativeEvent.velocity?.x === 0) setHeld(false);
          else releaseTimer.current = setTimeout(() => setHeld(false), HELD_FAILSAFE_MS);
        }}
        onMomentumScrollEnd={() => {
          clearReleaseTimer();
          setHeld(false);
        }}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: true,
          listener: onScroll,
        })}
      >
        {content.map((children, index) => {
          const input = [(index - 1) * width, index * width, (index + 1) * width];
          const opacity = scrollX.interpolate({
            inputRange: input,
            outputRange: [0, 1, 0],
            extrapolate: 'clamp',
          });
          const translateY = scrollX.interpolate({
            inputRange: input,
            outputRange: reduceMotion ? [0, 0, 0] : [16, 0, 16],
            extrapolate: 'clamp',
          });
          return (
            <View
              key={index}
              style={[
                styles.page,
                {
                  width,
                  backgroundColor: pageStyles[index].background,
                  paddingTop: insets.top + CLOSE_SIZE + space.lg,
                  paddingBottom: insets.bottom + DOTS_HEIGHT + space.md,
                },
              ]}
            >
              {/* Scrolls vertically only when a large system font makes the page taller than the screen. */}
              <ScrollView
                style={styles.pageScroll}
                contentContainerStyle={styles.pageContent}
                showsVerticalScrollIndicator={false}
              >
                <Animated.View style={{ opacity, transform: [{ translateY }] }}>
                  {children}
                </Animated.View>
              </ScrollView>
            </View>
          );
        })}
      </Animated.ScrollView>

      {auto && (
        <View
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[
            styles.storyTrack,
            { top: insets.top + 4, backgroundColor: palette.track, width: width - space.lg * 2 },
          ]}
        >
          <Animated.View
            style={[
              styles.storyFill,
              {
                backgroundColor: palette.text,
                width: width - space.lg * 2,
                transform: [
                  {
                    translateX: countdown.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-(width - space.lg * 2), 0],
                    }),
                  },
                ],
              },
            ]}
          />
        </View>
      )}

      <View style={[styles.dots, { bottom: insets.bottom }]}>
        {Array.from({ length: PAGE_COUNT }, (_, index) => (
          <Pressable
            key={index}
            onPress={() => scroller.current?.scrollTo({ x: index * width, animated: true })}
            style={styles.dotTarget}
            accessibilityRole="button"
            accessibilityLabel={m.report.page(index + 1, PAGE_COUNT)}
            accessibilityState={{ selected: index === page }}
          >
            <View
              style={[
                styles.dot,
                { backgroundColor: palette.text, opacity: index === page ? 1 : 0.35 },
              ]}
            />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function CloseButton({
  palette,
  top,
  label,
  onPress,
}: {
  palette: PagePalette;
  top: number;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.close, { top: top + space.sm }]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text
        accessibilityElementsHidden
        importantForAccessibility="no"
        maxFontSizeMultiplier={1.2}
        style={[styles.closeText, { color: palette.text }]}
      >
        ✕
      </Text>
    </Pressable>
  );
}

interface PageProps {
  report: PeriodReport;
  m: Messages;
  palette: PagePalette;
}

/** Style of a big title sized so its longest word fits the page width (no mid-word breaks). */
function fittedTitle(text: string, width: number) {
  const size = titleFontSize(text, width - space.lg * 2, PixelRatio.getFontScale());
  return { fontSize: size, lineHeight: Math.round(size * 1.18) };
}

function TitlePage({ report, m, palette, width }: PageProps & { width: number }) {
  const heading = reportHeading(report, m);
  return (
    <View>
      <FadeIn index={0}>
        <Text style={[styles.kicker, { color: palette.muted }]}>{m.report.kicker}</Text>
      </FadeIn>
      <FadeIn index={1}>
        <Text
          accessibilityRole="header"
          maxFontSizeMultiplier={TITLE_MAX_FONT_SCALE}
          style={[styles.title, fittedTitle(heading, width), { color: palette.text }]}
        >
          {heading}
        </Text>
      </FadeIn>
      <FadeIn index={2}>
        <Text style={[styles.body, { color: palette.muted }]}>{reportDates(report, m)}</Text>
      </FadeIn>
      {!report.ended && (
        <FadeIn index={3}>
          <Text style={[styles.body, styles.gapTop, { color: palette.muted }]}>
            {m.report.inProgress}
          </Text>
        </FadeIn>
      )}
    </View>
  );
}

function CountPage({ report, m, palette }: PageProps) {
  return (
    <View
      accessible
      accessibilityLabel={`${m.report.countLead}: ${m.report.count(report.markedDays, report.fastingDays)}`}
    >
      <Text style={[styles.kicker, { color: palette.muted }]}>{m.report.countLead}</Text>
      <Text
        maxFontSizeMultiplier={1.1}
        style={[styles.bigNumber, { color: palette.text }]}
        accessibilityElementsHidden
      >
        {report.markedDays}
      </Text>
      <Text style={[styles.ofTotal, { color: palette.text }]}>
        {m.report.countOf(report.fastingDays)}
      </Text>
      <View style={[styles.track, styles.gapTopLarge, { backgroundColor: palette.track }]}>
        <View
          style={[
            styles.fill,
            { backgroundColor: palette.fill, width: `${Math.min(100, report.percent)}%` },
          ]}
        />
      </View>
      <Text style={[styles.body, styles.gapTop, { color: palette.muted }]}>
        {m.report.percent(report.percent)}
      </Text>
    </View>
  );
}

function WeeksPage({ report, m, palette }: PageProps) {
  return (
    <View>
      <Text
        accessibilityRole="header"
        maxFontSizeMultiplier={1.4}
        style={[styles.pageTitle, { color: palette.text }]}
      >
        {m.report.weeksTitle}
      </Text>
      <View style={styles.weeks}>
        {report.weeks.map((week) => {
          const ratio = week.fastingDays > 0 ? week.markedDays / week.fastingDays : 0;
          const value = `${week.markedDays}/${week.fastingDays}`;
          return (
            <View
              key={week.index}
              style={styles.weekRow}
              accessible
              accessibilityLabel={`${m.report.week(week.index)}: ${value}`}
            >
              <Text
                style={[styles.weekLabel, { color: palette.muted }]}
                maxFontSizeMultiplier={1.3}
              >
                {m.report.week(week.index)}
              </Text>
              <View style={[styles.weekTrack, { backgroundColor: palette.track }]}>
                <View
                  style={[
                    styles.fill,
                    { backgroundColor: palette.fill, width: `${Math.round(ratio * 100)}%` },
                  ]}
                />
              </View>
              <Text style={[styles.weekValue, { color: palette.text }]} maxFontSizeMultiplier={1.3}>
                {value}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function Dot({
  state,
  size,
  palette,
}: {
  state: ReportDayState;
  size: number;
  palette: PagePalette;
}) {
  switch (state) {
    case 'marked':
      return (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: palette.fill,
          }}
        />
      );
    case 'unmarked':
      return (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 2,
            borderColor: palette.muted,
          }}
        />
      );
    case 'upcoming':
      return (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 1.5,
            borderColor: palette.track,
          }}
        />
      );
    case 'free': {
      const small = Math.max(4, Math.round(size * 0.3));
      return (
        <View
          style={{
            width: small,
            height: small,
            borderRadius: small / 2,
            backgroundColor: palette.muted,
            opacity: 0.6,
          }}
        />
      );
    }
  }
}

function GridPage({ report, m, palette, width }: PageProps & { width: number }) {
  const cell = Math.min(44, Math.floor((width - space.lg * 2) / DAYS_PER_ROW));
  const dot = Math.round(cell * 0.62);
  const rows: (typeof report.days)[] = [];
  for (let from = 0; from < report.days.length; from += DAYS_PER_ROW) {
    rows.push(report.days.slice(from, from + DAYS_PER_ROW));
  }
  const present = new Set(report.days.map((d) => d.state));
  const legend: [ReportDayState, string][] = [
    ['marked', m.report.legendMarked],
    ['unmarked', m.report.legendUnmarked],
    ['free', m.report.legendFree],
    ['upcoming', m.report.legendUpcoming],
  ];

  return (
    <View>
      <Text
        accessibilityRole="header"
        maxFontSizeMultiplier={1.4}
        style={[styles.pageTitle, { color: palette.text }]}
      >
        {m.report.gridTitle}
      </Text>
      <View
        style={styles.grid}
        accessible
        accessibilityLabel={`${m.report.gridTitle}: ${m.report.count(report.markedDays, report.fastingDays)}`}
        importantForAccessibility="yes"
      >
        {rows.map((row, rowIndex) => (
          <View
            key={rowIndex}
            style={styles.gridRow}
            importantForAccessibility="no-hide-descendants"
          >
            {row.map((day) => (
              <View key={day.jdn} style={{ width: cell, height: cell, ...styles.cell }}>
                <Dot state={day.state} size={dot} palette={palette} />
              </View>
            ))}
          </View>
        ))}
      </View>
      <View style={styles.legend} importantForAccessibility="no-hide-descendants">
        {legend
          .filter(([state]) => present.has(state))
          .map(([state, label]) => (
            <View key={state} style={styles.legendItem}>
              <View style={styles.legendDot}>
                <Dot state={state} size={14} palette={palette} />
              </View>
              <Text style={[styles.legendText, { color: palette.muted }]}>{label}</Text>
            </View>
          ))}
      </View>
    </View>
  );
}

function ClosingPage({
  m,
  palette,
  width,
  onShare,
  onClose,
}: {
  m: Messages;
  palette: PagePalette;
  width: number;
  onShare: () => void;
  onClose: () => void;
}) {
  const button = (label: string, onPress: () => void, filled: boolean) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: filled ? palette.text : 'transparent',
          borderColor: palette.text,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Text style={[styles.buttonText, { color: filled ? palette.background : palette.text }]}>
        {label}
      </Text>
    </Pressable>
  );
  return (
    <View>
      <Text
        accessibilityRole="header"
        maxFontSizeMultiplier={TITLE_MAX_FONT_SCALE}
        style={[styles.title, fittedTitle(m.report.closingTitle, width), { color: palette.text }]}
      >
        {m.report.closingTitle}
      </Text>
      <Text style={[styles.body, styles.gapTop, { color: palette.muted }]}>
        {m.report.closingBody}
      </Text>
      <View style={styles.buttons}>
        {button(m.report.share, onShare, true)}
        {button(m.report.close, onClose, false)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  page: { justifyContent: 'center', paddingHorizontal: space.lg },
  pageScroll: { flex: 1 },
  pageContent: { flexGrow: 1, justifyContent: 'center' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  close: {
    position: 'absolute',
    zIndex: 2,
    right: space.sm,
    width: CLOSE_SIZE,
    height: CLOSE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: { fontSize: 20, lineHeight: 24 },
  storyTrack: {
    position: 'absolute',
    left: space.lg,
    height: STORY_BAR_HEIGHT,
    borderRadius: STORY_BAR_HEIGHT / 2,
    overflow: 'hidden',
  },
  storyFill: { height: STORY_BAR_HEIGHT, borderRadius: STORY_BAR_HEIGHT / 2 },
  dots: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: DOTS_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotTarget: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4 },

  kicker: { fontSize: 16, lineHeight: 24 },
  title: { fontFamily: SERIF, fontSize: 44, lineHeight: 52, marginTop: space.sm },
  pageTitle: { fontFamily: SERIF, fontSize: 30, lineHeight: 40 },
  body: { fontSize: 17, lineHeight: 26, marginTop: space.md },
  gapTop: { marginTop: space.md },
  gapTopLarge: { marginTop: space.lg },
  bigNumber: { fontFamily: SERIF, fontSize: 128, lineHeight: 140, marginTop: space.sm },
  ofTotal: { fontFamily: SERIF, fontSize: 26, lineHeight: 34 },
  track: { height: 12, borderRadius: 6, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 6 },

  weeks: { marginTop: space.lg, gap: space.md },
  weekRow: { flexDirection: 'row', alignItems: 'center', gap: space.smd },
  // Minimum widths, not fixed ones: "Неделя 10" and "10/12" grow with the system font size.
  weekLabel: { minWidth: 84, flexShrink: 0, fontSize: 15, lineHeight: 22 },
  weekTrack: { flex: 1, minWidth: 24, height: 14, borderRadius: 7, overflow: 'hidden' },
  weekValue: {
    minWidth: 48,
    flexShrink: 0,
    textAlign: 'right',
    fontSize: 16,
    lineHeight: 22,
    fontVariant: ['tabular-nums'],
  },

  grid: { marginTop: space.lg, alignSelf: 'center' },
  gridRow: { flexDirection: 'row' },
  cell: { alignItems: 'center', justifyContent: 'center' },
  legend: { marginTop: space.lg, flexDirection: 'row', flexWrap: 'wrap', gap: space.md },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  legendDot: { width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  legendText: { fontSize: 14, lineHeight: 20 },

  buttons: { marginTop: space.xl, gap: space.md },
  button: {
    minHeight: 48,
    borderRadius: 24,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
  },
  buttonText: { fontSize: 16, lineHeight: 24, fontWeight: '600', textAlign: 'center' },
});
