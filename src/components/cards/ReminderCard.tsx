import { StyleSheet, View } from "react-native";
import CardComponent from "../Card";
import FrequencySelector, { frequencies, FrequencyToi18n } from "../FrequencySelector";
import TimeSelector, { timeNumberToString } from "../TimeSelector";
import Icon from "@react-native-vector-icons/lucide";
import { useSettings } from "../../context/SettingsContext";
import { useTheme } from "../../context/ThemeContext";
import Button from "../Button";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { registerBackgroundTaskAsync, unregisterBackgroundTaskAsync } from "../../utils/registerBackgroundNotification";
import AppText from "../AppText";
import ListRow, { Divider } from "../ListRow";
import Toggle from "../Toggle";
import { radius, spacing } from "../../theme/tokens";
import { IconName, ThemeColors } from "../../types/common";

export const NotificationCard = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { settings, updateSetting } = useSettings();

  const styles = useMemo(() => createStyles(colors), [colors]);
  const [hasQuietTime, setHasQuietTime] = useState(false)

  const onDisableNotifications = async () => {
    // Remove notification if disabled
    await unregisterBackgroundTaskAsync()
    updateSetting("notificationsEnabled", false);
  };

  const onUpdateTime = (key: "start" | "end", value: number) => {
    updateSetting("quietTime", {
      ...settings.quietTime,
      [key]: value,
    });
  };

  // An earlier approach pre-scheduled date-triggered notifications that skip quiet hours,
  // see utils/notificationScheduler.ts (scheduleRecurringNotificationsWithQuietTimes)
  const onConfirm = async () => {
    await registerBackgroundTaskAsync()

    updateSetting("notificationsEnabled", true);
  };

  const frequencyTextKey = FrequencyToi18n[Object.keys(frequencies)[settings.frequency] as keyof typeof FrequencyToi18n] || "general.label.every15Minutes";
  const quietSummary = t("reminders.quietSummary", {
    start: t(`time.${timeNumberToString(settings.quietTime.start)}`),
    end: t(`time.${timeNumberToString(settings.quietTime.end)}`),
  });

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

  if (settings.notificationsEnabled) {
    return (
      <CardComponent title={t("reminders.active")} icon="bell-ring" iconTone="success">
        <View style={styles.summary}>
          <AppText>
            {t("general.description.notificationEnabled")}{" "}
            {t(frequencyTextKey).toLowerCase()}.
          </AppText>
          <AppText variant="callout" tone="secondary">{quietSummary}</AppText>
        </View>
        <AppText variant="caption" tone="muted">{t("reminders.batteryNote")}</AppText>
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
        right={<Toggle value={hasQuietTime} onValueChange={setHasQuietTime} accessibilityLabel={t("reminders.quietHours")} />}
      />
      {hasQuietTime && (
        <View style={styles.quietHours}>
          {renderTimeColumn("sunset", t("reminders.from"), "start")}
          {renderTimeColumn("sunrise", t("reminders.to"), "end")}
        </View>
      )}

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
