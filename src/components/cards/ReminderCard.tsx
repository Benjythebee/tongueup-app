import { Linking, Platform, StyleSheet, View } from "react-native";
import * as Notifications from "expo-notifications";
import CardComponent from "../Card";
import FrequencySelector, { frequencies, FrequencyToi18n } from "../FrequencySelector";
import TimeSelector, { timeNumberToString } from "../TimeSelector";
import Icon from "@react-native-vector-icons/lucide";
import { useSettings } from "../../context/SettingsContext";
import { useTheme } from "../../context/ThemeContext";
import Button from "../Button";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import AppText from "../AppText";
import ListRow, { Divider } from "../ListRow";
import Toggle from "../Toggle";
import { radius, spacing } from "../../theme/tokens";
import { IconName, ThemeColors } from "../../types/common";
import { useReminderPermissions } from "../../hooks/useReminders";
import { computeReminderSlots, getNextReminderDate } from "../../utils/reminderSchedule";

// "8:15am" in English (like the `time.*` labels), "08:15" in French
const formatClock = (date: Date, language: string) => {
  const minutes = String(date.getMinutes()).padStart(2, "0");
  if (language.startsWith("fr")) {
    return `${String(date.getHours()).padStart(2, "0")}:${minutes}`;
  }
  const hour12 = date.getHours() % 12 || 12;
  return `${hour12}:${minutes}${date.getHours() < 12 ? "am" : "pm"}`;
};

const openBatterySettings = () =>
  Linking.sendIntent("android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS").catch(() => Linking.openSettings());

