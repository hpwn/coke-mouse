import type { TimeOfDayMetric } from './metric';
import { metricCsvHeader, metricCsvRow } from './csv_metric_appendix';

export function escapeCsv(value: string): string {
  if (value === undefined || value === null) value = '';
  const needsQuote = /[",\n\r]/.test(value);
  let v = value.replace(/"/g, '""');
  return needsQuote ? `"${v}"` : v;
}

export interface CsvLog {
  id: string;
  habitId: string;
  ts: number;
  note?: string;
  metric?: TimeOfDayMetric;
}

export function logsToCsv(logs: CsvLog[]): string {
  const metricHeader = metricCsvHeader().join(',');
  const header = `log_id,habit_id,epoch_ms,iso_utc,local_iso,note,${metricHeader}`;
  const rows = logs.map(l => {
    const d = new Date(l.ts);
    const metricRow = metricCsvRow(l.metric).map(escapeCsv);
    return [
      escapeCsv(l.id),
      escapeCsv(l.habitId),
      String(l.ts),
      escapeCsv(d.toISOString()),
      escapeCsv(d.toLocaleString()),
      escapeCsv(l.note ?? ''),
      ...metricRow
    ].join(',');
  });
  return [header, ...rows].join('\r\n') + '\r\n';
}
