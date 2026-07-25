import { describe, it, expect } from 'vitest';
import {
  getRoomStatusRank,
  isSupplementalRoom,
  isUniversityHoliday,
  getSupplementalOpenRange,
  getSupplementalAvailableBlocks,
  getBookedBlocks,
  getClassroomAvailability,
  getBuildingAvailability,
  getAvailableUntil,
  getAvailableForHours,
} from '../availability.js';

describe('availability.js pure functions', () => {
  describe('getRoomStatusRank', () => {
    it('ranks statuses correctly from most to least available', () => {
      expect(getRoomStatusRank('Available', 'Available')).toBe(0);
      expect(getRoomStatusRank('Opening Soon', 'Unavailable')).toBe(1);
      expect(getRoomStatusRank('Bookable Later', 'Unavailable')).toBe(2);
      expect(getRoomStatusRank('Other', 'Unavailable')).toBe(3);
      expect(getRoomStatusRank('Other', 'Closed')).toBe(4);
      expect(getRoomStatusRank('Other', 'Unknown')).toBe(5);
    });
  });

  describe('isSupplementalRoom', () => {
    it('identifies supplemental room records correctly', () => {
      expect(isSupplementalRoom(null)).toBe(false);
      expect(isSupplementalRoom({})).toBe(false);
      expect(isSupplementalRoom({ source: 'supplemental' })).toBe(false);
      expect(isSupplementalRoom({ source: 'supplemental', supplemental: {} })).toBe(true);
    });
  });

  describe('isUniversityHoliday', () => {
    it('detects fixed university holidays (New Years, Independence Day, Christmas)', () => {
      expect(isUniversityHoliday(new Date(2026, 0, 1))).toBe(true);  // Jan 1
      expect(isUniversityHoliday(new Date(2026, 6, 4))).toBe(true);  // Jul 4
      expect(isUniversityHoliday(new Date(2026, 11, 25))).toBe(true); // Dec 25
    });

    it('detects floating university holidays (MLK Day, Memorial Day, Labor Day, Thanksgiving)', () => {
      // 2026 Thanksgiving is Nov 26 (4th Thursday)
      expect(isUniversityHoliday(new Date(2026, 10, 26))).toBe(true);
      // Day after Thanksgiving
      expect(isUniversityHoliday(new Date(2026, 10, 27))).toBe(true);
      // Regular day is not holiday
      expect(isUniversityHoliday(new Date(2026, 9, 14))).toBe(false);
    });
  });

  describe('getSupplementalOpenRange & getSupplementalAvailableBlocks', () => {
    const alwaysRoom = {
      source: 'supplemental',
      supplemental: { hours: { type: 'always', holidayClosed: true } },
    };

    const weekdayRoom = {
      source: 'supplemental',
      supplemental: { hours: { type: 'weekday-window', start: 8, end: 18 } },
    };

    it('returns full 24h open window for always-open rooms on non-holidays', () => {
      const date = new Date(2026, 9, 14); // Wednesday
      expect(getSupplementalOpenRange(alwaysRoom, date)).toEqual({ start: 0, end: 24 });
      expect(getSupplementalAvailableBlocks(alwaysRoom, date)).toEqual([{ start: 0, end: 24 }]);
    });

    it('returns empty window for holiday-closed rooms on holidays', () => {
      const holiday = new Date(2026, 6, 4); // July 4th
      expect(getSupplementalOpenRange(alwaysRoom, holiday)).toBeNull();
      expect(getSupplementalAvailableBlocks(alwaysRoom, holiday)).toEqual([]);
    });

    it('handles weekday window rooms on weekends vs weekdays', () => {
      const wednesday = new Date(2026, 9, 14);
      const sunday = new Date(2026, 9, 18);
      expect(getSupplementalOpenRange(weekdayRoom, wednesday)).toEqual({ start: 8, end: 18 });
      expect(getSupplementalOpenRange(weekdayRoom, sunday)).toBeNull();
    });
  });

  describe('getBookedBlocks', () => {
    it('parses 25Live availability_times entries into decimal hour blocks', () => {
      const room = {
        availability_times: [
          {
            date: '2026-10-14',
            time_start: 9,
            time_end: 10.5,
            status: 1,
            event_name: 'CMSC 131',
          },
        ],
      };
      const blocks = getBookedBlocks(room, new Date(2026, 9, 14));
      expect(blocks.length).toBe(1);
      expect(blocks[0].start).toBe(9);
      expect(blocks[0].end).toBe(10.5);
    });
  });

  describe('getClassroomAvailability', () => {
    it('returns Available for a room with no schedule during operating hours', () => {
      const room = { availability_times: [] };
      const testDate = new Date(2026, 9, 14, 10, 0); // Wed 10 AM
      const res = getClassroomAvailability(room, testDate, testDate);
      expect(res).toBe('Available');
    });

    it('returns Unavailable when a room is booked during the selected window', () => {
      const room = {
        availability_times: [
          {
            date: '2026-10-14',
            time_start: 7,
            time_end: 22,
            status: 1,
            event_name: 'CMSC 216',
          },
        ],
      };
      const testDate = new Date(2026, 9, 14, 10, 0);
      const res = getClassroomAvailability(room, testDate, testDate);
      expect(res).toBe('Unavailable');
    });
  });

  describe('getBuildingAvailability & getBuildingRenderState', () => {
    it('aggregates building rooms availability stats correctly', () => {
      const rooms = [
        { availability_times: [] }, // available
        {
          availability_times: [
            {
              date: '2026-10-14',
              time_start: 7,
              time_end: 22,
              status: 1,
            },
          ],
        }, // unavailable
      ];
      const testDate = new Date(2026, 9, 14, 10, 0);
      const status = getBuildingAvailability(rooms, testDate, testDate);
      expect(status).toBe('Available');
    });
  });

  describe('getAvailableUntil & getAvailableForHours', () => {
    it('computes open duration remaining for available room', () => {
      const room = {
        availability_times: [
          {
            date: '2026-10-14',
            time_start: 14,
            time_end: 16,
            status: 1,
          },
        ],
      };
      const current = new Date(2026, 9, 14, 10, 0); // 10 AM, booked at 2 PM (14.0)
      const until = getAvailableUntil(room, current);
      expect(until).toBe('2:00 PM');
      const hours = getAvailableForHours(room, current);
      expect(hours).toBe(4);
    });
  });
});
