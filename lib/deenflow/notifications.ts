import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import type { Preferences, ReminderSetting } from "./types";

const CHANNEL_ID = "deenflow-reminders";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const reminderTimeLabel = ({ hour, minute }: ReminderSetting) =>
  new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(new Date(2026, 0, 1, hour, minute));

async function configureChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
    name: "DeenFlow reminders",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 180],
    lightColor: "#0B3B36",
  });
}

export async function requestReminderPermission() {
  if (Platform.OS === "web") return false;
  await configureChannel();
  const current = await Notifications.getPermissionsAsync();
  if (current.status === "granted") return true;
  const updated = await Notifications.requestPermissionsAsync();
  return updated.status === "granted";
}

export async function synchronizeReminders(preferences: Preferences) {
  if (Platform.OS === "web") return { supported: false, scheduled: 0 };
  const allowed = await requestReminderPermission();
  if (!allowed) return { supported: true, scheduled: 0, permitted: false };
  await Notifications.cancelAllScheduledNotificationsAsync();
  const reminders = [
    { id: "daily", setting: preferences.reminders.daily, title: "Daily intention", body: "Open your checklist and choose what matters most today." },
    { id: "focus", setting: preferences.reminders.focus, title: "Today’s Focus", body: "A small focused action can move your day forward." },
    { id: "adhkar", setting: preferences.reminders.adhkar, title: "Adhkar investment", body: "A few moments of dhikr can add to the reward you are tracking." },
  ];
  const enabled = reminders.filter((reminder) => reminder.setting.enabled);
  await Promise.all(enabled.map((reminder) => Notifications.scheduleNotificationAsync({
    content: { title: reminder.title, body: reminder.body, data: { reminder: reminder.id } },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: reminder.setting.hour,
      minute: reminder.setting.minute,
      channelId: CHANNEL_ID,
    },
  })));
  return { supported: true, scheduled: enabled.length, permitted: true };
}
