// Countdown to the next feasts and fasts.

import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CHURCHES, getUpcomingEvents, gregorianToJdn, weekdayOfJdn } from '../calendar';
import { formatDate } from '../i18n';
import { useSettings } from '../settings/SettingsProvider';
import { Card, ListRow } from '../ui/kit';
import { SERIF, Theme, space, type, useThemedStyles } from '../ui/theme';
import { useToday } from '../ui/useToday';

export function Upcoming() {
  const { settings, messages: m } = useSettings();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useThemedStyles(makeStyles);
  const today = useToday();

  const events = getUpcomingEvents(today, CHURCHES[settings.churchId]);

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + space.lg }]}>
        <Pressable
          onPress={() => (router.canGoBack() ? router.back() : router.replace('/today'))}
          style={styles.back}
          accessibilityRole="button"
          accessibilityLabel={m.upcoming.back}
        >
          <Text style={styles.backText}>‹ {m.upcoming.back}</Text>
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
        <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={1.4}>
          {m.upcoming.title}
        </Text>
        <Text style={styles.hint}>{m.upcoming.hint}</Text>

        <Card padding="none" style={styles.list}>
          {events.map((event, index) => {
            const name = event.kind === 'feast' ? m.feast[event.id] : m.majorFast[event.id];
            const kind = event.kind === 'feast' ? m.upcoming.kindFeast : m.upcoming.kindFast;
            const when = m.upcoming.inDays(event.daysUntil);
            const weekday =
              m.weekdays[
                weekdayOfJdn(gregorianToJdn(event.date.year, event.date.month, event.date.day))
              ];
            const date = `${weekday}, ${formatDate(m, event.date)}`;
            return (
              <ListRow
                key={`${event.kind}-${event.id}-${event.daysUntil}`}
                divider={index > 0}
                serif
                overline={kind}
                title={name}
                subtitle={date}
                accessibilityLabel={`${kind}: ${name}, ${when}, ${date}`}
                trailing={<Text style={styles.when}>{when}</Text>}
              />
            );
          })}
        </Card>

        <Text style={styles.disclaimer}>{m.today.disclaimer}</Text>
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
    hint: { ...type.label, color: t.muted, marginTop: space.xs },
    list: { marginTop: space.md },
    when: {
      ...type.label,
      fontWeight: '600',
      color: t.accent,
      textAlign: 'right',
      flexShrink: 1,
      maxWidth: 120,
    },
    disclaimer: { ...type.caption, color: t.muted, marginTop: space.lg },
  });
}
