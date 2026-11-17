// Geometry of the floating tab bar, shared by the bar and by the screens that scroll under it.

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { space } from './theme';

export const TAB_BAR_HEIGHT = 60;
export const TAB_BAR_MARGIN = 12;

/** Distance from the bottom of the screen to the bottom edge of the bar. */
export function useTabBarBottom(): number {
  return useSafeAreaInsets().bottom + TAB_BAR_MARGIN / 2;
}

/** Bottom padding a scrolling tab screen needs so its last line clears the bar. */
export function useTabBarSpace(): number {
  return useTabBarBottom() + TAB_BAR_HEIGHT + space.lg;
}
