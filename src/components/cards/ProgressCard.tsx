import { HOUR_MS, useSavedTimeseries } from "../../context/TimeSeriesData"
import { LayoutChangeEvent, StyleSheet, View } from "react-native"
import { Touchable } from "react-native-gesture-handler"
import Icon from "@react-native-vector-icons/lucide"
import CardComponent from "../Card"
import { CurveType, LineChart } from "react-native-gifted-charts"
import LoadingSpinner from "../LoadingSpinner"
import StatTile from "../StatTile"
import SegmentedControl from "../SegmentedControl"
import AppText from "../AppText"
import { useTranslation } from "react-i18next"
import { useMemo, useState } from "react"
import { useTheme } from "../../context/ThemeContext"
import { spacing, typography } from "../../theme/tokens"
import { buildChartWindow, ChartBucket, ChartRange, CHART_RANGES } from "../../utils/chartWindow"

const RANGES: ChartRange[] = ['day', 'week', 'month', 'year'];
// Room before the first and after the last point, so their labels aren't clipped
const EDGE_SPACING = 16;
const LABEL_WIDTH = 56;
// The day view labels every Nth hour
const LABEL_EVERY_HOURS = 6;
const Y_AXIS_LABEL_WIDTH = 28;
const Y_SECTIONS = 3;

