// A service as a reading page: a compact header (back, name, size), language switch, section
// chips (only for texts with several sections), the speaker as a small coloured label above each
// block, rubrics set apart by a rule and colour. The position is remembered per service. Tapping
// the text hides the controls (reading mode). Texts are optional data files loaded on demand.

import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  AlignedBlock,
  alignBlocks,
  sectionStarts,
  sectionsOf,
  speakerLabelKey,
} from '../liturgy/blocks';
import { slavonicFontFamily } from '../liturgy/font';
import {
  LiturgyProgress,
  emptyProgress,
  recordPosition,
  restoreIndex,
} from '../liturgy/progress';
import { readProgress, writeProgress } from '../liturgy/progressStore';
import {
  readingLineHeight,
  sectionAtIndex,
  showBackToTop,
  showSectionChips,
  speakerColor,
} from '../liturgy/reading';
import { defaultLiturgyLanguage, getAvailableLanguages, secondLanguage } from '../liturgy/registry';
import { LiturgyBlock, LiturgyId, LiturgyLanguage } from '../liturgy/types';
import { useLiturgyTexts } from '../liturgy/useLiturgyTexts';
import { PRAYER_TEXT_SIZES, PrayerTextSize } from '../prayers';
import { useSettings } from '../settings/SettingsProvider';
import { SegmentedControl } from '../ui/kit';
import { SERIF, Theme, space, type, useTheme, useThemedStyles } from '../ui/theme';
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
/** How long after a restore the scroll position is not saved, so the jump is not overwritten. */
const RESTORE_GRACE_MS = 1500;
const SAVE_DELAY_MS = 700;
const VIEWABILITY = { itemVisiblePercentThreshold: 10 } as const;

/** The part of FlatList's viewability token used here (the type is not exported by react-native). */
interface ViewToken {
  index?: number | null;
}

function fontFor(language: LiturgyLanguage) {
  return language === 'cu' ? slavonicFontFamily() : SERIF;
}

