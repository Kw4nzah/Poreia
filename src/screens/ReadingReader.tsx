// One reading of today (or of the day it is opened from) with its verses, with the same
// adjustable text size as the prayers.

import { Redirect, useRouter } from 'expo-router';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { CivilDate } from '../calendar';
import { getCommemoration, readingReference } from '../commemorations';
import { parseService } from '../commemorations/service';
import { readingText, translationName } from '../commemorations/text';
import { PRAYER_TEXT_SIZES, PrayerTextSize } from '../prayers';
import { useSettings } from '../settings/SettingsProvider';
import { buildShareMessage } from '../share/message';
import { SERIF, Theme, space, type, useThemedStyles } from '../ui/theme';
import { useToday } from '../ui/useToday';
import { ReadingLink } from '../ui/ReadingLink';
import { VerseText } from '../ui/VerseText';

const LARGEST = (PRAYER_TEXT_SIZES.length - 1) as PrayerTextSize;

export function ReadingReader({ index, date }: { index: number; date?: CivilDate }) {
  const { settings, messages: m, update } = useSettings();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useThemedStyles(makeStyles);
  const today = useToday();

  const reading = getCommemoration(date ?? today, settings.churchId)?.readings[index];
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

  /** One Share button for the whole reading (verses run together as one block of text). */
  function shareReading() {
    if (!reading || !text) return;
    const body = text.verses.map((v) => `${v.verse} ${v.text}`).join(' ');
    const source = `${readingReference(reading, settings.language)}, ${translationName(reading, text.language)}`;
    void Share.share({ message: buildShareMessage(body, source) }).catch(() => {});
  }

  function resize(step: -1 | 1) {
    const next = size + step;
    if (next >= 0 && next <= LARGEST) update({ prayerTextSize: next as PrayerTextSize });
  }

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + space.lg }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel={m.readings.title}
        >
          <Text style={styles.backText}>‹ {m.readings.title}</Text>
        </Pressable>
        <View style={styles.sizes}>
          <Pressable
            onPress={() => resize(-1)}
            disabled={size === 0}
            style={styles.sizeButton}
            accessibilityRole="button"
            accessibilityLabel={m.prayers.smaller}
            accessibilityState={{ disabled: size === 0 }}
          >
            <Text style={[styles.sizeText, size === 0 && styles.sizeDisabled]}>A−</Text>
          </Pressable>
          <Pressable
            onPress={() => resize(1)}
            disabled={size === LARGEST}
            style={styles.sizeButton}
            accessibilityRole="button"
            accessibilityLabel={m.prayers.larger}
            accessibilityState={{ disabled: size === LARGEST }}
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
        <Text selectable style={styles.title} accessibilityRole="header">
          {readingReference(reading, settings.language)}
        </Text>
        <View style={styles.rule} />

        <VerseText verses={text.verses} size={textSize} />

        <Text style={styles.source}>{translationName(reading, text.language)}</Text>
        <Pressable
          onPress={shareReading}
          style={styles.shareButton}
          accessibilityRole="button"
          accessibilityLabel={m.prayers.share}
        >
          <Text style={styles.shareText}>{m.prayers.share}</Text>
        </Pressable>
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
    backText: { ...type.body, color: t.accent },
    sizes: { flexDirection: 'row' },
    sizeButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
    sizeText: { fontFamily: SERIF, ...type.headline, color: t.accent },
    sizeDisabled: { color: t.line },

    kind: { ...type.label, color: t.muted },
    title: { fontFamily: SERIF, ...type.title1, color: t.ink, marginTop: space.xs },
    rule: { width: 40, height: 2, borderRadius: 1, backgroundColor: t.feast, marginTop: space.md },
    shareButton: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start', marginTop: space.sm },
    shareText: { ...type.label, color: t.accent },
    source: { ...type.caption, color: t.muted, marginTop: space.xl },
    note: { ...type.caption, color: t.muted, marginTop: space.xs },
  });
}
