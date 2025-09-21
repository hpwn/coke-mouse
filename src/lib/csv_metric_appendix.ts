import type { TimeOfDayMetric } from './metric';

const HEADERS = [
  'metric_kind',
  'metric_minutes',
  'metric_normalized',
  'metric_display',
  'metric_tz_offset'
] as const;

type HeaderTuple = typeof HEADERS;

type RowTuple = [string, string, string, string, string];

export function metricCsvHeader(): HeaderTuple {
  return HEADERS;
}

export function metricCsvRow(metric?: TimeOfDayMetric): RowTuple {
  if (!metric) {
    return ['', '', '', '', ''];
  }
  return [
    metric.kind,
    String(metric.minutesSinceMidnight),
    String(metric.normalizedMinutes),
    metric.display,
    String(metric.tzOffsetMin)
  ];
}