export function LiturgyReader({ id }: { id: LiturgyId }) {
  const { settings, messages: m, update } = useSettings();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);
  const listRef = useRef<FlatList<AlignedBlock>>(null);

  const available = useMemo(() => getAvailableLanguages(id), [id]);
  const [chosen, setChosen] = useState<LiturgyLanguage | null>(null);
  const [parallel, setParallel] = useState(false);
  const [chrome, setChrome] = useState(true);
  const [firstIndex, setFirstIndex] = useState(0);
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
  const activeSection = sectionAtIndex(starts, firstIndex);

  // ---- Reading position -------------------------------------------------------------------
  const progressRef = useRef<LiturgyProgress | null>(null);
  const [progressLoaded, setProgressLoaded] = useState(false);
  const restoredRef = useRef(false);
  const graceUntil = useRef(0);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestIndex = useRef(0);

  useEffect(() => {
    let live = true;
    readProgress().then((p) => {
      if (!live) return;
      progressRef.current = p;
      setProgressLoaded(true);
    });
    return () => {
      live = false;
    };
  }, []);

  const flush = useCallback(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = null;
    if (!restoredRef.current) return;
    progressRef.current = recordPosition(progressRef.current ?? emptyProgress(), id, latestIndex.current);
    void writeProgress(progressRef.current);
  }, [id]);

  // Save once more when leaving the screen.
  useEffect(() => flush, [flush]);

  // Restore the position once, when the first text has loaded. A language switch starts at the top.
  useEffect(() => {
    if (restoredRef.current || !progressLoaded || rows.length === 0) return;
    restoredRef.current = true;
    const index = restoreIndex(progressRef.current ?? emptyProgress(), id, rows.length);
    latestIndex.current = index;
    graceUntil.current = Date.now() + RESTORE_GRACE_MS;
    if (index > 0) {
      setTimeout(() => listRef.current?.scrollToIndex({ index, animated: false, viewPosition: 0 }), 60);
    }
    flush(); // marks this service as the last one opened
  }, [progressLoaded, rows.length, id, flush]);

  // FlatList wants a stable viewability callback, so it goes through a ref kept up to date.
  const flushRef = useRef(flush);
  flushRef.current = flush;
  const onViewableItemsChanged = useRef((_info: { viewableItems: ViewToken[] }) => {});
  onViewableItemsChanged.current = ({ viewableItems }) => {
    const first = viewableItems.find((v) => v.index !== null)?.index;
    if (first === undefined || first === null) return;
    setFirstIndex(first);
    if (!restoredRef.current || Date.now() < graceUntil.current) return;
    latestIndex.current = first;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => flushRef.current(), SAVE_DELAY_MS);
  };
  const stableViewable = useCallback(
    (info: { viewableItems: ViewToken[] }) => onViewableItemsChanged.current(info),
    [],
  );

  // ---- Controls ---------------------------------------------------------------------------
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
    const slavonic = language === 'cu';
    return (
      <Text
        style={[
          styles.text,
          {
            fontSize: base.fontSize,
            lineHeight: readingLineHeight(base.fontSize, slavonic),
            fontFamily: fontFor(language),
          },
          // The Slavonic font has no italic face; on Android an italic request falls back to the
          // system font, which lacks the Slavonic letters and shows boxes. Rubrics are set apart
          // by the rule beside them and by colour, and italic only outside Slavonic.
          rubric && styles.rubricText,
          rubric && !slavonic && styles.italic,
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
    const color = speakerColor(item.who, theme.dark);
    const rubric = item.who === 'rubric' || item.who === 'omitted';
    return (
      // The whole block toggles reading mode; it is not a separate control for screen readers,
      // whose users keep the controls visible anyway.
      <Pressable
        onPress={() => setChrome((on) => !on)}
        accessible={false}
        style={[styles.block, rubric && styles.rubricBlock]}
      >
        {label && (
          <Text style={[styles.speaker, color ? { color } : styles.speakerPlain]}>{label}</Text>
        )}
        {main && renderBlock(item.a, main, item.who, false)}
        {second && <View style={styles.gap} />}
        {second && renderBlock(item.b, second, item.who, true)}
      </Pressable>
    );
  }

  const loading = main !== null && mainText === undefined;
  const failed = mainText === null;
  const topPad = chrome ? 0 : insets.top + space.md;

  return (
    <View style={styles.screen}>
      {chrome && (
        <View style={[styles.header, { paddingTop: insets.top + space.xs }]}>
          <View style={styles.bar}>
            <Pressable
              onPress={() => router.back()}
              style={styles.back}
              accessibilityRole="button"
              accessibilityLabel={m.prayers.title}
            >
              <Text style={styles.backText}>‹</Text>
            </Pressable>
            <Text
              style={styles.title}
              numberOfLines={1}
              accessibilityRole="header"
              maxFontSizeMultiplier={1.3}
            >
              {m.liturgy.names[id]}
            </Text>
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
          {showSectionChips(sections) && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipScroll}
              contentContainerStyle={styles.sectionRow}
              accessibilityRole="menu"
              accessibilityLabel={m.liturgy.sectionsLabel}
            >
              {sections.map((section) => {
                const active = section === activeSection;
                return (
                  <Pressable
                    key={section}
                    onPress={() => jump(starts[section] ?? 0)}
                    style={[styles.chip, active && styles.chipActive]}
                    accessibilityRole="button"
                    accessibilityLabel={m.liturgy.section[section]}
                    accessibilityState={{ selected: active }}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {m.liturgy.section[section]}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
          <View style={styles.headerLine} />
        </View>
      )}

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
        extraData={[size, parallel, main, second, theme.dark]}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={9}
        removeClippedSubviews
        onViewableItemsChanged={stableViewable}
        viewabilityConfig={VIEWABILITY}
        onScrollToIndexFailed={({ index, averageItemLength }) => {
          listRef.current?.scrollToOffset({ offset: index * averageItemLength, animated: false });
          setTimeout(() => listRef.current?.scrollToIndex({ index, animated: false }), 80);
        }}
        contentContainerStyle={{
          paddingTop: space.sm + topPad,
          paddingBottom: insets.bottom + space.xl * 3,
          paddingHorizontal: space.lg,
          width: '100%',
          maxWidth: COLUMN_WIDTH + space.lg * 2,
          alignSelf: 'center',
        }}
        showsVerticalScrollIndicator={false}
      />

      {showBackToTop(firstIndex) && (
        <Pressable
          onPress={() => listRef.current?.scrollToOffset({ offset: 0, animated: true })}
          style={[styles.toTop, { bottom: insets.bottom + space.lg }]}
          accessibilityRole="button"
          accessibilityLabel={m.liturgy.backToTop}
        >
          <Text style={styles.toTopText}>↑</Text>
        </Pressable>
      )}
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.background },
    header: { backgroundColor: t.background, paddingHorizontal: space.md },
    bar: { flexDirection: 'row', alignItems: 'center' },
    back: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
    backText: { fontSize: 30, lineHeight: 34, color: t.accent },
    title: { flex: 1, fontFamily: SERIF, ...type.headline, color: t.ink, marginHorizontal: space.xs },
    sizeButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
    sizeText: { fontFamily: SERIF, ...type.headline, color: t.accent },
    sizeDisabled: { color: t.line },
    control: { marginTop: space.xs, marginBottom: space.xs },
    toggle: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
    toggleText: { ...type.label, color: t.accent },
    chipScroll: { flexGrow: 0, marginTop: space.xs },
    sectionRow: { flexDirection: 'row', gap: space.sm, paddingRight: space.md },
    chip: {
      minHeight: 44,
      justifyContent: 'center',
      paddingHorizontal: space.md,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: t.outline,
    },
    chipActive: { backgroundColor: t.accent, borderColor: t.accent },
    chipText: { ...type.label, color: t.ink },
    chipTextActive: { color: t.onAccent },
    headerLine: { height: StyleSheet.hairlineWidth, backgroundColor: t.line, marginTop: space.xs },
    status: { ...type.body, color: t.muted, paddingHorizontal: space.lg, marginTop: space.md },

    block: { marginTop: space.lg + space.xs },
    speaker: { ...type.caption, fontWeight: '700', marginBottom: space.xs, letterSpacing: 0.3 },
    speakerPlain: { color: t.muted },
    text: { color: t.ink },
    rubricBlock: {
      borderLeftWidth: 3,
      borderLeftColor: t.outline,
      paddingLeft: space.md,
    },
    rubricText: { color: t.muted },
    italic: { fontStyle: 'italic' },
    omitted: { opacity: 0.75 },
    secondary: { color: t.muted },
    gap: { height: space.sm },
    missing: { fontStyle: 'italic', color: t.muted },

    toTop: {
      position: 'absolute',
      right: space.lg,
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.surface,
      borderWidth: 1,
      borderColor: t.outline,
    },
    toTopText: { fontSize: 22, lineHeight: 26, color: t.accent },
  });
}
