// Fasting history: one row per fast that has ended or has marks, most recent first. A row opens
// that fast's report.

import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text } from 'react-native';
import { CHURCHES, gregorianToJdn } from '../../calendar';
import { periodKey } from '../../report/periods';
import { listReports } from '../../report/report';
import { reportHeading } from '../../report/text';
import { useReportInputs } from '../../report/useReportInputs';
import { useSettings } from '../../settings/SettingsProvider';
import { Card, ListRow } from '../../ui/kit';
import { Theme, space, type, useTheme, useThemedStyles } from '../../ui/theme';
import { useToday } from '../../ui/useToday';

export function HistorySection() {
  const { settings, messages: m } = useSettings();
  const router = useRouter();
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);
  const today = useToday();
  const { done, loaded } = useReportInputs();

  const todayJdn = gregorianToJdn(today.year, today.month, today.day);
  const reports = useMemo(
    () =>
      listReports(done, CHURCHES[settings.churchId], todayJdn, { greekFish: settings.greekFish }),
    [done, settings.churchId, settings.greekFish, todayJdn],
  );

  // The done days are still being read: a quiet spinner instead of an empty screen.
  if (!loaded) return <ActivityIndicator color={theme.accent} style={styles.loading} />;
  if (reports.length === 0) return <Text style={styles.empty}>{m.report.empty}</Text>;

  return (
    <Card padding="none" style={styles.list}>
      {reports.map((report, index) => (
        <ListRow
          key={periodKey(report.period)}
          serif
          divider={index > 0}
          title={reportHeading(report, m)}
          subtitle={
            report.ended
              ? m.report.count(report.markedDays, report.fastingDays)
              : `${m.report.count(report.markedDays, report.fastingDays)} · ${m.report.inProgress}`
          }
          onPress={() => router.push(`/report/${periodKey(report.period)}`)}
        />
      ))}
    </Card>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    list: { marginTop: space.lg },
    loading: { marginTop: space.xl },
    empty: { ...type.body, color: t.muted, marginTop: space.lg },
  });
}
