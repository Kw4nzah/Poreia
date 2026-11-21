// The on/off switch. The thumb must stand out from both the track and the card behind it, so it is
// a light cream when on (on the accent track) and the muted tone when off (on the line track).

import { Platform, Switch } from 'react-native';
import { useTheme } from './theme';

export function AppSwitch({
  value,
  onValueChange,
  label,
}: {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label: string;
}) {
  const theme = useTheme();
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: theme.line, true: theme.accent }}
      // onAccent is cream in light and dark brown in dark: either way 3:1 or more on the track.
      thumbColor={value ? theme.onAccent : theme.muted}
      // react-native-web colours the "on" thumb from its own prop (teal by default), not thumbColor.
      {...(Platform.OS === 'web' ? ({ activeThumbColor: theme.onAccent } as object) : {})}
      ios_backgroundColor={theme.line}
      accessibilityLabel={label}
    />
  );
}
