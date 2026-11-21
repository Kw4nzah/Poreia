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
        <View style={[styles.radio, { borderColor: selected ? t.accent : t.outline }]}>
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
    paddingLeft: space.md,
    paddingRight: 20,
    paddingVertical: space.smd,
  },
  text: { flex: 1, gap: space.xs },
  title: { ...type.bodyLarge, fontWeight: '500' },
  subtitle: { ...type.label },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: space.smd,
  },
  dot: { width: 12, height: 12, borderRadius: 6 },
});
