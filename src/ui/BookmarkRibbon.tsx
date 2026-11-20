// A small bookmark ribbon: a flat accent strip with softly rounded lower corners. Decorative; the
// meaning is always carried by text or an accessibility label next to it.

import { View } from 'react-native';
import { useTheme } from './theme';

export function BookmarkRibbon({ width = 12, height = 22 }: { width?: number; height?: number }) {
  const t = useTheme();
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width,
        height,
        backgroundColor: t.accent,
        borderBottomLeftRadius: width / 3,
        borderBottomRightRadius: width / 3,
      }}
    />
  );
}
