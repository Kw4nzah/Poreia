import { StyleProp, StyleSheet, Text, TextStyle, View } from 'react-native';
import { space, type, useTheme } from '../theme';

/** Small muted heading above a group of cards or rows, with an optional hint line. */
export function SectionHeader({
  title,
  hint,
  spacing = 'lg',
}: {
  title: string;
  hint?: string;
  /** Space above the heading. */
  spacing?: 'lg' | 'xl';
}) {
  const t = useTheme();
  const hintStyle: StyleProp<TextStyle> = [styles.hint, { color: t.muted }];
  return (
    <View style={{ marginTop: space[spacing] }}>
      <Text accessibilityRole="header" style={[styles.title, { color: t.muted }]}>
        {title}
      </Text>
      {hint && <Text style={hintStyle}>{hint}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  title: { ...type.label, marginBottom: space.sm },
  hint: { ...type.caption, marginBottom: space.sm },
});
