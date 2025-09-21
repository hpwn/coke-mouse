export type MetricKind = 'timeOfDay';

export interface HabitMetricConfig {
  kind: MetricKind;
  // For bedtime, earlier is better relative to wrapHour
  wrapHour?: number; // default 18 (6 PM)
  lowerIsBetter?: boolean; // default true
}

export interface TimeOfDayMetric {
  kind: 'timeOfDay';
  // minutes since midnight local (0..1439) as logged
  minutesSinceMidnight: number;
  // normalized minutes since wrapHour (0..1439), used for comparisons
  normalizedMinutes: number;
  // pretty display like "11:23 PM"
  display: string;
  // local TZ offset (minutes) for reference
  tzOffsetMin: number;
}

export function clampWrapHour(value: number | undefined): number | undefined {
  if (value === undefined || Number.isNaN(value)) return undefined;
  const v = Math.trunc(value);
  if (v < 0) return 0;
  if (v > 23) return 23;
  return v;
}

export function minutesSinceMidnight(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export function normalizeByWrap(minutes: number, wrapHour = 18): number {
  const safeWrap = clampWrapHour(wrapHour) ?? 18;
  const shiftMinutes = ((safeWrap % 24) + 24) % 24 * 60;
  const norm = (Math.round(minutes) - shiftMinutes + 1440) % 1440;
  return (norm + 1440) % 1440;
}

export function denormalizeByWrap(normalized: number, wrapHour = 18): number {
  const safeWrap = clampWrapHour(wrapHour) ?? 18;
  const shiftMinutes = ((safeWrap % 24) + 24) % 24 * 60;
  const value = (Math.round(normalized) + shiftMinutes) % 1440;
  return (value + 1440) % 1440;
}

export function formatTimeHHMM(date: Date): string {
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

export function minutesToDisplay(minutes: number): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setMinutes(Math.max(0, Math.round(minutes)));
  return formatTimeHHMM(d);
}

export function buildTimeOfDayMetric(date: Date, cfg?: HabitMetricConfig): TimeOfDayMetric {
  const wrapHour = clampWrapHour(cfg?.wrapHour) ?? 18;
  const minutes = minutesSinceMidnight(date);
  const normalizedMinutes = normalizeByWrap(minutes, wrapHour);
  const tzOffsetMin = -date.getTimezoneOffset();
  return {
    kind: 'timeOfDay',
    minutesSinceMidnight: minutes,
    normalizedMinutes,
    display: formatTimeHHMM(date),
    tzOffsetMin
  };
}

export function betterIsLower(cfg?: HabitMetricConfig): boolean {
  return cfg?.lowerIsBetter ?? true;
}

export function isBetterTimeOfDay(
  a: TimeOfDayMetric,
  b: TimeOfDayMetric,
  cfg?: HabitMetricConfig
): boolean {
  const lower = betterIsLower(cfg);
  return lower ? a.normalizedMinutes < b.normalizedMinutes : a.normalizedMinutes > b.normalizedMinutes;
}
