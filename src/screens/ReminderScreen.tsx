import React, { useMemo } from "react";
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
} from "react-native";
import { useTheme } from "../context/ThemeContext";

import { NotificationCard } from "../components/cards/ReminderCard";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { useTranslation } from "react-i18next";

const ReminderScreen: React.FC = () => {
  const { colors } = useTheme();
  const {t} = useTranslation();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <ScreenWrapper>
      <ScrollView
        style={{ flex: 1}}
        contentContainerStyle={{ gap: 25 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
        <Text style={styles.title}>{t("header.Reminders")}</Text>
      </View>
        <NotificationCard />
      </ScrollView>
    </ScreenWrapper>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    header: {
      paddingHorizontal: 16,
      paddingVertical: 0,
      paddingTop: 80,
      // borderBottomWidth: 1,
      // borderBottomColor: colors.border,
    },
    title: {
      fontSize: 42,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 16,
      color: colors.textSecondary,
      fontWeight: "400",
    },
    listContainer: {
      paddingVertical: 8,
    },
  });

export default ReminderScreen;
