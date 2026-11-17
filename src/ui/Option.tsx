import { StyleSheet, Text, View } from 'react-native';
import { Card } from './kit';
import { space, useTheme, type } from './theme';

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
    <Card
      onPress={onPress}
      padding="none"
      shape="field"
      style={{ borderColor: selected ? t.accent : t.line }}
      accessibilityRole="radio"
      accessibilityLabel={subtitle ? `${title}. ${subtitle}` : title}
      accessibilityState={{ selected }}
    >
      <View style={styles.row}>
        <View style={styles.text}>
          <Text style={[styles.title, { color: t.ink }]}>{title}</Text>
          {subtitle && <Text style={[styles.subtitle, { color: t.muted }]}>{subtitle}</Text>}
        </View>
        <View style={[styles.radio, { borderColor: selected ? t.accent : t.line }]}>
          {selected && <View style={[styles.dot, { backgroundColor: t.accent }]} />}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 64,
    paddingHorizontal: space.md,
    paddingVertical: space.smd,
  },
  text: { flex: 1, gap: space.xs },
  title: { ...type.bodyLarge },
  subtitle: { ...type.label },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: space.smd,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
});
