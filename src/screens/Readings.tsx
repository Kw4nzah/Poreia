// The Readings tab: today's Epistle and Gospel open in full, then the saints of the day and
// the readings of the other services, which open on their own page.

import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Reading, getCommemoration, groupReadings, readingReference } from '../commemorations';
import { parseService } from '../commemorations/service';
import { readingText, translationName } from '../commemorations/text';
import { formatDate } from '../i18n';
import { PRAYER_TEXT_SIZES, PrayerTextSize } from '../prayers';
import { useSettings } from '../settings/SettingsProvider';
import { FadeIn } from '../ui/motion';
import { useTabBarSpace } from '../ui/tabBar';
import { SERIF, Theme, space, useTheme } from '../ui/theme';
import { useToday } from '../ui/useToday';
import { ReadingLink } from '../ui/ReadingLink';
import { VerseText } from '../ui/VerseText';

const LARGEST = (PRAYER_TEXT_SIZES.length - 1) as PrayerTextSize;

export function Readings() {
  const { settings, messages: m, update } = useSettings();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const tabSpace = useTabBarSpace();
  const styles = makeStyles(theme);
  const today = useToday();

  const day = getCommemoration(today, settings.churchId);
  const size = settings.prayerTextSize;

  function resize(step: -1 | 1) {
    const next = size + step;
    if (next >= 0 && next <= LARGEST) update({ prayerTextSize: next as PrayerTextSize });
  }

  function kindLabel(reading: Reading): string {
    if (reading.kind === 'epistle') return m.readings.epistle;
    if (reading.kind === 'gospel') return m.readings.gospel;
    const service = parseService(reading.source);
    return service ? m.readings.service(service) : reading.source;
  }

  const groups = day ? groupReadings(day.readings) : [];
  const liturgy = groups.find((g) => g.id === 'liturgy')?.readings ?? [];
  const others = groups.filter((g) => g.id !== 'liturgy');

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{
        paddingTop: insets.top + space.md,
        paddingBottom: tabSpace,
        paddingHorizontal: space.lg,
      }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{m.tabs.readings}</Text>
          <Text style={styles.date}>{formatDate(m, today)}</Text>
        </View>
        <View style={styles.sizes}>
          <Pressable
            onPress={() => resize(-1)}
            disabled={size === 0}
            style={styles.sizeButton}
            accessibilityRole="button"
            accessibilityLabel={m.prayers.smaller}
          >
            <Text style={[styles.sizeText, size === 0 && styles.sizeDisabled]}>A−</Text>
          </Pressable>
          <Pressable
            onPress={() => resize(1)}
            disabled={size === LARGEST}
            style={styles.sizeButton}
            accessibilityRole="button"
            accessibilityLabel={m.prayers.larger}
          >
            <Text style={[styles.sizeText, size === LARGEST && styles.sizeDisabled]}>A+</Text>
          </Pressable>
        </View>
      </View>

      {!day && <Text style={styles.empty}>{m.readings.noData}</Text>}

      {liturgy.map((reading, i) => {
        const text = readingText(reading, settings.language);
        return (
          <FadeIn key={reading.source + reading.kind} index={i}>
            <View style={styles.reading}>
              <Text style={styles.kind}>{kindLabel(reading)}</Text>
              <Text style={styles.reference}>{readingReference(reading, settings.language)}</Text>
              <View style={styles.rule} />
              {text && (
                <>
                  <VerseText verses={text.verses} size={PRAYER_TEXT_SIZES[size]} />
                  <Text style={styles.source}>{translationName(reading, text.language)}</Text>
                  {text.fallback && <Text style={styles.note}>{m.readings.textEnglish}</Text>}
                </>
              )}
              <ReadingLink reading={reading} />
            </View>
          </FadeIn>
        );
      })}

      {day && (
        <>
          <Text style={styles.label}>{m.readings.saints}</Text>
          <View style={styles.card}>
            {day.names.map((name, index) => (
              <Text key={`${index}-${name}`} style={[styles.name, index > 0 && styles.divider]}>
                {name}
              </Text>
            ))}
          </View>
          {settings.language !== 'en' && <Text style={styles.note}>{m.readings.namesEnglish}</Text>}
        </>
      )}

      {day &&
        others.map((group) => (
          <View key={group.id}>
            <Text style={styles.label}>{m.readings.group[group.id]}</Text>
            <View style={styles.card}>
              {group.readings.map((reading, index) => {
                const hasText = readingText(reading, settings.language) !== null;
                return (
                  <Pressable
                    key={reading.source + index}
                    disabled={!hasText}
                    onPress={() =>
                      router.push({
                        pathname: '/reading/[index]',
                        params: { index: String(day.readings.indexOf(reading)) },
                      })
                    }
                    style={({ pressed }) => [
                      styles.row,
                      index > 0 && styles.divider,
                      pressed && styles.pressed,
                    ]}
                    accessibilityRole={hasText ? 'button' : 'text'}
                  >
                    <View style={styles.rowText}>
                      <Text style={styles.source}>{kindLabel(reading)}</Text>
                      <Text style={styles.rowReference}>
                        {readingReference(reading, settings.language)}
                      </Text>
                    </View>
                    {hasText && <Text style={styles.chevron}>›</Text>}
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
    </ScrollView>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.background },
    header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
    headerText: { flex: 1 },
    title: { fontFamily: SERIF, fontSize: 30, lineHeight: 38, color: t.ink },
    date: { fontSize: 16, color: t.muted, marginTop: 2 },
    sizes: { flexDirection: 'row', marginRight: -space.sm },
    sizeButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
    sizeText: { fontFamily: SERIF, fontSize: 18, color: t.accent },
    sizeDisabled: { color: t.line },
    empty: { fontSize: 16, lineHeight: 23, color: t.muted, marginTop: space.lg },

    reading: { marginTop: space.lg },
    kind: { fontSize: 14, color: t.muted },
    reference: { fontFamily: SERIF, fontSize: 24, lineHeight: 32, color: t.ink, marginTop: 2 },
    rule: {
      width: 40,
      height: 2,
      borderRadius: 1,
      backgroundColor: t.feast,
      marginVertical: space.md,
    },
    source: { fontSize: 13, color: t.muted, marginTop: space.sm },

    label: { fontSize: 14, color: t.muted, marginTop: space.xl, marginBottom: space.sm },
    note: { fontSize: 13, color: t.muted, marginTop: space.sm },
    card: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: t.line,
      backgroundColor: t.surface,
      overflow: 'hidden',
    },
    name: {
      fontFamily: SERIF,
      fontSize: 18,
      lineHeight: 25,
      color: t.ink,
      paddingHorizontal: 20,
      paddingVertical: 14,
    },
    divider: { borderTopWidth: 1, borderTopColor: t.line },
    row: {
      paddingHorizontal: 20,
      paddingVertical: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    rowText: { flex: 1 },
    rowReference: { fontSize: 17, lineHeight: 24, color: t.ink, marginTop: 2 },
    pressed: { backgroundColor: t.background },
    chevron: { fontSize: 22, lineHeight: 25, color: t.muted },
  });
}
