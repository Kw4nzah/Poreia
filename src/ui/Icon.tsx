// The app's line icons, drawn with plain Views: one size grid and one stroke everywhere, and no
// icon font or SVG module (either would be a native change). The shapes are borders and bars
// rotated into place, so they take the colour of the text role they sit next to.

import { StyleProp, View, ViewStyle } from 'react-native';

export type IconName =
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-down'
  | 'chevron-up'
  | 'check'
  | 'cross';

/** Stroke width shared by every icon. */
export const ICON_STROKE = 1.5;

const CHEVRON_TURN = {
  'chevron-right': '-45deg',
  'chevron-down': '45deg',
  'chevron-left': '135deg',
  'chevron-up': '-135deg',
} as const;

/** How far a chevron is nudged back so its point, not its box, sits in the centre. */
const CHEVRON_SHIFT = {
  'chevron-right': { translateX: -0.125 },
  'chevron-left': { translateX: 0.125 },
  'chevron-down': { translateY: -0.125 },
  'chevron-up': { translateY: 0.125 },
} as const;

export function Icon({
  name,
  color,
  size = 16,
  style,
}: {
  name: IconName;
  color: string;
  /** Edge of the square the icon sits in (dp). */
  size?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }, style]}
    >
      {shape(name, color, size)}
    </View>
  );
}

function shape(name: IconName, color: string, size: number) {
  if (name === 'cross') {
    const bar: ViewStyle = {
      position: 'absolute',
      width: size * 0.75,
      height: ICON_STROKE,
      backgroundColor: color,
    };
    return (
      <>
        <View style={[bar, { transform: [{ rotate: '45deg' }] }]} />
        <View style={[bar, { transform: [{ rotate: '-45deg' }] }]} />
      </>
    );
  }
  if (name === 'check') {
    return (
      <View
        style={{
          width: size * 0.34,
          height: size * 0.62,
          borderRightWidth: ICON_STROKE,
          borderBottomWidth: ICON_STROKE,
          borderColor: color,
          transform: [{ translateY: -size * 0.08 }, { rotate: '45deg' }],
        }}
      />
    );
  }
  const shift = CHEVRON_SHIFT[name];
  const arm = size * 0.5;
  return (
    <View
      style={{
        width: arm,
        height: arm,
        borderRightWidth: ICON_STROKE,
        borderBottomWidth: ICON_STROKE,
        borderColor: color,
        transform: [
          'translateX' in shift
            ? { translateX: shift.translateX * size }
            : { translateY: shift.translateY * size },
          { rotate: CHEVRON_TURN[name] },
        ],
      }}
    />
  );
}
