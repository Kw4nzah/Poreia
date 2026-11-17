// One prayer as a plain reading page, with an adjustable text size.

import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PRAYER_TEXT_SIZES, PrayerId, PrayerTextSize } from '../prayers';
import { useSettings } from '../settings/SettingsProvider';
import { SERIF, Theme, space, useTheme } from '../ui/theme';

const LARGEST = (PRAYER_TEXT_SIZES.length - 1) as PrayerTextSize;

export function PrayerReader({ id }: { id: PrayerId }) {
  const { settings, messages: m, update } = useSettings();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = makeStyles(theme);

  const prayer = m.prayers.text[id];
  const size = settings.prayerTextSize;
  const textSize = PRAYER_TEXT_SIZES[size];

  function resize(step: -1 | 1) {
    const next = size + step;
    if (next >= 0 && next <= LARGEST) update({ prayerTextSize: next as PrayerTextSize });
  }

  return (
    <View style={styles.screen}>
      {/* Outside the scroll view so the size buttons stay within reach while reading. */}
      <View style={[styles.header, { paddingTop: insets.top + space.lg }]}>
        <Pressable onPress={() => router.back()} style={styles.back}
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

      <ScrollView
        contentContainerStyle={{
          paddingTop: space.sm,
          paddingBottom: insets.bottom + space.xl,
          paddingHorizontal: space.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{prayer.title}</Text>
        <View style={styles.rule} />

        {prayer.sections.map((section, index) => (
          <View key={index}>
            {section.heading && <Text style={styles.heading}>{section.heading}</Text>}
            {section.paragraphs.map((paragraph, line) => (
              <Text key={line} style={[styles.paragraph, textSize]}>
                {paragraph}
              </Text>
            ))}
          </View>
        ))}

        {(id === 'morning' || id === 'evening') && settings.saints.length > 0 && (
          <View>
            <Text style={styles.heading}>{m.saints.heading}</Text>
            {settings.saints.map((saint) => (
              <View key={saint.name}>
                <Text style={[styles.paragraph, textSize]}>{m.saints.invocation(saint.name)}</Text>
                {saint.topic !== '' &&
                  (m.saints.topics[saint.topic].prayer !== '' ? (
                    m.saints.topics[saint.topic].prayer
                      .split('{name}')
                      .join(saint.name)
                      .split('\n\n')
                      .map((paragraph, line) => (
                        <Text key={line} style={[styles.paragraph, textSize]}>
                          {paragraph}
                        </Text>
                      ))
                  ) : (
                    <Text style={styles.note}>
                      {saint.name}: {m.saints.topics[saint.topic].label}
                    </Text>
                  ))}
              </View>
            ))}
          </View>
        )}
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
    backText: { fontSize: 16, color: t.accent },
    sizes: { flexDirection: 'row' },
    sizeButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
    sizeText: { fontFamily: SERIF, fontSize: 18, color: t.accent },
    sizeDisabled: { color: t.line },

    title: { fontFamily: SERIF, fontSize: 28, lineHeight: 36, color: t.ink },
    rule: { width: 40, height: 2, borderRadius: 1, backgroundColor: t.feast, marginTop: space.md },
    heading: { fontSize: 14, color: t.muted, marginTop: space.lg },
    paragraph: { fontFamily: SERIF, color: t.ink, marginTop: space.md },
    note: { fontSize: 14, color: t.muted, marginTop: space.xs },
  });
}
