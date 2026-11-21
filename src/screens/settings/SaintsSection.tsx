// The saints the user turns to: list, remove, add.

import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SaintGender, guessSaintGender } from '../../prayers/saintGender';
import { SAINT_TOPICS, SaintTopicId } from '../../prayers/saintTopics';
import {
  FavoriteSaint,
  MAX_FAVORITE_SAINTS,
  MAX_SAINT_NAME,
  cleanSaints,
} from '../../settings/model';
import { useSettings } from '../../settings/SettingsProvider';
import { AppTextInput } from '../../ui/AppTextInput';
import { Dropdown } from '../../ui/Dropdown';
import { Icon } from '../../ui/Icon';
import { Button, Card, SegmentedControl } from '../../ui/kit';
import { Theme, radius, space, type, useTheme, useThemedStyles } from '../../ui/theme';

export function SaintsSection() {
  const { settings, messages: m, update } = useSettings();
  const theme = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [saintName, setSaintName] = useState('');
  const [saintTopic, setSaintTopic] = useState<SaintTopicId | ''>('');

  // '' = not chosen yet; Add stays disabled until it is, so a saint is never silently mislabelled.
  const [saintGender, setSaintGender] = useState<SaintGender | ''>('');
  // Once the user picks a gender themselves, typing no longer changes it.
  const [genderChosen, setGenderChosen] = useState(false);

  function changeName(text: string) {
    setSaintName(text);
    if (!genderChosen) setSaintGender(guessSaintGender(text) ?? '');
  }

  function addSaint() {
    if (saintGender === '') return;
    const next = cleanSaints([
      ...settings.saints,
      { name: saintName, topic: saintTopic, gender: saintGender },
    ]);
    if (next.length === settings.saints.length) return;
    update({ saints: next });
    setSaintName('');
    setSaintTopic('');
    setSaintGender('');
    setGenderChosen(false);
  }

  function toggleGender(saint: FavoriteSaint) {
    const gender = saint.gender === 'f' ? 'm' : 'f';
    update({ saints: settings.saints.map((s) => (s === saint ? { ...s, gender } : s)) });
  }

  const genderName = (gender: SaintGender) =>
    gender === 'f' ? m.saints.genderFemale : m.saints.genderMale;

  return (
    <Card padding="md" style={styles.card}>
      <Text style={styles.hint}>{m.saints.hint}</Text>
      {settings.saints.map((saint) => (
        <View key={saint.name} style={styles.saintRow}>
          <View style={styles.saintText}>
            <Text style={styles.cardText}>{saint.name}</Text>
            <Pressable
              onPress={() => toggleGender(saint)}
              accessibilityRole="button"
              accessibilityLabel={`${saint.name}: ${genderName(saint.gender)}. ${m.saints.genderChange}`}
              hitSlop={8}
            >
              <Text style={styles.status}>{genderName(saint.gender)}</Text>
            </Pressable>
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
            <Icon name="cross" color={theme.muted} />
          </Pressable>
        </View>
      ))}
      {settings.saints.length < MAX_FAVORITE_SAINTS ? (
        <>
          <AppTextInput
            value={saintName}
            onChangeText={changeName}
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
          <View style={styles.genderGap}>
            <SegmentedControl<SaintGender | ''>
              accessibilityLabel={m.saints.genderLabel}
              value={saintGender}
              onChange={(gender) => {
                setSaintGender(gender);
                setGenderChosen(true);
              }}
              options={[
                { value: 'm', label: m.saints.genderMale },
                { value: 'f', label: m.saints.genderFemale },
              ]}
            />
          </View>
          <Dropdown
            value={saintTopic}
            options={SAINT_TOPICS.map((id) => ({ id, label: m.saints.topics[id].label }))}
            placeholder={m.saints.topicNone}
            onChange={setSaintTopic}
          />
          <Button
            label={m.saints.add}
            onPress={addSaint}
            disabled={saintName.trim() === '' || saintGender === ''}
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
    genderGap: { marginTop: space.sm, marginBottom: space.sm },
    input: {
      minHeight: 48,
      marginTop: space.sm,
      paddingHorizontal: space.md,
      borderRadius: radius.field,
      borderWidth: 1,
      borderColor: t.outline,
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
  });
}
