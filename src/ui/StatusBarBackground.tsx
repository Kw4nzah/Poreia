// The app draws edge to edge, so the system status bar (clock, battery) is transparent and page
// content would show through it. This solid strip in the page colour sits behind the status bar
// icons on every screen.

import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from './theme';

export function StatusBarBackground() {
  const theme = useTheme();
  const top = useSafeAreaInsets().top;
  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: top,
        backgroundColor: theme.background,
      }}
    />
  );
}
