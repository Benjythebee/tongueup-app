import { View,Text,StyleSheet } from "react-native"
import ActionButton from "../ActionButton"
import CardComponent from "../Card"
import { useSavedTimeseries } from "../../context/TimeSeriesData";
import useAsyncStorage from "../../hooks/useAsyncStorage";
import { useTheme } from "../../context/ThemeContext";
import Icon from "@react-native-vector-icons/lucide";
import {  useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

export const TIME_NO_RECORD = 30 * 1000; // 30 seconds

export const MomentaryNotesCard: React.FC<{showConfetti:()=>void}> = ({showConfetti}) => {
    const { colors } = useTheme();
    const [lastEntryRecord,setRecord,refreshValue] = useAsyncStorage("lastEntryRecord",{date:Date.now()-TIME_NO_RECORD});
    const { refreshData, addPoint } = useSavedTimeseries();
    const styles = useMemo(() => createStyles(colors), [colors]);
    const { t } = useTranslation(); 

    const onAddThought = async (str: "ok" | "notok") => {
        str=='ok' && showConfetti()
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

    return ( <CardComponent
          title={t("general.WhereIsYourTongue")}
          children={isWait30Seconds?(<View style={{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:10}}>
                <Icon name="party-popper" size={32} color={colors.text} />
                <Text style={styles.celebrateText}>{t("general.KeepUpTheGoodWork")}!</Text>
          </View>):(
            <>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignContent: "center",
                }}
              >
                <ActionButton
                  icon="check"
                  text={t("general.MyTongueWasOnRoof")}
                  iconStyle={{
                    backgroundColor: colors.success,
                    borderRadius: 20,
                    padding: 4,
                  }}
                  onActionPress={() => onAddThought("ok")}
                />

                <ActionButton
                  icon="x"
                  text={t("general.MyTongueWasPushingTeeth")}
                  iconStyle={{
                    backgroundColor: colors.error,
                    borderRadius: 20,
                    padding: 4,
                  }}
                  onActionPress={() => onAddThought("notok")}
                />
              </View>
            </>)
          }
        />)
}


const createStyles = (colors:any)=>StyleSheet.create({
    celebrateText:{
        color:colors.text, 
        fontSize:24
    },
    text:{
        color:colors.text, 
        fontSize:18,
    },
})