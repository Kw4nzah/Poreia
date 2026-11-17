// First-run questions: language, name, church. Also reopened from the Today screen to
// change them, so every step starts from the current settings.

import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CHURCHES, ChurchId } from '../calendar';
import { LANGUAGES, MESSAGES } from '../i18n';
import { useSettings } from '../settings/SettingsProvider';
import { Option } from '../ui/Option';
import { AppTextInput } from '../ui/AppTextInput';
import { SERIF, Theme, space, useTheme, radius, type } from '../ui/theme';

const STEPS = ['language', 'name', 'church'] as const;
const CHURCH_IDS = Object.keys(CHURCHES) as ChurchId[];

export function Onboarding() {
  const { settings, messages: m, update } = useSettings();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const styles = makeStyles(theme);

  const [stepIndex, setStepIndex] = useState(0);
  const [name, setName] = useState(settings.name);
  const [churchId, setChurchId] = useState<ChurchId>(settings.churchId);

  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  function goNext() {
    if (isLast) {
      update({ name: name.trim(), churchId, onboarded: true });
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
        <Text style={styles.brand}>Poreia</Text>
        <Text style={styles.tagline}>{m.onboarding.tagline}</Text>

        <View style={styles.dots}>
          {STEPS.map((id, index) => (
            <View key={id} style={[styles.dot, index <= stepIndex && styles.dotActive]} />
          ))}
        </View>

        {step === 'language' && (
          <>
            <Text style={styles.title}>{m.onboarding.languageTitle}</Text>
            <View style={styles.options}>
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

        {step === 'name' && (
          <>
            <Text style={styles.title}>{m.onboarding.nameTitle}</Text>
            <Text style={styles.hint}>{m.onboarding.nameHint}</Text>
            <AppTextInput
              value={name}
              onChangeText={setName}
              placeholder={m.onboarding.namePlaceholder}
              placeholderTextColor={theme.muted}
              style={styles.input}
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={40}
              accessibilityLabel={m.settings.name}
              returnKeyType="next"
              onSubmitEditing={goNext}
            />
          </>
        )}

        {step === 'church' && (
          <>
            <Text style={styles.title}>{m.onboarding.churchTitle}</Text>
            <Text style={styles.hint}>{m.onboarding.churchHint}</Text>
            <View style={styles.options}>
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
    input: {
      marginTop: space.lg,
      minHeight: 56,
      paddingHorizontal: space.md,
      borderRadius: radius.field,
      borderWidth: 1,
      borderColor: t.line,
      backgroundColor: t.surface,
      ...type.bodyLarge,
      color: t.ink,
    },
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
      borderColor: t.line,
    },
    secondaryText: { ...type.bodyLarge, color: t.ink },
  });
}
