// The Readings tab: today's Epistle and Gospel open in full, then the saints of the day and
// the readings of the other services, which open on their own page.

import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Reading, getCommemoration, groupReadings, readingReference } from '../commemorations';
import { parseService } from '../commemorations/service';
import { readingHasText, readingText, translationName } from '../commemorations/text';
import { formatDate } from '../i18n';
import { PRAYER_TEXT_SIZES, PrayerTextSize } from '../prayers';
import { useSettings } from '../settings/SettingsProvider';
import { Button, Card, ListRow, SectionHeader } from '../ui/kit';
import { FadeIn } from '../ui/motion';
import { useScrollTop } from '../ui/scrollTop';
import { useTabBarSpace } from '../ui/tabBar';
import { SERIF, Theme, space, type, useThemedStyles } from '../ui/theme';
import { useToday } from '../ui/useToday';
import { ReadingLink } from '../ui/ReadingLink';
import { VerseText } from '../ui/VerseText';

const LARGEST = (PRAYER_TEXT_SIZES.length - 1) as PrayerTextSize;

export function Readings() {
  const { settings, messages: m, update } = useSettings();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const tabSpace = useTabBarSpace();
  const scrollProps = useScrollTop('readings');
  const styles = useThemedStyles(makeStyles);
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

  function shareDay() {
    if (!day) return;
    const refs = day.readings
      .map((r) => `${kindLabel(r)}: ${readingReference(r, settings.language)}`)
      .join('\n');
    const message = [
      formatDate(m, today),
      `${m.readings.shareSaints}:\n${day.names.join('\n')}`,
      `${m.readings.shareReadings}:\n${refs}`,
    ].join('\n\n');
    Share.share({ message }).catch(() => {});
  }

  const groups = day ? groupReadings(day.readings) : [];
  const liturgy = groups.find((g) => g.id === 'liturgy')?.readings ?? [];
  const others = groups.filter((g) => g.id !== 'liturgy');
  const liturgyTexts = useMemo(
    () => liturgy.map((reading) => readingText(reading, settings.language)),
    // `liturgy` is rebuilt every render; the day and language are what it depends on.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [day, settings.language],
  );

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
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title} accessibilityRole="header">
            {m.tabs.readings}
          </Text>
          <Text style={styles.date}>{formatDate(m, today)}</Text>
        </View>
        <View style={styles.sizes}>
          {day && (
            <Button
              label={m.readings.share}
              onPress={shareDay}
              variant="ghost"
              size="sm"
              fullWidth={false}
            />
          )}
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

      {!day && <Text style={styles.empty}>{m.readings.noData}</Text>}

      {liturgy.map((reading, i) => {
        const text = liturgyTexts[i];
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
          <SectionHeader title={m.readings.saints} spacing="xl" />
          <Card padding="none">
            {day.names.map((name, index) => (
              <ListRow key={`${index}-${name}`} serif title={name} divider={index > 0} />
            ))}
          </Card>
          {settings.language !== 'en' && <Text style={styles.note}>{m.readings.namesEnglish}</Text>}
        </>
      )}

      {day &&
        others.map((group) => (
          <View key={group.id}>
            <SectionHeader title={m.readings.group[group.id]} spacing="xl" />
            <Card padding="none">
              {group.readings.map((reading, index) => {
                const hasText = readingHasText(reading, settings.language);
                return (
                  <ListRow
                    key={reading.source + index}
                    divider={index > 0}
                    overline={kindLabel(reading)}
                    title={readingReference(reading, settings.language)}
                    accessibilityLabel={`${kindLabel(reading)}: ${readingReference(reading, settings.language)}`}
                    onPress={
                      hasText
                        ? () =>
                            router.push({
                              pathname: '/reading/[index]',
                              params: { index: String(day.readings.indexOf(reading)) },
                            })
                        : undefined
                    }
                  />
                );
              })}
            </Card>
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
    title: { fontFamily: SERIF, ...type.title1, color: t.ink },
    date: { ...type.body, color: t.muted, marginTop: space.xs },
    sizes: { flexDirection: 'row', alignItems: 'center', marginRight: -space.sm },
    sizeButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
    sizeText: { fontFamily: SERIF, ...type.headline, color: t.accent },
    sizeDisabled: { color: t.line },
    empty: { ...type.body, color: t.muted, marginTop: space.lg },

    reading: { marginTop: space.lg },
    kind: { ...type.label, color: t.muted },
    reference: { fontFamily: SERIF, ...type.title2, color: t.ink, marginTop: space.xs },
    rule: {
      width: 40,
      height: 2,
      borderRadius: 1,
      backgroundColor: t.feast,
      marginVertical: space.md,
    },
    source: { ...type.caption, color: t.muted, marginTop: space.sm },

    note: { ...type.caption, color: t.muted, marginTop: space.sm },
  });
}
