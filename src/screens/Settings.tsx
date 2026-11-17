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
import { Option } from '../ui/Option';
import { useTabBarSpace } from '../ui/tabBar';
import { SERIF, Theme, space, useTheme, radius } from '../ui/theme';
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
  const styles = makeStyles(theme);
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
      <Text style={styles.title}>{m.settings.title}</Text>

      <Text style={styles.label}>{m.settings.name}</Text>
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

      <Text style={styles.label}>{m.settings.church}</Text>
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
          <Text style={styles.label}>{m.settings.fishTitle}</Text>
          <Text style={styles.hint}>{m.settings.fishHint}</Text>
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

      <Text style={styles.label}>{m.settings.language}</Text>
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

      <Text style={styles.label}>{m.settings.notificationsTitle}</Text>
      <View style={styles.card}>
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
            <View style={styles.hours} accessibilityRole="radiogroup">
              {NOTIFICATION_HOURS.map((hour) => {
                const selected = hour === settings.notificationHour;
                return (
                  <Pressable
                    key={hour}
                    onPress={() => update({ notificationHour: hour })}
                    style={[styles.hour, selected && styles.hourSelected]}
                    accessibilityRole="radio"
                    accessibilityLabel={`${String(hour).padStart(2, '0')}:00`}
                    accessibilityState={{ selected }}
                  >
                    <Text style={[styles.hourText, selected && styles.hourTextSelected]}>
                      {String(hour).padStart(2, '0')}:00
                    </Text>
                  </Pressable>
                );
              })}
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
      </View>

      <Text style={styles.label}>{m.saints.title}</Text>
      <View style={styles.card}>
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
            <Pressable
              onPress={addSaint}
              disabled={saintName.trim() === ''}
              style={[
                styles.button,
                styles.buttonFilled,
                saintName.trim() === '' && styles.disabled,
              ]}
              accessibilityRole="button"
              accessibilityLabel={m.saints.add}
              accessibilityState={{ disabled: saintName.trim() === '' }}
            >
              <Text style={styles.buttonFilledText}>{m.saints.add}</Text>
            </Pressable>
          </>
        ) : (
          <Text style={styles.status}>{m.saints.full}</Text>
        )}
      </View>

      <Text style={styles.label}>{m.settings.updatesTitle}</Text>
      <View style={styles.card}>
        <Text style={styles.cardText}>
          {m.settings.version(Application.nativeApplicationVersion ?? '–')}
        </Text>
        <Text style={styles.cardText}>{contentLine}</Text>
        {updates.status !== 'idle' && (
          <Text style={[styles.status, updates.status === 'failed' && styles.error]}>
            {m.updates[updates.status]}
          </Text>
        )}
        <Pressable
          onPress={updates.check}
          disabled={updates.busy}
          style={[styles.button, styles.buttonOutline, updates.busy && styles.disabled]}
          accessibilityRole="button"
          accessibilityLabel={m.updates.check}
          accessibilityState={{ disabled: updates.busy, busy: updates.busy }}
        >
          <Text style={styles.buttonOutlineText}>{m.updates.check}</Text>
        </Pressable>

        {apk.release && (
          <View style={styles.apk}>
            <Text style={styles.cardText}>{m.settings.apkAvailable(apk.release.version)}</Text>
            {apk.status === 'failed' && (
              <Text style={[styles.status, styles.error]}>{m.settings.apkFailed}</Text>
            )}
            <Pressable
              onPress={apk.install}
              disabled={apk.status === 'downloading'}
              style={[
                styles.button,
                styles.buttonFilled,
                apk.status === 'downloading' && styles.disabled,
              ]}
              accessibilityRole="button"
              accessibilityState={{ disabled: apk.status === 'downloading', busy: apk.status === 'downloading' }}
            >
              <Text style={styles.buttonFilledText}>
                {apk.status === 'downloading'
                  ? m.settings.apkDownloading
                  : m.settings.apkInstall(Math.round(apk.release.sizeBytes / 1_000_000))}
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      <Pressable
        onPress={() => router.push('/sources')}
        style={[styles.button, styles.buttonOutline]}
        accessibilityRole="button"
        accessibilityLabel={m.sources.title}
      >
        <Text style={styles.buttonOutlineText}>{m.sources.title}</Text>
      </Pressable>

      <Pressable
        onPress={() => Linking.openURL(PROJECT_URL).catch(() => {})}
        style={[styles.button, styles.buttonOutline]}
        accessibilityRole="link"
        accessibilityLabel={m.settings.projectLink}
      >
        <Text style={styles.buttonOutlineText}>{m.settings.projectLink}</Text>
      </Pressable>
    </ScrollView>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    screen: { flex: 1, backgroundColor: t.background },
    title: { fontFamily: SERIF, fontSize: 30, lineHeight: 38, color: t.ink, marginTop: space.xs },
    label: { fontSize: 14, color: t.muted, marginTop: space.lg, marginBottom: space.sm },
    hint: { fontSize: 13, lineHeight: 19, color: t.muted, marginBottom: space.sm },
    input: {
      minHeight: 56,
      paddingHorizontal: space.md,
      borderRadius: radius.field,
      borderWidth: 1,
      borderColor: t.line,
      backgroundColor: t.surface,
      fontSize: 17,
      color: t.ink,
    },
    options: { gap: 12 },
    card: {
      padding: space.md,
      borderRadius: radius.field,
      borderWidth: 1,
      borderColor: t.line,
      backgroundColor: t.surface,
    },
    cardText: { fontSize: 16, color: t.ink },
    status: { fontSize: 14, color: t.muted, marginTop: space.xs },
    warning: { color: t.warning },
    error: { color: t.danger },
    button: {
      minHeight: 48,
      paddingVertical: 8,
      paddingHorizontal: space.md,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 12,
    },
    buttonOutline: { borderWidth: 1, borderColor: t.line },
    buttonOutlineText: { fontSize: 16, color: t.ink, textAlign: 'center' },
    buttonFilled: { backgroundColor: t.accent },
    buttonFilledText: { fontSize: 16, fontWeight: '600', color: t.onAccent, textAlign: 'center' },
    disabled: { opacity: 0.6 },
    switchRow: { flexDirection: 'row', alignItems: 'center', minHeight: 44, gap: 12 },
    switchText: { flex: 1 },
    repeatRow: { marginTop: space.sm },
    hours: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm, marginTop: space.sm },
    hour: {
      flex: 1,
      minHeight: 44,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: t.line,
      alignItems: 'center',
      justifyContent: 'center',
    },
    hourSelected: { borderColor: t.accent, backgroundColor: t.accent },
    hourText: { fontSize: 16, color: t.ink, fontVariant: ['tabular-nums'] },
    hourTextSelected: { color: t.onAccent, fontWeight: '600' },
    saintRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingVertical: space.sm,
      borderTopWidth: 1,
      borderTopColor: t.line,
    },
    saintText: { flex: 1 },
    removeButton: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
    removeText: { fontSize: 24, color: t.muted },
    saintInput: { minHeight: 48, marginTop: space.sm },
    apk: { marginTop: space.md, paddingTop: space.md, borderTopWidth: 1, borderTopColor: t.line },
  });
}
