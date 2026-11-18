import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { DailyNotifications } from '../notifications/DailyNotifications';
import { SettingsProvider } from '../settings/SettingsProvider';
import { ErrorBoundary } from '../ui/ErrorBoundary';
import { StatusBarBackground } from '../ui/StatusBarBackground';
import { MAX_CONTENT_WIDTH, useTheme } from '../ui/theme';
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
          {/* One phone-width column, centred on tablets and wide windows. */}
          <View style={{ flex: 1, width: '100%', maxWidth: MAX_CONTENT_WIDTH, alignSelf: 'center' }}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'fade_from_bottom',
              contentStyle: { backgroundColor: theme.background },
            }}
          />
          </View>
        </SettingsProvider>
      </ErrorBoundary>
      <StatusBarBackground />
    </View>
  );
}
