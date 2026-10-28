import { View, StyleSheet } from "react-native"
import CardComponent from "../Card"
import ChoiceTile from "../ChoiceTile";
import CelebrationState from "../CelebrationState";
import { useSavedTimeseries } from "../../context/TimeSeriesData";
import useAsyncStorage from "../../hooks/useAsyncStorage";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { spacing } from "../../theme/tokens";

export const TIME_NO_RECORD = 30 * 1000; // 30 seconds

export const MomentaryNotesCard: React.FC<{}> = ({}) => {
    const [lastEntryRecord,setRecord,refreshValue] = useAsyncStorage("lastEntryRecord",{date:Date.now()-TIME_NO_RECORD});
    const { refreshData, addPoint } = useSavedTimeseries();
    const { t } = useTranslation();

    const onAddThought = async (str: "ok" | "notok") => {
        await addPoint(str == "ok" ? 1 : 0, str == "notok" ? 1 : 0);
        setTimeout(() => {
          refreshValue();
        }, TIME_NO_RECORD); // Delay to allow confetti to show
        refreshData();
        setRecord({ date: Date.now() });
    };

    useEffect(() => {
        refreshValue()
    }, []);

    const isWait30Seconds = lastEntryRecord?.date && (Date.now() - lastEntryRecord.date < TIME_NO_RECORD);

    return (
      <CardComponent
        title={t("general.WhereIsYourTongue")}
        subtitle={isWait30Seconds ? undefined : t("home.checkInHint")}
      >
        {isWait30Seconds ? (
          <CelebrationState title={t("general.KeepUpTheGoodWork")} message={t("home.logged")} />
        ) : (
          <View style={styles.choices}>
            <ChoiceTile
              icon="check"
              tone="success"
              label={t("general.MyTongueWasOnRoof")}
              onPress={() => onAddThought("ok")}
            />
            <ChoiceTile
              icon="x"
              tone="error"
              label={t("general.MyTongueWasPushingTeeth")}
              onPress={() => onAddThought("notok")}
            />
          </View>
        )}
      </CardComponent>
    )
}

const styles = StyleSheet.create({
    choices: {
        flexDirection: "row",
        gap: spacing.md,
    },
})
