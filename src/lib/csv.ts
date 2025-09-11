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
}

export function logsToCsv(logs: CsvLog[]): string {
  const header = 'log_id,habit_id,epoch_ms,iso_utc,local_iso,note';
  const rows = logs.map(l => {
    const d = new Date(l.ts);
    return [
      escapeCsv(l.id),
      escapeCsv(l.habitId),
      String(l.ts),
      escapeCsv(d.toISOString()),
      escapeCsv(d.toLocaleString()),
      escapeCsv(l.note ?? '')
    ].join(',');
  });
  return [header, ...rows].join('\r\n') + '\r\n';
}
