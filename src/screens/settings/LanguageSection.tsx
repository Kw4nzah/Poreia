// Interface language.

import { StyleSheet, View } from 'react-native';
import { LANGUAGES, MESSAGES } from '../../i18n';
import { useSettings } from '../../settings/SettingsProvider';
import { Option } from '../../ui/Option';
import { space } from '../../ui/theme';

export function LanguageSection() {
  const { settings, update } = useSettings();

  return (
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
  );
}

const styles = StyleSheet.create({
  options: { gap: space.smd, marginTop: space.lg },
});
