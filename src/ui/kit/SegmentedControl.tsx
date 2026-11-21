import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius, space, type, useTheme } from '../theme';
import { MIN_TARGET, segmentColors } from './tokens';

export interface Segment<T extends string | number> {
  value: T;
  label: string;
  accessibilityLabel?: string;
}

/** A single-choice row of equal segments (a few short options, e.g. the reminder hour). */
export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: {
  options: readonly Segment<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel?: string;
}) {
  const t = useTheme();
  return (
    <View
      style={[styles.track, { backgroundColor: t.background, borderColor: t.outline }]}
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
    >
      {options.map((option) => {
        const selected = option.value === value;
        const c = segmentColors(t, selected);
        return (
          <Pressable
            key={String(option.value)}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.segment,
              { backgroundColor: c.background, borderColor: c.border },
              pressed && !selected && { backgroundColor: t.line },
            ]}
            accessibilityRole="radio"
            accessibilityLabel={option.accessibilityLabel ?? option.label}
            accessibilityState={{ selected }}
          >
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
              maxFontSizeMultiplier={1.3}
              style={[styles.text, { color: c.text }, selected && styles.selectedText]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Space between the track's edge and the segments. */
const TRACK_INSET = space.xs;

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    gap: 2,
    padding: TRACK_INSET,
    borderRadius: radius.field,
    borderWidth: 1,
  },
  segment: {
    flex: 1,
    minHeight: MIN_TARGET,
    paddingHorizontal: space.xs,
    // Nested radius: the track's radius minus its inset.
    borderRadius: radius.field - TRACK_INSET,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { ...type.body, fontVariant: ['tabular-nums'] },
  selectedText: { fontWeight: '500' },
});