export const ProgressCard = () => {
    const { t, i18n } = useTranslation();
    const { colors } = useTheme();
    const [width, setWidth] = useState<number>(0);
    const [range, setRange] = useState<ChartRange>('week');
    // How many windows back from the current one
    const [offset, setOffset] = useState(0);
    const { data, loading } = useSavedTimeseries()
    const locale = i18n.language?.startsWith('fr') ? 'fr-FR' : 'en-US';

    const view = useMemo(() => buildChartWindow(data, range, offset), [data, range, offset]);
    const canGoBack = data.length > 0 && data[0].t * HOUR_MS < view.from.getTime();

    const totals = useMemo(() => {
        const { ok, nok, buckets } = view;
        const rate = ok + nok > 0 ? `${Math.round((ok / (ok + nok)) * 100)}%` : '–';
        // Whole-number y-axis steps: round the top of the axis up to a multiple of the section count
        const peak = buckets.reduce((max, p) => Math.max(max, p.ok, p.nok), 0);
        const maxValue = Math.max(Y_SECTIONS, Math.ceil(peak / Y_SECTIONS) * Y_SECTIONS);
        return { ok, nok, rate, maxValue };
    }, [view]);

    // Fit every bucket in the card
    const chartWidth = width - 36;
    const count = CHART_RANGES[range].count;
    const pointSpacing = Math.max(1, (chartWidth - Y_AXIS_LABEL_WIDTH - 2 * EDGE_SPACING) / (count - 1));
    const labelEvery = Math.ceil(LABEL_WIDTH / pointSpacing);

    const labelTextStyle = useMemo(() => ({
        ...typography.caption,
        fontSize: 11,
        color: colors.textMuted,
        width: LABEL_WIDTH,
        // gifted-charts sizes each label's box to the point spacing, and a one-line Text
        // on web caps its width to its parent
        maxWidth: LABEL_WIDTH,
        marginLeft: (pointSpacing - LABEL_WIDTH) / 2,
        textAlign: 'center' as const,
    }), [colors, pointSpacing]);

    const bucketLabel = (date: Date, index: number) => {
        switch (range) {
            // Midnight shows the weekday, other labelled hours show the time
            case 'day':
                if (date.getHours() % LABEL_EVERY_HOURS !== 0) return '';
                return date.getHours() === 0
                    ? date.toLocaleDateString(locale, { weekday: 'short' })
                    : date.toLocaleTimeString(locale, { hour: 'numeric' });
            case 'week':
                return date.toLocaleDateString(locale, { weekday: 'short' });
            case 'month':
                return index % labelEvery === 0 ? date.toLocaleDateString(locale, { day: 'numeric', month: 'short' }) : '';
            case 'year':
                return index % labelEvery === 0 ? date.toLocaleDateString(locale, { month: 'short' }) : '';
        }
    }

    const periodLabel = useMemo(() => {
        if (offset === 0) {
            return t(`stats.last.${range}`);
        }
        const format: Intl.DateTimeFormatOptions = {
            day: { weekday: 'short', hour: 'numeric' } as const,
            week: { day: 'numeric', month: 'short' } as const,
            month: { day: 'numeric', month: 'short' } as const,
            year: { month: 'short', year: 'numeric' } as const,
        }[range];
        const from = view.from.toLocaleString(locale, format);
        const to = view.to.toLocaleString(locale, format);
        return `${from} – ${to}`;
    }, [offset, range, view, locale, t]);

    const toChartData = (key: 'ok' | 'nok') => view.buckets.map((p: ChartBucket, index) => ({
        value: p[key],
        label: bucketLabel(p.start, index),
        labelTextStyle,
        hideDataPoint: p[key] === 0,
    }));

    const onLayout = (event: LayoutChangeEvent) => {
      setWidth(event.nativeEvent.layout.width);
    }

    const onRangeChange = (value: ChartRange) => {
      setRange(value);
      setOffset(0);
    }

    return (
      <CardComponent title={t("header.Statistics")} icon="chart-spline">
        {loading ? <LoadingSpinner /> : (
          <>
            <SegmentedControl
              stretch
              value={range}
              onChange={onRangeChange}
              options={RANGES.map((value) => ({ value, label: t(`stats.ranges.${value}`) }))}
            />
            <View style={styles.period}>
              <View style={!canGoBack && styles.arrowDisabled}>
                <Touchable
                  style={styles.arrow}
                  disabled={!canGoBack}
                  onPress={() => setOffset(offset + 1)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={t("stats.previous")}
                  accessibilityState={{ disabled: !canGoBack }}
                >
                  <Icon name="chevron-left" size={22} color={colors.textSecondary} />
                </Touchable>
              </View>
              <AppText variant="callout" tone="secondary" numberOfLines={1} style={styles.periodLabel}>
                {periodLabel}
              </AppText>
              <View style={offset === 0 && styles.arrowDisabled}>
                <Touchable
                  style={styles.arrow}
                  disabled={offset === 0}
                  onPress={() => setOffset(offset - 1)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={t("stats.next")}
                  accessibilityState={{ disabled: offset === 0 }}
                >
                  <Icon name="chevron-right" size={22} color={colors.textSecondary} />
                </Touchable>
              </View>
            </View>
            <View style={styles.stats}>
              <StatTile label={t("stats.onRoof")} value={totals.ok} tone="success" />
              <StatTile label={t("stats.offRoof")} value={totals.nok} tone="error" />
              <StatTile label={t("stats.rate")} value={totals.rate} tone="primary" />
            </View>
            <View onLayout={onLayout} style={styles.chart}>
              {width > 0 && (
                <LineChart
                  key={range}
                  data={toChartData('ok')}
                  data2={toChartData('nok')}
                  curved
                  curveType={CurveType.QUADRATIC}
                  areaChart
                  height={150}
                  parentWidth={width}
                  width={chartWidth}
                  disableScroll
                  spacing={pointSpacing}
                  initialSpacing={EDGE_SPACING}
                  endSpacing={EDGE_SPACING}
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
                  dataPointsRadius={pointSpacing < 12 ? 2.5 : 3.5}
                  rulesType="dashed"
                  rulesColor={colors.border}
                  xAxisColor={colors.border}
                  xAxisThickness={1}
                  yAxisThickness={0}
                  yAxisLabelWidth={Y_AXIS_LABEL_WIDTH}
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
  period: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  periodLabel: {
    flex: 1,
    textAlign: 'center',
  },
  arrow: {
    padding: spacing.xs,
  },
  arrowDisabled: {
    opacity: 0.3,
  },
  stats: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chart: {
    overflow: 'hidden',
    marginHorizontal: -spacing.sm,
  },
});
