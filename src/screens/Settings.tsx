// Settings hub: a list of categories, each with a one-line summary. A category opens its own
// screen (/settings/<id>) with just its controls.

import * as Application from 'expo-application';
import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MESSAGES } from '../i18n';
import { useSettings } from '../settings/SettingsProvider';
import { Card, ListRow } from '../ui/kit';
import { useScrollTop } from '../ui/scrollTop';
import { useTabBarSpace } from '../ui/tabBar';
import { SERIF, Theme, space, type, useThemedStyles } from '../ui/theme';
import { useApkUpdate } from '../updates/useApkUpdate';
import { SectionId, hourLabel, sectionTitle } from './settings/sections';

/** The hub's two groups: what the user sets about themselves, then the app itself. */
const GROUPS: readonly (readonly SectionId[])[] = [
  ['profile', 'language', 'notifications', 'saints', 'history'],
  ['backup', 'updates', 'deviceCheck', 'about'],
];

export function Settings() {
  const { settings, messages: m } = useSettings();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const tabSpace = useTabBarSpace();
  const scrollProps = useScrollTop('settings');
  const styles = useThemedStyles(makeStyles);
  const apk = useApkUpdate();

  function summary(id: SectionId): string {
    switch (id) {
      case 'profile': {
        const church = m.church[settings.churchId].name;
        return settings.name ? `${settings.name} · ${church}` : church;
      }
      case 'language':
        return MESSAGES[settings.language].languageName;
      case 'notifications':
        return settings.notifications
          ? m.settings.summaryNotificationsOn(hourLabel(settings.notificationHour))
          : m.settings.summaryNotificationsOff;
      case 'saints':
        return settings.saints.length > 0
          ? m.settings.summarySaints(settings.saints.length)
          : m.settings.summarySaintsNone;
      case 'history':
        return m.report.summary;
      case 'backup':
        return m.settings.summaryBackup;
      case 'updates': {
        const version = m.settings.version(Application.nativeApplicationVersion ?? '–');
        return apk.release
          ? `${version} · ${m.settings.apkAvailable(apk.release.version)}`
          : version;
      }
      case 'deviceCheck':
        return m.deviceCheck.summaryRow;
      case 'about':
        return m.settings.summaryAbout;
    }
  }

  return (
    <ScrollView
      {...scrollProps}
      style={styles.screen}
      contentContainerStyle={{
        paddingTop: insets.top + space.lg,
        paddingBottom: tabSpace,
        paddingHorizontal: space.lg,
      }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title} accessibilityRole="header" maxFontSizeMultiplier={1.4}>
        {m.settings.title}
      </Text>

      {GROUPS.map((group) => (
        <Card key={group[0]} padding="none" style={styles.group}>
          {group.map((id, index) => (
            <ListRow
              key={id}
              title={sectionTitle(m, id)}
              subtitle={summary(id)}
              divider={index > 0}
              onPress={() => router.push(`/settings/${id}`)}
            />
          ))}
        </Card>
      ))}
    </ScrollView>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.background },
    title: { fontFamily: SERIF, ...type.title1, color: t.ink },
    group: { marginTop: space.lg },
  });
}