export const NotificationCard = () => {
  const { colors } = useTheme();
  const { t, i18n } = useTranslation();
  const { settings, updateSetting, updateSettings } = useSettings();
  const { permissions, refresh: refreshPermissions } = useReminderPermissions();

  const styles = useMemo(() => createStyles(colors), [colors]);
  const [permissionDenied, setPermissionDenied] = useState(false);

  // Scheduling itself follows the settings (see useReminderSync)
  const onDisableNotifications = () => updateSetting("notificationsEnabled", false);

  const onUpdateTime = (key: "start" | "end", value: number) => {
    updateSetting("quietTime", {
      ...settings.quietTime,
      [key]: value,
    });
  };

  const onConfirm = async () => {
    if (Platform.OS !== "web") {
      const { granted } = await Notifications.requestPermissionsAsync();
      if (!granted) {
        setPermissionDenied(true);
        await refreshPermissions();
        return;
      }
    }
    setPermissionDenied(false);
    const now = new Date();
    await updateSettings({
      notificationsEnabled: true,
      // Without quiet hours, slots are counted from now
      reminderAnchorMinute: now.getHours() * 60 + now.getMinutes(),
    });
    await refreshPermissions();
  };

  const onAllowExactTiming = async () => {
    try {
      await Notifications.requestExactAlarmPermissionsAsync();
    } catch (error) {
      console.error("Failed to request the exact alarm permission", error);
    }
    await refreshPermissions();
  };

  const frequencyTextKey = FrequencyToi18n[Object.keys(frequencies)[settings.frequency] as keyof typeof FrequencyToi18n] || "general.label.every15Minutes";
  const quietSummary = t("reminders.quietSummary", {
    start: t(`time.${timeNumberToString(settings.quietTime.start)}`),
    end: t(`time.${timeNumberToString(settings.quietTime.end)}`),
  });
  const nextReminder = getNextReminderDate(computeReminderSlots(settings));

  const renderTimeColumn = (icon: IconName, label: string, key: "start" | "end") => (
    <View style={styles.timeColumn}>
      <View style={styles.timeLabel}>
        <Icon name={icon} size={16} color={colors.textSecondary} />
        <AppText variant="caption" tone="secondary">{label}</AppText>
      </View>
      <TimeSelector
        defaultValue={settings.quietTime[key]}
        onTimeChange={(newtime) => onUpdateTime(key, newtime)}
      />
    </View>
  );

  const notificationsBlockedRow = (
    <ListRow
      icon="bell-off"
      iconTone="error"
      title={t("reminders.notificationsBlocked")}
      description={t("reminders.notificationsBlockedDescription")}
      right={<Button size="sm" variant="secondary" label={t("reminders.openSettings")} onPress={() => Linking.openSettings()} />}
    />
  );

  if (settings.notificationsEnabled) {
    return (
      <CardComponent title={t("reminders.active")} icon="bell-ring" iconTone="success">
        <View style={styles.summary}>
          <AppText>
            {t("general.description.notificationEnabled")}{" "}
            {t(frequencyTextKey).toLowerCase()}.
          </AppText>
          {settings.quietTimeEnabled && <AppText variant="callout" tone="secondary">{quietSummary}</AppText>}
          {nextReminder && (
            <AppText variant="callout" tone="secondary">
              {t("reminders.nextReminder", { time: formatClock(nextReminder, i18n.language) })}
            </AppText>
          )}
        </View>

        {permissions && !permissions.notifications && notificationsBlockedRow}
        {permissions && !permissions.exactAlarms && (
          <ListRow
            icon="clock-alert"
            iconTone="error"
            title={t("reminders.exactTiming")}
            description={t("reminders.exactTimingDescription")}
            right={<Button size="sm" variant="secondary" label={t("reminders.allow")} onPress={onAllowExactTiming} />}
          />
        )}

        <Divider />
        <ListRow
          icon="alarm-clock"
          title={t("reminders.strictTiming")}
          description={t("reminders.strictTimingDescription")}
          right={
            <Toggle
              value={settings.strictTiming}
              onValueChange={(value) => updateSetting("strictTiming", value)}
              accessibilityLabel={t("reminders.strictTiming")}
            />
          }
        />
        {Platform.OS === "android" && (
          <>
            <Divider />
            <ListRow
              icon="battery-warning"
              title={t("reminders.lateReminders")}
              description={t("reminders.lateRemindersDescription")}
              onPress={openBatterySettings}
            />
          </>
        )}

        <Button
          variant="danger"
          icon="bell-off"
          fullWidth
          label={t("buttons.turnOff")}
          onPress={onDisableNotifications}
        />
      </CardComponent>
    );
  }

  return (
    <CardComponent title={t("header.Frequency")} subtitle={t("general.description.reminder")} icon="bell">
      <View style={styles.section}>
        <AppText variant="overline" tone="secondary">{t("general.label.RemindMe")}</AppText>
        <FrequencySelector onChange={(val)=>updateSetting('frequency',val)} defaultValue={settings.frequency} />
      </View>

      <Divider />

      <ListRow
        icon="moon-star"
        title={t("reminders.quietHours")}
        description={t("reminders.quietHoursDescription")}
        right={
          <Toggle
            value={settings.quietTimeEnabled}
            onValueChange={(value) => updateSetting("quietTimeEnabled", value)}
            accessibilityLabel={t("reminders.quietHours")}
          />
        }
      />
      {settings.quietTimeEnabled && (
        <View style={styles.quietHours}>
          {renderTimeColumn("sunset", t("reminders.from"), "start")}
          {renderTimeColumn("sunrise", t("reminders.to"), "end")}
        </View>
      )}

      {permissionDenied && permissions && !permissions.notifications && notificationsBlockedRow}

      <Button
        icon="bell-ring"
        fullWidth
        label={t("buttons.startReminders")}
        onPress={onConfirm}
      />
    </CardComponent>
  );
};


const createStyles = (colors: ThemeColors) => StyleSheet.create({
    summary: {
      gap: spacing.xs,
    },
    section: {
      gap: spacing.sm,
    },
    quietHours: {
      flexDirection: "row",
      gap: spacing.md,
      backgroundColor: colors.surfaceMuted,
      borderRadius: radius.md,
      padding: spacing.md,
    },
    timeColumn: {
      flex: 1,
      gap: spacing.sm,
    },
    timeLabel: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.xs,
    },
})
