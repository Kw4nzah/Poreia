// The daily view: today's date, feast, fasting rule and the next fast.

import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CHURCHES, FOOD_IDS, getDayInfo, getUpcomingFast, isFoodAllowed } from '../calendar';
import { getCommemoration, readingReference } from '../commemorations';
import { formatDate, formatDayMonth } from '../i18n';
import { useSettings } from '../settings/SettingsProvider';
import { FastingStatsCard } from '../log/FastingStatsCard';
import { computeStats } from '../log/log';
import { useFastingLog } from '../log/useFastingLog';
import { Badge, Button, Card } from '../ui/kit';
import { FadeIn, useGrow } from '../ui/motion';
import { useTabBarSpace } from '../ui/tabBar';
import { SERIF, Theme, space, useTheme, type, useThemedStyles } from '../ui/theme';
import { useToday } from '../ui/useToday';
import { useApkUpdate } from '../updates/useApkUpdate';
import { refreshWidget } from '../widget/refresh';

/** Names listed on the Today card; the rest is on the day screen. */
const SAINTS_SHOWN = 3;

export function Today() {
  const { settings, messages: m } = useSettings();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const tabSpace = useTabBarSpace();
  const styles = useThemedStyles(makeStyles);
  const today = useToday();
  const apk = useApkUpdate();

  const church = CHURCHES[settings.churchId];
  const info = getDayInfo(today, church, { greekFish: settings.greekFish });
  const upcoming = getUpcomingFast(today, church);

  const commemoration = getCommemoration(today, settings.churchId);
  const liturgyReadings = (commemoration?.readings ?? []).filter(
    (r) => r.kind === 'epistle' || r.kind === 'gospel',
  );

  const grow = useGrow(info.period ? (info.period.day / info.period.totalDays) * 100 : 0);

  const fasting = info.level !== 'none';

  // The widget's "complete today" mark, shared through storage; the widget is redrawn after a tap.
  const redrawWidget = useCallback(() => refreshWidget(settings), [settings]);
  const log = useFastingLog(today, redrawWidget);
  const stats = useMemo(
    () =>
      computeStats(
        today,
        log.done,
        (date) => getDayInfo(date, church, { greekFish: settings.greekFish }).level !== 'none',
        info.period,
      ),
    [today, log.done, church, settings.greekFish, info.period?.id],
  );
  const hasMarks = stats.year > 0 || stats.streak > 0;

  const tone = fasting ? theme.accent : theme.free;
  const level = m.level[info.level];
  // Outside a named period, a lone fast day (Wednesday, an eve) is the heading.
  const heading = info.period
    ? m.period[info.period.id]
    : info.fastDay
      ? m.fastDay[info.fastDay]
      : null;
  const churchDateDiffers =
    info.churchDate.day !== today.day || info.churchDate.month !== today.month;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{
        paddingTop: insets.top + space.lg,
        paddingBottom: tabSpace,
        paddingHorizontal: space.lg,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.greeting} accessibilityRole="header">
        {m.today.greeting(settings.name)}
      </Text>
      <Text style={styles.weekday}>{m.weekdays[info.weekday]}</Text>
      <Text style={styles.date}>{formatDate(m, today)}</Text>
      {churchDateDiffers && (
        <Text style={styles.churchDate}>
          {m.today.churchDate(formatDayMonth(m, info.churchDate))}
        </Text>
      )}

      {info.feasts.map((feast) => (
        <FadeIn key={feast} index={0}>
          <Card tone="feast" padding="md" style={styles.gap}>
            <Text style={styles.feastLabel}>{m.today.feast}</Text>
            <Text style={styles.feastName}>{m.feast[feast]}</Text>
          </Card>
        </FadeIn>
      ))}

      <FadeIn index={1}>
        <Card style={styles.card}>
          {heading && (
            <Badge label={heading} tone={fasting ? 'fast' : 'free'} style={styles.headingBadge} />
          )}
          <Text style={[styles.level, { color: tone }]}>{level.title}</Text>
          <Text style={styles.detail}>{level.detail}</Text>

          {info.notes.map((note) => (
            <Text key={note} style={styles.note}>
              {m.note[note]}
            </Text>
          ))}

          {fasting && (
            <View style={styles.foods}>
              {FOOD_IDS.map((food) => {
                const allowed = isFoodAllowed(info.level, food);
                return (
                  <View
                    key={food}
                    style={styles.foodRow}
                    accessible
                    accessibilityLabel={`${m.food[food]}: ${allowed ? m.today.foodAllowed : m.today.foodForbidden}`}
                  >
                    <View
                      style={[
                        styles.mark,
                        allowed
                          ? { backgroundColor: theme.free, borderColor: theme.free }
                          : { borderColor: theme.line },
                      ]}
                    >
                      <Text
                        maxFontSizeMultiplier={1.3}
                        style={[styles.markText, { color: allowed ? theme.surface : theme.muted }]}
                      >
                        {allowed ? '✓' : '✕'}
                      </Text>
                    </View>
                    <Text style={[styles.foodName, !allowed && styles.foodForbidden]}>
                      {m.food[food]}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {info.period && (
            <View style={styles.progress}>
              <View
                style={styles.track}
                accessible
                accessibilityRole="progressbar"
                accessibilityLabel={m.today.dayOf(info.period.day, info.period.totalDays)}
                accessibilityValue={{ min: 0, max: info.period.totalDays, now: info.period.day }}
              >
                <Animated.View style={[styles.fill, { backgroundColor: tone, width: grow }]} />
              </View>
              <View style={styles.progressRow}>
                <Text style={styles.progressText}>
                  {m.today.dayOf(info.period.day, info.period.totalDays)}
                </Text>
                <Text style={styles.progressText}>
                  {info.period.daysLeft === 0
                    ? m.today.lastDay
                    : m.today.daysLeft(info.period.daysLeft)}
                </Text>
              </View>
            </View>
          )}

          {fasting && (
            <View style={styles.logAction}>
              <Button
                label={log.doneToday ? m.widget.completed : m.widget.complete}
                accessibilityLabel={log.doneToday ? m.log.doneA11y : m.log.markA11y}
                variant={log.doneToday ? 'secondary' : 'primary'}
                onPress={() => void log.toggle()}
              />
            </View>
          )}
        </Card>
      </FadeIn>

      {hasMarks && (
        <FadeIn index={2}>
          <FastingStatsCard stats={stats} style={styles.card} />
        </FadeIn>
      )}

      <FadeIn index={2}>
        <Card
          onPress={() => router.navigate('/calendar')}
          style={styles.card}
          accessibilityRole="button"
          accessibilityHint={m.calendar.title}
        >
          <Text style={styles.cardLabel}>{m.today.upcomingTitle}</Text>
          <Text style={styles.upcomingName}>{m.majorFast[upcoming.id]}</Text>
          <Text style={styles.detail}>{m.today.startsIn(upcoming.daysUntil)}</Text>
          <Text style={styles.range}>
            {formatDayMonth(m, upcoming.start)} – {formatDate(m, upcoming.end)}
          </Text>
          {info.daysToPascha > 0 && (
            <Text style={styles.pascha}>{m.today.daysToPascha(info.daysToPascha)}</Text>
          )}
        </Card>
      </FadeIn>

      {commemoration && (
        <FadeIn index={3}>
          <Card
            onPress={() => router.navigate('/readings')}
            style={styles.card}
            accessibilityRole="button"
          >
            <Text style={styles.cardLabel}>{m.readings.saints}</Text>
            {commemoration.names.slice(0, SAINTS_SHOWN).map((name) => (
              <Text key={name} style={styles.saintName}>
                {name}
              </Text>
            ))}
            {commemoration.names.length > SAINTS_SHOWN && (
              <Text style={styles.range}>
                {m.readings.more(commemoration.names.length - SAINTS_SHOWN)}
              </Text>
            )}
            {liturgyReadings.length > 0 && (
              <View style={styles.readings}>
                <Text style={styles.cardLabel}>{m.readings.readings}</Text>
                {liturgyReadings.map((reading) => (
                  <View key={reading.kind + reading.source} style={styles.readingRow}>
                    <Text style={styles.readingKind}>
                      {reading.kind === 'epistle' ? m.readings.epistle : m.readings.gospel}
                    </Text>
                    <Text style={styles.readingRef}>
                      {readingReference(reading, settings.language)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            <View style={styles.cardFoot}>
              {settings.language !== 'en' ? (
                <Text style={styles.small}>{m.readings.namesEnglish}</Text>
              ) : (
                <View />
              )}
              <Text
                style={styles.chevron}
                accessibilityElementsHidden
                importantForAccessibility="no"
              >
                ›
              </Text>
            </View>
          </Card>
        </FadeIn>
      )}

      {!commemoration && <Text style={styles.note}>{m.readings.noData}</Text>}

      <Text style={styles.disclaimer}>{m.today.disclaimer}</Text>

      {apk.release && (
        <Pressable
          onPress={() => router.navigate('/settings')}
          style={styles.link}
          accessibilityRole="button"
          accessibilityLabel={m.today.newVersion}
        >
          <Text style={styles.linkText}>{m.today.newVersion}</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.background },
    greeting: { ...type.body, color: t.muted },
    weekday: { fontFamily: SERIF, ...type.hero, color: t.ink, marginTop: space.sm },
    date: { ...type.bodyLarge, color: t.ink, marginTop: space.xs },
    churchDate: { ...type.label, color: t.muted, marginTop: space.xs },

    gap: { marginTop: space.lg },
    feastLabel: { ...type.caption, color: t.feast },
    feastName: { fontFamily: SERIF, ...type.title3, color: t.ink, marginTop: space.xs },

    card: { marginTop: space.md },
    headingBadge: { marginBottom: space.sm },
    cardLabel: { ...type.label, color: t.muted, marginBottom: space.xs },
    level: { fontFamily: SERIF, ...type.title2 },
    detail: { ...type.body, color: t.ink, marginTop: space.xs },
    note: { ...type.label, color: t.muted, marginTop: space.sm },

    foods: {
      marginTop: space.md,
      paddingTop: space.md,
      borderTopWidth: 1,
      borderTopColor: t.line,
      gap: space.smd,
    },
    foodRow: { flexDirection: 'row', alignItems: 'center', gap: space.smd },
    mark: {
      width: 24,
      height: 24,
      flexShrink: 0,
      borderRadius: 12,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    markText: { fontSize: 12, lineHeight: 15, fontWeight: '700' },
    foodName: { flex: 1, ...type.body, color: t.ink },
    foodForbidden: { color: t.muted },

    logAction: {
      marginTop: space.md,
      paddingTop: space.md,
      borderTopWidth: 1,
      borderTopColor: t.line,
    },

    progress: { marginTop: space.lg },
    track: { height: 4, borderRadius: 2, backgroundColor: t.line, overflow: 'hidden' },
    fill: { height: 4, borderRadius: 2 },
    progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: space.sm },
    progressText: { ...type.label, color: t.muted, fontVariant: ['tabular-nums'] },

    upcomingName: { fontFamily: SERIF, ...type.title3, color: t.ink },
    range: { ...type.label, color: t.muted, marginTop: space.xs },
    pascha: {
      ...type.label,
      color: t.muted,
      marginTop: space.md,
      paddingTop: space.md,
      borderTopWidth: 1,
      borderTopColor: t.line,
    },

    saintName: { fontFamily: SERIF, ...type.headline, color: t.ink, marginTop: space.xs },
    readings: {
      marginTop: space.md,
      paddingTop: space.md,
      borderTopWidth: 1,
      borderTopColor: t.line,
    },
    readingRow: { flexDirection: 'row', gap: space.smd, marginTop: space.xs },
    readingKind: { minWidth: 76, flexShrink: 0, ...type.label, color: t.muted },
    readingRef: { flex: 1, ...type.body, color: t.ink },
    cardFoot: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: space.sm,
    },

    chevron: { ...type.title3, color: t.muted },

    disclaimer: { ...type.caption, color: t.muted, marginTop: space.lg },
    link: { minHeight: 44, justifyContent: 'center' },
    linkText: { ...type.body, color: t.accent },
    small: { ...type.caption, color: t.muted, marginTop: space.xs },
  });
}
