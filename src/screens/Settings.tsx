// Name, tradition, language and updates.

import * as Application from 'expo-application';
import * as Updates from 'expo-updates';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CHURCHES, ChurchId, GREEK_FISH_PRACTICES } from '../calendar';
import { LANGUAGES, MESSAGES } from '../i18n';
import { requestPermission } from '../notifications/schedule';
import {
  MAX_FAVORITE_SAINTS,
  MAX_SAINT_NAME,
  NOTIFICATION_HOURS,
  cleanSaints,
} from '../settings/model';
import { useSettings } from '../settings/SettingsProvider';
import { SAINT_TOPICS, SaintTopicId } from '../prayers/saintTopics';
import { AppSwitch } from '../ui/AppSwitch';
import { Dropdown } from '../ui/Dropdown';
import { AppTextInput } from '../ui/AppTextInput';
import { Button, Card, SectionHeader, SegmentedControl } from '../ui/kit';
import { Option } from '../ui/Option';
import { useTabBarSpace } from '../ui/tabBar';
import { SERIF, Theme, space, useTheme, radius, type, useThemedStyles } from '../ui/theme';
import { describeContent } from '../updates/contentVersion';
import { useApkUpdate } from '../updates/useApkUpdate';
import { useUpdateCheck } from '../updates/useUpdateCheck';

const PROJECT_URL = 'https://github.com/Kw4nzah/Poreia';
const CHURCH_IDS = Object.keys(CHURCHES) as ChurchId[];

