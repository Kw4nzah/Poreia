import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { radius, space, type, useTheme } from '../theme';
import { BadgeTone, badgeColors } from './tokens';

/** Small status tag (BoardUI Chip measures): fast level, feast or caution. Text is ink; the tone shows in the fill and the dot. */
export function Badge({
  label,
  tone = 'neutral',
  style,
}: {
  label: string;
  tone?: BadgeTone;
  style?: StyleProp<ViewStyle>;
}) {
  const t = useTheme();
  const c = badgeColors(t, tone);
  return (
    <View
      style={[styles.pill, { backgroundColor: c.background }, style]}
      accessible
      accessibilityLabel={label}
    >
      <View style={[styles.dot, { backgroundColor: c.dot }]} />
      <Text style={[styles.text, { color: c.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: space.sm,
    paddingVertical: space.xs,
    borderRadius: radius.tag,
    // A long label wraps inside the pill instead of running past the card.
    maxWidth: '100%',
  },
  dot: { width: 6, height: 6, borderRadius: 3, flexShrink: 0 },
  text: { ...type.caption, fontWeight: '500', flexShrink: 1 },
});
