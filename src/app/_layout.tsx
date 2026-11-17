import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { DailyNotifications } from '../notifications/DailyNotifications';
import { SettingsProvider } from '../settings/SettingsProvider';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { StatusBarBackground } from '../ui/StatusBarBackground';
import { useTheme } from '../ui/theme';
import { WidgetSync } from '../widget/WidgetSync';

export default function RootLayout() {
  const theme = useTheme();
  return (
    // The background shows while settings load, so there is no white flash in dark mode.
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <StatusBar style="auto" />
      <ErrorBoundary>
        <SettingsProvider>
          <DailyNotifications />
          <WidgetSync />
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'fade_from_bottom',
              contentStyle: { backgroundColor: theme.background },
            }}
          />
        </SettingsProvider>
      </ErrorBoundary>
      <StatusBarBackground />
    </View>
  );
}
