// Sources and licences of the texts shown in the app.

import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '../settings/SettingsProvider';
import { SERIF, Theme, space, type, useThemedStyles } from '../ui/theme';
import { BackLabel } from '../ui/BackLabel';

export function Sources() {
  const { messages: m } = useSettings();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useThemedStyles(makeStyles);

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + space.lg }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel={m.settings.title}
        >
          <BackLabel label={m.settings.title} />
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
        <Text style={styles.title} accessibilityRole="header">
          {m.sources.title}
        </Text>
        {m.sources.sections.map((section) => (
          <View key={section.heading}>
            <Text style={styles.heading} accessibilityRole="header">
              {section.heading}
            </Text>
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
    title: { fontFamily: SERIF, ...type.title1, color: t.ink },
    heading: { ...type.label, color: t.muted, marginTop: space.lg },
    body: { ...type.body, color: t.ink, marginTop: space.xs },
  });
}
