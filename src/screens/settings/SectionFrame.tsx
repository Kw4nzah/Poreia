// Shared frame of one settings category: back link to the hub, serif title, scrolling content.

import { useRouter } from 'expo-router';
import { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '../../settings/SettingsProvider';
import { SERIF, Theme, space, type, useThemedStyles } from '../../ui/theme';
import { useKeyboardHeight } from '../../ui/useKeyboardHeight';

export function SectionFrame({ title, children }: { title: string; children: ReactNode }) {
  const { messages: m } = useSettings();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useThemedStyles(makeStyles);
  const keyboard = useKeyboardHeight();

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + space.lg }]}>
        <Pressable
          // Opened by a link with nothing behind it: go to the hub instead of doing nothing.
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/settings'))}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel={m.settings.title}
        >
          <Text style={styles.backText}>‹ {m.settings.title}</Text>
        </Pressable>
      </View>
      <ScrollView
        contentContainerStyle={{
          paddingTop: space.sm,
          // Room for the keyboard, so the name, saint and backup fields can scroll above it.
          paddingBottom: insets.bottom + space.xl + keyboard,
          paddingHorizontal: space.lg,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={1.4}>
          {title}
        </Text>
        {children}
      </ScrollView>
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.background },
    header: { paddingHorizontal: space.lg },
    back: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
    backText: { ...type.body, color: t.accent },
    title: { fontFamily: SERIF, ...type.title1, color: t.ink },
  });
}
