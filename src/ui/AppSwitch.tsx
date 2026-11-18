// The on/off switch. The thumb must stand out from both the track and the card behind it, so it is
// a light cream when on (on the accent track) and the muted tone when off (on the line track).

import { Platform, Switch } from 'react-native';
import { useTheme } from './theme';

const THUMB_ON = '#FFF8F0';

/** react-native-web colours the "on" thumb from its own prop (teal by default), not thumbColor. */
const WEB_THUMB = Platform.OS === 'web' ? ({ activeThumbColor: THUMB_ON } as object) : {};

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
      thumbColor={value ? THUMB_ON : theme.muted}
      {...WEB_THUMB}
      ios_backgroundColor={theme.line}
      accessibilityLabel={label}
    />
  );
}
