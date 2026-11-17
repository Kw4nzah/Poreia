// The bottom bar: a floating, rounded "glass" pill that blurs what scrolls under it.
// It is drawn by us (the navigator's own bar is switched off) so that its layout is exact.

import { BlurTargetView, BlurView } from 'expo-blur';
import { usePathname, useRouter } from 'expo-router';
import type { ComponentRef, RefObject } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSettings } from '../settings/SettingsProvider';
import { TAB_BAR_HEIGHT, TAB_BAR_SIDE, useTabBarBottom } from './tabBar';
import { useTheme } from './theme';

const PILL_RADIUS = (TAB_BAR_HEIGHT - 16) / 2;
const TABS = ['today', 'readings', 'prayers', 'settings'] as const;
type TabId = (typeof TABS)[number];

export function GlassTabBar({
  targetRef,
}: {
  targetRef: RefObject<ComponentRef<typeof BlurTargetView> | null>;
}) {
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
            borderColor: theme.glassEdge,
            shadowOpacity: theme.dark ? 0.5 : 0.16,
          },
        ]}
      >
        <BlurView
          blurTarget={targetRef}
          blurMethod="dimezisBlurView"
          intensity={80}
          tint={theme.dark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
        {/* Keeps the labels readable whatever is behind, and is the whole look if blur is off. */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: theme.glass }]} />
        <View style={styles.row}>
          {TABS.map((id) => {
            const active = pathname === `/${id}` || pathname.startsWith(`/${id}/`);
            return (
              <Pressable
                key={id}
                onPress={() => router.navigate(`/${id}`)}
                style={styles.item}
                focusable={false}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <View style={styles.pill} collapsable={false}>
                  {/* The fill is its own rounded layer, clipped by the pill, so it can never show square. */}
                  {active && (
                    <View
                      style={[
                        StyleSheet.absoluteFill,
                        styles.fill,
                        { backgroundColor: theme.pill },
                      ]}
                    />
                  )}
                  <Text
                    numberOfLines={1}
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute' },
  bar: {
    height: TAB_BAR_HEIGHT,
    borderRadius: TAB_BAR_HEIGHT / 2,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  row: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6 },
  item: { flex: 1, height: '100%', justifyContent: 'center' },
  pill: {
    height: TAB_BAR_HEIGHT - 16,
    borderRadius: PILL_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    overflow: 'hidden',
  },
  fill: { borderRadius: PILL_RADIUS },
  label: { fontSize: 14, fontWeight: '500' },
  labelActive: { fontWeight: '700' },
});
