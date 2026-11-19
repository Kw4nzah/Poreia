// One day of the calendar: fasting rule with what is allowed and avoided, feast and period, saints
// and readings. Readings open on the reading page; no verse text is drawn here.

import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CHURCHES,
  CivilDate,
  FOOD_IDS,
  formatIsoDate,
  getDayInfo,
  gregorianToJdn,
  isFoodAllowed,
  shiftDay,
} from '../calendar';
import { Reading, getCommemoration, groupReadings, readingReference } from '../commemorations';
import { parseService } from '../commemorations/service';
import { readingHasText } from '../commemorations/text';
import { formatDate, formatDayMonth } from '../i18n';
import { useDayMark } from '../log/useDayMark';
import { useSettings } from '../settings/SettingsProvider';
import { Badge, Button, Card, ListRow, SectionHeader } from '../ui/kit';
import { SERIF, Theme, space, type, useTheme, useThemedStyles } from '../ui/theme';
import { useToday } from '../ui/useToday';

export function DayDetail({ date }: { date: CivilDate | null }) {
  const { settings, messages: m } = useSettings();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useThemedStyles(makeStyles);
  const today = useToday();
  const mark = useDayMark(date, today);

  function goBack() {
    if (router.canGoBack()) router.back();
    else router.replace('/calendar');
  }

  const header = (previous: CivilDate | null, next: CivilDate | null) => (
    <View style={[styles.header, { paddingTop: insets.top + space.lg }]}>
      <Pressable
        onPress={goBack}
        style={styles.back}
        accessibilityRole="button"
        accessibilityLabel={m.calendar.title}
      >
        <Text style={styles.backText}>‹ {m.calendar.title}</Text>
      </Pressable>
      {date && (
        <View style={styles.steps}>
          <Pressable
            onPress={() => previous && router.setParams({ date: formatIsoDate(previous) })}
            disabled={!previous}
            style={styles.step}
            accessibilityRole="button"
            accessibilityLabel={m.day.previous}
            accessibilityState={{ disabled: !previous }}
          >
            <Text style={[styles.stepText, !previous && styles.stepDisabled]}>‹</Text>
          </Pressable>
          <Pressable
            onPress={() => next && router.setParams({ date: formatIsoDate(next) })}
            disabled={!next}
            style={styles.step}
            accessibilityRole="button"
            accessibilityLabel={m.day.next}
            accessibilityState={{ disabled: !next }}
          >
            <Text style={[styles.stepText, !next && styles.stepDisabled]}>›</Text>
          </Pressable>
        </View>
      )}
    </View>
  );

  if (!date) {
    return (
      <View style={styles.screen}>
        {header(null, null)}
        <Text style={styles.empty} accessibilityRole="alert">
          {m.day.invalid}
        </Text>
      </View>
    );
  }

  const church = CHURCHES[settings.churchId];
  const info = getDayInfo(date, church, { greekFish: settings.greekFish });
  const commemoration = getCommemoration(date, settings.churchId);
  const iso = formatIsoDate(date);

  const fasting = info.level !== 'none';
  // A day can be marked once it has begun: today or any day before it, never a day to come.
  const isToday = iso === formatIsoDate(today);
  const canMark =
    fasting &&
    gregorianToJdn(date.year, date.month, date.day) <=
      gregorianToJdn(today.year, today.month, today.day);
  const level = m.level[info.level];
  const heading = info.period
    ? m.period[info.period.id]
    : info.fastDay
      ? m.fastDay[info.fastDay]
      : null;
  const churchDateDiffers =
    info.churchDate.day !== date.day || info.churchDate.month !== date.month;
  const allowed = FOOD_IDS.filter((food) => isFoodAllowed(info.level, food));
  const avoided = FOOD_IDS.filter((food) => !isFoodAllowed(info.level, food));

  function kindLabel(reading: Reading): string {
    if (reading.kind === 'epistle') return m.readings.epistle;
    if (reading.kind === 'gospel') return m.readings.gospel;
    const service = parseService(reading.source);
    return service ? m.readings.service(service) : reading.source;
  }

  const foodRows = (foods: typeof allowed, ok: boolean) =>
    foods.map((food) => (
      <View
        key={food}
        style={styles.foodRow}
        accessible
        accessibilityLabel={`${m.food[food]}: ${ok ? m.today.foodAllowed : m.today.foodForbidden}`}
      >
        <View
          style={[
            styles.mark,
            ok
              ? { backgroundColor: theme.free, borderColor: theme.free }
              : { borderColor: theme.outline },
          ]}
        >
          <Text
            maxFontSizeMultiplier={1.3}
            style={[styles.markText, { color: ok ? theme.surface : theme.muted }]}
          >
            {ok ? '✓' : '✕'}
          </Text>
        </View>
        <Text style={[styles.foodName, !ok && styles.foodForbidden]}>{m.food[food]}</Text>
      </View>
    ));

  const groups = commemoration ? groupReadings(commemoration.readings) : [];

  return (
    <View style={styles.screen}>
      {header(shiftDay(date, -1), shiftDay(date, 1))}

      <ScrollView
        contentContainerStyle={{
          paddingBottom: insets.bottom + space.xl,
          paddingHorizontal: space.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={styles.weekday}
          accessibilityRole="header"
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.6}
          maxFontSizeMultiplier={1.3}
        >
          {m.weekdays[info.weekday]}
        </Text>
        <Text style={styles.date}>{formatDate(m, date)}</Text>
        {churchDateDiffers && (
          <Text style={styles.churchDate}>
            {m.today.churchDate(formatDayMonth(m, info.churchDate))}
          </Text>
        )}

        {info.feasts.map((feast) => (
          <Card key={feast} tone="feast" padding="md" style={styles.gap}>
            <Text style={styles.feastLabel}>{m.today.feast}</Text>
            <Text style={styles.feastName}>{m.feast[feast]}</Text>
            <Button
              label={m.prayers.readFeastPrayers}
              accessibilityLabel={`${m.prayers.readFeastPrayers}: ${m.feast[feast]}`}
              variant="secondary"
              onPress={() => router.push({ pathname: '/prayer/[id]', params: { id: feast } })}
              style={styles.feastPrayers}
            />
          </Card>
        ))}

        <Card style={styles.card}>
          {heading && (
            <Badge label={heading} tone={fasting ? 'fast' : 'free'} style={styles.headingBadge} />
          )}
          <Text style={[styles.level, { color: fasting ? theme.accent : theme.free }]}>
            {level.title}
          </Text>
          <Text style={styles.detail}>{level.detail}</Text>
          {info.notes.map((note) => (
            <Text key={note} style={styles.note}>
              {m.note[note]}
            </Text>
          ))}

          <View style={styles.foods}>
            {allowed.length > 0 && (
              <View style={styles.foodGroup}>
                <Text style={styles.cardLabel}>{m.day.allowed}</Text>
                {foodRows(allowed, true)}
              </View>
            )}
            <View style={styles.foodGroup}>
              <Text style={styles.cardLabel}>{m.day.avoided}</Text>
              {avoided.length > 0 ? (
                foodRows(avoided, false)
              ) : (
                <Text style={styles.foodName}>{m.day.nothingAvoided}</Text>
              )}
            </View>
          </View>

          {canMark && (
            <View style={styles.markAction}>
              <Button
                label={
                  mark.marked
                    ? isToday
                      ? m.log.marked
                      : m.log.markedPast
                    : isToday
                      ? m.log.mark
                      : m.log.markPast
                }
                accessibilityLabel={
                  mark.marked
                    ? isToday
                      ? m.log.doneA11y
                      : m.log.donePastA11y
                    : isToday
                      ? m.log.markA11y
                      : m.log.markPastA11y
                }
                variant={mark.marked ? 'secondary' : 'primary'}
                onPress={() => void mark.toggle()}
              />
            </View>
          )}
        </Card>

        {commemoration ? (
          <>
            <SectionHeader title={m.readings.saints} spacing="xl" />
            <Card padding="none">
              {commemoration.names.map((name, index) => (
                <ListRow key={`${index}-${name}`} serif title={name} divider={index > 0} />
              ))}
            </Card>
            {settings.language !== 'en' && (
              <Text style={styles.small}>{m.readings.namesEnglish}</Text>
            )}

            {groups.map((group) => (
              <View key={group.id}>
                <SectionHeader title={m.readings.group[group.id]} spacing="xl" />
                <Card padding="none">
                  {group.readings.map((reading, index) => {
                    const reference = readingReference(reading, settings.language);
                    return (
                      <ListRow
                        key={reading.source + index}
                        divider={index > 0}
                        overline={kindLabel(reading)}
                        title={reference}
                        accessibilityLabel={`${kindLabel(reading)}: ${reference}`}
                        onPress={
                          readingHasText(reading, settings.language)
                            ? () =>
                                router.push({
                                  pathname: '/reading/[index]',
                                  params: {
                                    index: String(commemoration.readings.indexOf(reading)),
                                    date: iso,
                                  },
                                })
                            : undefined
                        }
                      />
                    );
                  })}
                </Card>
              </View>
            ))}
          </>
        ) : (
          <Text style={styles.noData}>{m.readings.noData}</Text>
        )}

        <Text style={styles.disclaimer}>{m.today.disclaimer}</Text>
      </ScrollView>
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.background },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: space.lg,
    },
    back: { minHeight: 44, justifyContent: 'center' },
    backText: { ...type.body, color: t.accent },
    steps: { flexDirection: 'row' },
    step: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    stepText: { fontSize: 28, lineHeight: 32, color: t.accent },
    stepDisabled: { color: t.line },

    empty: { ...type.body, color: t.muted, margin: space.lg },

    weekday: { fontFamily: SERIF, ...type.hero, color: t.ink, marginTop: space.sm },
    date: { ...type.bodyLarge, color: t.ink, marginTop: space.xs },
    churchDate: { ...type.label, color: t.muted, marginTop: space.xs },

    gap: { marginTop: space.lg },
    feastLabel: { ...type.caption, color: t.feastInk },
    feastName: { fontFamily: SERIF, ...type.title3, color: t.ink, marginTop: space.xs },
    feastPrayers: { marginTop: space.md },

    card: { marginTop: space.md },
    headingBadge: { marginBottom: space.sm },
    cardLabel: { ...type.label, color: t.muted },
    level: { fontFamily: SERIF, ...type.title2 },
    detail: { ...type.body, color: t.ink, marginTop: space.xs },
    note: { ...type.label, color: t.muted, marginTop: space.sm },

    foods: {
      marginTop: space.md,
      paddingTop: space.md,
      borderTopWidth: 1,
      borderTopColor: t.line,
      gap: space.md,
    },
    foodGroup: { gap: space.smd },
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

    markAction: {
      marginTop: space.md,
      paddingTop: space.md,
      borderTopWidth: 1,
      borderTopColor: t.line,
    },

    small: { ...type.caption, color: t.muted, marginTop: space.sm },
    noData: { ...type.body, color: t.muted, marginTop: space.xl },
    disclaimer: { ...type.caption, color: t.muted, marginTop: space.xl },
  });
}
