import { HOUR_MS, TimeSeriesDataPoint } from "../context/TimeSeriesData";

export type ChartRange = 'day' | 'week' | 'month' | 'year';
type BucketUnit = 'hour' | 'day' | 'month';

// Each range is a fixed number of buckets so the chart always fits the card without scrolling
// (react-native-svg rasterises the whole chart on Android, so a long scrollable one runs out of memory)
export const CHART_RANGES: Record<ChartRange, { unit: BucketUnit; count: number }> = {
  day: { unit: 'hour', count: 24 },
  week: { unit: 'day', count: 7 },
  month: { unit: 'day', count: 30 },
  year: { unit: 'month', count: 12 },
};

export interface ChartBucket {
  start: Date;
  ok: number;
  nok: number;
}

export interface ChartWindow {
  buckets: ChartBucket[];
  /** Start of the first bucket */
  from: Date;
  /** Start of the last bucket */
  to: Date;
  ok: number;
  nok: number;
}

// Hours follow the stored hour-since-epoch buckets; days and months follow the local calendar
const startOfUnit = (date: Date, unit: BucketUnit) => {
  switch (unit) {
    case 'hour': return new Date(Math.floor(date.getTime() / HOUR_MS) * HOUR_MS);
    case 'day': return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    case 'month': return new Date(date.getFullYear(), date.getMonth(), 1);
  }
};

const addUnits = (date: Date, unit: BucketUnit, amount: number) => {
  switch (unit) {
    case 'hour': return new Date(date.getTime() + amount * HOUR_MS);
    case 'day': return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
    case 'month': return new Date(date.getFullYear(), date.getMonth() + amount, 1);
  }
};

/**
 * Sums the (sorted, sparse) hourly points into the buckets of one window of `range`.
 * `offset` 0 is the window ending with the current hour/day/month, 1 the one before it, etc.
 */
export const buildChartWindow = (
  data: TimeSeriesDataPoint[],
  range: ChartRange,
  offset: number,
  now: Date = new Date(),
): ChartWindow => {
  const { unit, count } = CHART_RANGES[range];
  const to = addUnits(startOfUnit(now, unit), unit, -offset * count);
  const from = addUnits(to, unit, -(count - 1));
  const buckets: ChartBucket[] = Array.from({ length: count }, (_, i) => ({
    start: addUnits(from, unit, i),
    ok: 0,
    nok: 0,
  }));
  const end = addUnits(to, unit, 1).getTime();

  let ok = 0;
  let nok = 0;
  let index = 0;
  for (const point of data) {
    const time = point.t * HOUR_MS;
    if (time < from.getTime()) continue;
    if (time >= end) break;
    while (index < count - 1 && time >= buckets[index + 1].start.getTime()) index++;
    buckets[index].ok += point.ok;
    buckets[index].nok += point.nok;
    ok += point.ok;
    nok += point.nok;
  }

  return { buckets, from, to, ok, nok };
};
