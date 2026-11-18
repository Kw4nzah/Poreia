// Settings: copy a backup of the settings and done days, and restore one from pasted text.

import { useState } from 'react';
import { Alert, Share, StyleSheet, Text } from 'react-native';
import { MAX_BACKUP_CHARS, createBackup, parseBackup } from '../backup/backup';
import type { BackupError } from '../backup/backup';
import { readDoneDays, writeDoneDays } from '../backup/doneStorage';
import { useSettings } from '../settings/SettingsProvider';
import { AppTextInput } from '../ui/AppTextInput';
import { Button, Card } from '../ui/kit';
import { Theme, radius, space, type, useTheme, useThemedStyles } from '../ui/theme';

type Outcome =
  { kind: 'restored'; days: number } | { kind: 'error'; error: BackupError | 'storage' };

export function BackupSection() {
  const { settings, messages: m, update } = useSettings();
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [text, setText] = useState('');
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [busy, setBusy] = useState(false);

  async function copyBackup() {
    setOutcome(null);
    try {
      const message = createBackup(settings, await readDoneDays());
      await Share.share(
        { message, title: m.backup.shareTitle },
        { dialogTitle: m.backup.shareTitle },
      );
    } catch {
      // The sheet could not open or was dismissed; nothing was changed, so there is nothing to say.
    }
  }

  async function applyBackup(parsed: { settings: typeof settings; done: string[] }) {
    setBusy(true);
    try {
      // Done days first: if storage refuses, the settings stay as they were.
      if (!(await writeDoneDays(parsed.done))) {
        setOutcome({ kind: 'error', error: 'storage' });
        return;
      }
      update(parsed.settings);
      setText('');
      setOutcome({ kind: 'restored', days: parsed.done.length });
    } finally {
      setBusy(false);
    }
  }

  function restore() {
    const parsed = parseBackup(text, settings.language);
    if (!parsed.ok) {
      setOutcome({ kind: 'error', error: parsed.error });
      return;
    }
    setOutcome(null);
    Alert.alert(m.backup.confirmTitle, m.backup.confirmBody, [
      { text: m.backup.cancel, style: 'cancel' },
      { text: m.backup.restore, onPress: () => void applyBackup(parsed) },
    ]);
  }

  return (
    <>
      {/* The category screen already carries the title. */}
      <Text style={styles.hint}>{m.backup.hint}</Text>
      <Card padding="md">
        <Button label={m.backup.copy} onPress={() => void copyBackup()} variant="secondary" />
        <Text style={styles.status}>{m.backup.copyHint}</Text>

        <AppTextInput
          value={text}
          onChangeText={(value) => {
            setText(value);
            setOutcome(null);
          }}
          placeholder={m.backup.pastePlaceholder}
          placeholderTextColor={theme.muted}
          // One over the cap, so text that is too long is reported instead of silently cut.
          maxLength={MAX_BACKUP_CHARS + 1}
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          accessibilityLabel={m.backup.pasteLabel}
          style={styles.input}
        />
        <Button
          label={m.backup.restore}
          onPress={restore}
          disabled={text.trim() === '' || busy}
          loading={busy}
          style={styles.buttonGap}
        />
        {outcome && (
          <Text
            accessibilityLiveRegion="polite"
            style={[styles.status, outcome.kind === 'error' ? styles.error : styles.success]}
          >
            {outcome.kind === 'error'
              ? m.backup.errors[outcome.error]
              : m.backup.restored(outcome.days)}
          </Text>
        )}
      </Card>
    </>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    hint: { ...type.caption, color: t.muted, marginTop: space.md, marginBottom: space.sm },
    status: { ...type.label, color: t.muted, marginTop: space.xs },
    error: { color: t.danger },
    success: { color: t.ink },
    buttonGap: { marginTop: space.smd },
    input: {
      minHeight: 112,
      marginTop: space.md,
      padding: space.md,
      borderRadius: radius.field,
      borderWidth: 1,
      borderColor: t.line,
      backgroundColor: t.surface,
      ...type.body,
      color: t.ink,
    },
  });
}
