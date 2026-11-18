// First-run questions, essentials only: language, church calendar and, for the Greek church,
// the fish rule. The name is optional and lives in Settings.

import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CHURCHES, ChurchId, GREEK_FISH_PRACTICES, GreekFishPractice } from '../calendar';
import { LANGUAGES, MESSAGES } from '../i18n';
import { useSettings } from '../settings/SettingsProvider';
import { Option } from '../ui/Option';
import { SERIF, Theme, space, radius, type, useThemedStyles } from '../ui/theme';

type Step = 'language' | 'church' | 'fish';
const CHURCH_IDS = Object.keys(CHURCHES) as ChurchId[];

export function Onboarding() {
  const { settings, messages: m, update } = useSettings();
  const insets = useSafeAreaInsets();
  const styles = useThemedStyles(makeStyles);

  const [stepIndex, setStepIndex] = useState(0);
  const [churchId, setChurchId] = useState<ChurchId>(settings.churchId);
  const [greekFish, setGreekFish] = useState<GreekFishPractice>(settings.greekFish);

  // The fish rule only exists in the Greek practice.
  const steps: Step[] =
    churchId === 'greek' ? ['language', 'church', 'fish'] : ['language', 'church'];
  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  function goNext() {
    if (isLast) {
      update({ churchId, greekFish, onboarded: true });
    } else {
      setStepIndex(stepIndex + 1);
    }
  }

  return (
    <View
      style={[
        styles.screen,
        { paddingTop: insets.top + space.xl, paddingBottom: insets.bottom + space.md },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.brand} maxFontSizeMultiplier={1.3}>
          Poreia
        </Text>
        <Text style={styles.tagline}>{m.onboarding.tagline}</Text>

        <View
          style={styles.dots}
          accessible
          accessibilityLabel={m.report.page(stepIndex + 1, steps.length)}
        >
          {steps.map((id, index) => (
            <View key={id} style={[styles.dot, index <= stepIndex && styles.dotActive]} />
          ))}
        </View>

        {step === 'language' && (
          <>
            <Text style={styles.title} accessibilityRole="header">
              {m.onboarding.languageTitle}
            </Text>
            <View style={styles.options} accessibilityRole="radiogroup">
              {LANGUAGES.map((language) => (
                <Option
                  key={language}
                  selected={language === settings.language}
                  title={MESSAGES[language].languageName}
                  onPress={() => update({ language })}
                />
              ))}
            </View>
          </>
        )}

        {step === 'church' && (
          <>
            <Text style={styles.title} accessibilityRole="header">
              {m.onboarding.churchTitle}
            </Text>
            <Text style={styles.hint}>{m.onboarding.churchHint}</Text>
            <View style={styles.options} accessibilityRole="radiogroup">
              {CHURCH_IDS.map((id) => (
                <Option
                  key={id}
                  selected={id === churchId}
                  title={m.church[id].name}
                  subtitle={m.church[id].calendar}
                  onPress={() => setChurchId(id)}
                />
              ))}
            </View>
          </>
        )}

        {step === 'fish' && (
          <>
            <Text style={styles.title} accessibilityRole="header">
              {m.settings.fishTitle}
            </Text>
            <Text style={styles.hint}>{m.settings.fishHint}</Text>
            <View style={styles.options} accessibilityRole="radiogroup">
              {GREEK_FISH_PRACTICES.map((id) => (
                <Option
                  key={id}
                  selected={id === greekFish}
                  title={m.settings.fish[id].title}
                  subtitle={m.settings.fish[id].subtitle}
                  onPress={() => setGreekFish(id)}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>

      <View style={styles.actions}>
        {stepIndex > 0 && (
          <Pressable
            onPress={() => setStepIndex(stepIndex - 1)}
            style={styles.secondary}
            accessibilityRole="button"
            accessibilityLabel={m.onboarding.back}
          >
            <Text style={styles.secondaryText}>{m.onboarding.back}</Text>
          </Pressable>
        )}
        <Pressable
          onPress={goNext}
          style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={isLast ? m.onboarding.start : m.onboarding.next}
        >
          <Text style={styles.primaryText}>{isLast ? m.onboarding.start : m.onboarding.next}</Text>
        </Pressable>
      </View>
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.background, paddingHorizontal: space.lg },
    content: { paddingBottom: space.lg },
    brand: { fontFamily: SERIF, ...type.display, color: t.accent },
    tagline: { ...type.body, color: t.muted, marginTop: space.xs },
    dots: { flexDirection: 'row', gap: space.sm, marginTop: space.xl, marginBottom: space.lg },
    dot: { width: 28, height: 3, borderRadius: 2, backgroundColor: t.line },
    dotActive: { backgroundColor: t.accent },
    title: { fontFamily: SERIF, ...type.title2, color: t.ink },
    hint: { ...type.body, color: t.muted, marginTop: space.sm },
    options: { gap: space.smd, marginTop: space.lg },
    actions: { flexDirection: 'row', gap: space.smd, paddingTop: space.sm },
    primary: {
      flex: 1,
      minHeight: 54,
      paddingVertical: space.sm,
      borderRadius: radius.field,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: t.accent,
    },
    pressed: { opacity: 0.85 },
    primaryText: { ...type.bodyLarge, fontWeight: '600', color: t.onAccent, textAlign: 'center' },
    secondary: {
      minHeight: 54,
      paddingVertical: space.sm,
      paddingHorizontal: space.lg,
      borderRadius: radius.field,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: t.outline,
    },
    secondaryText: { ...type.bodyLarge, color: t.ink },
  });
}
