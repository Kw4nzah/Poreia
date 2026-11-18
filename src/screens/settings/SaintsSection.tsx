// The saints the user turns to: list, remove, add.

import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SAINT_TOPICS, SaintTopicId } from '../../prayers/saintTopics';
import { MAX_FAVORITE_SAINTS, MAX_SAINT_NAME, cleanSaints } from '../../settings/model';
import { useSettings } from '../../settings/SettingsProvider';
import { AppTextInput } from '../../ui/AppTextInput';
import { Dropdown } from '../../ui/Dropdown';
import { Button, Card } from '../../ui/kit';
import { Theme, radius, space, type, useTheme, useThemedStyles } from '../../ui/theme';

export function SaintsSection() {
  const { settings, messages: m, update } = useSettings();
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [saintName, setSaintName] = useState('');
  const [saintTopic, setSaintTopic] = useState<SaintTopicId | ''>('');

  function addSaint() {
    const next = cleanSaints([...settings.saints, { name: saintName, topic: saintTopic }]);
    if (next.length === settings.saints.length) return;
    update({ saints: next });
    setSaintName('');
    setSaintTopic('');
  }

  return (
    <Card padding="md" style={styles.card}>
      <Text style={styles.hint}>{m.saints.hint}</Text>
      {settings.saints.map((saint) => (
        <View key={saint.name} style={styles.saintRow}>
          <View style={styles.saintText}>
            <Text style={styles.cardText}>{saint.name}</Text>
            {saint.topic !== '' && (
              <Text style={styles.status}>{m.saints.topics[saint.topic].label}</Text>
            )}
          </View>
          <Pressable
            onPress={() => update({ saints: settings.saints.filter((s) => s !== saint) })}
            style={styles.removeButton}
            accessibilityRole="button"
            accessibilityLabel={`${m.saints.remove}: ${saint.name}`}
          >
            <Text style={styles.removeText}>×</Text>
          </Pressable>
        </View>
      ))}
      {settings.saints.length < MAX_FAVORITE_SAINTS ? (
        <>
          <AppTextInput
            value={saintName}
            onChangeText={setSaintName}
            placeholder={m.saints.namePlaceholder}
            placeholderTextColor={theme.muted}
            maxLength={MAX_SAINT_NAME}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={addSaint}
            accessibilityLabel={m.saints.namePlaceholder}
            style={styles.input}
          />
          <Dropdown
            value={saintTopic}
            options={SAINT_TOPICS.map((id) => ({ id, label: m.saints.topics[id].label }))}
            placeholder={m.saints.topicNone}
            onChange={setSaintTopic}
          />
          <Button
            label={m.saints.add}
            onPress={addSaint}
            disabled={saintName.trim() === ''}
            style={styles.buttonGap}
          />
        </>
      ) : (
        <Text style={styles.status}>{m.saints.full}</Text>
      )}
    </Card>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    card: { marginTop: space.lg },
    hint: { ...type.caption, color: t.muted, marginBottom: space.sm },
    cardText: { ...type.body, color: t.ink },
    status: { ...type.label, color: t.muted, marginTop: space.xs },
    buttonGap: { marginTop: space.smd },
    input: {
      minHeight: 48,
      marginTop: space.sm,
      paddingHorizontal: space.md,
      borderRadius: radius.field,
      borderWidth: 1,
      borderColor: t.line,
      backgroundColor: t.surface,
      ...type.bodyLarge,
      color: t.ink,
    },
    saintRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: space.smd,
      paddingVertical: space.sm,
      borderTopWidth: 1,
      borderTopColor: t.line,
    },
    saintText: { flex: 1 },
    removeButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
    removeText: { ...type.title2, color: t.muted },
  });
}
