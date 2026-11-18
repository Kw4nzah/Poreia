// Small card on the Today screen: streak, progress of the current fast and the year's total.

import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Card } from '../ui/kit';
import { SERIF, Theme, space, type, useThemedStyles } from '../ui/theme';
import { useSettings } from '../settings/SettingsProvider';
import type { LogStats } from './log';

interface StatProps {
  value: string;
  caption: string;
  /** What a screen reader says for the whole cell. */
  spoken: string;
}

function Stat({ value, caption, spoken }: StatProps) {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.stat} accessible accessibilityLabel={`${caption}: ${spoken}`}>
      <Text style={styles.value} maxFontSizeMultiplier={1.4}>
        {value}
      </Text>
      <Text style={styles.caption}>{caption}</Text>
    </View>
  );
}

export function FastingStatsCard({
  stats,
  style,
}: {
  stats: LogStats;
  style?: StyleProp<ViewStyle>;
}) {
  const { messages: m } = useSettings();
  const styles = useThemedStyles(makeStyles);
  const { fast } = stats;

  return (
    <Card style={style}>
      <Text style={styles.title} accessibilityRole="header">
        {m.log.title}
      </Text>
      <View style={styles.row}>
        <Stat
          value={String(stats.streak)}
          caption={m.log.streak}
          spoken={m.log.days(stats.streak)}
        />
        {fast && (
          <Stat
            value={`${fast.completed}/${fast.total}`}
            caption={m.period[fast.id]}
            spoken={m.log.outOf(fast.completed, fast.total)}
          />
        )}
        <Stat value={String(stats.year)} caption={m.log.thisYear} spoken={m.log.days(stats.year)} />
      </View>
      <Text style={styles.note}>{m.log.streakNote}</Text>
    </Card>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    title: { ...type.label, color: t.muted, marginBottom: space.sm },
    row: { flexDirection: 'row', gap: space.md },
    stat: { flex: 1 },
    value: { fontFamily: SERIF, ...type.title2, color: t.ink, fontVariant: ['tabular-nums'] },
    caption: { ...type.label, color: t.muted, marginTop: space.xs },
    note: {
      ...type.caption,
      color: t.muted,
      marginTop: space.md,
      paddingTop: space.md,
      borderTopWidth: 1,
      borderTopColor: t.line,
    },
  });
}
