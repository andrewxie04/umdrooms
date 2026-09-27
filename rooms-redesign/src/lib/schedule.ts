import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';

export const CAMPUS_ZONE = 'America/New_York';
export const campusFormat = (date: Date, pattern: string) => formatInTimeZone(date, CAMPUS_ZONE, pattern);
export const scheduleEnd = (start: Date, minutes: number) => new Date(start.getTime() + minutes * 60_000);

/** Daily feeds cannot confirm availability across midnight. */
export function validSchedule(start: Date, minutes: number): boolean {
  return Number.isFinite(start.getTime()) && Number.isInteger(minutes) && minutes >= 15 && minutes <= 720 &&
    campusFormat(start, 'yyyy-MM-dd') === campusFormat(scheduleEnd(start, minutes), 'yyyy-MM-dd');
}

export function campusDateTime(day: string, time: string): Date | null {
  const date = fromZonedTime(`${day}T${time}:00`, CAMPUS_ZONE);
  // Reject nonexistent clock times during the spring DST transition.
  return Number.isFinite(date.getTime()) && campusFormat(date, "yyyy-MM-dd'T'HH:mm") === `${day}T${time}` ? date : null;
}
