import { useSavedTimeseries } from "../../context/TimeSeriesData"
import { View } from "react-native"
import CardComponent from "../Card"
import { CurveType, LineChart } from "react-native-gifted-charts"
import LoadingSpinner from "../LoadingSpinner"
import {Dimensions} from 'react-native';
import { useTranslation } from "react-i18next"

export const ProgressCard = () => {
    const { t } = useTranslation();
    const {data,loading,pointToTimeStamp} = useSavedTimeseries()

    const dateToLabel = (date: Date) => {
        // Transform date to a label "[day of the week], [day of the month] [month name]"
        const options: Intl.DateTimeFormatOptions = { weekday: 'narrow', day: 'numeric', month: 'short' };
        return date.toLocaleDateString('en-US', options);
    }

    const windowWidth = Dimensions.get('window').width;

    if (loading) {
        return <CardComponent title={t("header.Progress")} children={<LoadingSpinner />} />
    }

    return (
            <CardComponent
              title={t("header.Progress")}
              children={
                <>
                <View  style={{flexDirection:'row',flex:1,}}>
                        
                    <LineChart
                    curved={true}
                    curveType={CurveType.QUADRATIC}
                    data={data.map((p)=>({label:dateToLabel(pointToTimeStamp(p.t)), value:p.ok}))}
                    data2={data.map((p)=>({label:dateToLabel(pointToTimeStamp(p.t)), value:p.nok}))}
                    rotateLabel={true}
                    endSpacing={0}
                    // adjustToWidth={true}
                    parentWidth={windowWidth - 70}
                    color={'#4CAF50'}
                    color2={'#F44336'}
                    adjustToWidth={true}
                    dataPointsColor="#4CAF50"
                    dataPointsColor2="#F44336"
                    />
                </View>
                </>
              }
            />)
}