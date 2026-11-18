// "Open this reading in YouVersion" link shown under a reading, in the user's language.

import { Pressable, StyleSheet, Text } from 'react-native';
import type { Reading } from '../commemorations';
import { readingUrl } from '../commemorations/links';
import { openExternalUrl } from '../security/openExternal';
import { useSettings } from '../settings/SettingsProvider';
import { Theme, space, type, useThemedStyles } from './theme';

export function ReadingLink({ reading }: { reading: Reading }) {
  const { settings, messages: m } = useSettings();
  // Hooks first: the early return below must not change how many hooks run.
  const styles = useThemedStyles(makeStyles);
  const url = readingUrl(reading, settings.language);
  if (!url) return null;
  return (
    <Pressable
      onPress={() => void openExternalUrl(url)}
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
