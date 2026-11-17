// Sources and licences of the texts shown in the app.

import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '../settings/SettingsProvider';
import { SERIF, Theme, space, useTheme } from '../ui/theme';

export function Sources() {
  const { messages: m } = useSettings();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = makeStyles(theme);

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + space.lg }]}>
        <Pressable onPress={() => router.back()} style={styles.back}
          accessibilityRole="button"
          accessibilityLabel={m.settings.title}
        >
          <Text style={styles.backText}>‹ {m.settings.title}</Text>
        </Pressable>
      </View>
      <ScrollView
        contentContainerStyle={{
          paddingTop: space.sm,
          paddingBottom: insets.bottom + space.xl,
          paddingHorizontal: space.lg,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>{m.sources.title}</Text>
        {m.sources.sections.map((section) => (
          <View key={section.heading}>
            <Text style={styles.heading}>{section.heading}</Text>
            <Text style={styles.body}>{section.body}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.background },
    header: { paddingHorizontal: space.lg },
    back: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
    backText: { fontSize: 16, color: t.accent },
    title: { fontFamily: SERIF, fontSize: 30, lineHeight: 38, color: t.ink },
    heading: { fontSize: 14, color: t.muted, marginTop: space.lg },
    body: { fontSize: 16, lineHeight: 24, color: t.ink, marginTop: space.xs },
  });
}
