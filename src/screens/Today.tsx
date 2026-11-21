// The daily view: today's date, feast, fasting rule and the next fast.

import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CHURCHES, FOOD_IDS, getDayInfo, getUpcomingFast, isFoodAllowed } from '../calendar';
import { getCommemoration, readingReference } from '../commemorations';
import { formatDate, formatDayMonth } from '../i18n';
import { useSettings } from '../settings/SettingsProvider';
import { useFastingLog } from '../log/useFastingLog';
import { periodKey } from '../report/periods';
import { reportHeading } from '../report/text';
import { usePendingReport } from '../report/usePendingReport';
import { Badge, Button, Card, ListRow } from '../ui/kit';
import { Icon } from '../ui/Icon';
import { FadeIn } from '../ui/motion';
import { summarizeDay } from '../today/summary';
import { useScrollTop } from '../ui/scrollTop';
import { useTabBarSpace } from '../ui/tabBar';
import { SERIF, Theme, radius, space, useTheme, type, useThemedStyles } from '../ui/theme';
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
  const scrollProps = useScrollTop('today');
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

  const fasting = info.level !== 'none';

  // The "I am fasting today" mark, shared through storage; the widget is redrawn after a tap.
  const redrawWidget = useCallback(() => refreshWidget(settings), [settings]);
  const log = useFastingLog(today, redrawWidget);
  const report = usePendingReport(today);

  const tone = fasting ? theme.accent : theme.free;
  const summary = summarizeDay(info, m);
  // Outside a named period, a lone fast day (Wednesday, an eve) is the heading.
  const heading = info.period
    ? m.period[info.period.id]
    : info.fastDay
      ? m.fastDay[info.fastDay]
      : null;
  // The summary card says the rule; this card keeps the period, its notes, progress and the mark.
  const hasDayCard = heading !== null || info.notes.length > 0 || fasting;
  const churchDateDiffers =
    info.churchDate.day !== today.day || info.churchDate.month !== today.month;

  return (
    <ScrollView
      {...scrollProps}
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
      <Text
        style={styles.weekday}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.6}
        maxFontSizeMultiplier={1.3}
      >
        {m.weekdays[info.weekday]}
      </Text>
      <Text style={styles.date}>{formatDate(m, today)}</Text>
      {churchDateDiffers && (
        <Text style={styles.churchDate}>
          {m.today.churchDate(formatDayMonth(m, info.churchDate))}
        </Text>
      )}

      <FadeIn index={0}>
        <Card tone={info.feasts.length > 0 ? 'feast' : 'surface'} style={styles.gap}>
          <Text style={[styles.headline, { color: tone }]}>{summary.headline}</Text>
          {info.feasts.map((feast) => (
            <Button
              key={feast}
              label={m.prayers.readFeastPrayers}
              accessibilityLabel={`${m.prayers.readFeastPrayers}: ${m.feast[feast]}`}
              variant="secondary"
              onPress={() => router.push({ pathname: '/prayer/[id]', params: { id: feast } })}
              style={styles.feastPrayers}
            />
          ))}
        </Card>
      </FadeIn>

      <FadeIn index={1}>
        <Pressable
          onPress={() => router.navigate('/foods')}
          style={styles.search}
          accessibilityRole="search"
          accessibilityLabel={m.foods.title}
          accessibilityHint={m.foods.searchPlaceholder}
        >
          <Text style={styles.searchText} numberOfLines={1}>
            {m.foods.searchPlaceholder}
          </Text>
        </Pressable>
      </FadeIn>

      {hasDayCard && (
        <FadeIn index={1}>
          <Card style={styles.card}>
            {heading && (
              <Badge label={heading} tone={fasting ? 'fast' : 'free'} style={styles.headingBadge} />
            )}

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
                            : { borderColor: theme.outline },
                        ]}
                      >
                        <Icon
                          name={allowed ? 'check' : 'cross'}
                          color={allowed ? theme.surface : theme.muted}
                          size={12}
                        />
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
                  style={styles.road}
                  accessible
                  accessibilityRole="progressbar"
                  accessibilityLabel={m.today.dayOf(info.period.day, info.period.totalDays)}
                  accessibilityValue={{ min: 0, max: info.period.totalDays, now: info.period.day }}
                >
                  {/* The road: one mark per day of the period. Days kept, today, days ahead, and
                      in a fast the last day before the feast in gold. */}
                  {Array.from({ length: info.period.totalDays }, (_, index) => {
                    const day = index + 1;
                    const isToday = day === info.period!.day;
                    const kept = day < info.period!.day;
                    const last = fasting && day === info.period!.totalDays && !isToday;
                    return (
                      <View
                        key={day}
                        style={[
                          styles.roadDay,
                          isToday && styles.roadToday,
                          {
                            backgroundColor:
                              kept || isToday ? tone : last ? theme.feast : theme.line,
                          },
                        ]}
                      />
                    );
                  })}
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
                  label={log.doneToday ? m.log.marked : m.log.mark}
                  accessibilityLabel={log.doneToday ? m.log.doneA11y : m.log.markA11y}
                  variant={log.doneToday ? 'secondary' : 'primary'}
                  onPress={() => void log.toggle()}
                />
              </View>
            )}
          </Card>
        </FadeIn>
      )}

      {report.pending && (
        <FadeIn index={2}>
          <Card padding="none" tone="feast" style={styles.card}>
            <View style={styles.readyRow}>
              <Pressable
                style={styles.readyMain}
                onPress={() => {
                  const key = periodKey(report.pending!.period);
                  report.markSeen();
                  router.push(`/report/${key}`);
                }}
                accessibilityRole="button"
                accessibilityLabel={`${m.report.readyTitle(m.majorFast[report.pending.period.id])}. ${m.report.readyHint}`}
              >
                <Text style={styles.readyTitle}>
                  {m.report.readyTitle(m.majorFast[report.pending.period.id])}
                </Text>
                <Text style={styles.readyHint}>
                  {reportHeading(report.pending, m)} · {m.report.readyHint}
                </Text>
              </Pressable>
              <Pressable
                style={styles.readyDismiss}
                onPress={report.markSeen}
                accessibilityRole="button"
                accessibilityLabel={m.report.dismiss}
              >
                <Icon name="cross" color={theme.muted} size={16} />
              </Pressable>
            </View>
          </Card>
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

      <FadeIn index={3}>
        <Card padding="none" style={styles.card}>
          <ListRow
            title={m.upcoming.open}
            subtitle={m.upcoming.openHint}
            onPress={() => router.navigate('/upcoming')}
          />
        </Card>
      </FadeIn>

      {commemoration && (
        <FadeIn index={4}>
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
              <Icon name="chevron-right" color={theme.muted} />
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
    headline: { fontFamily: SERIF, ...type.title3 },
    feastPrayers: { marginTop: space.md },
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
    foodName: { flex: 1, ...type.body, color: t.ink },
    foodForbidden: { color: t.muted },
    search: {
      minHeight: 48,
      justifyContent: 'center',
      marginTop: space.md,
      paddingHorizontal: space.md,
      borderRadius: radius.field,
      borderWidth: 1,
      borderColor: t.outline,
      backgroundColor: t.surface,
    },
    searchText: { ...type.body, color: t.muted },

    card: { marginTop: space.md },
    headingBadge: { marginBottom: space.sm },
    cardLabel: { ...type.label, color: t.muted, marginBottom: space.xs },
    detail: { ...type.body, color: t.ink, marginTop: space.xs },
    note: { ...type.label, color: t.muted, marginTop: space.sm },

    logAction: {
      marginTop: space.md,
      paddingTop: space.md,
      borderTopWidth: 1,
      borderTopColor: t.line,
    },

    readyRow: { flexDirection: 'row', alignItems: 'center' },
    readyMain: {
      flex: 1,
      minHeight: 56,
      justifyContent: 'center',
      paddingVertical: space.smd,
      paddingLeft: space.md,
    },
    readyTitle: { fontFamily: SERIF, ...type.headline, color: t.ink },
    readyHint: { ...type.label, color: t.muted, marginTop: space.xs },
    readyDismiss: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },

    progress: { marginTop: space.lg },
    road: {
      height: 16,
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
    },
    roadDay: { width: 2, height: 8, borderRadius: 1 },
    roadToday: { height: 16 },
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

    disclaimer: { ...type.caption, color: t.muted, marginTop: space.lg },
    link: { minHeight: 44, justifyContent: 'center' },
    linkText: { ...type.body, color: t.accent },
    small: { ...type.caption, color: t.muted, marginTop: space.xs },
  });
}
