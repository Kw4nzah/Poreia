// The Divine Liturgy as a reading page: section jumps, speaker labels, rubrics in italics, one
// language or two stacked per block. Texts are optional data files loaded on demand.

import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AlignedBlock,
  alignBlocks,
  sectionStarts,
  sectionsOf,
  speakerLabelKey,
} from '../liturgy/blocks';
import { slavonicFontFamily } from '../liturgy/font';
import { defaultLiturgyLanguage, getAvailableLanguages, secondLanguage } from '../liturgy/registry';
import { LiturgyBlock, LiturgyId, LiturgyLanguage } from '../liturgy/types';
import { useLiturgyTexts } from '../liturgy/useLiturgyTexts';
import { PRAYER_TEXT_SIZES, PrayerTextSize } from '../prayers';
import { useSettings } from '../settings/SettingsProvider';
import { SegmentedControl } from '../ui/kit';
import { SERIF, Theme, space, type, useThemedStyles } from '../ui/theme';
import { holdScreenAwake } from './keepAwake';

/**
 * The two-language view aligns blocks by id. The Slavonic and English texts come from different
 * books with different ids and order, so every block would read "no text in this language".
 * Turn this on only when two languages share block ids.
 */
const PARALLEL_VIEW_READY = false;

const LARGEST = (PRAYER_TEXT_SIZES.length - 1) as PrayerTextSize;
/** Line length cap so wide screens still read as a narrow column. */
const COLUMN_WIDTH = 600;

function fontFor(language: LiturgyLanguage) {
  return language === 'cu' ? slavonicFontFamily() : SERIF;
}

