// The daily view: today's date, feast, fasting rule and the next fast.

import { useRouter } from 'expo-router';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CHURCHES, FOOD_IDS, getDayInfo, getUpcomingFast, isFoodAllowed } from '../calendar';
import { getCommemoration, readingReference } from '../commemorations';
import { formatDate, formatDayMonth } from '../i18n';
import { useSettings } from '../settings/SettingsProvider';
import { FadeIn, PressCard, useGrow } from '../ui/motion';
import { useTabBarSpace } from '../ui/tabBar';
import { SERIF, Theme, radius, space, useTheme } from '../ui/theme';
import { useToday } from '../ui/useToday';
import { useApkUpdate } from '../updates/useApkUpdate';

/** Names listed on the Today card; the rest is on the day screen. */
const SAINTS_SHOWN = 3;

export function Today() {
  const { settings, messages: m } = useSettings();
  const router = useRouter();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const tabSpace = useTabBarSpace();
  const styles = makeStyles(theme);
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
      <Text style={styles.greeting}>{m.today.greeting(settings.name)}</Text>
      <Text style={styles.weekday}>{m.weekdays[info.weekday]}</Text>
      <Text style={styles.date}>{formatDate(m, today)}</Text>
      {churchDateDiffers && (
        <Text style={styles.churchDate}>
          {m.today.churchDate(formatDayMonth(m, info.churchDate))}
        </Text>
      )}

      {info.feasts.map((feast) => (
        <FadeIn key={feast} index={0}>
          <View style={styles.feast}>
            <Text style={styles.feastLabel}>{m.today.feast}</Text>
            <Text style={styles.feastName}>{m.feast[feast]}</Text>
          </View>
        </FadeIn>
      ))}

      <FadeIn index={1}>
        <View style={styles.card}>
          {heading && <Text style={styles.cardLabel}>{heading}</Text>}
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
                  <View key={food} style={styles.foodRow}>
                    <View
                      style={[
                        styles.mark,
                        allowed
                          ? { backgroundColor: theme.free, borderColor: theme.free }
                          : { borderColor: theme.line },
                      ]}
                    >
                      <Text
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
              <View style={styles.track}>
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
        </View>
      </FadeIn>

      <FadeIn index={2}>
        <View style={styles.card}>
          <Text style={styles.cardLabel}>{m.today.upcomingTitle}</Text>
          <Text style={styles.upcomingName}>{m.majorFast[upcoming.id]}</Text>
          <Text style={styles.detail}>{m.today.startsIn(upcoming.daysUntil)}</Text>
          <Text style={styles.range}>
            {formatDayMonth(m, upcoming.start)} – {formatDate(m, upcoming.end)}
          </Text>
          {info.daysToPascha > 0 && (
            <Text style={styles.pascha}>{m.today.daysToPascha(info.daysToPascha)}</Text>
          )}
        </View>
      </FadeIn>

      {commemoration && (
        <FadeIn index={3}>
          <PressCard
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
              <Text style={styles.chevron}>›</Text>
            </View>
          </PressCard>
        </FadeIn>
      )}

      <Text style={styles.disclaimer}>{m.today.disclaimer}</Text>

      {apk.release && (
        <Pressable
          onPress={() => router.navigate('/settings')}
          style={styles.link}
          accessibilityRole="button"
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
    greeting: { fontSize: 15, color: t.muted },
    weekday: { fontFamily: SERIF, fontSize: 34, lineHeight: 42, color: t.ink, marginTop: space.sm },
    date: { fontSize: 17, color: t.ink, marginTop: 2 },
    churchDate: { fontSize: 14, color: t.muted, marginTop: space.xs },

    feast: {
      marginTop: space.lg,
      padding: space.md,
      borderRadius: radius.card,
      backgroundColor: t.feastSurface,
    },
    feastLabel: { fontSize: 13, color: t.feast },
    feastName: { fontFamily: SERIF, fontSize: 20, lineHeight: 27, color: t.ink, marginTop: 2 },

    card: {
      marginTop: space.md,
      padding: 20,
      borderRadius: radius.card,
      borderWidth: 1,
      borderColor: t.line,
      backgroundColor: t.surface,
    },
    cardLabel: { fontSize: 14, color: t.muted, marginBottom: space.xs },
    level: { fontFamily: SERIF, fontSize: 28, lineHeight: 36 },
    detail: { fontSize: 16, lineHeight: 23, color: t.ink, marginTop: space.xs },
    note: { fontSize: 14, lineHeight: 20, color: t.muted, marginTop: space.sm },

    foods: {
      marginTop: space.md,
      paddingTop: space.md,
      borderTopWidth: 1,
      borderTopColor: t.line,
      gap: 12,
    },
    foodRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    mark: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 1.5,
      alignItems: 'center',
      justifyContent: 'center',
    },
    markText: { fontSize: 12, lineHeight: 15, fontWeight: '700' },
    foodName: { flex: 1, fontSize: 16, color: t.ink },
    foodForbidden: { color: t.muted },

    progress: { marginTop: 20 },
    track: { height: 4, borderRadius: 2, backgroundColor: t.line, overflow: 'hidden' },
    fill: { height: 4, borderRadius: 2 },
    progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: space.sm },
    progressText: { fontSize: 14, color: t.muted, fontVariant: ['tabular-nums'] },

    upcomingName: { fontFamily: SERIF, fontSize: 22, lineHeight: 29, color: t.ink },
    range: { fontSize: 14, color: t.muted, marginTop: space.xs },
    pascha: {
      fontSize: 14,
      color: t.muted,
      marginTop: space.md,
      paddingTop: space.md,
      borderTopWidth: 1,
      borderTopColor: t.line,
    },

    saintName: { fontFamily: SERIF, fontSize: 18, lineHeight: 25, color: t.ink, marginTop: 2 },
    readings: {
      marginTop: space.md,
      paddingTop: space.md,
      borderTopWidth: 1,
      borderTopColor: t.line,
    },
    readingRow: { flexDirection: 'row', gap: 12, marginTop: 2 },
    readingKind: { width: 76, fontSize: 15, lineHeight: 22, color: t.muted },
    readingRef: { flex: 1, fontSize: 16, lineHeight: 22, color: t.ink },
    cardFoot: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: space.sm,
    },

    pressed: { backgroundColor: t.background },
    chevron: { fontSize: 22, lineHeight: 25, color: t.muted },

    disclaimer: { fontSize: 13, lineHeight: 19, color: t.muted, marginTop: space.lg },
    link: { minHeight: 44, justifyContent: 'center' },
    linkText: { fontSize: 15, color: t.accent },
    small: { fontSize: 13, color: t.muted, marginTop: space.xs },
  });
}
