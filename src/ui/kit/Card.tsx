import { ReactNode } from 'react';
import { PressableProps, StyleProp, View, ViewStyle } from 'react-native';
import { PressCard } from '../motion';
import { useTheme } from '../theme';
import { CardPadding, CardRadius, CardTone, cardStyle } from './tokens';

interface CardProps extends Omit<PressableProps, 'style' | 'children'> {
  children: ReactNode;
  /** Inner padding; `none` for cards that hold edge-to-edge rows. */
  padding?: CardPadding;
  shape?: CardRadius;
  tone?: CardTone;
  style?: StyleProp<ViewStyle>;
}

/**
 * Bordered surface with the card radius. Without `onPress` it is a plain View; with it, a
 * pressable card that darkens under the finger (PressCard, which respects reduce motion).
 */
export function Card({
  children,
  padding = 'lg',
  shape = 'card',
  tone = 'surface',
  style,
  onPress,
  ...rest
}: CardProps) {
  const t = useTheme();
  const base = [cardStyle(t, padding, shape, tone), padding === 'none' && { overflow: 'hidden' as const }];
  if (!onPress) {
    return <View style={[base, style]}>{children}</View>;
  }
  return (
    <PressCard {...rest} onPress={onPress} style={[base, style]}>
      {children}
    </PressCard>
  );
}
