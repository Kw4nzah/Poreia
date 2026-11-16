// Small, quiet motion built on React Native's own Animated (no extra native module, so it
// ships as a plain update). Everything is skipped when the system asks to reduce motion.

import { ReactNode, useEffect, useRef, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Pressable,
  PressableProps,
  StyleProp,
  ViewStyle,
} from 'react-native';

/** True while the system "remove animations" / "reduce motion" setting is on. */
export function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => alive && setReduce(value))
      .catch(() => {});
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => {
      alive = false;
      subscription.remove();
    };
  }, []);
  return reduce;
}

const EASE_OUT = Easing.out(Easing.cubic);

/** Fades in and rises a few points when first shown. `index` staggers a list a little. */
export function FadeIn({
  index = 0,
  children,
  style,
}: {
  index?: number;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const reduce = useReduceMotion();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduce) {
      progress.setValue(1);
      return;
    }
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 340,
      delay: Math.min(index, 6) * 60,
      easing: EASE_OUT,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [progress, reduce, index]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/** A card-sized Pressable that sinks a little under the finger. */
export function PressCard({
  style,
  children,
  onPressIn,
  onPressOut,
  ...rest
}: Omit<PressableProps, 'style' | 'children'> & {
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
}) {
  const reduce = useReduceMotion();
  const scale = useRef(new Animated.Value(1)).current;

  function to(value: number) {
    if (reduce) return;
    Animated.timing(scale, {
      toValue: value,
      duration: 120,
      easing: EASE_OUT,
      useNativeDriver: true,
    }).start();
  }

  return (
    <Pressable
      {...rest}
      onPressIn={(event) => {
        to(0.98);
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        to(1);
        onPressOut?.(event);
      }}
    >
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </Pressable>
  );
}

/** Width in percent that eases from 0 to `percent` the first time it is shown. */
export function useGrow(percent: number): Animated.AnimatedInterpolation<string> {
  const reduce = useReduceMotion();
  const value = useRef(new Animated.Value(reduce ? percent : 0)).current;

  useEffect(() => {
    if (reduce) {
      value.setValue(percent);
      return;
    }
    const animation = Animated.timing(value, {
      toValue: percent,
      duration: 700,
      delay: 200,
      easing: EASE_OUT,
      useNativeDriver: false, // width is a layout property
    });
    animation.start();
    return () => animation.stop();
  }, [value, percent, reduce]);

  return value.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });
}
