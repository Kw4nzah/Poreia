// Sources and licences, and the project on GitHub.

import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { PROJECT_URL } from '../../security/constants';
import { openExternalUrl } from '../../security/openExternal';
import { useSettings } from '../../settings/SettingsProvider';
import { Button } from '../../ui/kit';
import { space } from '../../ui/theme';

export function AboutSection() {
  const { messages: m } = useSettings();
  const router = useRouter();

  return (
    <View style={styles.column}>
      <Button label={m.sources.title} onPress={() => router.push('/sources')} variant="secondary" />
      <Button
        label={m.settings.projectLink}
        onPress={() => void openExternalUrl(PROJECT_URL)}
        variant="secondary"
        accessibilityRole="link"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  column: { gap: space.smd, marginTop: space.lg },
});
