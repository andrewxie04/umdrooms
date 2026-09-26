import { afterEach, describe, expect, it, vi } from 'vitest';
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

const building = {
  code: 'AJC', name: 'A. James Clark Hall', latitude: 38.99, longitude: -76.94,
  classrooms: [{ id: 'AJC 2119', name: 'AJC 2119', availability_times: [] }],
};
const inventory = {
  coverage: { minDate: '2026-07-25', maxDate: '2026-08-25' },
  buildings: [building],
};

function setup(search: string) {
  vi.mocked(fetchJsonWithProgress).mockReset();
  vi.mocked(fetchAvailabilityForDate).mockReset();
  const saved = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => saved.get(key) ?? null,
    setItem: (key: string, value: string) => saved.set(key, value),
    removeItem: (key: string) => saved.delete(key),
    key: (index: number) => [...saved.keys()][index] ?? null,
    get length() { return saved.size; },
  });
  vi.stubGlobal('window', { location: { search } });
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => [] }));
  vi.mocked(fetchLibCalAvailabilityForDate).mockResolvedValue(
    ['MCK', 'ASY', 'PAC', 'KIR'].map((code) => ({ code, name: code, classrooms: [] }))
  );
  vi.mocked(fetchDiningHallsForDate).mockResolvedValue([]);
  vi.mocked(fetchAvailabilityForDate).mockResolvedValue([building]);
}

describe('small inventory startup', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('loads current availability without downloading the historical archive', async () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-09-25T12:00:00-04:00'));
    setup('');
    vi.mocked(fetchJsonWithProgress).mockResolvedValue(inventory);

    const { useCampusStore } = await import('../store');
    await useCampusStore.getState().init();

    expect(vi.mocked(fetchJsonWithProgress).mock.calls.map(([url]) => url)).toEqual([
      '/buildings_inventory.json',
    ]);
    expect(fetchAvailabilityForDate).toHaveBeenCalled();
    expect(useCampusStore.getState().dayFetch.status).toBe('ready');
  });

  it('refreshes a visible Now schedule after fifteen minutes', async () => {
    vi.useFakeTimers({ toFake: ['Date', 'setInterval', 'clearInterval'] });
    vi.setSystemTime(new Date('2026-09-25T12:00:00-04:00'));
    setup('');
    vi.mocked(fetchJsonWithProgress).mockResolvedValue(inventory);

    const { useCampusStore } = await import('../store');
    await useCampusStore.getState().init();
    expect(fetchAvailabilityForDate).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(14 * 60 * 1000);
    expect(fetchAvailabilityForDate).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(60 * 1000);
    expect(fetchAvailabilityForDate).toHaveBeenCalledTimes(2);
    expect(useCampusStore.getState().dayFetch.status).toBe('ready');

    useCampusStore.getState().setViewMode('schedule');
  });

  it('loads the archive when a selected day falls inside its coverage', async () => {
    setup('?start=2026-08-01T12:00:00-04:00');
    vi.mocked(fetchJsonWithProgress).mockImplementation(async (url: string) =>
      url.endsWith('buildings_inventory.json') ? inventory : [building]
    );

    const { useCampusStore } = await import('../store');
    await useCampusStore.getState().init();

    expect(vi.mocked(fetchJsonWithProgress).mock.calls.map(([url]) => url)).toEqual([
      '/buildings_inventory.json',
      '/buildings_data.json',
    ]);
    expect(fetchAvailabilityForDate).not.toHaveBeenCalled();
    expect(useCampusStore.getState().dayFetch.status).toBe('ready');
  });
});
