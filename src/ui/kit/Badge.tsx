import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { radius, space, type, useTheme } from '../theme';
import { BadgeTone, badgeColors } from './tokens';

/** Small status tag: fast level, feast or caution. Text is ink; the tone shows in fill, edge and dot. */
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
      style={[styles.pill, { backgroundColor: c.background, borderColor: c.border }, style]}
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
    gap: space.sm,
    paddingHorizontal: space.smd,
    paddingVertical: space.xs,
    borderRadius: radius.tag,
    borderWidth: 1,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  text: { ...type.caption, fontWeight: '600' },
});
