import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchAvailabilityForDate, fetchJsonWithProgress } from '../availabilityData.js';
import { fetchLibCalAvailabilityForDate } from '../libcalData.js';
import { fetchDiningHallsForDate } from '../diningData.js';

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

function libraryResponse(roomName = 'Original study room') {
  return ['MCK', 'ASY', 'PAC', 'KIR'].map((code) => ({
    code, name: code,
    classrooms: code === 'MCK' ? [{
      id: 'study-1', name: roomName, source: 'libcal',
      libcal: { available_blocks: [] },
      availability_times: [],
    }] : [],
  }));
}

describe('library availability failures', () => {
  let useCampusStore: typeof import('../store')['useCampusStore'];
  const mockFetch = vi.mocked(fetchLibCalAvailabilityForDate);

  beforeEach(async () => {
    vi.resetModules();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-09-25T12:00:00-04:00'));
    const storage = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    });
    vi.stubGlobal('window', { location: { search: '' } });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [] }));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const building = { code: 'AJC', name: 'AJC', classrooms: [] };
    vi.mocked(fetchJsonWithProgress).mockResolvedValue({ buildings: [building], coverage: null });
    vi.mocked(fetchAvailabilityForDate).mockResolvedValue([building]);
    vi.mocked(fetchDiningHallsForDate).mockResolvedValue([]);
    mockFetch.mockResolvedValue(libraryResponse());
    ({ useCampusStore } = await import('../store'));
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it.each(['unavailable', 'incomplete'] as const)(
    'marks an %s feed unknown after bounded retries and recovers with fresh data',
    async (failure) => {
      if (failure === 'unavailable') mockFetch.mockRejectedValue(new Error('feed unavailable'));
      else mockFetch.mockResolvedValue(libraryResponse().filter((building) => building.code !== 'KIR'));

      useCampusStore.getState().retryLibCal();
      expect(useCampusStore.getState().libcalStatus).toBe('loading');
      expect(mockFetch).toHaveBeenCalledTimes(1);
      await vi.advanceTimersByTimeAsync(350);
      expect(mockFetch).toHaveBeenCalledTimes(2);
      expect(useCampusStore.getState().libcalStatus).toBe('loading');
      await vi.advanceTimersByTimeAsync(1000);
      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(useCampusStore.getState().libcalStatus).toBe('error');
      expect(useCampusStore.getState().buildings.find((b) => b.code === 'MCK'))
        .toMatchObject({ dataIssue: 'error', status: 'unknown' });

      mockFetch.mockResolvedValue(libraryResponse('Recovered study room'));
      useCampusStore.getState().retryLibCal();
      await vi.advanceTimersByTimeAsync(0);
      expect(mockFetch).toHaveBeenCalledTimes(4);
      expect(useCampusStore.getState().libcalStatus).toBe('ready');
      const recovered = useCampusStore.getState().buildings.find((b) => b.code === 'MCK');
      expect(recovered?.dataIssue).toBeUndefined();
      expect(recovered?.rooms[0].name).toBe('Recovered study room');
    },
  );

  it('does not restore a stale cached success when retrying a failed forced refresh', async () => {
    await useCampusStore.getState().init();
    expect(useCampusStore.getState().libcalStatus).toBe('ready');
    expect(mockFetch).toHaveBeenCalledTimes(1);

    mockFetch.mockRejectedValue(new Error('offline'));
    useCampusStore.getState().refreshDayData();
    await vi.advanceTimersByTimeAsync(1350);
    expect(mockFetch).toHaveBeenCalledTimes(4);
    expect(useCampusStore.getState().libcalStatus).toBe('error');

    useCampusStore.getState().retryLibCal();
    expect(useCampusStore.getState().libcalStatus).toBe('loading');
    expect(mockFetch).toHaveBeenCalledTimes(5);
    await vi.advanceTimersByTimeAsync(1350);
    expect(mockFetch).toHaveBeenCalledTimes(7);
    expect(useCampusStore.getState().libcalStatus).toBe('error');
    expect(useCampusStore.getState().buildings.find((b) => b.code === 'MCK')?.rooms).toEqual([]);

    mockFetch.mockResolvedValue(libraryResponse('Fresh study room'));
    useCampusStore.getState().retryLibCal();
    await vi.advanceTimersByTimeAsync(0);
    expect(mockFetch).toHaveBeenCalledTimes(8);
    expect(useCampusStore.getState().libcalStatus).toBe('ready');
    const recovered = useCampusStore.getState().buildings.find((b) => b.code === 'MCK');
    expect(recovered?.dataIssue).toBeUndefined();
    expect(recovered?.rooms[0].name).toBe('Fresh study room');
  });
});
