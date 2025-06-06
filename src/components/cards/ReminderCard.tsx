import { StyleSheet, Switch, Text, View } from "react-native";
import CardComponent from "../Card";
import FrequencySelector, { frequencies, frequencyHoursLimits, FrequencyToi18n } from "../FrequencySelector";
import TimeSelector from "../TimeSelector";
import Icon from "@react-native-vector-icons/lucide";
import { useSettings } from "../../context/SettingsContext";
import { useTheme } from "../../context/ThemeContext";
import Button from "../Button";
import * as Notifications from "expo-notifications";
import { useMemo, useState } from "react";
import { scheduleRecurringNotificationsWithQuietTimes } from "../../utils/notificationScheduler";
import ActionButton from "../ActionButton";
import { useTranslation } from "react-i18next";

const identifier = "tongueup-tongue-reminder";

const notificationContent: Notifications.NotificationContentInput = {
            title: "Remember to drink water!",
            body: "It's time to hydrate! Remember to drink water for your health.",
            vibrate: [0, 250, 500, 250],
            sound: "default",
            priority: Notifications.AndroidNotificationPriority.HIGH,
        }

export const NotificationCard = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { settings, updateSetting } = useSettings();

  const styles = useMemo(() => createStyles(colors), [colors]);
  const [hasQuietTime, setHasQuietTime] = useState(false)

  const onDisableNotifications = async () => {
    // Remove notification if disabled
    
    await Notifications.cancelAllScheduledNotificationsAsync();
    updateSetting("notificationsEnabled", false);
  };

  const onUpdateTime = (key: "start" | "end", value: number) => {
    updateSetting("quietTime", {
      ...settings.quietTime,
      [key]: value,
    });
  };

  const onConfirm = async () => {
    const key = Object.keys(frequencies)[
      settings.frequency
    ] as keyof typeof frequencies;
    const seconds = frequencies[key];
    // Clear any existing notifications with this identifier
    await Notifications.cancelAllScheduledNotificationsAsync();

    if(hasQuietTime && settings.quietTime.start !== settings.quietTime.end){
        scheduleRecurringNotificationsWithQuietTimes({
        identifier,
        quietTimes: {
            start: settings.quietTime.start,
            end: settings.quietTime.end,
        },
        content:notificationContent,
        intervalMinutes: seconds / 60,
        durationHours: frequencyHoursLimits[key], // Default to 37 hours
        });
    }else{
        await Notifications.scheduleNotificationAsync({
            identifier,
            content: notificationContent,
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: seconds,
                repeats: true,
            },
            });
    }

    updateSetting("notificationsEnabled", true);
  };

  const isNotificationEnabled = settings.notificationsEnabled;

  const frequencyTextKey = FrequencyToi18n[Object.keys(frequencies)[settings.frequency] as keyof typeof FrequencyToi18n] || "general.label.every1Minutes";

  return (
    <CardComponent
      title={t("header.Frequency")}
      children={
        settings.notificationsEnabled ? (
          <View
            style={{
              gap: 2,
              flex: 1,
              flexDirection: "row",
              alignContent: "center",
              alignItems: "center",
            }}
          >
            <Text style={styles.text}>
              {t("general.description.notificationEnabled")}{" "}
              {t(frequencyTextKey).toLowerCase()}
            </Text>
            <ActionButton
              variant="small"
              style={{ backgroundColor: colors.error }}
              icon="x"
              onActionPress={onDisableNotifications}
            />
          </View>
        ) : (
          <>
            <Text style={styles.text}>{t("general.description.reminder")}</Text>

            <View
              style={{
                flexDirection: "column",
                justifyContent: "space-evenly",
                padding: 2,
              }}
            >
              <FrequencySelector onChange={(val)=>updateSetting('frequency',val)} defaultValue={settings.frequency} />
            </View>

            <View style={{ paddingTop: 4 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={styles.text}>{t("general.label.SetQuietPeriod")}</Text>
                    <Switch
                        trackColor={{false: '#767577', true: '#81b0ff'}}
                        thumbColor={hasQuietTime ? '#f5dd4b' : '#f4f3f4'}
                        ios_backgroundColor="#3e3e3e"
                        style={{ transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] }}
                        onValueChange={setHasQuietTime}
                        value={hasQuietTime}
                        />

                </View>
                {hasQuietTime && (
                <View style={{ paddingVertical: 0 }}>
                <Text style={styles.text}>
                    {t("general.description.tellUsWhatQuietTime")}
                </Text>

                <View
                    style={{
                    flexDirection: "column",
                    justifyContent: "space-evenly",
                    paddingHorizontal: 6,
                    }}
                >
                    <View
                    style={{
                        flexDirection: "row",
                        flex: 1,
                        justifyContent: "space-around",
                        gap: 6,
                        alignItems: "center",
                    }}
                    >
                    <View
                        style={{
                          alignItems: "center",
                          alignContent: "center",
                          justifyContent: "center",
                          gap: 2,
                        }}
                    >
                        <Icon name="sunset" size={24} color={colors.text} />
                    </View>
                    <TimeSelector
                        defaultValue={settings.quietTime.start}
                        onTimeChange={(newtime) => onUpdateTime("start", newtime)}
                    />

                    <View
                        style={{
                        alignItems: "center",
                        alignContent: "center",
                        justifyContent: "center",
                        gap: 2,
                        }}
                    >
                        <Icon name="sunrise" size={24} color={colors.text} />
                    </View>
                    <TimeSelector
                        defaultValue={settings.quietTime.end}
                        onTimeChange={(newtime) => onUpdateTime("end", newtime)}
                    />
                    </View>
                </View>
                </View>
                )}
            </View>
            {!isNotificationEnabled && (<View style={{flexDirection: "row", justifyContent: "center" }}>
              <Button
                style={{
                  backgroundColor: colors.success,
                  padding: 8,
                  borderRadius: 8,
                }}
                onPress={() => {
                  onConfirm();
                }}
                label={t("buttons.confirm")}
              />
            </View>

            )}
          </>
        )
      }
    />
  );
};


const createStyles = (colors: any) =>StyleSheet.create({
    text: {
      color: colors.text,
      fontSize: 18,
    },
})