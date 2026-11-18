// Name, tradition and (for the Greek calendar) the fish rule.

import { StyleSheet, View } from 'react-native';
import { CHURCHES, ChurchId, GREEK_FISH_PRACTICES } from '../../calendar';
import { useSettings } from '../../settings/SettingsProvider';
import { AppTextInput } from '../../ui/AppTextInput';
import { SectionHeader } from '../../ui/kit';
import { Option } from '../../ui/Option';
import { Theme, radius, space, type, useTheme, useThemedStyles } from '../../ui/theme';

const CHURCH_IDS = Object.keys(CHURCHES) as ChurchId[];

export function ProfileSection() {
  const { settings, messages: m, update } = useSettings();
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <>
      <SectionHeader title={m.settings.name} />
      <AppTextInput
        value={settings.name}
        onChangeText={(name) => update({ name })}
        onEndEditing={() => update({ name: settings.name.trim() })}
        placeholder={m.onboarding.namePlaceholder}
        placeholderTextColor={theme.muted}
        style={styles.input}
        autoCapitalize="words"
        autoCorrect={false}
        maxLength={40}
        returnKeyType="done"
        blurOnSubmit
        accessibilityLabel={m.settings.name}
      />

      <SectionHeader title={m.settings.church} />
      <View style={styles.options} accessibilityRole="radiogroup">
        {CHURCH_IDS.map((id) => (
          <Option
            key={id}
            selected={id === settings.churchId}
            title={m.church[id].name}
            subtitle={m.church[id].calendar}
            onPress={() => update({ churchId: id })}
          />
        ))}
      </View>

      {settings.churchId === 'greek' && (
        <>
          <SectionHeader title={m.settings.fishTitle} hint={m.settings.fishHint} />
          <View style={styles.options} accessibilityRole="radiogroup">
            {GREEK_FISH_PRACTICES.map((id) => (
              <Option
                key={id}
                selected={id === settings.greekFish}
                title={m.settings.fish[id].title}
                subtitle={m.settings.fish[id].subtitle}
                onPress={() => update({ greekFish: id })}
              />
            ))}
          </View>
        </>
      )}
    </>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    input: {
      minHeight: 56,
      paddingHorizontal: space.md,
      borderRadius: radius.field,
      borderWidth: 1,
      borderColor: t.outline,
      backgroundColor: t.surface,
      ...type.bodyLarge,
      color: t.ink,
    },
    options: { gap: space.smd },
  });
}
