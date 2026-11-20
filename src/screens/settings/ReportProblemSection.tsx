// Report a problem: the user writes what happened, "Send" opens a ready GitHub issue with those
// words and a few technical details. Nothing is sent by the app itself; the person presses
// "Submit" on GitHub. The words stay on screen until the link is opened.

import * as Application from 'expo-application';
import * as Updates from 'expo-updates';
import { useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { openExternalUrl } from '../../security/openExternal';
import { useSettings } from '../../settings/SettingsProvider';
import { buildBugReportUrl, ReportInfo, ReportTexts } from '../../support/reportIssue';
import { AppTextInput } from '../../ui/AppTextInput';
import { Button, SegmentedControl } from '../../ui/kit';
import { Theme, space, type, useTheme, useThemedStyles } from '../../ui/theme';

/** Android release and device model from React Native itself (no extra module). */
function deviceInfo(language: string): ReportInfo {
  const constants =
    Platform.OS === 'android'
      ? (Platform.constants as unknown as { Release?: string; Model?: string })
      : {};
  return {
    appVersion: Application.nativeApplicationVersion,
    runtimeVersion: Updates.runtimeVersion,
    androidVersion: constants.Release ? `${constants.Release} (API ${Platform.Version})` : null,
    deviceModel: constants.Model ?? null,
    language,
  };
}

export function ReportProblemSection() {
  const { settings, messages: m } = useSettings();
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);
  const b = m.bugReport;
  const [kind, setKind] = useState(0);
  const [text, setText] = useState('');
  const [steps, setSteps] = useState('');
  const [problem, setProblem] = useState<'needText' | 'tooLong' | 'failed' | null>(null);

  const s = m.support;
  const texts: ReportTexts = {
    title: s.reportTitle,
    what: b.issueWhat,
    write: s.reportWrite,
    details: s.reportDetails,
    app: s.reportApp,
    runtime: s.reportRuntime,
    android: s.reportAndroid,
    device: s.reportDevice,
    language: s.reportLanguage,
    steps: b.issueSteps,
    kind: b.issueKind,
  };
  const info = deviceInfo(settings.language);
  const url = buildBugReportUrl(info, texts, { kind: b.kinds[kind], text, steps });
  const tooLong = text.trim() !== '' && url === null;

  async function send() {
    if (text.trim() === '') return setProblem('needText');
    if (url === null) return setProblem('tooLong');
    setProblem((await openExternalUrl(url)) ? null : 'failed');
  }

  return (
    <View>
      <Text style={styles.intro}>{b.intro}</Text>

      <Text style={styles.label}>{b.kindLabel}</Text>
      <SegmentedControl
        accessibilityLabel={b.kindLabel}
        options={b.kinds.map((label, index) => ({ value: String(index), label }))}
        value={String(kind)}
        onChange={(value) => setKind(Number(value))}
      />

      <Text style={styles.label}>{b.whatLabel}</Text>
      <AppTextInput
        value={text}
        onChangeText={(value) => {
          setText(value);
          setProblem(null);
        }}
        placeholder={b.whatPlaceholder}
        placeholderTextColor={theme.muted}
        multiline
        numberOfLines={5}
        textAlignVertical="top"
        accessibilityLabel={b.whatLabel}
        style={styles.input}
      />

      <Text style={styles.label}>{b.stepsLabel}</Text>
      <AppTextInput
        value={steps}
        onChangeText={(value) => {
          setSteps(value);
          setProblem(null);
        }}
        multiline
        numberOfLines={3}
        textAlignVertical="top"
        accessibilityLabel={b.stepsLabel}
        style={styles.input}
      />

      {(problem !== null || tooLong) && (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {problem === 'needText' ? b.needText : problem === 'failed' ? b.failed : b.tooLong}
        </Text>
      )}
      <Button
        label={b.send}
        onPress={() => void send()}
        disabled={tooLong}
        accessibilityRole="link"
        style={styles.send}
      />
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    intro: { ...type.body, color: t.muted, marginTop: space.sm },
    label: { ...type.label, color: t.muted, marginTop: space.lg, marginBottom: space.xs },
    input: {
      ...type.body,
      color: t.ink,
      minHeight: 96,
      borderWidth: 1,
      borderColor: t.outline,
      borderRadius: 12,
      padding: space.smd,
      backgroundColor: t.surface,
    },
    error: { ...type.body, color: t.danger, marginTop: space.md },
    send: { marginTop: space.lg },
  });
}
