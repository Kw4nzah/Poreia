// App version, bundle update check and the APK update with its download popup.

import * as Application from 'expo-application';
import * as Updates from 'expo-updates';
import { StyleSheet, Text, View } from 'react-native';
import { useSettings } from '../../settings/SettingsProvider';
import { Button, Card } from '../../ui/kit';
import { Theme, space, type, useThemedStyles } from '../../ui/theme';
import { describeContent } from '../../updates/contentVersion';
import { useApkUpdate } from '../../updates/useApkUpdate';
import { useUpdateCheck } from '../../updates/useUpdateCheck';
import { ApkDownloadModal } from './ApkDownloadModal';

export function UpdatesSection() {
  const { messages: m } = useSettings();
  const styles = useThemedStyles(makeStyles);
  const updates = useUpdateCheck();
  const apk = useApkUpdate();
  const contentLine = describeContent(m, Updates.isEmbeddedLaunch, Updates.createdAt);

  return (
    <Card padding="md" style={styles.card}>
      <Text style={styles.cardText}>
        {m.settings.version(Application.nativeApplicationVersion ?? '–')}
      </Text>
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
          <Button
            label={m.settings.apkInstall(Math.round(apk.release.sizeBytes / 1_000_000))}
            onPress={() => void apk.install()}
            loading={apk.status === 'downloading'}
            style={styles.buttonGap}
          />
        </View>
      )}
      <ApkDownloadModal apk={apk} />
    </Card>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    card: { marginTop: space.lg },
    cardText: { ...type.body, color: t.ink },
    status: { ...type.label, color: t.muted, marginTop: space.xs },
    error: { color: t.danger },
    buttonGap: { marginTop: space.smd },
    apk: { marginTop: space.md, paddingTop: space.md, borderTopWidth: 1, borderTopColor: t.line },
  });
}
