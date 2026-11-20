// The verses of a reading as running text with small verse numbers; a chapter number is
// shown where the chapter changes inside the reading.

import { StyleSheet, Text, TextStyle } from 'react-native';
import type { ReadingVerse } from '../commemorations/text';
import { SERIF, useTheme } from './theme';

export function VerseText({ verses, size }: { verses: readonly ReadingVerse[]; size: TextStyle }) {
  const theme = useTheme();
  return (
    <Text selectable style={[styles.text, size, { color: theme.ink }]}>
      {verses.map((v, i) => (
        <Text key={`${v.chapter}:${v.verse}`}>
          {i > 0 ? ' ' : ''}
          <Text style={[styles.number, { color: theme.muted }]}>
            {i > 0 && verses[i - 1].chapter !== v.chapter ? `${v.chapter}:${v.verse}` : v.verse}
            {' '}
          </Text>
          {v.text}
        </Text>
      ))}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: { fontFamily: SERIF },
  number: { fontSize: 12 },
});
