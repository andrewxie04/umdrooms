import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchAvailabilityForDate, fetchJsonWithProgress } from '../availabilityData.js';
import { fetchLibCalAvailabilityForDate } from '../libcalData.js';
import { fetchDiningHallsForDate } from '../diningData.js';
import { invalidatePersistedDay, persistDay } from '../dayCachePersistence';

vi.mock('../availabilityData.js', async (importOriginal) => ({
  ...await importOriginal<typeof import('../availabilityData.js')>(),
  fetchJsonWithProgress: vi.fn(),
  fetchAvailabilityForDate: vi.fn(),
}));
vi.mock('../libcalData.js', async (importOriginal) => ({
  ...await importOriginal<typeof import('../libcalData.js')>(),
  fetchLibCalAvailabilityForDate: vi.fn(),
}));
vi.mock('../diningData.js', async (importOriginal) => ({
  ...await importOriginal<typeof import('../diningData.js')>(),
  fetchDiningHallsForDate: vi.fn(),
}));
vi.mock('../dayCachePersistence', () => ({
  readPersistedDay: vi.fn().mockResolvedValue(null),
  invalidatePersistedDay: vi.fn().mockResolvedValue(undefined),
  persistDay: vi.fn().mockResolvedValue(undefined),
}));

describe('classroom availability failures', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('keeps room statuses unknown while loading and failed, then restores them on retry', async () => {
    const storage = new Map<string, string>([['dayCache.v1.stale', 'x'.repeat(1000)]]);
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        const used = [...storage].reduce((sum, [entryKey, entryValue]) =>
          sum + entryKey.length + entryValue.length, 0);
        if (used + key.length + value.length > 1200) throw new Error('quota exceeded');
        storage.set(key, value);
      },
      removeItem: (key: string) => storage.delete(key),
      key: (index: number) => [...storage.keys()][index] ?? null,
      get length() { return storage.size; },
    });
    vi.stubGlobal('window', { location: { search: '' } });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [] }));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const building = {
      code: 'AJC', name: 'A. James Clark Hall', latitude: 38.99, longitude: -76.94,
      classrooms: [{ id: 'AJC 2119', name: 'AJC 2119', availability_times: [] }],
    };
    vi.mocked(fetchJsonWithProgress).mockResolvedValue([building]);
    vi.mocked(fetchLibCalAvailabilityForDate).mockResolvedValue(
      ['MCK', 'ASY', 'PAC', 'KIR'].map((code) => ({ code, name: code, classrooms: [] }))
    );
    vi.mocked(fetchDiningHallsForDate).mockResolvedValue([]);
    let rejectDay!: (error: Error) => void;
    vi.mocked(fetchAvailabilityForDate).mockReturnValue(
      new Promise((_, reject) => { rejectDay = reject; })
    );

    const { useCampusStore } = await import('../store');
    const initialLoad = useCampusStore.getState().init();
    await vi.waitFor(() => expect(useCampusStore.getState().dayFetch.status).toBe('loading'));
    const loading = useCampusStore.getState().buildings.find((entry) => entry.code === 'AJC');
    expect(loading).toMatchObject({
      dataIssue: 'loading', dataIssueSource: 'classrooms', status: 'unknown',
      rooms: [{ status: 'unknown' }],
    });

    rejectDay(new Error('feed unavailable'));
    await initialLoad;
    const failed = useCampusStore.getState().buildings.find((entry) => entry.code === 'AJC');
    expect(failed).toMatchObject({
      dataIssue: 'error', dataIssueSource: 'classrooms', status: 'unknown',
      rooms: [{ status: 'unknown' }],
    });

    vi.mocked(fetchAvailabilityForDate).mockResolvedValue([building]);
    useCampusStore.getState().retryDayData();
    await vi.waitFor(() => expect(useCampusStore.getState().dayFetch.status).toBe('ready'));
    expect(useCampusStore.getState().buildings.find((entry) => entry.code === 'AJC')?.dataIssue).toBeUndefined();
    expect(persistDay).toHaveBeenCalledOnce();
    expect(vi.mocked(persistDay).mock.calls[0][1]).toEqual([building]);
    expect([...storage.keys()].some((key) => key.startsWith('dayCache.v1.') && key !== 'dayCache.v1.stale')).toBe(false);
  });

  it('shows successful buildings while a live day loads and keeps failed ones unknown', async () => {
    const storage = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    });
    vi.stubGlobal('window', { location: { search: '' } });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [] }));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const makeBuilding = (code: string) => ({
      code, name: code, latitude: 38.99, longitude: -76.94,
      classrooms: [{ id: `${code} 100`, name: `${code} 100`, availability_times: [] }],
    });
    const ajc = makeBuilding('AJC');
    const atl = makeBuilding('ATL');
    vi.mocked(fetchJsonWithProgress).mockResolvedValue([ajc, atl]);
    vi.mocked(fetchLibCalAvailabilityForDate).mockResolvedValue([]);
    vi.mocked(fetchDiningHallsForDate).mockResolvedValue([]);
    let emit!: (progress: object) => void;
    let finish!: (buildings: Array<typeof ajc>) => void;
    vi.mocked(fetchAvailabilityForDate).mockImplementation((_buildings, _date, options) => {
      emit = (options as { onProgress: (progress: object) => void }).onProgress;
      return new Promise((resolve) => { finish = resolve; });
    });

    const { useCampusStore } = await import('../store');
    const initialLoad = useCampusStore.getState().init();
    await vi.waitFor(() => expect(useCampusStore.getState().dayFetch.status).toBe('loading'));
    emit({ index: 0, building: ajc, succeeded: true, completedRooms: 1, totalRooms: 2,
      completedBuildings: 1, totalBuildings: 2, ratio: 0.5 });
    expect(useCampusStore.getState().buildings.find((entry) => entry.code === 'AJC')?.dataIssue).toBeUndefined();
    expect(useCampusStore.getState().buildings.find((entry) => entry.code === 'ATL')?.dataIssue).toBe('loading');

    emit({ index: 1, building: atl, succeeded: false, completedRooms: 2, totalRooms: 2,
      completedBuildings: 2, totalBuildings: 2, ratio: 1 });
    finish([ajc, atl]);
    await initialLoad;
    expect(useCampusStore.getState().dayFetch.status).toBe('error');
    expect(useCampusStore.getState().buildings.find((entry) => entry.code === 'AJC')?.dataIssue).toBeUndefined();
    expect(useCampusStore.getState().buildings.find((entry) => entry.code === 'ATL')).toMatchObject({
      dataIssue: 'error', status: 'unknown', rooms: [{ status: 'unknown' }],
    });
    expect(persistDay).not.toHaveBeenCalled();

    vi.mocked(fetchAvailabilityForDate).mockImplementation(async (requested, _date, options) => {
      expect(requested.map((entry: { code: string }) => entry.code)).toEqual(['ATL']);
      (options as { onProgress: (progress: object) => void }).onProgress({
        index: 0, building: atl, succeeded: true, completedRooms: 1, totalRooms: 1,
        completedBuildings: 1, totalBuildings: 1, ratio: 1,
      });
      return [atl];
    });
    useCampusStore.getState().retryDayData();
    await vi.waitFor(() => expect(useCampusStore.getState().dayFetch.status).toBe('ready'));
    expect(useCampusStore.getState().buildings.find((entry) => entry.code === 'AJC')?.dataIssue).toBeUndefined();
    expect(useCampusStore.getState().buildings.find((entry) => entry.code === 'ATL')?.dataIssue).toBeUndefined();
    expect(fetchAvailabilityForDate).toHaveBeenCalledTimes(2);
    expect(persistDay).toHaveBeenCalledOnce();
    expect([...storage.keys()].some((key) => key.startsWith('dayCache.v1.'))).toBe(false);
  });

  it('lets the user recheck Now availability without showing the old answer during refresh', async () => {
    vi.stubGlobal('localStorage', {
      getItem: () => null, setItem: () => undefined,
    });
    vi.stubGlobal('window', { location: { search: '' } });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [] }));
    const building = {
      code: 'AJC', name: 'A. James Clark Hall', latitude: 38.99, longitude: -76.94,
      classrooms: [{ id: 'AJC 2119', name: 'AJC 2119', availability_times: [] }],
    };
    vi.mocked(fetchJsonWithProgress).mockResolvedValue([building]);
    vi.mocked(fetchLibCalAvailabilityForDate).mockResolvedValue([]);
    vi.mocked(fetchDiningHallsForDate).mockResolvedValue([]);
    vi.mocked(fetchAvailabilityForDate).mockResolvedValueOnce([building]);

    const { useCampusStore } = await import('../store');
    await useCampusStore.getState().init();
    expect(useCampusStore.getState().dayFetch).toMatchObject({
      status: 'ready', updatedAt: expect.any(Number),
    });

    let finishRefresh!: (buildings: Array<typeof building>) => void;
    vi.mocked(fetchAvailabilityForDate).mockReturnValueOnce(
      new Promise((resolve) => { finishRefresh = resolve; })
    );
    useCampusStore.getState().refreshDayData();
    expect(useCampusStore.getState().dayFetch.status).toBe('loading');
    expect(useCampusStore.getState().buildings.find((entry) => entry.code === 'AJC')?.rooms[0].status).toBe('unknown');
    useCampusStore.getState().refreshDayData();
    await vi.waitFor(() => expect(fetchAvailabilityForDate).toHaveBeenCalledTimes(2));
    expect(invalidatePersistedDay).toHaveBeenCalledWith(useCampusStore.getState().activeDateKey);
    expect(fetchAvailabilityForDate).toHaveBeenCalledTimes(2);

    finishRefresh([building]);
    await vi.waitFor(() => expect(useCampusStore.getState().dayFetch.status).toBe('ready'));
  });
});
