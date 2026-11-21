// Countdown to the next feasts and fasts.

import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CHURCHES, getUpcomingEvents, gregorianToJdn, weekdayOfJdn } from '../calendar';
import { formatDate } from '../i18n';
import { useSettings } from '../settings/SettingsProvider';
import { Button, Card, ListRow } from '../ui/kit';
import { exportUpcomingToCalendar } from './exportCalendar';
import { removePhoneCalendar, syncPhoneCalendar } from './phoneCalendar';
import { BackLabel } from '../ui/BackLabel';
import { SERIF, Theme, space, type, useThemedStyles } from '../ui/theme';
import { useToday } from '../ui/useToday';

export function Upcoming() {
  const { settings, messages: m } = useSettings();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const styles = useThemedStyles(makeStyles);
  const today = useToday();

  const [busy, setBusy] = useState(false);

  const run = async (work: () => Promise<string>) => {
    setBusy(true);
    try {
      Alert.alert(await work());
    } finally {
      setBusy(false);
    }
  };
  const syncToPhone = () =>
    run(async () => {
      const result = await syncPhoneCalendar(today, settings.churchId, m);
      if (result.ok) return m.upcoming.phoneSynced(result.count);
      if (result.reason === 'permission') return m.upcoming.phonePermissionDenied;
      return result.reason === 'noCalendar' ? m.upcoming.phoneNoCalendar : m.upcoming.phoneFailed;
    });
  const removeFromPhone = () =>
    run(async () => {
      const result = await removePhoneCalendar();
      if (result.ok) {
        return result.removed ? m.upcoming.phoneRemoved : m.upcoming.phoneNothingToRemove;
      }
      return result.reason === 'permission'
        ? m.upcoming.phonePermissionDenied
        : m.upcoming.phoneFailed;
    });

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
          <BackLabel label={m.upcoming.back} />
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

        <View style={styles.export}>
          <Button
            label={busy ? m.upcoming.phoneSyncing : m.upcoming.addToPhone}
            variant="secondary"
            disabled={busy}
            onPress={() => void syncToPhone()}
          />
          <View style={styles.exportGap} />
          <Button
            label={m.upcoming.removeFromPhone}
            variant="secondary"
            disabled={busy}
            onPress={() => void removeFromPhone()}
          />
          <Text style={styles.exportHint}>{m.upcoming.phoneHint}</Text>
          <View style={styles.exportGap} />
          <Button
            label={m.upcoming.addToCalendar}
            variant="secondary"
            onPress={() =>
              void exportUpcomingToCalendar(today, settings.churchId, m).then((ok) => {
                if (!ok) Alert.alert(m.upcoming.addToCalendarFailed);
              })
            }
          />
          <Text style={styles.exportHint}>{m.upcoming.addToCalendarHint}</Text>
        </View>

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
    export: { marginTop: space.lg },
    exportGap: { height: space.sm },
    exportHint: { ...type.caption, color: t.muted, marginTop: space.sm },
    disclaimer: { ...type.caption, color: t.muted, marginTop: space.lg },
  });
}
