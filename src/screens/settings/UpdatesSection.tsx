// App version, bundle update check and the APK update with its download popup.

import * as Application from 'expo-application';
import * as Updates from 'expo-updates';
import { StyleSheet, Text, View } from 'react-native';
import {
  RELEASE_NOTES,
  notesForVersion,
  releaseNotesFor,
  isInstalledVersion,
} from '../../releaseNotes';
import { useSettings } from '../../settings/SettingsProvider';
import { Button, Card } from '../../ui/kit';
import { Theme, space, type, useThemedStyles } from '../../ui/theme';
import { describeContent } from '../../updates/contentVersion';
import { useApkUpdate } from '../../updates/useApkUpdate';
import { useUpdateCheck } from '../../updates/useUpdateCheck';
import { ApkDownloadModal } from './ApkDownloadModal';

export function UpdatesSection() {
  const { settings, messages: m } = useSettings();
  const styles = useThemedStyles(makeStyles);
  const updates = useUpdateCheck();
  const apk = useApkUpdate();
  const installed = Application.nativeApplicationVersion;
  // The bundle may already carry the notes of a release whose APK is not installed yet.
  const comingNotes = apk.release ? notesForVersion(settings.language, apk.release.version) : null;
  const installedNotes =
    releaseNotesFor(settings.language).find((entry) =>
      isInstalledVersion(entry.version, installed),
    ) ?? null;
  const contentLine = describeContent(m, Updates.isEmbeddedLaunch, Updates.createdAt);

  return (
    <Card padding="md" style={styles.card}>
      <Text style={styles.cardText}>
        {m.settings.version(Application.nativeApplicationVersion ?? '–')}
      </Text>
      <Text style={styles.cardText}>{m.settings.contentVersion(RELEASE_NOTES[0].version)}</Text>
      <Text style={styles.cardText}>{contentLine}</Text>
      {updates.status !== 'idle' && (
        <Text
          accessibilityLiveRegion="polite"
          style={[styles.status, updates.status === 'failed' && styles.error]}
        >
          {m.updates[updates.status]}
        </Text>
      )}
      <Button
        label={m.updates.check}
        onPress={updates.check}
        variant="secondary"
        loading={updates.busy}
        style={styles.buttonGap}
      />

      {apk.release && (
        <View style={styles.apk}>
          <Text style={styles.cardText}>{m.settings.apkAvailable(apk.release.version)}</Text>
          {comingNotes && (
            <NoteList title={m.support.whatsNewComing(apk.release.version)} notes={comingNotes} />
          )}
          <Button
            label={m.settings.apkInstall(Math.round(apk.release.sizeBytes / 1_000_000))}
            onPress={() => void apk.install()}
            loading={apk.status === 'downloading'}
            style={styles.buttonGap}
          />
        </View>
      )}
      {installedNotes && (
        <View style={styles.apk}>
          <NoteList
            title={m.support.whatsNewIn(installedNotes.version)}
            notes={installedNotes.notes}
          />
        </View>
      )}
      <ApkDownloadModal apk={apk} />
    </Card>
  );
}

function NoteList({ title, notes }: { title: string; notes: readonly string[] }) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.notes}>
      <Text style={styles.notesTitle} accessibilityRole="header">
        {title}
      </Text>
      {notes.map((note, index) => (
        <View key={index} style={styles.note}>
          <Text style={styles.bullet} importantForAccessibility="no">
            •
          </Text>
          <Text style={styles.noteText}>{note}</Text>
        </View>
      ))}
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    card: { marginTop: space.lg },
    cardText: { ...type.body, color: t.ink },
    status: { ...type.label, color: t.muted, marginTop: space.xs },
    error: { color: t.danger },
    buttonGap: { marginTop: space.smd },
    notes: { marginTop: space.sm },
    notesTitle: { ...type.label, fontWeight: '600', color: t.ink },
    note: { flexDirection: 'row', gap: space.sm, marginTop: space.xs },
    bullet: { ...type.body, color: t.muted, width: 12 },
    noteText: { ...type.body, color: t.ink, flex: 1 },
    apk: { marginTop: space.md, paddingTop: space.md, borderTopWidth: 1, borderTopColor: t.line },
  });
}
