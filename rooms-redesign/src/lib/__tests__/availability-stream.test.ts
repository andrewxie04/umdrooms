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
  vi.stubGlobal('fetch', vi.fn(async (url: string, options?: { body?: string }) => {
    const code = options?.body
      ? JSON.parse(options.body).building.code
      : new URL(url, 'http://localhost').searchParams.get('code');
    return code === 'AJC'
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

it('asks with a cacheable GET and falls back to POST on an older deployment', async () => {
  const buildings = [{ code: 'IRB', classrooms: [{ id: 'IRB 0318', availability_times: [] }] }];
  const calls: string[] = [];
  vi.stubGlobal('fetch', vi.fn(async (url: string, options?: { method?: string; body?: string }) => {
    calls.push(`${options?.method ?? 'GET'} ${url}`);
    if (!options?.method) return { ok: false, status: 405, text: async () => 'Method not allowed' };
    return { ok: true, status: 200, json: async () => buildings[0] };
  }));

  const result = await fetchAvailabilityForDate(buildings, '2026-11-19', { concurrency: 1 });

  expect(result).toEqual(buildings);
  expect(calls).toEqual([
    'GET /.netlify/functions/availability-building?date=2026-11-19&code=IRB',
    'POST /.netlify/functions/availability-building',
  ]);
});

it('requests priority buildings first, then the largest', async () => {
  const room = (code: string, n: number) => Array.from({ length: n }, (_, i) => ({ id: `${code} ${i}`, availability_times: [] }));
  const buildings = [
    { code: 'AJC', classrooms: room('AJC', 2) },
    { code: 'MTH', classrooms: room('MTH', 29) },
    { code: 'IRB', classrooms: room('IRB', 6) },
  ];
  const order: string[] = [];
  vi.stubGlobal('fetch', vi.fn(async (url: string, options?: { body?: string }) => {
    // An earlier test switched the module to POST (older deployment); accept both.
    const code = options?.body
      ? JSON.parse(options.body).building.code
      : new URL(url, 'http://localhost').searchParams.get('code')!;
    order.push(code);
    return { ok: true, status: 200, json: async () => buildings.find((b) => b.code === code) };
  }));

  const result = await fetchAvailabilityForDate(buildings, '2026-11-19', { concurrency: 1, priority: ['AJC'] });

  expect(order).toEqual(['AJC', 'MTH', 'IRB']);
  expect(result.map((b: { code: string }) => b.code)).toEqual(['AJC', 'MTH', 'IRB']);
});

it('bypasses cached copies on a forced refresh', async () => {
  vi.resetModules();
  const { fetchAvailabilityForDate: fetchFresh } = await import('../availabilityData.js');
  const buildings = [{ code: 'IRB', classrooms: [{ id: 'IRB 0318', availability_times: [] }] }];
  const calls: Array<[string, RequestInit | undefined]> = [];
  vi.stubGlobal('fetch', vi.fn(async (url: string, options?: RequestInit) => {
    calls.push([url, options]);
    return { ok: true, status: 200, json: async () => buildings[0] };
  }));
  vi.spyOn(Date, 'now').mockReturnValue(Date.UTC(2026, 10, 19, 6, 5, 30));

  await fetchFresh(buildings, '2026-11-19', { concurrency: 1 });
  await fetchFresh(buildings, '2026-11-19', { concurrency: 1, fresh: true });

  expect(calls[0][0]).toBe('/.netlify/functions/availability-building?date=2026-11-19&code=IRB');
  expect(calls[0][1]?.cache).toBeUndefined();
  expect(calls[1][0]).toBe(`/.netlify/functions/availability-building?date=2026-11-19&code=IRB&fresh=${Math.floor(Date.UTC(2026, 10, 19, 6, 5, 30) / 60000)}`);
  expect(calls[1][1]?.cache).toBe('no-store');
});
