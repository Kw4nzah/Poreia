import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { useSettings } from '../../settings/SettingsProvider';
import { TabBar } from '../../ui/FloatingTabBar';
import { useTheme } from '../../ui/theme';

// The navigator's own bar is off; TabBar floats over the screens.
export default function TabsLayout() {
  const { messages: m } = useSettings();
  const theme = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Tabs
        tabBar={() => null}
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          sceneStyle: { backgroundColor: theme.background },
        }}
      >
        <Tabs.Screen name="today" options={{ title: m.tabs.today }} />
        <Tabs.Screen name="readings" options={{ title: m.tabs.readings }} />
        <Tabs.Screen name="prayers" options={{ title: m.prayers.title }} />
        <Tabs.Screen name="settings" options={{ title: m.settings.title }} />
      </Tabs>
      <TabBar />
    </View>
  );
}
