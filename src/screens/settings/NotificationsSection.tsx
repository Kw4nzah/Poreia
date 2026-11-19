// Daily notification, its time and repeat, and the evening-before reminder.

import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { requestPermission } from '../../notifications/schedule';
import { NOTIFICATION_HOURS } from '../../settings/model';
import { useSettings } from '../../settings/SettingsProvider';
import { AppSwitch } from '../../ui/AppSwitch';
import { Card, SegmentedControl } from '../../ui/kit';
import { Theme, space, type, useThemedStyles } from '../../ui/theme';
import { NotificationHelp } from './NotificationHelp';
import { hourLabel } from './sections';

export function NotificationsSection() {
  const { settings, messages: m, update } = useSettings();
  const styles = useThemedStyles(makeStyles);
  const [notificationsDenied, setNotificationsDenied] = useState(false);
  const [eveDenied, setEveDenied] = useState(false);
  const [ongoingDenied, setOngoingDenied] = useState(false);

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

  async function toggleEve(on: boolean) {
    setEveDenied(false);
    if (!on) {
      update({ eveReminder: false });
      return;
    }
    const granted = await requestPermission(m.settings.notificationsChannel).catch(() => false);
    if (granted) update({ eveReminder: true });
    else setEveDenied(true);
  }

  async function toggleOngoing(on: boolean) {
    setOngoingDenied(false);
    if (!on) {
      update({ persistentNotification: false });
      return;
    }
    const granted = await requestPermission(m.settings.notificationsChannel).catch(() => false);
    if (granted) update({ persistentNotification: true });
    else setOngoingDenied(true);
  }

  return (
    <>
      <Card padding="md" style={styles.card}>
        <View style={styles.switchRow}>
          <Text style={[styles.cardText, styles.switchText]}>{m.settings.notificationsToggle}</Text>
          <AppSwitch
            value={settings.notifications}
            onValueChange={toggleNotifications}
            label={m.settings.notificationsToggle}
          />
        </View>
        {notificationsDenied && (
          <Text style={[styles.status, styles.warning]} accessibilityLiveRegion="polite">
            {m.settings.notificationsDenied}
          </Text>
        )}
        {settings.notifications && (
          <View style={styles.group}>
            <Text style={styles.status}>{m.settings.notificationsTime}</Text>
            <View style={styles.hours}>
              <SegmentedControl
                accessibilityLabel={m.settings.notificationsTime}
                value={settings.notificationHour}
                onChange={(hour) => update({ notificationHour: hour })}
                options={NOTIFICATION_HOURS.map((hour) => ({
                  value: hour,
                  label: hourLabel(hour),
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
        <View style={styles.group}>
          <View style={styles.switchRow}>
            <Text style={[styles.cardText, styles.switchText]}>{m.settings.eveReminder}</Text>
            <AppSwitch
              value={settings.eveReminder}
              onValueChange={toggleEve}
              label={m.settings.eveReminder}
            />
          </View>
          <Text style={styles.status}>{m.settings.eveReminderHint}</Text>
          {eveDenied && (
            <Text style={[styles.status, styles.warning]} accessibilityLiveRegion="polite">
              {m.settings.notificationsDenied}
            </Text>
          )}
        </View>
        <View style={styles.group}>
          <View style={styles.switchRow}>
            <Text style={[styles.cardText, styles.switchText]}>{m.settings.ongoingToggle}</Text>
            <AppSwitch
              value={settings.persistentNotification}
              onValueChange={toggleOngoing}
              label={m.settings.ongoingToggle}
            />
          </View>
          <Text style={styles.status}>{m.settings.ongoingHint}</Text>
          {ongoingDenied && (
            <Text style={[styles.status, styles.warning]} accessibilityLiveRegion="polite">
              {m.settings.notificationsDenied}
            </Text>
          )}
        </View>
      </Card>
      <NotificationHelp />
    </>
  );
}

function makeStyles(t: Theme) {
  return StyleSheet.create({
    card: { marginTop: space.lg },
    cardText: { ...type.body, color: t.ink },
    status: { ...type.label, color: t.muted, marginTop: space.xs },
    warning: { color: t.warning },
    switchRow: { flexDirection: 'row', alignItems: 'center', minHeight: 44, gap: space.smd },
    switchText: { flex: 1 },
    repeatRow: { marginTop: space.sm },
    hours: { marginTop: space.sm },
    group: { marginTop: space.md, paddingTop: space.md, borderTopWidth: 1, borderTopColor: t.line },
  });
}
