import { formatInTimeZone } from 'date-fns-tz';

export const CAMPUS_TIME_ZONE = 'America/New_York';
const FUNCTION_ENDPOINT = '/.netlify/functions/availability-building';
// 43 buildings total. The function now answers each building with a single
// one-day 25Live request (~1–3 s), so the whole campus fits in two waves. The
// older deployment fans out one 25Live request per room; keep it at 12-way.
const DEFAULT_BUILDING_FETCH_CONCURRENCY = 24;
const LEGACY_BUILDING_FETCH_CONCURRENCY = 12;
// Set once a deployment answers GET with 405 (it predates cacheable GETs).
let getUnsupported = false;
// The first GET doubles as a probe; concurrent requests wait for its answer
// instead of each discovering a 405 on an older deployment.
let getProbe = null;
const BUILDING_FETCH_TIMEOUT_MS = 25000;

export function getDateKey(date) {
  return formatInTimeZone(date, CAMPUS_TIME_ZONE, 'yyyy-MM-dd');
}

export function getCoverageRange(buildings) {
  let minDate = null;
  let maxDate = null;

  for (const building of buildings || []) {
    for (const room of building.classrooms || []) {
      for (const slot of room.availability_times || []) {
        const date = String(slot.date || '').split('T')[0];
        if (!date) continue;
        if (!minDate || date < minDate) minDate = date;
        if (!maxDate || date > maxDate) maxDate = date;
      }
    }
  }

  return minDate && maxDate ? { minDate, maxDate } : null;
}

export function isDateCovered(dateKey, coverage) {
  if (!coverage || !coverage.minDate || !coverage.maxDate) return false;
  return dateKey >= coverage.minDate && dateKey <= coverage.maxDate;
}

export function stripAvailability(buildings) {
  return (buildings || []).map((building) => ({
    ...building,
    classrooms: (building.classrooms || []).map((room) => ({
      ...room,
      availability_times: [],
    })),
  }));
}

export async function fetchJsonWithProgress(url, { signal, onProgress } = {}) {
  const response = await fetch(url, {
    signal,
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const contentLength = Number(response.headers.get('content-length') || 0);

  if (!response.body) {
    const data = await response.json();
    onProgress?.({ loaded: 1, total: 1, ratio: 1, indeterminate: true });
    return data;
  }

  const reader = response.body.getReader();
  const chunks = [];
  let loaded = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) {
      chunks.push(value);
      loaded += value.length;
      onProgress?.({
        loaded,
        total: contentLength,
        ratio: contentLength ? loaded / contentLength : null,
        indeterminate: !contentLength,
      });
    }
  }

  onProgress?.({
    loaded: contentLength || loaded || 1,
    total: contentLength || loaded || 1,
    ratio: 1,
    indeterminate: !contentLength,
  });

  const blob = new Blob(chunks);
  const text = await blob.text();
  return JSON.parse(text);
}

async function fetchBuildingAvailability(building, dateKey, signal, fresh = false) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), BUILDING_FETCH_TIMEOUT_MS);
  const abortFromParent = () => controller.abort();

  if (signal) {
    if (signal.aborted) {
      clearTimeout(timeoutId);
      throw new DOMException('The operation was aborted.', 'AbortError');
    }
    signal.addEventListener('abort', abortFromParent, { once: true });
  }

  try {
    let response = null;
    if (getProbe) await getProbe.catch(() => undefined);
    if (!getUnsupported) {
      // A GET is shared through the CDN and the browser cache.
      const query = new URLSearchParams({ date: dateKey, code: String(building.code || '') });
      // A forced refresh must not get a cached copy: a per-minute token is part
      // of the CDN cache key, and the browser cache is skipped.
      if (fresh) query.set('fresh', String(Math.floor(Date.now() / 60000)));
      const request = fetch(`${FUNCTION_ENDPOINT}?${query}`, { signal: controller.signal, ...(fresh ? { cache: 'no-store' } : {}) });
      const probing = !getProbe;
      if (probing) getProbe = request.then((r) => { if (r.status === 405) getUnsupported = true; });
      response = await request;
      if (response.status === 405) {
        getUnsupported = true;
        response = null;
      }
    }
    if (!response) {
      response = await fetch(FUNCTION_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: dateKey,
          building,
        }),
        signal: controller.signal,
      });
    }

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text || `HTTP ${response.status}`);
    }

    return response.json();
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener?.('abort', abortFromParent);
  }
}

/**
 * @param {any[]} buildings
 * @param {Date | string} date
 * @param {{ signal?: AbortSignal, onProgress?: (progress: any) => void, concurrency?: number, priority?: string[], fresh?: boolean }} [options]
 */
export async function fetchAvailabilityForDate(
  buildings,
  date,
  { signal, onProgress, concurrency, priority = [], fresh = false } = {}
) {
  const dateKey = typeof date === 'string' ? date : getDateKey(date);
  // Buildings the person is looking at (favorites, the open building) first,
  // then the largest: they take longest, so starting them early keeps the last
  // wave short. Results still land at their original index.
  const rank = new Map(priority.map((code, i) => [String(code), i]));
  const tasks = (buildings || []).map((building, index) => ({
    index,
    roomCount: (building.classrooms || []).length,
    rank: rank.get(String(building.code ?? '')) ?? Infinity,
    building,
  })).sort((a, b) => (a.rank - b.rank) || (b.roomCount - a.roomCount));
  const totalRooms = tasks.reduce((sum, task) => sum + task.roomCount, 0);
  const totalBuildings = tasks.length;
  const results = new Array(totalBuildings);

  let completedRooms = 0;
  let completedBuildings = 0;
  let cursor = 0;

  onProgress?.({
    completedRooms,
    totalRooms,
    completedBuildings,
    totalBuildings,
    ratio: totalRooms ? 0 : 1,
    indeterminate: false,
  });

  const abortError = () => new DOMException('The operation was aborted.', 'AbortError');

  async function worker() {
    while (cursor < tasks.length) {
      if (signal?.aborted) throw abortError();
      const task = tasks[cursor++];
      let succeeded = false;
      try {
        const result = await fetchBuildingAvailability(task.building, dateKey, signal, fresh);
        results[task.index] = result;
        succeeded = true;
      } catch (error) {
        if (signal?.aborted) throw error;
        console.warn(
          `Falling back to bundled availability for ${task.building.code || task.building.name || 'building'} on ${dateKey}:`,
          error
        );
        results[task.index] = task.building;
      }
      completedRooms += task.roomCount;
      completedBuildings += 1;
      onProgress?.({
        completedRooms,
        totalRooms,
        completedBuildings,
        totalBuildings,
        ratio: totalRooms ? completedRooms / totalRooms : 1,
        indeterminate: false,
        index: task.index,
        building: results[task.index],
        succeeded,
      });
    }
  }

  const limit = concurrency ?? (getUnsupported ? LEGACY_BUILDING_FETCH_CONCURRENCY : DEFAULT_BUILDING_FETCH_CONCURRENCY);
  const poolSize = Math.max(1, Math.min(limit, tasks.length || 1));
  await Promise.all(Array.from({ length: poolSize }, () => worker()));

  return results.map((building, index) => building || tasks[index].building);
}
