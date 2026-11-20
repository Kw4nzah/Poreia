// Release notes per version, newest first; the installed version is highlighted.

import * as Application from 'expo-application';
import { StyleSheet, Text, View } from 'react-native';
import { isInstalledVersion, releaseNotesFor } from '../../releaseNotes';
import { compareVersions } from '../../updates/apkRelease';
import { useSettings } from '../../settings/SettingsProvider';
import { Badge, Card } from '../../ui/kit';
import { SERIF, Theme, space, type, useThemedStyles } from '../../ui/theme';

export function WhatsNew() {
  const { settings, messages: m } = useSettings();
  const styles = useThemedStyles(makeStyles);
  const installed = Application.nativeApplicationVersion;

  return (
    <View style={styles.list}>
      <Text style={styles.heading} accessibilityRole="header">
        {m.support.whatsNewTitle}
      </Text>
      {releaseNotesFor(settings.language).map(({ version, notes }) => {
        const current = isInstalledVersion(version, installed);
        // Newer than the installed app, yet in this list: it arrived as an over-the-air update.
        const delivered = !!installed && compareVersions(version, installed) > 0;
        return (
          <Card key={version} padding="md" tone={current ? 'feast' : 'surface'} style={styles.card}>
            <View style={styles.header}>
              <Text style={styles.version} accessibilityRole="header">
                {m.settings.version(version)}
              </Text>
              {current && <Badge label={m.support.whatsNewInstalled} tone="feast" />}
              {delivered && <Badge label={m.support.whatsNewDelivered} tone="neutral" />}
            </View>
            {notes.map((note, index) => (
              <View key={index} style={styles.note}>
                <Text style={styles.bullet} importantForAccessibility="no">
                  •
                </Text>
                <Text style={styles.noteText}>{note}</Text>
              </View>
            ))}
          </Card>
        );
      })}
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    list: { marginTop: space.xl },
    heading: { fontFamily: SERIF, ...type.title3, color: t.ink },
    card: { marginTop: space.md },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: space.sm,
      marginBottom: space.xs,
    },
    version: { ...type.bodyLarge, fontWeight: '600', color: t.ink },
    note: { flexDirection: 'row', gap: space.sm, marginTop: space.sm },
    bullet: { ...type.body, color: t.muted, width: 12 },
    noteText: { ...type.body, color: t.ink, flex: 1 },
  });
}
