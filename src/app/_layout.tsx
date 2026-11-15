import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SettingsProvider } from '../settings/SettingsProvider';
import { useTheme } from '../ui/theme';

export default function RootLayout() {
  const theme = useTheme();
  return (
    // The background shows while settings load, so there is no white flash in dark mode.
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar style="auto" />
      <SettingsProvider>
        <Stack
          screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.background } }}
        />
      </SettingsProvider>
    </View>
  );
}
