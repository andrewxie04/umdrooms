import { describe, expect, it } from 'vitest';
import { campusDateTime, campusFormat, scheduleEnd, validSchedule } from '../schedule';
import { getClassroomAvailability } from '../availability.js';

describe('visit planning', () => {
  it('uses Eastern time and rejects nonexistent DST times', () => {
    expect(campusDateTime('2026-09-28', '14:00')!.toISOString()).toBe('2026-09-28T18:00:00.000Z');
    expect(campusDateTime('2026-03-08', '02:30')).toBeNull();
    expect(campusDateTime('2026-12-01', '14:00')!.toISOString()).toBe('2026-12-01T19:00:00.000Z');
  });
  it('requires a bounded same-day visit', () => {
    const start = campusDateTime('2026-09-28', '23:00')!;
    expect(validSchedule(start, 30)).toBe(true);
    expect(validSchedule(start, 120)).toBe(false);
    expect(validSchedule(start, 0)).toBe(false);
    expect(validSchedule(start, NaN)).toBe(false);
  });
  it('checks the whole duration, including a conflict after arrival and closing', () => {
    const room = { availability_times: [{ date: '2026-09-28', time_start: 15, time_end: 16, status: 1 }] };
    const start = campusDateTime('2026-09-28', '14:00')!;
    expect(getClassroomAvailability(room, start, scheduleEnd(start, 60))).toBe('Available');
    expect(getClassroomAvailability(room, start, scheduleEnd(start, 120))).toBe('Unavailable');
    expect(campusFormat(scheduleEnd(start, 90), 'HH:mm')).toBe('15:30');
    const late = campusDateTime('2026-09-28', '21:00')!;
    expect(getClassroomAvailability(room, late, scheduleEnd(late, 120))).toBe('Closed');
  });
});
