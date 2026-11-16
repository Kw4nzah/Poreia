import { Tabs } from 'expo-router';
import { useSettings } from '../../settings/SettingsProvider';
import { useTheme } from '../../ui/theme';

// Four plain text tabs: no icon font, so this stays a JS-only update.
export default function TabsLayout() {
  const { messages: m } = useSettings();
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        sceneStyle: { backgroundColor: theme.background },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.muted,
        tabBarStyle: { backgroundColor: theme.surface, borderTopColor: theme.line },
        tabBarIconStyle: { display: 'none' },
        tabBarLabelStyle: { fontSize: 15, marginBottom: 12, marginTop: 12 },
      }}
    >
      <Tabs.Screen name="today" options={{ title: m.tabs.today }} />
      <Tabs.Screen name="readings" options={{ title: m.tabs.readings }} />
      <Tabs.Screen name="prayers" options={{ title: m.prayers.title }} />
      <Tabs.Screen name="settings" options={{ title: m.settings.title }} />
    </Tabs>
  );
}
