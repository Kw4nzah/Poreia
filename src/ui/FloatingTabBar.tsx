// The bottom bar: a floating raised surface with a hairline edge. It is drawn by us (the
// navigator's own bar is switched off) so that its layout is exact.

import { usePathname, useRouter } from 'expo-router';
import { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSettings } from '../settings/SettingsProvider';
import {
  TAB_BAR_HEIGHT,
  TAB_BAR_INSET,
  TAB_BAR_RADIUS,
  TAB_BAR_SIDE,
  useTabBarBottom,
} from './tabBar';
import { DOUBLE_TAP_MS, TAB_IDS as TABS, TabId, scrollTabToTop } from './scrollTop';
import { useTheme, type } from './theme';

export function TabBar() {
  const { messages: m } = useSettings();
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const bottom = useTabBarBottom();
  const lastTap = useRef({ id: '', at: 0 });

  // A second tap on the tab you are already on scrolls that page to the top.
  function onTabPress(id: TabId, active: boolean) {
    const now = Date.now();
    const double = lastTap.current.id === id && now - lastTap.current.at < DOUBLE_TAP_MS;
    lastTap.current = { id, at: now };
    if (active && pathname === `/${id}`) {
      if (double) scrollTabToTop(id);
      return;
    }
    router.navigate(`/${id}`);
  }

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
        accessibilityRole="tablist"
      >
        {TABS.map((id) => {
          const active = pathname === `/${id}` || pathname.startsWith(`/${id}/`);
          return (
            <Pressable
              key={id}
              onPress={() => onTabPress(id, active)}
              style={styles.item}
              focusable={false}
              accessibilityRole="tab"
              accessibilityLabel={labels[id]}
              accessibilityState={{ selected: active }}
            >
              <View style={styles.selection} collapsable={false}>
                {/* The fill is its own rounded layer, clipped by the selection: a translucent
                    background on the same view is drawn square on some Android devices. */}
                {active && (
                  <View
                    style={[StyleSheet.absoluteFill, styles.fill, { backgroundColor: theme.pill }]}
                  />
                )}
                <Text
                  numberOfLines={1}
                  maxFontSizeMultiplier={1.3}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}
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
    // Narrow: "Настройки" has to fit a quarter of a 320dp bar.
    paddingHorizontal: 2,
    overflow: 'hidden',
  },
  fill: { borderRadius: TAB_BAR_RADIUS - TAB_BAR_INSET },
  label: { ...type.label, fontWeight: '500' },
  labelActive: { fontWeight: '600' },
});
