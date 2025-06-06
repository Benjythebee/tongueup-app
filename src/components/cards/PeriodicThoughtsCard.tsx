import { StyleSheet, Text, View } from "react-native";
import CardComponent from "../Card";
import NumberSelector from "../NumberSelector";
import { useMemo, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import { TIME_NO_RECORD } from "./MomentaryNotesCard";
import useAsyncStorage from "../../hooks/useAsyncStorage";
import { useSavedTimeseries } from "../../context/TimeSeriesData";
import Icon from "@react-native-vector-icons/lucide";
import Button from "../Button";
import { useTranslation } from "react-i18next";

export const PeriodicThoughtsCard: React.FC = () => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [lastEntryRecord, setRecord] = useAsyncStorage(
    "lastPeriodicEntryRecord",
    { date: Date.now() - TIME_NO_RECORD }
  );
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { addPoint, refreshData } = useSavedTimeseries();
  const [numberOfTimes, setNumberOfTimes] = useState<[number, number]>([0, 0]);

  const onConfirm = async () => {
    await addPoint(numberOfTimes[0], numberOfTimes[1]);
    refreshData();
    setRecord({ date: Date.now() });
  };
  const isWait30Seconds =
    lastEntryRecord?.date && Date.now() - lastEntryRecord.date < TIME_NO_RECORD;

  return (
    <CardComponent
      title={t("header.PeriodicThoughts")}
      children={
        isWait30Seconds ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <Icon name="party-popper" size={32} color={colors.text} />
            <Text style={styles.celebrateText}>{t("general.KeepUpTheGoodWork")}</Text>
          </View>
        ) : (
          <>
            <Text style={styles.text}>
              {t("general.ComingOutOfMeeting")}
            </Text>

            <View
              style={{
                flexDirection: "column",
                // padding: 0,
                paddingVertical:10,
                gap: 10,
              }}
            >
              <View
                style={{
                  gap: 2,
                  flex: 1,
                  flexDirection: "row",
                  alignContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={[styles.text, {paddingLeft:15,fontSize: 24, flex: 1 }]}>
                  {t("buttons.IHaveThoughtAboutIt")}
                </Text>
                <NumberSelector
                  onSelected={(val) => {
                    const num = parseInt(val);
                    const lastVal = numberOfTimes[1];
                    setNumberOfTimes([num, lastVal]);
                  }}
                />
                <Text style={styles.text}> {t("singleWord.times")}</Text>
              </View>
              <View
                style={{
                  gap: 2,
                  flex: 1,
                  flexDirection: "row",
                  alignContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={[styles.text, { paddingLeft:15,fontSize: 24, flex: 1 }]}>
                  {t("buttons.TongueWasPushingMyTeeth")}
                </Text>
                <NumberSelector
                  onSelected={(val) => {
                    const num = parseInt(val);
                    const beginVal = numberOfTimes[0];
                    setNumberOfTimes([beginVal, num]);
                  }}
                />
                <Text style={styles.text}> {t("singleWord.times")}</Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "center" }}>
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
          </>
        )
      }
    />
  );
};

const createStyles = (colors: any) =>
  StyleSheet.create({
    celebrateText: {
      color: colors.text,
      fontSize: 24,
    },
    text: {
      color: colors.text,
      fontSize: 18,
    },
  });
