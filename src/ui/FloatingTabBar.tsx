// The bottom bar: a floating raised surface with a hairline edge. It is drawn by us (the
// navigator's own bar is switched off) so that its layout is exact.

import { usePathname, useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSettings } from '../settings/SettingsProvider';
import {
  TAB_BAR_HEIGHT,
  TAB_BAR_INSET,
  TAB_BAR_RADIUS,
  TAB_BAR_SIDE,
  useTabBarBottom,
} from './tabBar';
import { useTheme, type } from './theme';

const TABS = ['today', 'readings', 'prayers', 'settings'] as const;
type TabId = (typeof TABS)[number];

export function TabBar() {
  const { messages: m } = useSettings();
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const bottom = useTabBarBottom();

  const labels: Record<TabId, string> = {
    today: m.tabs.today,
    readings: m.tabs.readings,
    prayers: m.prayers.title,
    settings: m.settings.title,
  };

  return (
    <View
      pointerEvents="box-none"
      style={[styles.wrap, { bottom, left: TAB_BAR_SIDE, right: TAB_BAR_SIDE }]}
    >
      <View
        style={[
          styles.bar,
          {
            backgroundColor: theme.surface,
            borderColor: theme.line,
            // On dark the hairline and the surface step carry the depth; no shadow.
            shadowOpacity: theme.dark ? 0 : 0.08,
            elevation: theme.dark ? 0 : 3,
          },
        ]}
      >
        {TABS.map((id) => {
          const active = pathname === `/${id}` || pathname.startsWith(`/${id}/`);
          return (
            <Pressable
              key={id}
              onPress={() => router.navigate(`/${id}`)}
              style={styles.item}
              focusable={false}
              accessibilityRole="tab"
              accessibilityLabel={labels[id]}
              accessibilityState={{ selected: active }}
            >
              <View style={[styles.selection, active && { backgroundColor: theme.pill }]}>
                <Text
                  numberOfLines={1}
                  maxFontSizeMultiplier={1.3}
                  adjustsFontSizeToFit
                  style={[
                    styles.label,
                    { color: active ? theme.accent : theme.muted },
                    active && styles.labelActive,
                  ]}
                >
                  {labels[id]}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute' },
  bar: {
    height: TAB_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: TAB_BAR_INSET,
    borderRadius: TAB_BAR_RADIUS,
    borderWidth: 1,
    shadowColor: '#000',
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  item: { flex: 1, height: '100%', justifyContent: 'center' },
  selection: {
    height: TAB_BAR_HEIGHT - TAB_BAR_INSET * 2,
    // Nested radius: the bar's radius minus the inset between them.
    borderRadius: TAB_BAR_RADIUS - TAB_BAR_INSET,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  label: { ...type.label, fontWeight: '500' },
  labelActive: { fontWeight: '600' },
});
