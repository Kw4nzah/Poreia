// Monthly calendar: a Monday-first grid marked by fasting level and feasts.
// Tapping a day opens its day screen.

import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CHURCHES,
  CivilDate,
  FastLevel,
  MONDAY_FIRST,
  buildMonthGrid,
  formatIsoDate,
  getDayInfo,
  shiftMonth,
} from '../calendar';
import { formatDate } from '../i18n';
import { useSettings } from '../settings/SettingsProvider';
import { SERIF, Theme, radius, space, useTheme, useThemedStyles } from '../ui/theme';
import { useToday } from '../ui/useToday';

/** Width of the level mark under the day number, from light to strict. */
const MARK_WIDTH: Record<FastLevel, number> = {
  none: 6,
  noMeat: 10,
  fish: 14,
  oil: 18,
  noOil: 22,
  xerophagy: 26,
};

const sameDay = (a: CivilDate, b: CivilDate) =>
  a.year === b.year && a.month === b.month && a.day === b.day;

export function MonthCalendar() {
  const { settings, messages: m } = useSettings();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const today = useToday();
  const styles = useThemedStyles(makeStyles);

  const [shown, setShown] = useState({ year: today.year, month: today.month });

  const church = CHURCHES[settings.churchId];
  const weeks = useMemo(() => buildMonthGrid(shown.year, shown.month), [shown]);
  const infoOf = (date: CivilDate) => getDayInfo(date, church, { greekFish: settings.greekFish });

  function go(delta: -1 | 1) {
    const next = shiftMonth(shown.year, shown.month, delta);
    setShown(next);
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + space.lg }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel={m.calendar.back}
        >
          <Text style={styles.backText}>‹ {m.calendar.back}</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + space.xl,
          paddingHorizontal: space.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.monthRow}>
          <Pressable
            onPress={() => go(-1)}
            style={styles.arrow}
            accessibilityRole="button"
            accessibilityLabel={m.calendar.previousMonth}
          >
            <Text style={styles.arrowText}>‹</Text>
          </Pressable>
          <Text style={styles.month} accessibilityRole="header" maxFontSizeMultiplier={1.4}>
            {m.months[shown.month - 1]} {shown.year}
          </Text>
          <Pressable
            onPress={() => go(1)}
            style={styles.arrow}
            accessibilityRole="button"
            accessibilityLabel={m.calendar.nextMonth}
          >
            <Text style={styles.arrowText}>›</Text>
          </Pressable>
        </View>

        <View style={styles.week}>
          {MONDAY_FIRST.map((weekday) => (
            <Text
              key={weekday}
              style={styles.weekday}
              numberOfLines={1}
              maxFontSizeMultiplier={1.2}
              accessibilityLabel={m.weekdays[weekday]}
            >
              {m.calendar.weekdaysShort[weekday]}
            </Text>
          ))}
        </View>

        {weeks.map((week, row) => (
          <View key={row} style={styles.week}>
            {week.map((date, col) => {
              if (!date) return <View key={col} style={styles.cell} />;
              const day = infoOf(date);
              const isToday = sameDay(date, today);
              const fasting = day.level !== 'none';
              const label = [
                formatDate(m, date),
                m.weekdays[day.weekday],
                isToday ? m.calendar.today : null,
                ...day.feasts.map((feast) => m.feast[feast]),
                m.level[day.level].title,
              ]
                .filter(Boolean)
                .join(', ');
              return (
                <Pressable
                  key={col}
                  onPress={() =>
                    router.push({ pathname: '/day/[date]', params: { date: formatIsoDate(date) } })
                  }
                  style={styles.cell}
                  accessibilityRole="button"
                  accessibilityLabel={label}
                  accessibilityHint={m.calendar.openDay}
                >
                  <View style={[styles.day, isToday && styles.dayToday]}>
                    <Text style={styles.dayNumber} maxFontSizeMultiplier={1.3}>
                      {date.day}
                    </Text>
                    <View
                      style={[
                        styles.mark,
                        {
                          width: MARK_WIDTH[day.level],
                          backgroundColor: fasting ? theme.accent : theme.free,
                        },
                      ]}
                    />
                    {day.feasts.length > 0 && <View style={styles.feastDot} />}
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.background },
    header: { paddingHorizontal: space.lg },
    back: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
    backText: { fontSize: 16, color: t.accent },

    monthRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: space.sm,
      marginBottom: space.md,
    },
    month: {
      flex: 1,
      textAlign: 'center',
      fontFamily: SERIF,
      fontSize: 24,
      lineHeight: 32,
      color: t.ink,
    },
    arrow: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    arrowText: { fontSize: 28, lineHeight: 32, color: t.accent },

    week: { flexDirection: 'row' },
    weekday: {
      flex: 1,
      textAlign: 'center',
      fontSize: 13,
      color: t.muted,
      paddingBottom: space.xs,
    },
    cell: { flex: 1, minHeight: 52, alignItems: 'center', justifyContent: 'center' },
    day: {
      width: 44,
      height: 48,
      maxWidth: '100%',
      borderRadius: radius.field,
      borderWidth: 2,
      borderColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3,
    },
    dayToday: { borderColor: t.accent },
    dayNumber: { fontSize: 16, lineHeight: 20, color: t.ink, fontVariant: ['tabular-nums'] },
    mark: { height: 4, borderRadius: 2 },
    feastDot: {
      position: 'absolute',
      top: 4,
      right: 5,
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: t.feast,
    },
  });
}
