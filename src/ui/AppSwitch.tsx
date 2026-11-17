// The on/off switch. The thumb must stand out from both the track and the card behind it, so it is
// a light cream when on (on the accent track) and the muted tone when off (on the line track).

import { Switch } from 'react-native';
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
      thumbColor={value ? '#FFF8F0' : theme.muted}
      ios_backgroundColor={theme.line}
      accessibilityLabel={label}
    />
  );
}
