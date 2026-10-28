import { useSavedTimeseries } from "../../context/TimeSeriesData"
import { LayoutChangeEvent, StyleSheet, View } from "react-native"
import CardComponent from "../Card"
import { CurveType, LineChart } from "react-native-gifted-charts"
import LoadingSpinner from "../LoadingSpinner"
import StatTile from "../StatTile"
import { useTranslation } from "react-i18next"
import { useEffect, useMemo, useRef, useState } from "react"
import { useTheme } from "../../context/ThemeContext"
import { spacing, typography } from "../../theme/tokens"

// react-native-svg draws the whole (scrollable) chart into one bitmap on Android,
// so plotting every hour since install runs out of memory: only plot the most recent hours
const CHART_HOURS = 48;
// Horizontal distance between two hourly points
const POINT_SPACING = 24;
// Only every Nth hour gets an x-axis label
const LABEL_EVERY_HOURS = 6;
const LABEL_WIDTH = 56;
const Y_SECTIONS = 3;

export const ProgressCard = () => {
    const { t, i18n } = useTranslation();
    const { colors } = useTheme();
    const [width, setWidth] = useState<number>(0);
    const ref = useRef<any>(null);
    const { data: allData, loading, pointToTimeStamp } = useSavedTimeseries()
    const data = allData.slice(-CHART_HOURS);
    const locale = i18n.language?.startsWith('fr') ? 'fr-FR' : 'en-US';

    const totals = useMemo(() => {
        const ok = data.reduce((sum, p) => sum + p.ok, 0);
        const nok = data.reduce((sum, p) => sum + p.nok, 0);
        const rate = ok + nok > 0 ? `${Math.round((ok / (ok + nok)) * 100)}%` : '–';
        // Whole-number y-axis steps: round the top of the axis up to a multiple of the section count
        const peak = data.reduce((max, p) => Math.max(max, p.ok, p.nok), 0);
        const maxValue = Math.max(Y_SECTIONS, Math.ceil(peak / Y_SECTIONS) * Y_SECTIONS);
        return { ok, nok, rate, maxValue };
    }, [data]);

    const labelTextStyle = useMemo(() => ({
        ...typography.caption,
        fontSize: 11,
        color: colors.textMuted,
        width: LABEL_WIDTH,
        marginLeft: (POINT_SPACING - LABEL_WIDTH) / 2,
    }), [colors]);

    // Midnight shows the weekday, other labelled hours show the time
    const hourToLabel = (date: Date) => {
        if (date.getHours() % LABEL_EVERY_HOURS !== 0) {
            return '';
        }
        return date.getHours() === 0
            ? date.toLocaleDateString(locale, { weekday: 'short' })
            : date.toLocaleTimeString(locale, { hour: 'numeric' });
    }

    const toChartData = (key: 'ok' | 'nok') => data.map((p) => ({
        value: p[key],
        label: hourToLabel(pointToTimeStamp(p.t)),
        labelTextStyle,
        hideDataPoint: p[key] === 0,
    }));

    const onLayout = (event: LayoutChangeEvent) => {
      setWidth(event.nativeEvent.layout.width);
    }

    useEffect(() => {
      ref.current?.scrollToEnd()
    }, [width, data.length]);

    return (
      <CardComponent title={t("header.Statistics")} subtitle={t("stats.window")} icon="chart-spline">
        {loading ? <LoadingSpinner /> : (
          <>
            <View style={styles.stats}>
              <StatTile label={t("stats.onRoof")} value={totals.ok} tone="success" />
              <StatTile label={t("stats.offRoof")} value={totals.nok} tone="error" />
              <StatTile label={t("stats.rate")} value={totals.rate} tone="primary" />
            </View>
            <View onLayout={onLayout} style={styles.chart}>
              {width > 0 && (
                <LineChart
                  scrollRef={ref}
                  data={toChartData('ok')}
                  data2={toChartData('nok')}
                  curved
                  curveType={CurveType.QUADRATIC}
                  areaChart
                  height={150}
                  parentWidth={width}
                  width={width - 36}
                  spacing={POINT_SPACING}
                  initialSpacing={12}
                  endSpacing={12}
                  maxValue={totals.maxValue}
                  noOfSections={Y_SECTIONS}
                  formatYLabel={(label) => String(Math.round(Number(label)))}
                  thickness={2.5}
                  color1={colors.success}
                  color2={colors.error}
                  startFillColor1={colors.success}
                  endFillColor1={colors.success}
                  startFillColor2={colors.error}
                  endFillColor2={colors.error}
                  startOpacity={0.22}
                  endOpacity={0}
                  dataPointsColor1={colors.success}
                  dataPointsColor2={colors.error}
                  dataPointsRadius={3.5}
                  rulesType="dashed"
                  rulesColor={colors.border}
                  xAxisColor={colors.border}
                  xAxisThickness={1}
                  yAxisThickness={0}
                  yAxisLabelWidth={28}
                  yAxisTextStyle={{ ...typography.caption, fontSize: 11, color: colors.textMuted }}
                />
              )}
            </View>
          </>
        )}
      </CardComponent>
    )
}

const styles = StyleSheet.create({
  stats: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chart: {
    overflow: 'hidden',
    marginHorizontal: -spacing.sm,
  },
});
