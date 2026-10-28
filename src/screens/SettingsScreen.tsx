import React from "react";
import { Alert, Linking } from "react-native";
import Constants from "expo-constants";
import { useTheme } from "../context/ThemeContext";
import Button from "../components/Button";
import CardComponent from "../components/Card";
import ListRow, { Divider } from "../components/ListRow";
import Toggle from "../components/Toggle";
import AppText from "../components/AppText";
import { ScreenWrapper } from "../components/ScreenWrapper";
import { useSavedTimeseries } from "../context/TimeSeriesData";
import { useTranslation } from "react-i18next";
import LanguageSelector from "../components/LanguageSelector";

const SUPPORT_URL = "https://tongueup.benjylarcher.com/";

const SettingsScreen: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { clearAllData, refreshData } = useSavedTimeseries();
  const { t } = useTranslation();

  const onClearData = () => {
    Alert.alert(t("settings.confirmClearTitle"), t("settings.confirmClearMessage"), [
      { text: t("buttons.cancel"), style: "cancel" },
      {
        text: t("buttons.delete"),
        style: "destructive",
        onPress: async () => {
          await clearAllData();
          refreshData();
          Alert.alert(t("settings.dataCleared"), t("settings.dataClearedMessage"));
        },
      },
    ]);
  };

  return (
    <ScreenWrapper title={t("header.Settings")}>
      <CardComponent title={t("settings.preferences")}>
        <ListRow
          icon={isDark ? "moon" : "sun"}
          title={t("general.label.darkTheme")}
          right={<Toggle value={isDark} onValueChange={toggleTheme} accessibilityLabel={t("general.label.darkTheme")} />}
        />
        <Divider />
        <ListRow
          icon="languages"
          title={t("general.label.settingsLanguage")}
          right={<LanguageSelector />}
        />
      </CardComponent>

      <CardComponent title={t("settings.yourData")}>
        <ListRow
          icon="trash-2"
          iconTone="error"
          title={t("general.label.clearProgress")}
          description={t("settings.clearProgressDescription")}
        />
        <Button variant="danger" fullWidth label={t("buttons.delete")} onPress={onClearData} />
      </CardComponent>

      <CardComponent title={t("settings.about")}>
        <ListRow
          icon="life-buoy"
          iconTone="primary"
          title={t("settings.help")}
          onPress={() => Linking.openURL(SUPPORT_URL)}
        />
      </CardComponent>

      <AppText variant="caption" tone="muted" align="center">
        {t("settings.version", { version: Constants.expoConfig?.version ?? "" })}
      </AppText>
    </ScreenWrapper>
  );
};

export default SettingsScreen;