export function LiturgyReader({ id }: { id: LiturgyId }) {
  const { settings, messages: m, update } = useSettings();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useThemedStyles(makeStyles);
  const listRef = useRef<FlatList<AlignedBlock>>(null);

  const available = useMemo(() => getAvailableLanguages(id), [id]);
  const [chosen, setChosen] = useState<LiturgyLanguage | null>(null);
  const [parallel, setParallel] = useState(false);
  const main = chosen ?? defaultLiturgyLanguage(available, settings.language);
  const second = main && parallel ? secondLanguage(available, main) : null;
  const canParallel =
    PARALLEL_VIEW_READY && main !== null && secondLanguage(available, main) !== null;

  const texts = useLiturgyTexts(
    id,
    [main, second].filter((x): x is LiturgyLanguage => x !== null),
  );
  const mainText = main ? texts[main] : undefined;
  const secondText = second ? texts[second] : undefined;

  // The service stays on screen while it is read.
  useEffect(() => holdScreenAwake(), []);

  const rows = useMemo<AlignedBlock[]>(
    () => (mainText ? alignBlocks(mainText.blocks, secondText?.blocks ?? []) : []),
    [mainText, secondText],
  );
  // In two-language mode blocks only the second text has are shown too, so jumps use `rows`.
  const sections = useMemo(() => sectionsOf(rows), [rows]);
  const starts = useMemo(() => sectionStarts(rows), [rows]);

  const size = settings.prayerTextSize;
  const base = PRAYER_TEXT_SIZES[size];

  function resize(step: -1 | 1) {
    const next = size + step;
    if (next >= 0 && next <= LARGEST) update({ prayerTextSize: next as PrayerTextSize });
  }

  function jump(index: number) {
    listRef.current?.scrollToIndex({ index, animated: false, viewPosition: 0 });
  }

  function renderBlock(
    block: LiturgyBlock | null,
    language: LiturgyLanguage,
    who: AlignedBlock['who'],
    muted: boolean,
  ) {
    if (!block) {
      return (
        <Text style={[styles.missing, { fontSize: base.fontSize - 2 }]}>{m.liturgy.missing}</Text>
      );
    }
    const rubric = who === 'rubric' || who === 'omitted';
    return (
      <Text
        style={[
          styles.text,
          base,
          { fontFamily: fontFor(language) },
          rubric && styles.rubric,
          who === 'omitted' && styles.omitted,
          muted && styles.secondary,
        ]}
      >
        {block.text}
      </Text>
    );
  }

  function renderRow({ item }: { item: AlignedBlock }) {
    const labelKey = speakerLabelKey(item.who);
    const label = labelKey ? m.liturgy.speaker[labelKey] : null;
    return (
      <View style={styles.block}>
        {label && (
          <Text style={styles.speaker} accessibilityRole="text">
            {label}
          </Text>
        )}
        {main && renderBlock(item.a, main, item.who, false)}
        {second && <View style={styles.gap} />}
        {second && renderBlock(item.b, second, item.who, true)}
      </View>
    );
  }

  const loading = main !== null && mainText === undefined;
  const failed = mainText === null;

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + space.lg }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel={m.prayers.title}
        >
          <Text style={styles.backText}>‹ {m.prayers.title}</Text>
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

      <View style={styles.controls}>
        <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={1.4}>
          {m.liturgy.title}
        </Text>
        {available.length > 1 && main && (
          <View style={styles.control}>
            <SegmentedControl
              accessibilityLabel={m.liturgy.languageLabel}
              options={available.map((language) => ({
                value: language,
                label: m.liturgy.language[language],
              }))}
              value={main}
              onChange={setChosen}
            />
          </View>
        )}
        {canParallel && (
          <Pressable
            onPress={() => setParallel((on) => !on)}
            style={styles.toggle}
            accessibilityRole="switch"
            accessibilityLabel={m.liturgy.parallel}
            accessibilityState={{ checked: parallel }}
          >
            <Text style={styles.toggleText}>
              {parallel ? m.liturgy.parallelOff : m.liturgy.parallel}
            </Text>
          </Pressable>
        )}
        {sections.length > 1 && (
          <View
            style={styles.sectionRow}
            accessibilityRole="menu"
            accessibilityLabel={m.liturgy.sectionsLabel}
          >
            {sections.map((section) => (
              <Pressable
                key={section}
                onPress={() => jump(starts[section] ?? 0)}
                style={styles.chip}
                accessibilityRole="button"
                accessibilityLabel={m.liturgy.section[section]}
              >
                <Text style={styles.chipText}>{m.liturgy.section[section]}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {(loading || failed) && (
        <Text style={styles.status} accessibilityLiveRegion="polite">
          {failed ? m.liturgy.loadFailed : m.liturgy.loading}
        </Text>
      )}

      <FlatList
        ref={listRef}
        data={rows}
        keyExtractor={(row) => row.id}
        renderItem={renderRow}
        extraData={[size, parallel, main, second]}
        initialNumToRender={12}
        windowSize={9}
        onScrollToIndexFailed={({ index, averageItemLength }) => {
          listRef.current?.scrollToOffset({ offset: index * averageItemLength, animated: false });
          setTimeout(() => listRef.current?.scrollToIndex({ index, animated: false }), 80);
        }}
        contentContainerStyle={{
          paddingTop: space.sm,
          paddingBottom: insets.bottom + space.xl * 2,
          paddingHorizontal: space.lg,
          width: '100%',
          maxWidth: COLUMN_WIDTH + space.lg * 2,
          alignSelf: 'center',
        }}
        showsVerticalScrollIndicator={false}
      />
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

    controls: { paddingHorizontal: space.lg, paddingBottom: space.sm },
    title: { fontFamily: SERIF, ...type.title1, color: t.ink },
    control: { marginTop: space.md },
    toggle: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
    toggleText: { ...type.label, color: t.accent },
    sectionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.xs },
    chip: {
      minHeight: 44,
      justifyContent: 'center',
      paddingHorizontal: space.md,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: t.outline,
    },
    chipText: { ...type.label, color: t.ink },
    status: { ...type.body, color: t.muted, paddingHorizontal: space.lg, marginTop: space.md },

    block: { marginTop: space.lg },
    speaker: { ...type.caption, color: t.accent, fontWeight: '600', marginBottom: space.xs },
    text: { color: t.ink },
    rubric: { fontStyle: 'italic', color: t.muted },
    omitted: { opacity: 0.7 },
    secondary: { color: t.muted },
    gap: { height: space.sm },
    missing: { fontStyle: 'italic', color: t.muted },
  });
}
