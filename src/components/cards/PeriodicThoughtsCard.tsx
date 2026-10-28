import { View } from "react-native";
import CardComponent from "../Card";
import { useState } from "react";
import { TIME_NO_RECORD } from "./MomentaryNotesCard";
import useAsyncStorage from "../../hooks/useAsyncStorage";
import { useSavedTimeseries } from "../../context/TimeSeriesData";
import Button from "../Button";
import CelebrationState from "../CelebrationState";
import ListRow, { Divider } from "../ListRow";
import Stepper from "../Stepper";
import { useTranslation } from "react-i18next";

export const PeriodicThoughtsCard: React.FC = () => {
  const { t } = useTranslation();
  const [lastEntryRecord, setRecord] = useAsyncStorage(
    "lastPeriodicEntryRecord",
    { date: Date.now() - TIME_NO_RECORD }
  );
  const { addPoint, refreshData } = useSavedTimeseries();
  const [okCount, setOkCount] = useState(0);
  const [nokCount, setNokCount] = useState(0);

  const onConfirm = async () => {
    await addPoint(okCount, nokCount);
    refreshData();
    setOkCount(0);
    setNokCount(0);
    setRecord({ date: Date.now() });
  };
  const isWait30Seconds =
    lastEntryRecord?.date && Date.now() - lastEntryRecord.date < TIME_NO_RECORD;

  return (
    <CardComponent
      title={t("header.PeriodicThoughts")}
      subtitle={isWait30Seconds ? undefined : t("home.catchUpHint")}
      icon="hourglass"
    >
      {isWait30Seconds ? (
        <CelebrationState title={t("general.KeepUpTheGoodWork")} message={t("home.logged")} />
      ) : (
        <>
          <View>
            <ListRow
              icon="check"
              iconTone="success"
              title={t("general.MyTongueWasOnRoof")}
              right={<Stepper value={okCount} onChange={setOkCount} />}
            />
            <Divider />
            <ListRow
              icon="x"
              iconTone="error"
              title={t("general.MyTongueWasPushingTeeth")}
              right={<Stepper value={nokCount} onChange={setNokCount} />}
            />
          </View>
          <Button
            fullWidth
            label={t("buttons.save")}
            disabled={okCount === 0 && nokCount === 0}
            onPress={onConfirm}
          />
        </>
      )}
    </CardComponent>
  );
};
