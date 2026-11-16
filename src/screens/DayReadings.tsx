// The full list for today: every saint and feast name and every reading, grouped by service.

import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCommemoration, groupReadings, readingReference } from '../commemorations';
import { readingVerses } from '../commemorations/text';
import { formatDate } from '../i18n';
import { useSettings } from '../settings/SettingsProvider';
import { SERIF, Theme, space, useTheme } from '../ui/theme';
import { useToday } from '../ui/useToday';

export function DayReadings() {
  const { settings, messages: m } = useSettings();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = makeStyles(theme);
  const today = useToday();

  const day = getCommemoration(today, settings.churchId);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{
        paddingTop: insets.top + space.sm,
        paddingBottom: insets.bottom + space.xl,
        paddingHorizontal: space.lg,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Pressable onPress={() => router.back()} style={styles.back} accessibilityRole="button">
        <Text style={styles.backText}>‹ {m.settings.back}</Text>
      </Pressable>
      <Text style={styles.title}>{m.readings.title}</Text>
      <Text style={styles.date}>{formatDate(m, today)}</Text>

      {!day && <Text style={styles.empty}>{m.readings.noData}</Text>}

      {day && (
        <>
          <Text style={styles.label}>{m.readings.saints}</Text>
          <View style={styles.card}>
            {day.names.map((name, index) => (
              <Text key={name} style={[styles.name, index > 0 && styles.nameDivider]}>
                {name}
              </Text>
            ))}
          </View>
          {settings.language !== 'en' && <Text style={styles.note}>{m.readings.namesEnglish}</Text>}

          {groupReadings(day.readings).map((group) => (
            <View key={group.id}>
              <Text style={styles.label}>{m.readings.group[group.id]}</Text>
              <View style={styles.card}>
                {group.readings.map((reading, index) => {
                  const hasText = readingVerses(reading, settings.language) !== null;
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
                        styles.reading,
                        index > 0 && styles.readingDivider,
                        pressed && styles.pressed,
                      ]}
                      accessibilityRole={hasText ? 'button' : 'text'}
                    >
                      <View style={styles.readingText}>
                        <Text style={styles.source}>
                          {reading.kind === 'epistle'
                            ? m.readings.epistle
                            : reading.kind === 'gospel'
                              ? m.readings.gospel
                              : reading.source}
                        </Text>
                        <Text style={styles.reference}>
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
        </>
      )}
    </ScrollView>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.background },
    back: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
    backText: { fontSize: 16, color: t.accent },
    title: { fontFamily: SERIF, fontSize: 30, lineHeight: 38, color: t.ink, marginTop: space.xs },
    date: { fontSize: 16, color: t.muted, marginTop: 2 },
    empty: { fontSize: 16, lineHeight: 23, color: t.muted, marginTop: space.lg },
    label: { fontSize: 14, color: t.muted, marginTop: space.lg, marginBottom: space.sm },
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
    nameDivider: { borderTopWidth: 1, borderTopColor: t.line },
    reading: {
      paddingHorizontal: 20,
      paddingVertical: 14,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    readingText: { flex: 1 },
    pressed: { backgroundColor: t.background },
    chevron: { fontSize: 22, lineHeight: 25, color: t.muted },
    readingDivider: { borderTopWidth: 1, borderTopColor: t.line },
    source: { fontSize: 14, color: t.muted },
    reference: { fontSize: 17, lineHeight: 24, color: t.ink, marginTop: 2 },
  });
}
