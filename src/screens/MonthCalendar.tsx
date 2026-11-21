// Monthly calendar: a Monday-first grid marked by fasting level and feasts.
// Tapping a day opens its day screen. A dot marks the days the user marked "I am fasting", and
// the "Mark days" mode marks or clears many past days at once.

import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { AccessibilityInfo, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CHURCHES,
  CivilDate,
  FastLevel,
  MAX_ISO_YEAR,
  MIN_ISO_YEAR,
  MONDAY_FIRST,
  buildMonthGrid,
  formatIsoDate,
  getDayInfo,
  jdnToGregorian,
  shiftMonth,
} from '../calendar';
import { formatDate } from '../i18n';
import { bulkActions, isMarkableDay, jdnOf, toggleSelected } from '../log/bulk';
import { useFastingLog } from '../log/useFastingLog';
import { useSettings } from '../settings/SettingsProvider';
import { Button } from '../ui/kit';
import { SERIF, Theme, radius, space, type, useTheme, useThemedStyles } from '../ui/theme';
import { useToday } from '../ui/useToday';
import { refreshWidget } from '../widget/refresh';
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

/** Nothing to do when a mark changed outside the Today screen; the calendar reads the marks itself. */
const noop = () => {};

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
  const { done, markMany } = useFastingLog(today, noop);
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<ReadonlySet<number>>(() => new Set());
  const [saving, setSaving] = useState(false);
  const [barHeight, setBarHeight] = useState(0);

  const church = CHURCHES[settings.churchId];
  const weeks = useMemo(() => buildMonthGrid(shown.year, shown.month), [shown]);
  const infoOf = (date: CivilDate) => getDayInfo(date, church, { greekFish: settings.greekFish });

  function endSelecting() {
    setSelecting(false);
    setSelected(new Set());
  }

  const actions = bulkActions(selected, done);
  const todayJdn = jdnOf(today);

  async function apply(marked: boolean) {
    if (saving || selected.size === 0) return;
    setSaving(true);
    try {
      const ok = await markMany([...selected].map(jdnToGregorian), marked);
      if (ok) {
        if (selected.has(todayJdn)) refreshWidget(settings);
        AccessibilityInfo.announceForAccessibility(
          marked ? m.calendar.marksSaved : m.calendar.marksCleared,
        );
        endSelecting();
      } else {
        AccessibilityInfo.announceForAccessibility(m.calendar.marksFailed);
      }
    } finally {
      setSaving(false);
    }
  }

  function go(delta: -1 | 1) {
    const next = shiftMonth(shown.year, shown.month, delta);
    // Days outside these years have no day screen (see parseIsoDate), so the grid stops there.
    if (next.year < MIN_ISO_YEAR || next.year > MAX_ISO_YEAR) return;
    setShown(next);
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + space.lg }]}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/today'))}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel={m.calendar.back}
        >
          <BackLabel label={m.calendar.back} />
        </Pressable>
        <Pressable
          onPress={() => (selecting ? endSelecting() : setSelecting(true))}
          style={styles.modeButton}
          accessibilityRole="button"
          accessibilityLabel={selecting ? m.calendar.markDaysDone : m.calendar.markDays}
          accessibilityState={{ selected: selecting }}
        >
          <Text style={styles.modeText}>
            {selecting ? m.calendar.markDaysDone : m.calendar.markDays}
          </Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: (selecting ? barHeight : insets.bottom) + space.xl,
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

        {selecting && (
          <Text style={styles.help} maxFontSizeMultiplier={1.4}>
            {m.calendar.markDaysHelp}
          </Text>
        )}

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
              const jdn = jdnOf(date);
              const marked = done.has(jdn);
              const markable = isMarkableDay(date, today, day.level);
              const picked = selecting && selected.has(jdn);
              const label = [
                formatDate(m, date),
                m.weekdays[day.weekday],
                isToday ? m.calendar.today : null,
                ...day.feasts.map((feast) => m.feast[feast]),
                m.level[day.level].title,
                marked ? m.calendar.markedFasting : null,
                picked ? m.calendar.daySelected : null,
              ]
                .filter(Boolean)
                .join(', ');
              return (
                <Pressable
                  key={col}
                  onPress={() =>
                    selecting
                      ? setSelected((current) => toggleSelected(current, jdn))
                      : router.push({
                          pathname: '/day/[date]',
                          params: { date: formatIsoDate(date) },
                        })
                  }
                  disabled={selecting && !markable}
                  style={styles.cell}
                  accessibilityRole={selecting ? 'checkbox' : 'button'}
                  accessibilityLabel={label}
                  accessibilityHint={selecting ? m.calendar.selectHint : m.calendar.openDay}
                  accessibilityState={
                    selecting ? { checked: picked, disabled: !markable } : undefined
                  }
                >
                  <View
                    style={[
                      styles.day,
                      isToday && styles.dayToday,
                      picked && styles.daySelected,
                      selecting && !markable && styles.dayDimmed,
                    ]}
                  >
                    <Text
                      style={[styles.dayNumber, picked && { color: theme.onAccent }]}
                      maxFontSizeMultiplier={1.3}
                    >
                      {date.day}
                    </Text>
                    <View
                      style={[
                        styles.mark,
                        {
                          width: MARK_WIDTH[day.level],
                          backgroundColor: picked
                            ? theme.onAccent
                            : fasting
                              ? theme.accent
                              : theme.free,
                        },
                      ]}
                    />
                    {marked && (
                      <View
                        style={[
                          styles.fastingDot,
                          { backgroundColor: picked ? theme.onAccent : theme.accent },
                        ]}
                      />
                    )}
                    {day.feasts.length > 0 && <View style={styles.feastDot} />}
                  </View>
                </Pressable>
              );
            })}
          </View>
        ))}
      </ScrollView>

      {selecting && (
        <View
          style={[styles.bar, { paddingBottom: insets.bottom + space.md }]}
          onLayout={(event) => setBarHeight(event.nativeEvent.layout.height)}
        >
          <View style={styles.barTop}>
            <Text style={styles.count} accessibilityLiveRegion="polite" maxFontSizeMultiplier={1.4}>
              {m.calendar.selectedCount(selected.size)}
            </Text>
            <Button
              label={m.calendar.cancel}
              variant="ghost"
              size="sm"
              fullWidth={false}
              onPress={endSelecting}
            />
          </View>
          <View style={styles.barActions}>
            <Button
              label={m.calendar.markAsFasting}
              style={styles.barButton}
              disabled={saving || !actions.canMark}
              onPress={() => void apply(true)}
            />
            <Button
              label={m.calendar.clearMarks}
              variant="secondary"
              style={styles.barButton}
              disabled={saving || !actions.canClear}
              onPress={() => void apply(false)}
            />
          </View>
        </View>
      )}
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.background },
    header: {
      paddingHorizontal: space.lg,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    back: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
    modeButton: { minHeight: 44, minWidth: 44, justifyContent: 'center', alignItems: 'flex-end' },
    modeText: { fontSize: 16, fontWeight: '600', color: t.accent },
    help: { ...type.caption, color: t.muted, textAlign: 'center', marginBottom: space.md },

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
    dayToday: { borderColor: t.accent },
    daySelected: { backgroundColor: t.accent, borderColor: t.accent },
    dayDimmed: { opacity: 0.35 },
    dayNumber: { fontSize: 16, lineHeight: 20, color: t.ink, fontVariant: ['tabular-nums'] },
    mark: { height: 4, borderRadius: 2 },
    fastingDot: {
      position: 'absolute',
      top: 5,
      left: 6,
      width: 7,
      height: 7,
      borderRadius: 4,
    },
    feastDot: {
      position: 'absolute',
      top: 4,
      right: 5,
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: t.feast,
    },

    bar: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      paddingHorizontal: space.lg,
      paddingTop: space.smd,
      gap: space.sm,
      backgroundColor: t.surface,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: t.line,
    },
    barTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    count: { ...type.label, flex: 1, color: t.ink },
    barActions: { flexDirection: 'row', gap: space.sm },
    barButton: { flex: 1 },
  });
}
