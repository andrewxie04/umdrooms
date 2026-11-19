const fs = require('fs');
const path = require('path');

const TIMEOUT_MS = 10000;
const ROOM_CONCURRENCY = 12;
const PRIMARY_BUILDINGS_PATH = path.join(__dirname, '../../rooms-redesign/public/buildings_data.json');
const FALLBACK_BUILDINGS_PATH = path.join(__dirname, '../../public/buildings_data.json');

function loadTrustedBuildings() {
  try {
    const targetPath = fs.existsSync(PRIMARY_BUILDINGS_PATH) ? PRIMARY_BUILDINGS_PATH : FALLBACK_BUILDINGS_PATH;
    return JSON.parse(fs.readFileSync(targetPath, 'utf8'));
  } catch (error) {
    console.error('Failed to load trusted building inventory:', error);
    return [];
  }
}

const TRUSTED_BUILDINGS = loadTrustedBuildings();
const TRUSTED_BUILDINGS_BY_CODE = new Map(
  TRUSTED_BUILDINGS.map((building) => [String(building.code || '').trim(), building])
);

function json(statusCode, body, extraHeaders = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      ...extraHeaders,
    },
    body: JSON.stringify(body),
  };
}

// GET responses are shared through Netlify's CDN: the first visitor in a
// five-minute window pays the 25Live round trip, later ones get a cached copy,
// and a stale copy is served while it refreshes. Browsers keep it a minute.
const CACHEABLE_HEADERS = {
  'Cache-Control': 'public, max-age=60',
  'Netlify-CDN-Cache-Control': 'public, s-maxage=300, stale-while-revalidate=900',
  // `fresh` (a per-minute token on forced refreshes) bypasses older copies.
  'Netlify-Vary': 'query=date|code|fresh',
};

function badRequest(message) {
  return json(400, { error: message });
}

async function fetchWithTimeout(url, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

const AVAILABILITY_URL = 'https://25live.collegenet.com/25live/data/umd/run/availability/availabilitydata.json';
// One request per building. `comptype=availability` returns only the requested
// day (≈3 KB per room) where `availability_daily` returned ~31 days (≈40 KB per
// room), and 25Live answers a whole building's rooms in about the time it takes
// for one. Measured 2026-11-19: 29 rooms → 1.3 s / 61 KB in a single request.
const BATCH_TIMEOUT_MS = 15000;

function availabilityUrl(spaceIds, date) {
  const params = new URLSearchParams({
    obj_cache_accl: '0',
    start_dt: `${date}T00:00:00`,
    comptype: 'availability',
    compsubject: 'location',
    page_size: '1000',
    space_id: spaceIds.map(String).join('+'),
    include: 'closed blackouts pending related empty',
    caller: 'pro-AvailService.getData',
  });
  return `${AVAILABILITY_URL}?${params.toString()}`;
}

/** Collapses one subject's items into the slot shape the client expects. */
function slotsFromItems(date, items) {
  const availabilityBySlot = new Map();
  for (const item of items || []) {
    const timeStart = item.start || 'N/A';
    const timeEnd = item.end || 'N/A';
    const key = `${date}|${timeStart}|${timeEnd}`;

    if (!availabilityBySlot.has(key)) {
      availabilityBySlot.set(key, {
        date,
        event_name: [item.itemName || 'N/A'],
        time_start: timeStart,
        time_end: timeEnd,
        status: item.type_id ?? 'N/A',
        additional_details: [item.itemId2 || 'N/A'],
      });
      continue;
    }

    const entry = availabilityBySlot.get(key);
    entry.event_name.push(item.itemName || 'N/A');
    entry.additional_details.push(item.itemId2 || 'N/A');
  }

  return Array.from(availabilityBySlot.values()).map((entry) => ({
    ...entry,
    event_name: entry.event_name.join(', '),
    additional_details: entry.additional_details.map(String).join(', '),
  }));
}

/** Returns Map(roomId → slots) for every requested room on `date`. */
async function fetchBuildingAvailability(roomIds, date, timeoutMs = BATCH_TIMEOUT_MS) {
  const response = await fetchWithTimeout(availabilityUrl(roomIds, date), timeoutMs);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const data = await response.json();
  const byRoom = new Map(roomIds.map((id) => [String(id), []]));
  for (const subject of data.subjects || []) {
    const id = String(subject.itemId ?? '');
    if (!byRoom.has(id)) continue;
    byRoom.get(id).push(...slotsFromItems(subject.item_date || '', subject.items));
  }
  return byRoom;
}

/** Fallback for a failed batch: the same single-day query, one room at a time. */
async function fetchRoomAvailability(roomId, date) {
  const rooms = await fetchBuildingAvailability([roomId], date, TIMEOUT_MS);
  return rooms.get(String(roomId)) || [];
}

async function runPool(items, worker, limit) {
  let cursor = 0;

  async function next() {
    if (cursor >= items.length) return;
    const item = items[cursor++];
    await worker(item);
    await next();
  }

  const size = Math.max(1, Math.min(limit, items.length || 1));
  await Promise.all(Array.from({ length: size }, () => next()));
}

function isFetchableRoom(room) {
  return Number.isFinite(Number(room?.id)) && !room?.source && !room?.supplemental;
}

function readRequest(event) {
  if (event.httpMethod === 'GET') {
    const query = event.queryStringParameters || {};
    return { date: query.date, code: query.code };
  }
  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (_) {
    return { error: 'Invalid JSON body' };
  }
  const { date, building } = payload || {};
  if (!building || typeof building !== 'object') return { error: 'Expected a building payload' };
  return { date, code: building.code };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST' && event.httpMethod !== 'GET') {
    return json(405, { error: 'Method not allowed' });
  }

  const request = readRequest(event);
  if (request.error) return badRequest(request.error);
  const { date } = request;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(date || ''))) {
    return badRequest('Expected date in YYYY-MM-DD format');
  }
  const buildingCode = String(request.code || '').trim();
  const trustedBuilding = TRUSTED_BUILDINGS_BY_CODE.get(buildingCode);
  if (!trustedBuilding) {
    return badRequest(`Unknown building code: ${buildingCode || 'missing'}`);
  }

  const nextBuilding = {
    ...trustedBuilding,
    classrooms: (trustedBuilding.classrooms || []).map((room) => ({
      ...room,
      availability_times: isFetchableRoom(room)
        ? []
        : Array.isArray(room.availability_times)
        ? room.availability_times
        : [],
    })),
  };
  const fetchableRooms = nextBuilding.classrooms.filter(isFetchableRoom);

  try {
    if (fetchableRooms.length) {
      try {
        const byRoom = await fetchBuildingAvailability(fetchableRooms.map((room) => room.id), date);
        for (const room of fetchableRooms) room.availability_times = byRoom.get(String(room.id)) || [];
      } catch (batchError) {
        console.warn(`Batch availability failed for ${buildingCode}; retrying per room:`, batchError.message);
        await runPool(
          fetchableRooms,
          async (room) => {
            room.availability_times = await fetchRoomAvailability(room.id, date);
          },
          ROOM_CONCURRENCY
        );
      }
    }

    return json(200, nextBuilding, event.httpMethod === 'GET' ? CACHEABLE_HEADERS : {});
  } catch (error) {
    return json(502, {
      error: `Failed to fetch availability for ${buildingCode || trustedBuilding.name || 'building'}`,
      details: error.message,
    });
  }
};

module.exports.__test = { availabilityUrl, slotsFromItems, fetchBuildingAvailability };
