import {
  ActivityIndicator,
  GestureResponderEvent,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { space, useTheme } from '../theme';
import {
  ButtonSize,
  ButtonVariant,
  DISABLED_OPACITY,
  buttonColors,
  buttonMetrics,
  controlState,
} from './tokens';

interface ButtonProps {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  /** Stretches to the container (default). Off: as wide as its label. */
  fullWidth?: boolean;
  /** `link` for buttons that open a web page. */
  accessibilityRole?: 'button' | 'link';
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

/** Text button. Pressing darkens it (it never scales, so there is no motion to reduce). */
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = true,
  accessibilityRole = 'button',
  accessibilityLabel,
  style,
}: ButtonProps) {
  const t = useTheme();
  const colors = buttonColors(t, variant);
  const metrics = buttonMetrics(size);
  const state = controlState(disabled, loading);

  return (
    <Pressable
      onPress={onPress}
      disabled={state.disabled}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={state}
      style={[
        styles.base,
        {
          minHeight: metrics.minHeight,
          paddingHorizontal: metrics.paddingHorizontal,
          paddingVertical: metrics.paddingVertical,
          borderRadius: metrics.borderRadius,
          backgroundColor: colors.background,
          borderColor: colors.border,
          opacity: disabled ? DISABLED_OPACITY : 1,
        },
        !fullWidth && styles.shrink,
        style,
      ]}
    >
      {({ pressed }) => (
        <>
          {loading && <ActivityIndicator size="small" color={colors.text} style={styles.spinner} />}
          <Text
            style={{
              color: colors.text,
              fontSize: metrics.fontSize,
              lineHeight: metrics.lineHeight,
              fontWeight: '600',
              textAlign: 'center',
              // A long Turkish or Russian label wraps inside the button instead of leaving it.
              flexShrink: 1,
            }}
          >
            {label}
          </Text>
          {pressed && (
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: colors.overlay, opacity: colors.overlayOpacity },
              ]}
            />
          )}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  shrink: { alignSelf: 'flex-start' },
  spinner: { marginRight: space.sm },
});
