// "Back to top" for the four tab screens: double-tapping the active tab and a floating button that
// appears once the page is scrolled far down. Each tab screen spreads `useScrollTop(id)` on its
// ScrollView; the tab bar and the button talk to it through a tiny store, not through renders.

import { usePathname } from 'expo-router';
import { useCallback, useEffect, useRef, useSyncExternalStore } from 'react';
import type { ComponentRef } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSettings } from '../settings/SettingsProvider';
import { TAB_BAR_HEIGHT, TAB_BAR_SIDE, useTabBarBottom } from './tabBar';
import { useTheme } from './theme';

export const TAB_IDS = ['today', 'readings', 'prayers', 'settings'] as const;
export type TabId = (typeof TAB_IDS)[number];

/** How far down (dp) the page must be scrolled before the button shows. */
export const SHOW_AFTER = 480;
/** Two taps on the active tab within this many ms count as a double tap. */
export const DOUBLE_TAP_MS = 320;

const scrollers: Partial<Record<TabId, () => void>> = {};
const far: Record<TabId, boolean> = {
  today: false,
  readings: false,
  prayers: false,
  settings: false,
};
const listeners = new Set<() => void>();

function setFar(id: TabId, value: boolean) {
  if (far[id] === value) return;
  far[id] = value;
  listeners.forEach((listener) => listener());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

export function scrollTabToTop(id: TabId) {
  scrollers[id]?.();
}

/** Props for a tab screen's ScrollView. */
export function useScrollTop(id: TabId) {
  const ref = useRef<ComponentRef<typeof ScrollView>>(null);
  useEffect(() => {
    // The platform's own animated scroll: eased and quick, however far the page is scrolled.
    scrollers[id] = () => ref.current?.scrollTo({ y: 0, animated: true });
    return () => {
      delete scrollers[id];
      setFar(id, false);
    };
  }, [id]);
  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) =>
      setFar(id, event.nativeEvent.contentOffset.y > SHOW_AFTER),
    [id],
  );
  return { ref, onScroll, scrollEventThrottle: 32 };
}

/** The active tab, or null on a page above the tabs (a settings section, a reading...). */
function activeTab(pathname: string): TabId | null {
  return TAB_IDS.find((id) => pathname === `/${id}`) ?? null;
}

/** Floating "back to top" button, mounted once next to the tab bar. */
export function ScrollTopButton() {
  const { messages: m } = useSettings();
  const theme = useTheme();
  const pathname = usePathname();
  const bottom = useTabBarBottom();
  const id = activeTab(pathname);
  const visible = useSyncExternalStore(
    subscribe,
    () => (id ? far[id] : false),
    () => false,
  );

  const shown = useRef(new Animated.Value(0)).current;
  const reduce = useRef(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        reduce.current = value;
      })
      .catch(() => {});
  }, []);
  useEffect(() => {
    Animated.timing(shown, {
      toValue: visible ? 1 : 0,
      duration: reduce.current ? 0 : visible ? 260 : 180,
      easing: visible ? Easing.out(Easing.cubic) : Easing.in(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [visible, shown]);

  return (
    <Animated.View
      pointerEvents={visible ? 'box-none' : 'none'}
      // Invisible means invisible to TalkBack too: no phantom "Back to top" stop while it is hidden.
      accessibilityElementsHidden={!visible}
      importantForAccessibility={visible ? 'auto' : 'no-hide-descendants'}
      style={[
        styles.wrap,
        {
          bottom: bottom + TAB_BAR_HEIGHT + 12,
          right: TAB_BAR_SIDE,
          opacity: shown,
          transform: [
            { translateY: shown.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
            { scale: shown.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }) },
          ],
        },
      ]}
    >
      <Pressable
        onPress={() => id && scrollTabToTop(id)}
        accessibilityRole="button"
        accessibilityLabel={m.tabs.scrollTop}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: theme.surface,
            borderColor: theme.glassEdge,
            shadowOpacity: theme.dark ? 0.5 : 0.18,
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <View style={[styles.chevron, { borderColor: theme.accent }]} />
      </Pressable>
    </Animated.View>
  );
}

const SIZE = 48;

const styles = StyleSheet.create({
  wrap: { position: 'absolute' },
  button: {
    width: SIZE,
    height: SIZE,
    borderRadius: SIZE / 2,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  // An up chevron: two borders of a square, turned 45 degrees.
  chevron: {
    width: 12,
    height: 12,
    borderTopWidth: 2.5,
    borderLeftWidth: 2.5,
    borderRadius: 1.5,
    marginTop: 4,
    transform: [{ rotate: '45deg' }],
  },
});
