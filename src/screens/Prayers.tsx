// The list of prayers, grouped.

import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PRAYER_GROUPS } from '../prayers';
import { useSettings } from '../settings/SettingsProvider';
import { FadeIn } from '../ui/motion';
import { useTabBarSpace } from '../ui/tabBar';
import { SERIF, Theme, radius, space, useTheme, type } from '../ui/theme';

export function Prayers() {
  const { messages: m } = useSettings();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const tabSpace = useTabBarSpace();
  const styles = makeStyles(theme);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{
        paddingTop: insets.top + space.lg,
        paddingBottom: tabSpace,
        paddingHorizontal: space.lg,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>{m.prayers.title}</Text>

      {PRAYER_GROUPS.map((group, groupIndex) => (
        <FadeIn key={group.id} index={groupIndex}>
          <Text style={styles.label}>{m.prayers.group[group.id]}</Text>
          <View style={styles.card}>
            {group.prayers.map((id, index) => (
              <Pressable
                key={id}
                onPress={() => router.push({ pathname: '/prayer/[id]', params: { id } })}
                style={({ pressed }) => [
                  styles.row,
                  index > 0 && styles.rowDivider,
                  pressed && styles.rowPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={m.prayers.text[id].title}
              >
                <Text style={styles.rowText}>{m.prayers.text[id].title}</Text>
                <Text style={styles.chevron}>›</Text>
              </Pressable>
            ))}
          </View>
        </FadeIn>
      ))}
    </ScrollView>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.background },
    title: { fontFamily: SERIF, ...type.title1, color: t.ink },
    label: { ...type.label, color: t.muted, marginTop: space.lg, marginBottom: space.sm },
    card: {
      borderRadius: radius.card,
      borderWidth: 1,
      borderColor: t.line,
      backgroundColor: t.surface,
      overflow: 'hidden',
    },
    row: {
      minHeight: 56,
      paddingHorizontal: space.lg,
      paddingVertical: space.smd,
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.smd,
    },
    rowDivider: { borderTopWidth: 1, borderTopColor: t.line },
    rowPressed: { backgroundColor: t.background },
    rowText: { flex: 1, fontFamily: SERIF, ...type.headline, color: t.ink },
    chevron: { ...type.title3, color: t.muted },
  });
}
