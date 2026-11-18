// Popup shown while the new APK downloads: percentage, bytes, cancel; on failure the error with
// retry and close. It is visible exactly while the update hook is `downloading` or `failed`, so it
// cannot be left on screen.

import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';
import { useSettings } from '../../settings/SettingsProvider';
import { Button, Card } from '../../ui/kit';
import { SERIF, Theme, radius, space, type, useTheme, useThemedStyles } from '../../ui/theme';
import { formatMegabytes } from '../../updates/downloadProgress';
import type { useApkUpdate } from '../../updates/useApkUpdate';

type ApkUpdate = ReturnType<typeof useApkUpdate>;

const SCRIM = '#0000008C';

export function ApkDownloadModal({ apk }: { apk: ApkUpdate }) {
  const { settings, messages: m } = useSettings();
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { release, status, progress } = apk;
  const failed = status === 'failed';
  const visible = release !== null && status !== 'idle';
  const percent = progress?.percent ?? null;
  const title = release ? m.settings.apkModalTitle(release.version) : '';

  const bytes =
    progress === null
      ? ''
      : progress.total === null
        ? m.settings.apkBytesUnknown(formatMegabytes(progress.written, settings.language))
        : m.settings.apkBytes(
            formatMegabytes(progress.written, settings.language),
            formatMegabytes(progress.total, settings.language),
          );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      // The phone's back button cancels a running download or closes the error.
      onRequestClose={failed ? apk.dismiss : apk.cancel}
    >
      <View style={styles.scrim}>
        <Card padding="lg" style={styles.card}>
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>

          {failed ? (
            <>
              <Text accessibilityLiveRegion="assertive" style={styles.error}>
                {m.settings.apkFailed}
              </Text>
              <Button
                label={m.settings.apkRetry}
                onPress={() => void apk.install()}
                style={styles.gap}
              />
              <Button
                label={m.settings.apkClose}
                onPress={apk.dismiss}
                variant="secondary"
                style={styles.gap}
              />
            </>
          ) : (
            <>
              {percent === null ? (
                <ActivityIndicator color={theme.accent} style={styles.spinner} />
              ) : (
                <Text style={styles.percent}>{`${percent}%`}</Text>
              )}
              <View
                style={styles.track}
                accessible
                accessibilityRole="progressbar"
                accessibilityLabel={title}
                accessibilityValue={
                  percent === null ? undefined : { min: 0, max: 100, now: percent }
                }
              >
                <View style={[styles.fill, { width: `${percent === null ? 0 : percent}%` }]} />
              </View>
              <Text style={styles.bytes} accessibilityLiveRegion="polite">
                {bytes}
              </Text>
              <Button
                label={m.settings.apkCancel}
                onPress={apk.cancel}
                variant="secondary"
                style={styles.gap}
              />
            </>
          )}
        </Card>
      </View>
    </Modal>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    scrim: {
      flex: 1,
      backgroundColor: SCRIM,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: space.lg,
    },
    card: { width: '100%', maxWidth: 420 },
    title: { fontFamily: SERIF, ...type.title3, color: t.ink },
    percent: { ...type.hero, color: t.ink, marginTop: space.md, textAlign: 'center' },
    spinner: { marginTop: space.md, minHeight: 44 },
    track: {
      height: 8,
      borderRadius: radius.pill,
      backgroundColor: t.line,
      overflow: 'hidden',
      marginTop: space.md,
    },
    fill: { height: 8, borderRadius: radius.pill, backgroundColor: t.accent },
    bytes: {
      ...type.label,
      color: t.muted,
      marginTop: space.sm,
      textAlign: 'center',
      minHeight: 20,
    },
    error: { ...type.body, color: t.danger, marginTop: space.md },
    gap: { marginTop: space.md },
  });
}
