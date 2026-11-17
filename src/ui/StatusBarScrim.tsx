// Content scrolls under the phone's status bar (the app draws edge to edge). This covers that strip
// with the page colour and fades it out just below, so text does not collide with the clock and icons.

import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from './theme';

const FADE_STEPS = 6;
const FADE_STEP_HEIGHT = 4;

export function StatusBarScrim() {
  const theme = useTheme();
  const top = useSafeAreaInsets().top;
  return (
    <View
      pointerEvents="none"
      style={[styles.wrap, { height: top + FADE_STEPS * FADE_STEP_HEIGHT }]}
    >
      <View style={{ height: top, backgroundColor: theme.background }} />
      {Array.from({ length: FADE_STEPS }, (_, i) => (
        <View
          key={i}
          style={{
            height: FADE_STEP_HEIGHT,
            backgroundColor: theme.background,
            opacity: 1 - (i + 1) / (FADE_STEPS + 1),
          }}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', top: 0, left: 0, right: 0 },
});
