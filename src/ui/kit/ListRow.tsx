import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SERIF, space, type, useTheme } from '../theme';
import { Divider } from './Divider';

/** Pressable rows stay comfortably above the 44dp touch target. */
const PRESSABLE_ROW = 56;

interface ListRowProps {
  title: string;
  subtitle?: string;
  /** Small muted line above the title. */
  overline?: string;
  /** Serif title (names, prayers); plain body size otherwise. */
  serif?: boolean;
  /** Pressable when given; the arrow on the right shows with it. */
  onPress?: () => void;
  /** Hides the arrow of a pressable row. */
  hideArrow?: boolean;
  /** Draws a hairline above the row (every row but the first). */
  divider?: boolean;
  /** Replaces the arrow on the right. */
  trailing?: ReactNode;
  accessibilityLabel?: string;
}

/** One row of a list that sits inside a `<Card padding="none">`. */
export function ListRow({
  title,
  subtitle,
  overline,
  serif = false,
  onPress,
  hideArrow = false,
  divider = false,
  trailing,
  accessibilityLabel,
}: ListRowProps) {
  const t = useTheme();
  const pressable = onPress !== undefined;
  const label =
    accessibilityLabel ?? [overline, title, subtitle].filter(Boolean).join(': ');

  const content = (pressed: boolean) => (
    <View
      style={[
        styles.row,
        pressable && styles.pressable,
        pressed && { backgroundColor: t.background },
      ]}
    >
      <View style={styles.text}>
        {overline && <Text style={[styles.overline, { color: t.muted }]}>{overline}</Text>}
        <Text style={[serif ? styles.serifTitle : styles.title, { color: t.ink }]}>{title}</Text>
        {subtitle && <Text style={[styles.subtitle, { color: t.muted }]}>{subtitle}</Text>}
      </View>
      {trailing ??
        (pressable && !hideArrow && (
          <Text accessibilityElementsHidden importantForAccessibility="no" style={[styles.arrow, { color: t.muted }]}>
            ›
          </Text>
        ))}
    </View>
  );

  return (
    <View>
      {divider && <Divider />}
      {pressable ? (
        <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}>
          {({ pressed }) => content(pressed)}
        </Pressable>
      ) : (
        <View accessible accessibilityLabel={label}>
          {content(false)}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: space.lg,
    paddingVertical: space.smd,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.smd,
  },
  pressable: { minHeight: PRESSABLE_ROW },
  text: { flex: 1 },
  overline: { ...type.caption },
  title: { ...type.bodyLarge },
  serifTitle: { fontFamily: SERIF, ...type.headline },
  subtitle: { ...type.label, marginTop: space.xs },
  arrow: { ...type.title3 },
});
