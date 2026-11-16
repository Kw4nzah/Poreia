// "Open this reading in the Turkish Bible" link, shown to Turkish readers under the text.

import { Linking, Pressable, StyleSheet, Text } from 'react-native';
import type { Reading } from '../commemorations';
import { turkishReadingUrl } from '../commemorations/links';
import { useSettings } from '../settings/SettingsProvider';
import { Theme, space, useTheme } from './theme';

export function TurkishLink({ reading }: { reading: Reading }) {
  const { settings, messages: m } = useSettings();
  const theme = useTheme();
  const url = settings.language === 'tr' ? turkishReadingUrl(reading) : null;
  if (!url) return null;
  const styles = makeStyles(theme);
  return (
    <Pressable
      onPress={() => Linking.openURL(url).catch(() => {})}
      style={styles.button}
      accessibilityRole="link"
    >
      <Text style={styles.text}>{m.readings.openTurkish}</Text>
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
    text: { fontSize: 15, color: t.accent, textDecorationLine: 'underline' },
  });
}
