// One reading of today with its verses, with the same adjustable text size as the prayers.

import { Redirect, useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCommemoration, readingReference } from '../commemorations';
import { parseService } from '../commemorations/service';
import { readingText, translationName } from '../commemorations/text';
import { PRAYER_TEXT_SIZES, PrayerTextSize } from '../prayers';
import { useSettings } from '../settings/SettingsProvider';
import { SERIF, Theme, space, useTheme } from '../ui/theme';
import { useToday } from '../ui/useToday';
import { ReadingLink } from '../ui/ReadingLink';
import { VerseText } from '../ui/VerseText';

const LARGEST = (PRAYER_TEXT_SIZES.length - 1) as PrayerTextSize;

export function ReadingReader({ index }: { index: number }) {
  const { settings, messages: m, update } = useSettings();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = makeStyles(theme);
  const today = useToday();

  const reading = getCommemoration(today, settings.churchId)?.readings[index];
  const text = reading ? readingText(reading, settings.language) : null;
  if (!reading || !text) return <Redirect href="/readings" />;

  const size = settings.prayerTextSize;
  const textSize = PRAYER_TEXT_SIZES[size];
  const label =
    reading.kind === 'epistle'
      ? m.readings.epistle
      : reading.kind === 'gospel'
        ? m.readings.gospel
        : (() => {
            const service = parseService(reading.source);
            return service ? m.readings.service(service) : reading.source;
          })();

  function resize(step: -1 | 1) {
    const next = size + step;
    if (next >= 0 && next <= LARGEST) update({ prayerTextSize: next as PrayerTextSize });
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + space.sm }]}>
        <Pressable onPress={() => router.back()} style={styles.back} accessibilityRole="button">
          <Text style={styles.backText}>‹ {m.readings.title}</Text>
        </Pressable>
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

      <ScrollView
        contentContainerStyle={{
          paddingTop: space.sm,
          paddingBottom: insets.bottom + space.xl,
          paddingHorizontal: space.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.kind}>{label}</Text>
        <Text style={styles.title}>{readingReference(reading, settings.language)}</Text>
        <View style={styles.rule} />

        <VerseText verses={text.verses} size={textSize} />

        <Text style={styles.source}>{translationName(reading, text.language)}</Text>
        {text.fallback && <Text style={styles.note}>{m.readings.textEnglish}</Text>}
        <ReadingLink reading={reading} />
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
    back: { minHeight: 44, justifyContent: 'center', flexShrink: 1 },
    backText: { fontSize: 16, color: t.accent },
    sizes: { flexDirection: 'row' },
    sizeButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
    sizeText: { fontFamily: SERIF, fontSize: 18, color: t.accent },
    sizeDisabled: { color: t.line },

    kind: { fontSize: 14, color: t.muted },
    title: { fontFamily: SERIF, fontSize: 28, lineHeight: 36, color: t.ink, marginTop: 2 },
    rule: { width: 40, height: 2, borderRadius: 1, backgroundColor: t.feast, marginTop: space.md },
    source: { fontSize: 13, color: t.muted, marginTop: space.xl },
    note: { fontSize: 13, color: t.muted, marginTop: 4 },
  });
}
