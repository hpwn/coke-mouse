import { describe, it, expect } from 'vitest';
import { logsToCsv } from '../src/lib/csv';

describe('csv utilities', () => {
  it('escapes commas quotes and newlines', () => {
    const orig = Date.prototype.toLocaleString;
    Date.prototype.toLocaleString = () => 'LOCAL';
    const csv = logsToCsv([
      { id: '1', habitId: 'h', ts: 0, note: 'a,"b"\nline' }
    ]);
    Date.prototype.toLocaleString = orig;
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv.slice(1)).toBe(
      'log_id,habit_id,epoch_ms,iso_utc,local_iso,note,metric_kind,metric_minutes,metric_normalized,metric_display,metric_tz_offset\r\n' +
        '1,h,0,1970-01-01T00:00:00.000Z,LOCAL,"a,""b""\nline",,,,,\r\n'
    );
  });
});
