import { useSavedTimeseries } from "../../context/TimeSeriesData"
import { LayoutChangeEvent, View } from "react-native"
import CardComponent from "../Card"
import { CurveType, LineChart } from "react-native-gifted-charts"
import LoadingSpinner from "../LoadingSpinner"
import {Dimensions} from 'react-native';
import { useTranslation } from "react-i18next"
import { fontSize, width } from "react-native-responsive-sizes";
import { useEffect, useRef, useState } from "react"

export const ProgressCard = () => {
    const { t, i18n} = useTranslation();
    const windowWidth = Dimensions.get('window').width;
    
    const [width, setWidth] = useState<number>(windowWidth);
    const ref = useRef<any>(null);
    const {data,loading,pointToTimeStamp} = useSavedTimeseries()

    const dateToLabel = (date: Date) => {
        // Transform date to a label "[day of the week], [day of the month] [month name]"
        const options: Intl.DateTimeFormatOptions = { weekday: 'short', hour:'2-digit' };
        return date.toLocaleDateString(i18n.language=='en'?'en-US':'fr-FR', options);
    }


    const onLayout=(event:LayoutChangeEvent)=> {
      const { width} = event.nativeEvent.layout;
      setWidth(width);
    }

    useEffect(() => {
      ref.current?.scrollToEnd()
    }, [width]);

    if (loading) {
        return <CardComponent title={t("header.Statistics")} children={<LoadingSpinner />} />
    }

    return (
            <CardComponent
              title={t("header.Statistics")}
              children={
                <>
                <View onLayout={onLayout} style={{flexDirection:'row',flex:1, overflow:'hidden'}}>
                        
                    <LineChart
                    scrollRef={ref}
                    curved={true}
                    xAxisThickness={1}
                    curveType={CurveType.QUADRATIC}
                    data={data.map((p)=>({label:dateToLabel(pointToTimeStamp(p.t)), value:p.ok}))}
                    data2={data.map((p)=>({label:dateToLabel(pointToTimeStamp(p.t)), value:p.nok}))}
                    xAxisLabelTextStyle={{
                      color: '#6b7280',
                      fontSize: fontSize(12),
                      // width: width(15),
                      fontWeight: '400',
                    }}
                    spacing={70}
                    initialSpacing={35}
                    endSpacing={35}

                    parentWidth={width}
                    width={width}
                    color={'#4CAF50'}
                    color2={'#F44336'}
                    // adjustToWidth={true}
                    dataPointsColor="#4CAF50"
                    dataPointsColor2="#F44336"
                    />
                </View>
                </>
              }
            />)
}