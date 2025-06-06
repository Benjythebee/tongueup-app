import React, { useMemo } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";


import { Switch } from "react-native-gesture-handler";
import Icon from "@react-native-vector-icons/lucide";
import Button from "../components/Button";
import { useSavedTimeseries } from "../context/TimeSeriesData";
import { useTranslation } from "react-i18next";
import LanguageSelector from "../components/LanguageSelector";

const SettingsScreen: React.FC = () => {
  const { colors,theme,toggleTheme } = useTheme();
  const { clearAllData , refreshData} = useSavedTimeseries();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const {t} = useTranslation();

  const isDark = theme === "dark"
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('header.Settings')}</Text>
      </View>
      <ScrollView
        style={{ flex: 1, gap: 10 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.settingContainer}>
          <View style={{flexDirection: 'row', gap:5, alignItems: 'center'}}>
            <Icon name="moon" size={24} color={colors.text} />
            <Text style={styles.settingLabel}>{t("general.label.darkTheme")}</Text>
          </View>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isDark ? "#f4f3f4" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            style={{ marginVertical: 10, transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }]  }}
              />
        </View>
        <View style={styles.settingContainer}>
          <View style={{flexDirection: 'row', gap:5, alignItems: 'center'}}>
            <Icon name="octagon-alert" size={24} color={colors.text} />
            <Text style={styles.settingLabel}>{t("general.label.clearProgress")}</Text>
          </View>
          <Button 
          label={t("buttons.delete")}
          style={{backgroundColor:colors.error}}
          onPress={async ()=>{
            await clearAllData();
            refreshData()
            Alert.alert("Data cleared", "All your saved progress has been cleared.");
          }}
          />

        </View>

        <View style={styles.settingContainer}>
          <View style={{flexDirection: 'row', gap:5, alignItems: 'center'}}>
            <Icon name="languages" size={24} color={colors.text} />
            <Text style={styles.settingLabel}>{t("general.label.settingsLanguage")}</Text>
          </View>
          <LanguageSelector />

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingTop: 40,
      // borderBottomWidth: 1,
      // borderBottomColor: colors.border,
    },
    title: {
      fontSize: 42,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 4,
    },
    settingContainer:{
      paddingHorizontal: 40,
      paddingVertical: 12,
      backgroundColor: colors.card,
      borderRadius: 8,
      marginBottom: 10,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    settingLabel:{
      fontSize: 24,
      color: colors.text,
    }
  });

export default SettingsScreen;
