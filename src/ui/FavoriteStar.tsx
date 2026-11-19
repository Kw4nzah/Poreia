// A star toggle: filled when the item is a favourite, outlined when not, so the state does not
// rest on colour alone. A 44-point target, announced to screen readers as a selected button.

import { Pressable, StyleSheet, Text } from 'react-native';
import { useTheme } from './theme';

interface FavoriteStarProps {
  selected: boolean;
  onPress: () => void;
  /** What the star is for, e.g. "Favourite"; the selected state is announced separately. */
  label: string;
}

export function FavoriteStar({ selected, onPress, label }: FavoriteStarProps) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={styles.target}
      hitSlop={4}
      accessibilityRole="togglebutton"
      accessibilityLabel={label}
      accessibilityState={{ selected, checked: selected }}
    >
      <Text
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden
        style={[styles.glyph, { color: selected ? theme.accent : theme.muted }]}
      >
        {selected ? '★' : '☆'}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  target: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  glyph: { fontSize: 22 },
});
