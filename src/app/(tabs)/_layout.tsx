import { Tabs } from 'expo-router';
import { useSettings } from '../../settings/SettingsProvider';
import { useTheme } from '../../ui/theme';
import { TAB_BAR_HEIGHT, TAB_BAR_MARGIN, useTabBarBottom } from '../../ui/tabBar';

// Four plain text tabs in a floating, translucent "glass" bar: no icon font and no blur module,
// so this stays a JS-only update.
export default function TabsLayout() {
  const { messages: m } = useSettings();
  const theme = useTheme();
  const bottom = useTabBarBottom();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        animation: 'fade',
        sceneStyle: { backgroundColor: theme.background },
        tabBarActiveTintColor: theme.accent,
        tabBarInactiveTintColor: theme.muted,
        tabBarStyle: {
          position: 'absolute',
          left: TAB_BAR_MARGIN + 4,
          right: TAB_BAR_MARGIN + 4,
          bottom,
          height: TAB_BAR_HEIGHT,
          paddingBottom: 0,
          paddingTop: 0,
          borderRadius: TAB_BAR_HEIGHT / 2,
          borderWidth: 1,
          borderTopWidth: 1,
          borderColor: theme.glassEdge,
          backgroundColor: theme.glass,
          shadowColor: '#000',
          shadowOpacity: theme.dark ? 0.5 : 0.14,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 8 },
          elevation: 8,
        },
        tabBarItemStyle: { justifyContent: 'center', height: TAB_BAR_HEIGHT },
        tabBarIconStyle: { display: 'none' },
        tabBarLabelStyle: { fontSize: 14, fontWeight: '600', margin: 0 },
      }}
    >
      <Tabs.Screen name="today" options={{ title: m.tabs.today }} />
      <Tabs.Screen name="readings" options={{ title: m.tabs.readings }} />
      <Tabs.Screen name="prayers" options={{ title: m.prayers.title }} />
      <Tabs.Screen name="settings" options={{ title: m.settings.title }} />
    </Tabs>
  );
}