export function Settings() {
  const { settings, messages: m, update } = useSettings();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const tabSpace = useTabBarSpace();
  const styles = useThemedStyles(makeStyles);
  const updates = useUpdateCheck();
  const apk = useApkUpdate();
  const [notificationsDenied, setNotificationsDenied] = useState(false);
  const [saintName, setSaintName] = useState('');
  const [saintTopic, setSaintTopic] = useState<SaintTopicId | ''>('');
  const contentLine = describeContent(m, Updates.isEmbeddedLaunch, Updates.createdAt);

  function addSaint() {
    const next = cleanSaints([...settings.saints, { name: saintName, topic: saintTopic }]);
    if (next.length === settings.saints.length) return;
    update({ saints: next });
    setSaintName('');
    setSaintTopic('');
  }

  async function toggleNotifications(on: boolean) {
    setNotificationsDenied(false);
    if (!on) {
      update({ notifications: false });
      return;
    }
    const granted = await requestPermission(m.settings.notificationsChannel).catch(() => false);
    if (granted) update({ notifications: true });
    else setNotificationsDenied(true);
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{
        paddingTop: insets.top + space.lg,
        paddingBottom: tabSpace,
        paddingHorizontal: space.lg,
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title} accessibilityRole="header">
        {m.settings.title}
      </Text>

      <SectionHeader title={m.settings.name} />
      <AppTextInput
        value={settings.name}
        onChangeText={(name) => update({ name })}
        onEndEditing={() => update({ name: settings.name.trim() })}
        placeholder={m.onboarding.namePlaceholder}
        placeholderTextColor={theme.muted}
        style={styles.input}
        autoCapitalize="words"
        autoCorrect={false}
        maxLength={40}
        returnKeyType="done"
        blurOnSubmit
        accessibilityLabel={m.settings.name}
      />

      <SectionHeader title={m.settings.church} />
      <View style={styles.options}>
        {CHURCH_IDS.map((id) => (
          <Option
            key={id}
            selected={id === settings.churchId}
            title={m.church[id].name}
            subtitle={m.church[id].calendar}
            onPress={() => update({ churchId: id })}
          />
        ))}
      </View>

      {settings.churchId === 'greek' && (
        <>
          <SectionHeader title={m.settings.fishTitle} hint={m.settings.fishHint} />
          <View style={styles.options}>
            {GREEK_FISH_PRACTICES.map((id) => (
              <Option
                key={id}
                selected={id === settings.greekFish}
                title={m.settings.fish[id].title}
                subtitle={m.settings.fish[id].subtitle}
                onPress={() => update({ greekFish: id })}
              />
            ))}
          </View>
        </>
      )}

      <SectionHeader title={m.settings.language} />
      <View style={styles.options}>
        {LANGUAGES.map((language) => (
          <Option
            key={language}
            selected={language === settings.language}
            title={MESSAGES[language].languageName}
            onPress={() => update({ language })}
          />
        ))}
      </View>

      <SectionHeader title={m.settings.notificationsTitle} />
      <Card padding="md">
        <View style={styles.switchRow}>
          <Text style={[styles.cardText, styles.switchText]}>{m.settings.notificationsToggle}</Text>
          <AppSwitch
            value={settings.notifications}
            onValueChange={toggleNotifications}
            label={m.settings.notificationsToggle}
          />
        </View>
        {notificationsDenied && (
          <Text style={[styles.status, styles.warning]}>{m.settings.notificationsDenied}</Text>
        )}
        {settings.notifications && (
          <View style={styles.apk}>
            <Text style={styles.status}>{m.settings.notificationsTime}</Text>
            <View style={styles.hours}>
              <SegmentedControl
                accessibilityLabel={m.settings.notificationsTime}
                value={settings.notificationHour}
                onChange={(hour) => update({ notificationHour: hour })}
                options={NOTIFICATION_HOURS.map((hour) => ({
                  value: hour,
                  label: `${String(hour).padStart(2, '0')}:00`,
                }))}
              />
            </View>
            <View style={[styles.switchRow, styles.repeatRow]}>
              <Text style={[styles.cardText, styles.switchText]}>
                {m.settings.notificationRepeat}
              </Text>
              <AppSwitch
                value={settings.notificationRepeat}
                onValueChange={(value) => update({ notificationRepeat: value })}
                label={m.settings.notificationRepeat}
              />
            </View>
            <Text style={styles.status}>{m.settings.notificationRepeatHint}</Text>
          </View>
        )}
      </Card>

      <SectionHeader title={m.saints.title} />
      <Card padding="md">
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
              style={[styles.input, styles.saintInput]}
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

      <SectionHeader title={m.settings.updatesTitle} />
      <Card padding="md">
        <Text style={styles.cardText}>
          {m.settings.version(Application.nativeApplicationVersion ?? '–')}
        </Text>
        <Text style={styles.cardText}>{contentLine}</Text>
        {updates.status !== 'idle' && (
          <Text style={[styles.status, updates.status === 'failed' && styles.error]}>
            {m.updates[updates.status]}
          </Text>
        )}
        <Button
          label={m.updates.check}
          onPress={updates.check}
          variant="secondary"
          loading={updates.busy}
          style={styles.buttonGap}
        />

        {apk.release && (
          <View style={styles.apk}>
            <Text style={styles.cardText}>{m.settings.apkAvailable(apk.release.version)}</Text>
            {apk.status === 'failed' && (
              <Text style={[styles.status, styles.error]}>{m.settings.apkFailed}</Text>
            )}
            <Button
              label={
                apk.status === 'downloading'
                  ? m.settings.apkDownloading
                  : m.settings.apkInstall(Math.round(apk.release.sizeBytes / 1_000_000))
              }
              onPress={apk.install}
              loading={apk.status === 'downloading'}
              style={styles.buttonGap}
            />
          </View>
        )}
      </Card>

      <Button
        label={m.sources.title}
        onPress={() => router.push('/sources')}
        variant="secondary"
        style={styles.buttonGap}
      />

      <Button
        label={m.settings.projectLink}
        onPress={() => Linking.openURL(PROJECT_URL).catch(() => {})}
        variant="secondary"
        accessibilityRole="link"
        style={styles.buttonGap}
      />
    </ScrollView>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.background },
    title: { fontFamily: SERIF, ...type.title1, color: t.ink },
    hint: { ...type.caption, color: t.muted, marginBottom: space.sm },
    input: {
      minHeight: 56,
      paddingHorizontal: space.md,
      borderRadius: radius.field,
      borderWidth: 1,
      borderColor: t.line,
      backgroundColor: t.surface,
      ...type.bodyLarge,
      color: t.ink,
    },
    options: { gap: space.smd },
    cardText: { ...type.body, color: t.ink },
    status: { ...type.label, color: t.muted, marginTop: space.xs },
    warning: { color: t.warning },
    error: { color: t.danger },
    buttonGap: { marginTop: space.smd },
    switchRow: { flexDirection: 'row', alignItems: 'center', minHeight: 44, gap: space.smd },
    switchText: { flex: 1 },
    repeatRow: { marginTop: space.sm },
    hours: { marginTop: space.sm },
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
    saintInput: { minHeight: 48, marginTop: space.sm },
    apk: { marginTop: space.md, paddingTop: space.md, borderTopWidth: 1, borderTopColor: t.line },
  });
}
