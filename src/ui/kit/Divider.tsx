import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useTheme } from '../theme';

/** Hairline rule in the theme's line colour. */
export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return (
    <View
      importantForAccessibility="no"
      accessibilityElementsHidden
      style={[styles.line, { backgroundColor: t.line }, style]}
    />
  );
}

const styles = StyleSheet.create({ line: { height: 1 } });
