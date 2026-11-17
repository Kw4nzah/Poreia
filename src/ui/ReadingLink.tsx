// "Open this reading in YouVersion" link shown under a reading, in the user's language.

import { Linking, Pressable, StyleSheet, Text } from 'react-native';
import type { Reading } from '../commemorations';
import { readingUrl } from '../commemorations/links';
import { useSettings } from '../settings/SettingsProvider';
import { Theme, space, type, useThemedStyles } from './theme';

export function ReadingLink({ reading }: { reading: Reading }) {
  const { settings, messages: m } = useSettings();
  const url = readingUrl(reading, settings.language);
  if (!url) return null;
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      onPress={() => Linking.openURL(url).catch(() => {})}
      style={styles.button}
      accessibilityRole="link"
      accessibilityLabel={m.readings.openBible}
    >
      <Text style={styles.text}>{m.readings.openBible}</Text>
    </Pressable>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    button: {
      minHeight: 44,
      justifyContent: 'center',
      marginTop: space.sm,
      alignSelf: 'flex-start',
    },
    text: { ...type.body, color: t.accent, textDecorationLine: 'underline' },
  });
}
