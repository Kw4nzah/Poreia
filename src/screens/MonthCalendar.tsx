// Monthly calendar: a Monday-first grid marked by fasting level and feasts,
// with the rule of the tapped day underneath.

import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CHURCHES,
  CivilDate,
  FastLevel,
  FOOD_IDS,
  MONDAY_FIRST,
  buildMonthGrid,
  getDayInfo,
  isFoodAllowed,
  shiftMonth,
} from '../calendar';
import { formatDate } from '../i18n';
import { useSettings } from '../settings/SettingsProvider';
import { SERIF, Theme, radius, space, useTheme, useThemedStyles } from '../ui/theme';
import { useToday } from '../ui/useToday';
import { BackLabel } from '../ui/BackLabel';
import { Icon } from '../ui/Icon';

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
  const [picked, setPicked] = useState<CivilDate>(today);

  const church = CHURCHES[settings.churchId];
  const weeks = useMemo(() => buildMonthGrid(shown.year, shown.month), [shown]);
  const infoOf = (date: CivilDate) => getDayInfo(date, church, { greekFish: settings.greekFish });

  function go(delta: -1 | 1) {
    const next = shiftMonth(shown.year, shown.month, delta);
    setShown(next);
    // Keep the detail panel on a day of the month being viewed.
    setPicked(
      next.year === today.year && next.month === today.month
        ? today
        : { year: next.year, month: next.month, day: 1 },
    );
  }

  const info = infoOf(picked);
  const heading = info.period
    ? m.period[info.period.id]
    : info.fastDay
      ? m.fastDay[info.fastDay]
      : null;
  const allowed = FOOD_IDS.filter((food) => isFoodAllowed(info.level, food));

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + space.lg }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel={m.calendar.back}
        >
          <BackLabel label={m.calendar.back} />
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
            <Icon name="chevron-left" color={theme.accent} size={20} />
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
            <Icon name="chevron-right" color={theme.accent} size={20} />
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
              const isPicked = sameDay(date, picked);
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
                  onPress={() => setPicked(date)}
                  style={styles.cell}
                  accessibilityRole="button"
                  accessibilityLabel={label}
                  accessibilityState={{ selected: isPicked }}
                >
                  <View
                    style={[styles.day, isPicked && styles.dayPicked, isToday && styles.dayToday]}
                  >
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

        <View style={styles.panel} accessibilityLiveRegion="polite">
          <Text style={styles.panelDate}>
            {m.weekdays[info.weekday]}, {formatDate(m, picked)}
          </Text>
          {info.feasts.map((feast) => (
            <Text key={feast} style={styles.panelFeast}>
              {m.feast[feast]}
            </Text>
          ))}
          {heading && <Text style={styles.panelLabel}>{heading}</Text>}
          <Text
            style={[
              styles.panelLevel,
              { color: info.level === 'none' ? theme.free : theme.accent },
            ]}
          >
            {m.level[info.level].title}
          </Text>
          <Text style={styles.panelDetail}>{m.level[info.level].detail}</Text>
          {allowed.length > 0 && (
            <Text style={styles.panelFoods}>{allowed.map((food) => m.food[food]).join(' · ')}</Text>
          )}
          {info.notes.map((note) => (
            <Text key={note} style={styles.panelNote}>
              {m.note[note]}
            </Text>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.background },
    header: { paddingHorizontal: space.lg },
    back: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },

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
      gap: space.xs,
    },
    dayPicked: { backgroundColor: t.surface, borderColor: t.line },
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

    panel: {
      marginTop: space.lg,
      padding: 20,
      borderRadius: radius.card,
      borderWidth: 1,
      borderColor: t.line,
      backgroundColor: t.surface,
    },
    panelDate: { fontSize: 14, color: t.muted },
    panelFeast: {
      fontFamily: SERIF,
      fontSize: 18,
      lineHeight: 25,
      color: t.feast,
      marginTop: space.xs,
    },
    panelLabel: { fontSize: 14, color: t.muted, marginTop: space.sm },
    panelLevel: { fontFamily: SERIF, fontSize: 24, lineHeight: 32, marginTop: space.xs },
    panelDetail: { fontSize: 16, lineHeight: 23, color: t.ink, marginTop: space.xs },
    panelFoods: { fontSize: 15, lineHeight: 22, color: t.free, marginTop: space.sm },
    panelNote: { fontSize: 14, lineHeight: 20, color: t.muted, marginTop: space.sm },
  });
}
