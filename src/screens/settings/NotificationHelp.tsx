// "Notifications not arriving?": what the phone reports, the usual fixes, a shortcut to the app's
// system settings and a test notification. Nothing here changes a setting.

import { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';
import { readDiagnostics, sendTestNotification } from '../../notifications/diagnostics';
import {
  DiagnosticRow,
  Diagnostics,
  UNKNOWN_DIAGNOSTICS,
  describeDiagnostics,
} from '../../notifications/diagnosticsFormat';
import { DAYS_AHEAD } from '../../notifications/schedule';
import { useSettings } from '../../settings/SettingsProvider';
import { Button, Card } from '../../ui/kit';
import { Theme, space, type, useThemedStyles } from '../../ui/theme';

type TestState = 'idle' | 'sending' | 'scheduled' | 'blocked' | 'failed';

export function NotificationHelp() {
  const { messages: m } = useSettings();
  const s = m.support;
  const styles = useThemedStyles(makeStyles);
  const [diagnostics, setDiagnostics] = useState<Diagnostics | null>(null);
  const [checking, setChecking] = useState(false);
  const [test, setTest] = useState<TestState>('idle');
  const mounted = useRef(true);

  const check = useCallback(async () => {
    setChecking(true);
    const result = await readDiagnostics().catch(() => UNKNOWN_DIAGNOSTICS);
    if (!mounted.current) return;
    setDiagnostics(result);
    setChecking(false);
  }, []);

  useEffect(() => {
    mounted.current = true;
    void check();
    return () => {
      mounted.current = false;
    };
  }, [check]);

  async function sendTest() {
    setTest('sending');
    const result = await sendTestNotification(
      m.settings.notificationsChannel,
      s.testTitle,
      s.testBody,
    );
    if (!mounted.current) return;
    setTest(result);
    // The new notification shows up in the scheduled count a moment later.
    void check();
  }

  function openAppSettings() {
    // The app's own page in the system settings (not a web link).
    Linking.openSettings().catch(() => {});
  }

  const rows: DiagnosticRow[] = diagnostics ? describeDiagnostics(diagnostics, m) : [];
  const testMessage =
    test === 'scheduled'
      ? s.testScheduled
      : test === 'blocked'
        ? m.settings.notificationsDenied
        : test === 'failed'
          ? s.testFailed
          : null;
  const steps = [
    s.stepAllow(m.settings.notificationsChannel),
    s.stepBattery,
    s.stepFocus,
    s.stepAutostart,
    s.stepOpenApp(DAYS_AHEAD),
  ];

  return (
    <Card padding="md" style={styles.card}>
      <Text style={styles.title} accessibilityRole="header">
        {s.helpTitle}
      </Text>
      <Text style={styles.text}>{s.helpIntro}</Text>

      <View style={styles.rows}>
        {rows.map((row) => (
          <View
            key={row.id}
            style={styles.row}
            accessible
            accessibilityLabel={`${row.label}: ${row.value}`}
          >
            <Text style={[styles.text, styles.rowLabel]}>{row.label}</Text>
            <Text style={[styles.value, row.tone === 'warning' && styles.warning]}>
              {row.value}
            </Text>
          </View>
        ))}
      </View>
      <Button
        label={checking ? s.helpChecking : s.helpRecheck}
        onPress={() => void check()}
        variant="secondary"
        loading={checking}
        style={styles.buttonGap}
      />

      <View style={styles.group}>
        <Text style={styles.subtitle} accessibilityRole="header">
          {s.stepsTitle}
        </Text>
        {steps.map((step, index) => (
          <View key={index} style={styles.step}>
            <Text style={[styles.text, styles.stepNumber]}>{index + 1}.</Text>
            <Text style={[styles.text, styles.stepText]}>{step}</Text>
          </View>
        ))}
        <Button
          label={s.openSettings}
          onPress={openAppSettings}
          variant="secondary"
          style={styles.buttonGap}
        />
      </View>

      <View style={styles.group}>
        <Button label={s.testButton} onPress={() => void sendTest()} loading={test === 'sending'} />
        {testMessage && (
          <Text
            style={[styles.caption, test !== 'scheduled' && styles.warning]}
            accessibilityLiveRegion="polite"
          >
            {testMessage}
          </Text>
        )}
      </View>
    </Card>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    card: { marginTop: space.lg },
    title: { ...type.headline, color: t.ink },
    subtitle: { ...type.bodyLarge, fontWeight: '600', color: t.ink, marginBottom: space.xs },
    text: { ...type.body, color: t.ink },
    caption: { ...type.label, color: t.muted, marginTop: space.sm },
    warning: { color: t.warning },
    rows: { marginTop: space.md },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 44,
      gap: space.smd,
      borderTopWidth: 1,
      borderTopColor: t.line,
    },
    rowLabel: { flex: 1 },
    value: { ...type.body, fontWeight: '600', color: t.ink, flexShrink: 1, textAlign: 'right' },
    group: { marginTop: space.md, paddingTop: space.md, borderTopWidth: 1, borderTopColor: t.line },
    step: { flexDirection: 'row', gap: space.sm, marginTop: space.sm },
    stepNumber: { width: 24 },
    stepText: { flex: 1 },
    buttonGap: { marginTop: space.smd },
  });
}
