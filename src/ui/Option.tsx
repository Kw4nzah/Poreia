import { Pressable, StyleSheet, Text, View } from 'react-native';
import { space, useTheme, radius } from './theme';

interface OptionProps {
  selected: boolean;
  title: string;
  subtitle?: string;
  onPress: () => void;
}

/** One choice in a single-select list. */
export function Option({ selected, title, subtitle, onPress }: OptionProps) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        { borderColor: selected ? t.accent : t.line, backgroundColor: t.surface },
        pressed && { opacity: 0.85 },
      ]}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
    >
      <View style={styles.text}>
        <Text style={[styles.title, { color: t.ink }]}>{title}</Text>
        {subtitle && <Text style={[styles.subtitle, { color: t.muted }]}>{subtitle}</Text>}
      </View>
      <View style={[styles.radio, { borderColor: selected ? t.accent : t.line }]}>
        {selected && <View style={[styles.dot, { backgroundColor: t.accent }]} />}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    paddingHorizontal: space.md,
    paddingVertical: 12,
    borderRadius: radius.field,
    borderWidth: 1,
  },
  text: { flex: 1, gap: 2 },
  title: { fontSize: 17 },
  subtitle: { fontSize: 14 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
