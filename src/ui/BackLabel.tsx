import { StyleSheet, Text, View } from 'react-native';
import { Icon } from './Icon';
import { space, type, useTheme } from './theme';

/** The label of a "back" link at the top of a pushed screen: a chevron and where it leads. */
export function BackLabel({ label }: { label: string }) {
  const t = useTheme();
  return (
    <View style={styles.row}>
      <Icon name="chevron-left" color={t.accent} />
      <Text style={[styles.text, { color: t.accent }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  text: { ...type.body, flexShrink: 1 },
});
