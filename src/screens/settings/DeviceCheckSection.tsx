// Device check: a short checklist for things only a real phone can verify after an update.
// Ticks are stored per release version (see src/deviceCheck).

import { useEffect, useReducer, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  DEVICE_CHECK_ITEMS,
  doneCount,
  emptyState,
  reduceDeviceCheck,
} from '../../deviceCheck/model';
import { loadDeviceCheck, saveDeviceCheck } from '../../deviceCheck/store';
import { RELEASE_NOTES } from '../../releaseNotes';
import { useSettings } from '../../settings/SettingsProvider';
import { Button, Card } from '../../ui/kit';
import { Theme, space, type, useThemedStyles } from '../../ui/theme';

/** The newest release of this bundle: it also changes with over-the-air updates. */
const CHECK_VERSION = RELEASE_NOTES[0].version;

export function DeviceCheckSection() {
  const { messages: m } = useSettings();
  const d = m.deviceCheck;
  const styles = useThemedStyles(makeStyles);
  const [state, dispatch] = useReducer(reduceDeviceCheck, CHECK_VERSION, emptyState);
  const loaded = useRef(false);

  useEffect(() => {
    let cancelled = false;
    void loadDeviceCheck(CHECK_VERSION).then((stored) => {
      if (cancelled) return;
      loaded.current = true;
      dispatch({ type: 'load', stored });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Save only after the stored ticks were read, so an empty start never overwrites them.
  useEffect(() => {
    if (loaded.current) void saveDeviceCheck(state);
  }, [state]);

  return (
    <View>
      <Text style={styles.intro}>{d.intro}</Text>
      <View style={styles.summaryRow}>
        <Text style={styles.summary} accessibilityLiveRegion="polite">
          {d.summary(doneCount(state), DEVICE_CHECK_ITEMS.length)}
        </Text>
        <Button
          label={d.reset}
          variant="secondary"
          size="sm"
          fullWidth={false}
          onPress={() => dispatch({ type: 'reset' })}
        />
      </View>
      {DEVICE_CHECK_ITEMS.map((id) => {
        const checked = state.done.includes(id);
        const item = d.items[id];
        return (
          <Card key={id} padding="md" tone={checked ? 'feast' : 'surface'} style={styles.card}>
            <Pressable
              onPress={() => dispatch({ type: 'toggle', id })}
              accessibilityRole="checkbox"
              accessibilityState={{ checked }}
              accessibilityLabel={item.title}
              accessibilityHint={checked ? d.untickA11y : d.tickA11y}
              style={styles.row}
            >
              <View style={[styles.box, checked && styles.boxChecked]}>
                {checked && (
                  <Text style={styles.mark} importantForAccessibility="no">
                    ✓
                  </Text>
                )}
              </View>
              <View style={styles.text}>
                <Text style={styles.title}>{item.title}</Text>
                {item.steps.map((step, index) => (
                  <Text key={index} style={styles.step}>
                    {step}
                  </Text>
                ))}
              </View>
            </Pressable>
          </Card>
        );
      })}
    </View>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    intro: { ...type.body, color: t.muted, marginTop: space.sm },
    summaryRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: space.smd,
      marginTop: space.lg,
    },
    summary: { ...type.bodyLarge, fontWeight: '600', color: t.ink, flexShrink: 1 },
    card: { marginTop: space.md },
    row: { flexDirection: 'row', gap: space.smd, minHeight: 44 },
    box: {
      width: 28,
      height: 28,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: t.outline,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 2,
    },
    boxChecked: { backgroundColor: t.accent, borderColor: t.accent },
    mark: { color: t.onAccent, fontSize: 16, fontWeight: '700' },
    text: { flex: 1 },
    title: { ...type.bodyLarge, fontWeight: '600', color: t.ink },
    step: { ...type.body, color: t.ink, marginTop: space.xs },
  });
}
