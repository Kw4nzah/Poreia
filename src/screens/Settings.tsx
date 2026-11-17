// Name, tradition, language and updates.

import * as Application from 'expo-application';
import * as Updates from 'expo-updates';
import { useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CHURCHES, ChurchId, GREEK_FISH_PRACTICES } from '../calendar';
import { LANGUAGES, MESSAGES } from '../i18n';
import { requestPermission } from '../notifications/schedule';
import {
  MAX_FAVORITE_SAINTS,
  MAX_SAINT_NAME,
  MAX_SAINT_NOTE,
  NOTIFICATION_HOURS,
  cleanSaints,
} from '../settings/model';
import { useSettings } from '../settings/SettingsProvider';
import { Option } from '../ui/Option';
import { useTabBarSpace } from '../ui/tabBar';
import { SERIF, Theme, space, useTheme } from '../ui/theme';
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
  const [saintNote, setSaintNote] = useState('');
  const contentLine = describeContent(m, Updates.isEmbeddedLaunch, Updates.createdAt);

  function addSaint() {
    const next = cleanSaints([...settings.saints, { name: saintName, note: saintNote }]);
    if (next.length === settings.saints.length) return;
    update({ saints: next });
    setSaintName('');
    setSaintNote('');
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
        paddingTop: insets.top + space.md,
        paddingBottom: tabSpace,
        paddingHorizontal: space.lg,
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>{m.settings.title}</Text>

      <Text style={styles.label}>{m.settings.name}</Text>
      <TextInput
        value={settings.name}
        onChangeText={(name) => update({ name })}
        onEndEditing={() => update({ name: settings.name.trim() })}
        placeholder={m.onboarding.namePlaceholder}
        placeholderTextColor={theme.muted}
        style={styles.input}
        autoCapitalize="words"
        autoCorrect={false}
        maxLength={40}
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
          <Switch
            value={settings.notifications}
            onValueChange={toggleNotifications}
            trackColor={{ false: theme.line, true: theme.accent }}
            thumbColor={theme.surface}
            accessibilityLabel={m.settings.notificationsToggle}
          />
        </View>
        {notificationsDenied && <Text style={styles.status}>{m.settings.notificationsDenied}</Text>}
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
                    accessibilityState={{ selected }}
                  >
                    <Text style={[styles.hourText, selected && styles.hourTextSelected]}>
                      {String(hour).padStart(2, '0')}:00
                    </Text>
                  </Pressable>
                );
              })}
            </View>
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
              {saint.note !== '' && <Text style={styles.status}>{saint.note}</Text>}
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
            <TextInput
              value={saintName}
              onChangeText={setSaintName}
              placeholder={m.saints.namePlaceholder}
              placeholderTextColor={theme.muted}
              maxLength={MAX_SAINT_NAME}
              style={[styles.input, styles.saintInput]}
            />
            <TextInput
              value={saintNote}
              onChangeText={setSaintNote}
              placeholder={m.saints.notePlaceholder}
              placeholderTextColor={theme.muted}
              maxLength={MAX_SAINT_NOTE}
              style={[styles.input, styles.saintInput]}
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
          <Text style={styles.status}>{m.updates[updates.status]}</Text>
        )}
        <Pressable
          onPress={updates.check}
          disabled={updates.busy}
          style={[styles.button, styles.buttonOutline, updates.busy && styles.disabled]}
          accessibilityRole="button"
        >
          <Text style={styles.buttonOutlineText}>{m.updates.check}</Text>
        </Pressable>

        {apk.release && (
          <View style={styles.apk}>
            <Text style={styles.cardText}>{m.settings.apkAvailable(apk.release.version)}</Text>
            {apk.status === 'failed' && <Text style={styles.status}>{m.settings.apkFailed}</Text>}
            <Pressable
              onPress={apk.install}
              disabled={apk.status === 'downloading'}
              style={[
                styles.button,
                styles.buttonFilled,
                apk.status === 'downloading' && styles.disabled,
              ]}
              accessibilityRole="button"
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
      >
        <Text style={styles.buttonOutlineText}>{m.sources.title}</Text>
      </Pressable>

      <Pressable
        onPress={() => Linking.openURL(PROJECT_URL).catch(() => {})}
        style={[styles.button, styles.buttonOutline]}
        accessibilityRole="link"
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
      height: 56,
      paddingHorizontal: space.md,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: t.line,
      backgroundColor: t.surface,
      fontSize: 17,
      color: t.ink,
    },
    options: { gap: 12 },
    card: {
      padding: space.md,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: t.line,
      backgroundColor: t.surface,
    },
    cardText: { fontSize: 16, color: t.ink },
    status: { fontSize: 14, color: t.muted, marginTop: space.xs },
    button: {
      height: 48,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 12,
    },
    buttonOutline: { borderWidth: 1, borderColor: t.line },
    buttonOutlineText: { fontSize: 16, color: t.ink },
    buttonFilled: { backgroundColor: t.accent },
    buttonFilledText: { fontSize: 16, fontWeight: '600', color: t.onAccent },
    disabled: { opacity: 0.6 },
    switchRow: { flexDirection: 'row', alignItems: 'center', minHeight: 44, gap: 12 },
    switchText: { flex: 1 },
    hours: { flexDirection: 'row', gap: space.sm, marginTop: space.sm },
    hour: {
      flex: 1,
      height: 44,
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
    saintInput: { height: 48, marginTop: space.sm },
    apk: { marginTop: space.md, paddingTop: space.md, borderTopWidth: 1, borderTopColor: t.line },
  });
}
