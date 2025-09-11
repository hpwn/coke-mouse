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
    expect(csv).toBe(
      'log_id,habit_id,epoch_ms,iso_utc,local_iso,note\r\n1,h,0,1970-01-01T00:00:00.000Z,LOCAL,"a,""b""\nline"\r\n'
    );
  });
});
