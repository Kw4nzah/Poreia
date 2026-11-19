// One prayer as a plain reading page, with an adjustable text size and a calm reading mode
// (large, centred text and no controls). The screen stays on only while reading mode is on.

import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import {
  AppState,
  BackHandler,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  ScrollViewInstance,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PRAYER_TEXT_SIZES, PrayerId, PrayerTextSize } from '../prayers';
import { cleanPrayerBookmark, toggleFavoritePrayer } from '../prayers/favorites';
import { useSettings } from '../settings/SettingsProvider';
import { FavoriteStar } from '../ui/FavoriteStar';
import { SERIF, Theme, space, type, useThemedStyles } from '../ui/theme';
import { holdScreenAwake } from './keepAwake';

const LARGEST = (PRAYER_TEXT_SIZES.length - 1) as PrayerTextSize;

/** Reading mode sets the text larger than the chosen size. */
const READING_SCALE = 1.25;
/** Line length cap so wide screens still read as a narrow column. */
const READING_WIDTH = 560;
/** How long scrolling must pause before the position is remembered. */
const SAVE_DELAY_MS = 800;
/** Smaller moves than this are not worth a write. */
const SAVE_MIN_STEP = 24;

export function PrayerReader({ id, resume = false }: { id: PrayerId; resume?: boolean }) {
  const { settings, messages: m, update } = useSettings();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useThemedStyles(makeStyles);

  const prayer = m.prayers.text[id];
  const size = settings.prayerTextSize;
  const calm = settings.prayerReadingMode;
  const base = PRAYER_TEXT_SIZES[size];
  const textSize = calm
    ? {
        fontSize: Math.round(base.fontSize * READING_SCALE),
        lineHeight: Math.round(base.lineHeight * READING_SCALE),
      }
    : base;
  const align = calm ? styles.centered : null;

  // The system back button leaves reading mode first, then the page.
  useEffect(() => {
    if (!calm) return;
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      update({ prayerReadingMode: false });
      return true;
    });
    return () => subscription.remove();
  }, [calm, update]);

  // Reading mode keeps the screen on; leaving it (or the page) gives that back.
  useEffect(() => {
    if (!calm) return;
    return holdScreenAwake();
  }, [calm]);

  const favorite = settings.favoritePrayers.includes(id);

  // "Continue where you left off": remember this prayer and how far down it the reader is.
  // The saved offset is read once, when the page opens; later saves must not move the view.
  const scrollRef = useRef<ScrollViewInstance>(null);
  const restoreTo = useRef(
    resume && settings.lastPrayer?.id === id
      ? (cleanPrayerBookmark(settings.lastPrayer)?.scroll ?? 0)
      : 0,
  );
  const offset = useRef(restoreTo.current);
  const saved = useRef(restoreTo.current);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const updateRef = useRef(update);
  updateRef.current = update;

  const save = useRef((force: boolean) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (!force && Math.abs(offset.current - saved.current) < SAVE_MIN_STEP) return;
    saved.current = offset.current;
    updateRef.current({ lastPrayer: { id, scroll: Math.round(offset.current) } });
  }).current;

  useEffect(() => {
    // Opening a prayer afresh starts its bookmark at the top.
    save(true);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') save(true);
    });
    return () => {
      subscription.remove();
      save(true);
    };
  }, [save]);

  function onScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    offset.current = Math.max(0, event.nativeEvent.contentOffset.y);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => save(false), SAVE_DELAY_MS);
  }

  // The text is laid out after the first render, so the saved offset is applied once it is.
  function onContentSizeChange() {
    const target = restoreTo.current;
    if (target <= 0) return;
    restoreTo.current = 0;
    scrollRef.current?.scrollTo({ y: target, animated: false });
  }

  function resize(step: -1 | 1) {
    const next = size + step;
    if (next >= 0 && next <= LARGEST) update({ prayerTextSize: next as PrayerTextSize });
  }

  return (
    <View style={styles.screen}>
      {/* Outside the scroll view so the size buttons stay within reach while reading. */}
      {!calm && (
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
            <FavoriteStar
              selected={favorite}
              label={m.prayers.favorite}
              onPress={() =>
                update({ favoritePrayers: toggleFavoritePrayer(settings.favoritePrayers, id) })
              }
            />
            <Pressable
              onPress={() => update({ prayerReadingMode: true })}
              style={styles.modeButton}
              accessibilityRole="button"
              accessibilityLabel={m.prayers.readingMode}
            >
              <Text style={styles.modeText}>{m.prayers.readingMode}</Text>
            </Pressable>
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
      )}

      <ScrollView
        ref={scrollRef}
        onScroll={onScroll}
        scrollEventThrottle={64}
        onContentSizeChange={onContentSizeChange}
        contentContainerStyle={[
          {
            paddingTop: calm ? insets.top + space.xl : space.sm,
            paddingBottom: insets.bottom + (calm ? space.xl * 2 : space.xl),
            paddingHorizontal: space.lg,
          },
          calm && styles.calmColumn,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, align]} accessibilityRole="header" maxFontSizeMultiplier={1.4}>
          {prayer.title}
        </Text>
        <View style={[styles.rule, calm && styles.ruleCentered]} />

        {prayer.sections.map((section, index) => (
          <View key={index}>
            {section.heading && (
              <Text style={[styles.heading, align]} accessibilityRole="header">
                {section.heading}
              </Text>
            )}
            {section.paragraphs.map((paragraph, line) => (
              <Text key={line} style={[styles.paragraph, textSize, align]}>
                {paragraph}
              </Text>
            ))}
          </View>
        ))}

        {(id === 'morning' || id === 'evening') && settings.saints.length > 0 && (
          <View>
            <Text style={[styles.heading, align]} accessibilityRole="header">
              {m.saints.heading}
            </Text>
            {settings.saints.map((saint) => (
              <View key={saint.name}>
                <Text style={[styles.paragraph, textSize, align]}>
                  {m.saints.invocation(saint.name)}
                </Text>
                {saint.topic !== '' &&
                  (m.saints.topics[saint.topic].prayer !== '' ? (
                    m.saints.topics[saint.topic].prayer
                      .split('{name}')
                      .join(saint.name)
                      .split('\n\n')
                      .map((paragraph, line) => (
                        <Text key={line} style={[styles.paragraph, textSize, align]}>
                          {paragraph}
                        </Text>
                      ))
                  ) : (
                    <Text style={[styles.note, align]}>
                      {saint.name}: {m.saints.topics[saint.topic].label}
                    </Text>
                  ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {calm && (
        <Pressable
          onPress={() => update({ prayerReadingMode: false })}
          style={[styles.leave, { top: insets.top + space.sm }]}
          accessibilityRole="button"
          accessibilityLabel={m.prayers.leaveReadingMode}
        >
          <Text style={styles.leaveText}>✕</Text>
        </Pressable>
      )}
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
    sizes: { flexDirection: 'row', flexShrink: 1, justifyContent: 'flex-end' },
    // "Режим чтения" wraps instead of pushing the size buttons off a narrow screen.
    modeButton: {
      minHeight: 44,
      flexShrink: 1,
      justifyContent: 'center',
      paddingHorizontal: space.sm,
    },
    sizeButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
    sizeText: { fontFamily: SERIF, ...type.headline, color: t.accent },
    sizeDisabled: { color: t.line },
    modeText: { ...type.label, color: t.accent },

    centered: { textAlign: 'center' },
    calmColumn: { width: '100%', maxWidth: READING_WIDTH, alignSelf: 'center' },
    ruleCentered: { alignSelf: 'center' },
    // Quiet exit in the corner; the screen has no other controls in reading mode.
    leave: {
      position: 'absolute',
      right: space.sm,
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    leaveText: { fontSize: 18, color: t.muted },

    title: { fontFamily: SERIF, ...type.title1, color: t.ink },
    rule: { width: 40, height: 2, borderRadius: 1, backgroundColor: t.feast, marginTop: space.md },
    heading: { ...type.label, color: t.muted, marginTop: space.lg },
    paragraph: { fontFamily: SERIF, color: t.ink, marginTop: space.md },
    note: { ...type.label, color: t.muted, marginTop: space.xs },
  });
}
