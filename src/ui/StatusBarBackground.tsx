// The app draws edge to edge, so the system status bar (clock, battery) is transparent and page
// content would show through it. A solid strip in the page colour sits behind the status bar
// icons on every screen, and just below it the colour fades out smoothly, so content scrolling up
// dissolves instead of being cut off. (A gradient is built from thin strips: no native module.)

import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from './theme';

const FADE_HEIGHT = 24;
const STEPS = 24;

/** Opacity of strip `i` of `STEPS`: eased from fully opaque to fully clear. */
function fadeOpacity(i: number): number {
  const t = (i + 0.5) / STEPS;
  const smooth = t * t * (3 - 2 * t); // smoothstep
  return 1 - smooth;
}

export function StatusBarBackground() {
  const theme = useTheme();
  const top = useSafeAreaInsets().top;
  return (
    <View
      pointerEvents="none"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, height: top + FADE_HEIGHT }}
    >
      <View style={{ height: top, backgroundColor: theme.background }} />
      {Array.from({ length: STEPS }, (_, i) => (
        <View
          key={i}
          style={{
            height: FADE_HEIGHT / STEPS,
            backgroundColor: theme.background,
            opacity: fadeOpacity(i),
          }}
        />
      ))}
    </View>
  );
}
