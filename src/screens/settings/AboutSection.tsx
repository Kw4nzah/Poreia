// Sources and licences, the project on GitHub, reporting a problem and the release notes.

import * as Application from 'expo-application';
import { useRouter } from 'expo-router';
import * as Updates from 'expo-updates';
import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { PROJECT_URL } from '../../security/constants';
import { openExternalUrl } from '../../security/openExternal';
import { useSettings } from '../../settings/SettingsProvider';
import { Button } from '../../ui/kit';
import { Theme, space, type, useThemedStyles } from '../../ui/theme';
import { buildReportUrl } from '../../support/reportIssue';
import { WhatsNew } from './WhatsNew';

/** Android release and device model from React Native itself (no extra module). */
function androidDetails(): { androidVersion: string | null; deviceModel: string | null } {
  if (Platform.OS !== 'android') return { androidVersion: null, deviceModel: null };
  const constants = Platform.constants as unknown as { Release?: string; Model?: string };
  return {
    androidVersion: constants.Release ? `${constants.Release} (API ${Platform.Version})` : null,
    deviceModel: constants.Model ?? null,
  };
}

export function AboutSection() {
  const { settings, messages: m } = useSettings();
  const router = useRouter();
  const styles = useThemedStyles(makeStyles);
  const [reportFailed, setReportFailed] = useState(false);

  async function reportProblem() {
    setReportFailed(false);
    const s = m.support;
    const url = buildReportUrl(
      {
        appVersion: Application.nativeApplicationVersion,
        runtimeVersion: Updates.runtimeVersion,
        ...androidDetails(),
        language: settings.language,
      },
      {
        title: s.reportTitle,
        what: s.reportWhat,
        write: s.reportWrite,
        details: s.reportDetails,
        app: s.reportApp,
        runtime: s.reportRuntime,
        android: s.reportAndroid,
        device: s.reportDevice,
        language: s.reportLanguage,
      },
    );
    if (!(await openExternalUrl(url))) setReportFailed(true);
  }

  return (
    <View>
      <View style={styles.column}>
        <Button
          label={m.sources.title}
          onPress={() => router.push('/sources')}
          variant="secondary"
        />
        <Button
          label={m.settings.projectLink}
          onPress={() => void openExternalUrl(PROJECT_URL)}
          variant="secondary"
          accessibilityRole="link"
        />
        <Button
          label={m.support.reportButton}
          onPress={() => void reportProblem()}
          variant="secondary"
          accessibilityRole="link"
        />
      </View>
      <Text style={styles.hint}>{m.support.reportHint}</Text>
      {reportFailed && (
        <Text style={[styles.hint, styles.warning]} accessibilityLiveRegion="polite">
          {m.support.reportFailed}
        </Text>
      )}
      <WhatsNew />
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    column: { gap: space.smd, marginTop: space.lg },
    hint: { ...type.label, color: t.muted, marginTop: space.sm },
    warning: { color: t.warning },
  });
}
