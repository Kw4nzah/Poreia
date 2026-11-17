import { BlurTargetView } from 'expo-blur';
import type { ComponentRef } from 'react';
import { Tabs } from 'expo-router';
import { useRef } from 'react';
import { View } from 'react-native';
import { useSettings } from '../../settings/SettingsProvider';
import { GlassTabBar } from '../../ui/GlassTabBar';
import { StatusBarScrim } from '../../ui/StatusBarScrim';
import { useTheme } from '../../ui/theme';

// The navigator's own bar is off; GlassTabBar floats over the screens. The screens sit in a
// blur target so the bar can blur whatever scrolls under it.
export default function TabsLayout() {
  const { messages: m } = useSettings();
  const theme = useTheme();
  const target = useRef<ComponentRef<typeof BlurTargetView>>(null);

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <BlurTargetView ref={target} style={{ flex: 1 }}>
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
      </BlurTargetView>
      <StatusBarScrim />
      <GlassTabBar targetRef={target} />
    </View>
  );
}
