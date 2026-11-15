// Placeholder first screen: proves the calendar engine and the update channel on a
// real device. The designed onboarding and "Today" screens replace it.

import * as Application from 'expo-application';
import * as Updates from 'expo-updates';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CHURCHES, ChurchId, civilFromLocalDate, getDayInfo, getUpcomingFast } from '../calendar';

export default function Home() {
  const [churchId, setChurchId] = useState<ChurchId>('greek');
  const [status, setStatus] = useState('');
  const today = civilFromLocalDate(new Date());
  const church = CHURCHES[churchId];
  const info = getDayInfo(today, church);
  const upcoming = getUpcomingFast(today, church);

  async function checkForUpdate() {
    if (!Updates.isEnabled) {
      setStatus('Updates are disabled in this build.');
      return;
    }
    try {
      setStatus('Checking…');
      const check = await Updates.checkForUpdateAsync();
      if (!check.isAvailable) {
        setStatus('Up to date.');
        return;
      }
      setStatus('Downloading…');
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    } catch (error) {
      setStatus(`Update failed: ${String(error)}`);
    }
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Poreia</Text>
      <Text style={styles.line}>
        {today.day}.{today.month}.{today.year}
      </Text>

      <View style={styles.row}>
        {(Object.keys(CHURCHES) as ChurchId[]).map((id) => (
          <Pressable
            key={id}
            onPress={() => setChurchId(id)}
            style={[styles.chip, id === churchId && styles.chipActive]}
          >
            <Text style={id === churchId ? styles.chipTextActive : styles.chipText}>{id}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.heading}>
        {info.period ? `${info.period.id} — ${info.period.day} / ${info.period.totalDays}` : 'no period'}
      </Text>
      <Text style={styles.line}>level: {info.level}</Text>
      {info.feasts.length > 0 && <Text style={styles.line}>feast: {info.feasts.join(', ')}</Text>}
      <Text style={styles.line}>
        next: {upcoming.id} in {upcoming.daysUntil} days
      </Text>

      <Pressable onPress={checkForUpdate} style={styles.button}>
        <Text style={styles.buttonText}>Check for updates</Text>
      </Pressable>
      <Text style={styles.small}>{status}</Text>
      <Text style={styles.small}>
        app {Application.nativeApplicationVersion} ({Application.nativeBuildVersion}) · runtime{' '}
        {Updates.runtimeVersion ?? '-'}
      </Text>
      <Text style={styles.small}>
        {Updates.isEmbeddedLaunch ? 'embedded bundle' : `update ${Updates.updateId ?? '-'}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'center', padding: 24, gap: 8, backgroundColor: '#fff' },
  title: { fontSize: 32, fontWeight: '700', color: '#1b1b1b' },
  heading: { fontSize: 20, fontWeight: '600', marginTop: 16, color: '#1b1b1b' },
  line: { fontSize: 16, color: '#333' },
  small: { fontSize: 12, color: '#666' },
  row: { flexDirection: 'row', gap: 8, marginTop: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, backgroundColor: '#eee' },
  chipActive: { backgroundColor: '#7a1f2b' },
  chipText: { color: '#333' },
  chipTextActive: { color: '#fff' },
  button: {
    marginTop: 24,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#7a1f2b',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
