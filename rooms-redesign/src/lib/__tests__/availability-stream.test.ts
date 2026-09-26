import { afterEach, expect, it, vi } from 'vitest';
import { fetchAvailabilityForDate } from '../availabilityData.js';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

it('reports each building result and distinguishes a failed feed from a free room', async () => {
  const buildings = ['AJC', 'ATL'].map((code) => ({
    code, classrooms: [{ id: `${code} 100`, availability_times: [] }],
  }));
  const booked = {
    ...buildings[0], classrooms: [{
      id: 'AJC 100', availability_times: [{ date: '2026-10-14', time_start: 9, time_end: 10 }],
    }],
  };
  vi.stubGlobal('fetch', vi.fn(async (_url: string, options: { body: string }) => {
    const { building } = JSON.parse(options.body);
    return building.code === 'AJC'
      ? { ok: true, json: async () => booked }
      : { ok: false, status: 503, text: async () => 'feed unavailable' };
  }));
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);

  const updates: Array<{ index: number; succeeded: boolean; building: { code: string } }> = [];
  const options = {
    concurrency: 2,
    onProgress: (progress: { index?: number; succeeded?: boolean; building?: { code: string } }) => {
      if (progress.index != null) updates.push(progress as typeof updates[number]);
    },
  };
  const result = await fetchAvailabilityForDate(buildings, '2026-10-14', options);

  expect(result[0]).toEqual(booked);
  expect(result[1]).toEqual(buildings[1]);
  expect(updates.map(({ index, succeeded, building }) =>
    [index, succeeded, building.code]).sort()).toEqual([
    [0, true, 'AJC'], [1, false, 'ATL'],
  ]);
});
