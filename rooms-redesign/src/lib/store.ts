// src/lib/store.ts
//
// Zustand store implementing the plan.md "Store shape" contract, with the
// full data-loading pipeline ported from the legacy CRA app's App.js:
//   - bundled buildings_data.json fetch with download progress
//   - coverage-range handling (bundled data covers a date span; outside it we
//     refetch per-day availability through /.netlify/functions/availability-building)
//   - LibCal study-room inventory + availability merge
//   - dining halls fetch (/.netlify/functions/dining-status)
//   - parking computed statically from parkingData.js rules
//   - day cache (14 entries, bounded) + adjacent-day prefetch in schedule mode
//
// Raw (un-derived) records live in module-level variables below; the store
// only exposes the derived contract shapes (BuildingEntry / DiningHall /
// ParkingLot) plus loading state. Re-derivation happens when the view context
// changes (viewMode / scheduleDate / minDurationMin / now-minute tick).

import { create } from 'zustand';
import {
  fetchAvailabilityForDate,
  fetchJsonWithProgress,
  getCoverageRange,
  getDateKey,
  isDateCovered,
  stripAvailability,
} from './availabilityData.js';
import {
  LIBCAL_BUILDING_METADATA,
  fetchLibCalAvailabilityForDate,
  getLibCalBuildingInventory,
} from './libcalData.js';
import { fetchDiningHallsForDate, getDiningStatusInfo } from './diningData.js';
import {
  getParkingFeatures,
  getParkingReferenceDate,
  getParkingStatusLabel,
} from './parkingData.js';
import { getBuildingRenderState } from './availability.js';
import { boundedCacheSet } from './cache.js';
import { safeStorageGet, safeStorageSet } from './storage.js';
import type {
  BuildingEntry,
  CampusSelection,
  DiningHall,
  MapFlyTarget,
  OverlayKind,
  ParkingLot,
  RoomEntry,
  Status,
  ViewMode,
} from '../types/campus';

// ---------------------------------------------------------------------------
// Contract store interface
// ---------------------------------------------------------------------------

export interface CampusStore {
  // data
  buildings: BuildingEntry[]; // classrooms + library merged
  dining: DiningHall[];
  parking: ParkingLot[];
  loading: { status: 'idle' | 'loading' | 'ready' | 'error'; progress: number; error?: string | null };
  coverage: { start?: string; end?: string } | null;

  // ui state
  viewMode: ViewMode;
  scheduleDate: Date; // selected date/time window (schedule mode)
  minDurationMin: number; // 0 | 60 | 120 | 180
  minCapacity: number; // 0 (All) | 20 | 50 | 100 | 150 — minimum-seat filter
  searchQuery: string;
  activeOverlays: OverlayKind[]; // which marker layers show
  selected: CampusSelection;
  darkMode: boolean;
  /** When true (session default), the UI theme follows the solar day/night
   * cycle via setDarkModeAuto; any manual toggleDarkMode() flips this to
   * false for the rest of the session. Never persisted. */
  darkModeAuto: boolean;
  favorites: string[]; // 'b:CODE' | 'r:CODE/ROOMID'
  flyTo: MapFlyTarget | null; // map listens and clears after flying
  legendOpen: boolean;

  // actions
  init(): Promise<void>; // full data load pipeline (ported from App.js)
  setViewMode(m: ViewMode): void;
  setScheduleDate(d: Date): void; // triggers availability refetch for that day
  setSearchQuery(q: string): void;
  setMinDuration(min: number): void;
  setMinCapacity(seats: number): void;
  toggleOverlay(k: OverlayKind): void;
  select(s: CampusStore['selected'], opts?: { source?: 'map' | 'panel' }): void;
  clearSelection(): void;
  toggleDarkMode(): void;
  /** Solar-cycle hook: sets darkMode WITHOUT persisting it and without
   * clearing darkModeAuto. Only the manual toggleDarkMode() persists. */
  setDarkModeAuto(dark: boolean): void;
  toggleFavorite(key: string): void;
  requestFlyTo(t: MapFlyTarget): void;
  clearFlyTo(): void;
  setLegendOpen(open: boolean): void;

  // --- additive state beyond the contract (safe for UI agents to ignore) ---
  /** Per-day availability refetch progress (schedule mode / out-of-coverage days). */
  dayFetch: DayFetchState;
  /** Campus-timezone date key (yyyy-MM-dd) backing the current data. */
  activeDateKey: string;
  /** Deep-link target captured from the URL (?building=CODE&room=ID) at boot. */
  pendingDeepLink: { building: string | null; room: string | null } | null;
  /** Where the latest selection came from; 'map' skips the redundant camera fly. */
  selectionSource: 'map' | 'panel' | null;
  /** Favorites view open flag (rendered inside the shell panel). */
  favoritesOpen: boolean;
  setFavoritesOpen(open: boolean): void;
}

export interface DayFetchState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  progress: number;
  indeterminate: boolean;
  error: string | null;
  dateKey: string | null;
  completedRooms: number;
  totalRooms: number;
  completedBuildings: number;
  totalBuildings: number;
}

const EMPTY_DAY_FETCH_STATE: DayFetchState = {
  status: 'idle',
  progress: 0,
  indeterminate: false,
  error: null,
  dateKey: null,
  completedRooms: 0,
  totalRooms: 0,
  completedBuildings: 0,
  totalBuildings: 0,
};

// ---------------------------------------------------------------------------
// Module-level raw data + pipeline state (ported from App.js refs/state)
// ---------------------------------------------------------------------------

const DAY_CACHE_LIMIT = 14;
const BASE_URL = import.meta.env.BASE_URL || '/';

let bundledBuildings: any[] = []; // sorted bundled dataset (full availability)
let inventorySkeleton: any[] = []; // bundled dataset with availability stripped
let bundledCoverage: { minDate: string; maxDate: string } | null = null;
let metadataBuildings: any[] = []; // buildings_metadata.json (map skeleton fallback)
let libraryInventory: any[] = getLibCalBuildingInventory(); // static LibCal metadata
let classroomRaw: any[] = []; // classroom buildings for the active day
let libraryRaw: any[] = []; // LibCal buildings for the active day
let diningRaw: any[] = []; // dining halls + retail venues for the active day

const dayCache = new Map<string, any[]>();
const libcalCache = new Map<string, any[]>();
const diningCache = new Map<string, any[]>();
const prefetchInFlight = new Set<string>();

// ---------------------------------------------------------------------------
// Persistent day cache (localStorage). A day outside the bundled coverage
// costs a 337-room live fetch through the Netlify functions — persisting the
// result makes a reload/revisit of the same day instant. Best-effort only:
// TTL keeps intraday drift bounded, KEEP caps quota use, and every failure
// path silently falls back to the network.
// ---------------------------------------------------------------------------

const PERSIST_DAY_PREFIX = 'dayCache.v1.';
const PERSIST_DAY_TTL_MS = 60 * 60 * 1000; // 1h — availability drifts slowly
const PERSIST_DAY_KEEP = 2; // newest N days kept in storage

function readPersistedDay(dateKey: string): any[] | null {
  const raw = safeStorageGet(`${PERSIST_DAY_PREFIX}${dateKey}`);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed?.buildings)) return null;
    if (Date.now() - (parsed.at ?? 0) > PERSIST_DAY_TTL_MS) return null;
    return parsed.buildings;
  } catch {
    return null;
  }
}

function persistDay(dateKey: string, buildings: any[]): void {
  safeStorageSet(
    `${PERSIST_DAY_PREFIX}${dateKey}`,
    JSON.stringify({ at: Date.now(), buildings }),
  );
  // Evict everything but the newest KEEP entries (by stored timestamp).
  try {
    const entries: { key: string; at: number }[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(PERSIST_DAY_PREFIX)) continue;
      let at = 0;
      try {
        at = JSON.parse(localStorage.getItem(key) ?? '{}')?.at ?? 0;
      } catch {
        /* unparseable entry sorts oldest */
      }
      entries.push({ key, at });
    }
    entries.sort((a, b) => b.at - a.at);
    for (const e of entries.slice(PERSIST_DAY_KEEP)) localStorage.removeItem(e.key);
  } catch {
    /* storage unavailable — in-memory cache still works */
  }
}

let activeFetchId = 0;
let dayAbort: AbortController | null = null;
let libcalAbort: AbortController | null = null;
let diningAbort: AbortController | null = null;
let initPromise: Promise<void> | null = null;
let nowTicker: ReturnType<typeof setInterval> | null = null;

// ---------------------------------------------------------------------------
// Persistence helpers (ported behavior; keys kept compatible with legacy app)
// ---------------------------------------------------------------------------

function loadDarkMode(): boolean {
  const saved = safeStorageGet('darkMode');
  if (saved != null) {
    try {
      return JSON.parse(saved);
    } catch {
      /* corrupted */
    }
  }
  // Plan: system default (legacy app defaulted to dark when unset).
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return true;
}

const ALL_OVERLAYS: OverlayKind[] = ['classrooms', 'library', 'dining', 'parking'];

function loadOverlays(): OverlayKind[] {
  const saved = safeStorageGet('mapVisibility');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Legacy shape: { classrooms, studyRooms, parking, dining }
      const next: OverlayKind[] = [];
      if (parsed.classrooms !== false) next.push('classrooms');
      if (parsed.studyRooms !== false) next.push('library');
      if (parsed.dining !== false) next.push('dining');
      if (parsed.parking !== false) next.push('parking');
      return next;
    } catch {
      /* corrupted */
    }
  }
  return [...ALL_OVERLAYS];
}

function persistOverlays(overlays: OverlayKind[]): void {
  safeStorageSet(
    'mapVisibility',
    JSON.stringify({
      classrooms: overlays.includes('classrooms'),
      studyRooms: overlays.includes('library'),
      parking: overlays.includes('parking'),
      dining: overlays.includes('dining'),
    })
  );
}

function loadFavorites(): string[] {
  const saved = safeStorageGet('favorites');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed.filter((x) => typeof x === 'string');
    } catch {
      /* corrupted */
    }
  }
  // One-time migration from the legacy app's two separate favorite lists.
  const migrated: string[] = [];
  try {
    const fb = JSON.parse(safeStorageGet('favoriteBuildings') || '[]');
    if (Array.isArray(fb)) {
      for (const f of fb) if (f && typeof f.code === 'string') migrated.push(`b:${f.code}`);
    }
  } catch {
    /* corrupted */
  }
  try {
    const fr = JSON.parse(safeStorageGet('favoriteRooms') || '[]');
    if (Array.isArray(fr)) {
      for (const f of fr) {
        if (f && f.id != null) migrated.push(`r:${f.buildingCode ?? ''}/${f.id}`);
      }
    }
  } catch {
    /* corrupted */
  }
  if (migrated.length) safeStorageSet('favorites', JSON.stringify(migrated));
  return migrated;
}

// Deep links (?building=CODE&room=ID and ?start=...&end=...), ported from App.js.
function readDeepLink(): CampusStore['pendingDeepLink'] {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const building = params.get('building');
  const room = params.get('room');
  return building || room ? { building, room } : null;
}

function readInitialSchedule(): { viewMode: ViewMode; scheduleDate: Date } {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const start = params.get('start');
    if (start) {
      const startDate = new Date(start);
      if (!isNaN(startDate.getTime())) {
        return { viewMode: 'schedule', scheduleDate: startDate };
      }
    }
  }
  return { viewMode: 'now', scheduleDate: new Date() };
}

// ---------------------------------------------------------------------------
// Derivation helpers (raw records -> contract entries)
// ---------------------------------------------------------------------------

function sortBuildings(data: any[]): any[] {
  return (Array.isArray(data) ? data : []).slice().sort((a, b) => a.name.localeCompare(b.name));
}

// Ported verbatim from App.js: merges supplemental (LibCal) buildings into the
// classroom dataset by code/name, appending non-duplicate rooms.
function mergeBuildingCollections(baseBuildings: any[], supplementalBuildings: any[]): any[] {
  const merged = new Map<string, any>();

  for (const building of baseBuildings || []) {
    const key = building.code || building.name;
    merged.set(key, {
      ...building,
      classrooms: Array.isArray(building.classrooms) ? [...building.classrooms] : [],
    });
  }

  for (const building of supplementalBuildings || []) {
    const key = building.code || building.name;
    const existing = merged.get(key);
    if (!existing) {
      merged.set(key, {
        ...building,
        classrooms: Array.isArray(building.classrooms) ? [...building.classrooms] : [],
      });
      continue;
    }

    const existingRoomIds = new Set((existing.classrooms || []).map((room: any) => String(room.id)));
    const nextRooms = [...(existing.classrooms || [])];

    for (const room of building.classrooms || []) {
      if (existingRoomIds.has(String(room.id))) continue;
      nextRooms.push(room);
    }

    merged.set(key, {
      ...existing,
      latitude: existing.latitude ?? building.latitude,
      longitude: existing.longitude ?? building.longitude,
      classrooms: nextRooms,
    });
  }

  return sortBuildings(Array.from(merged.values()));
}

// availability.js display statuses -> contract Status. Note: 'Bookable Later'
// (LibCal room free later today) collapses to 'unavailable' here; call
// availability.js getRoomRenderState() directly for the richer label.
function toContractStatus(displayStatus: string | null | undefined): Status {
  switch (displayStatus) {
    case 'Available':
      return 'available';
    case 'Opening Soon':
      return 'opening-soon';
    case 'Unavailable':
    case 'Closed':
    case 'Bookable Later':
      return 'unavailable';
    default:
      return 'unknown';
  }
}

const LIBCAL_CODES = new Set<string>(LIBCAL_BUILDING_METADATA.map((b: any) => b.code));

interface DeriveContext {
  startTime: Date;
  endTime: Date | null;
  isNow: boolean;
  durationHours: number; // availability.js expects the duration filter in hours
  minCapacity: number; // minimum-seat filter (0 = All); 0 disables filtering
  referenceDate: Date;
}

function currentContext(): DeriveContext {
  const s = useCampusStore.getState();
  const isNow = s.viewMode === 'now';
  const startTime = isNow ? new Date() : s.scheduleDate;
  return {
    startTime,
    endTime: null,
    isNow,
    durationHours: Math.max(0, s.minDurationMin) / 60,
    minCapacity: Math.max(0, s.minCapacity),
    referenceDate: startTime,
  };
}

// Ported from legacy sidebarUtils.js roomMatchesCapacityFilter: rooms without
// a numeric capacity are excluded when a minimum-seat filter is active.
function roomMatchesCapacity(room: any, minCapacity: number): boolean {
  if (minCapacity <= 0) return true;
  const capacity = Number(room?.capacity);
  return Number.isFinite(capacity) && capacity >= minCapacity;
}

function deriveBuildings(ctx: DeriveContext): BuildingEntry[] {
  const base = classroomRaw.length
    ? classroomRaw
    : inventorySkeleton.length
      ? inventorySkeleton
      : metadataBuildings;
  const supplemental = libraryRaw.length ? libraryRaw : libraryInventory;
  const merged = mergeBuildingCollections(base, supplemental);

  return merged.map((b: any) => {
    const allClassrooms = Array.isArray(b.classrooms) ? b.classrooms : [];
    // Capacity filter (legacy "Minimum seats" chips) applies before the
    // render-state summary so building counts reflect the filtered rooms.
    const classrooms = allClassrooms.filter((room: any) =>
      roomMatchesCapacity(room, ctx.minCapacity)
    );
    const summary = getBuildingRenderState(classrooms, {
      startTime: ctx.startTime,
      endTime: ctx.endTime,
      isNow: ctx.isNow,
      durationFilter: ctx.durationHours,
    } as any);
    const stateByRoom = new Map<any, any>();
    for (const rs of summary.roomStates || []) stateByRoom.set(rs.room, rs.state);

    const code = String(b.code ?? b.name ?? '');
    const rooms: RoomEntry[] = classrooms.map((room: any, idx: number) => {
      const st = stateByRoom.get(room);
      return {
        id: String(room.id ?? room.name ?? idx),
        name: String(room.name ?? room.id ?? `Room ${idx + 1}`),
        buildingCode: code,
        status: toContractStatus(st?.displayStatus ?? st?.rawStatus),
        displayStatus: st?.displayStatus ?? st?.rawStatus ?? null,
        availableUntil: st?.availableUntil ?? null,
        events: Array.isArray(room.availability_times) ? room.availability_times : [],
        raw: room,
      };
    });

    const kind: BuildingEntry['kind'] =
      b.libcalBuilding === true || LIBCAL_CODES.has(code) ? 'library' : 'classroom';

    return {
      id: code,
      name: String(b.name ?? code),
      code,
      lat: Number(b.latitude ?? 0),
      lng: Number(b.longitude ?? 0),
      kind,
      totalRooms: summary.totalRooms ?? classrooms.length,
      availableRooms: summary.availableCount ?? 0,
      status: summary.totalRooms ? toContractStatus(summary.status) : 'unknown',
      rooms,
      raw: b,
    };
  });
}

function deriveDining(ctx: DeriveContext): DiningHall[] {
  return diningRaw.map((hall: any, idx: number) => {
    const info = getDiningStatusInfo(hall, ctx.referenceDate);
    const statusText = info?.badgeLabel
      ? info.summary
        ? `${info.badgeLabel} · ${info.summary}`
        : String(info.badgeLabel)
      : (info?.summary ?? '');
    return {
      id: String(hall.id ?? hall.name ?? idx),
      name: String(hall.name ?? 'Dining'),
      lat: Number(hall.latitude ?? 0),
      lng: Number(hall.longitude ?? 0),
      status: toContractStatus(info?.status),
      statusText,
      meals: Array.isArray(hall.meals) ? hall.meals : [],
      raw: hall,
    };
  });
}

function deriveParking(ctx: DeriveContext): ParkingLot[] {
  const reference = getParkingReferenceDate(ctx.isNow ? 'now' : 'schedule', ctx.startTime);
  return getParkingFeatures(reference).map((feature: any) => {
    const p = feature.properties || {};
    // 'Visitor' (paid 24/7 garage) maps to amber 'opening-soon' as a
    // caution color; raw.kind === 'paid' preserves the exact semantics.
    const status: Status =
      p.status === 'Free' ? 'available' : p.status === 'Visitor' ? 'opening-soon' : 'unavailable';
    const detail = p.detail ?? p.description ?? '';
    return {
      id: String(p.name ?? ''),
      name: String(p.name ?? 'Parking'),
      // Display coords (with PARKING_DISPLAY_OFFSETS applied) take priority so
      // overlapping lots (e.g. Lot U2 vs Mowatt Lane Garage) don't stack their
      // markers; the raw coords stay available in `raw` for highlight/fly use.
      lat: Number(feature.geometry?.coordinates?.[1] ?? p.trueLatitude ?? 0),
      lng: Number(feature.geometry?.coordinates?.[0] ?? p.trueLongitude ?? 0),
      status,
      // The status badge already communicates Free/Visitor/Permit, so the
      // subtitle carries only the rule summary (label is a fallback).
      statusText: detail || getParkingStatusLabel(p.status),
      raw: p,
    };
  });
}

function recomputeDerived(): void {
  const ctx = currentContext();
  useCampusStore.setState({
    buildings: deriveBuildings(ctx),
    dining: deriveDining(ctx),
    parking: deriveParking(ctx),
    activeDateKey: getDateKey(ctx.startTime),
  });
}

// ---------------------------------------------------------------------------
// Data pipeline (ported from App.js effects)
// ---------------------------------------------------------------------------

function roomTotal(buildings: any[]): number {
  return buildings.reduce((sum, b) => sum + (b.classrooms || []).length, 0);
}

/** Ensures classroom availability data for a campus date key (yyyy-MM-dd). */
async function ensureDayData(dateKey: string): Promise<void> {
  if (!bundledBuildings.length) return;

  // Day is inside the bundled dataset's coverage — no network fetch needed.
  if (isDateCovered(dateKey, bundledCoverage)) {
    dayAbort?.abort();
    activeFetchId += 1;
    classroomRaw = bundledBuildings;
    useCampusStore.setState({ dayFetch: { ...EMPTY_DAY_FETCH_STATE, status: 'ready', progress: 1, dateKey } });
    recomputeDerived();
    return;
  }

  let cached = dayCache.get(dateKey);
  if (!cached) {
    // Reload/revisit within the TTL: restore the persisted result instead of
    // re-running the full live fetch.
    const persisted = readPersistedDay(dateKey);
    if (persisted) {
      cached = persisted;
      boundedCacheSet(dayCache, dateKey, persisted, DAY_CACHE_LIMIT);
    }
  }
  if (cached) {
    dayAbort?.abort();
    activeFetchId += 1;
    classroomRaw = cached;
    useCampusStore.setState({
      dayFetch: {
        status: 'ready',
        progress: 1,
        indeterminate: false,
        error: null,
        dateKey,
        completedRooms: roomTotal(cached),
        totalRooms: roomTotal(cached),
        completedBuildings: cached.length,
        totalBuildings: cached.length,
      },
    });
    recomputeDerived();
    return;
  }

  if (!inventorySkeleton.length) return;

  dayAbort?.abort();
  const controller = new AbortController();
  dayAbort = controller;
  const fetchId = ++activeFetchId;

  // Show the availability-stripped inventory while the day loads.
  classroomRaw = inventorySkeleton;
  useCampusStore.setState({
    dayFetch: {
      status: 'loading',
      progress: 0,
      indeterminate: false,
      error: null,
      dateKey,
      completedRooms: 0,
      totalRooms: roomTotal(inventorySkeleton),
      completedBuildings: 0,
      totalBuildings: inventorySkeleton.length,
    },
  });
  recomputeDerived();

  try {
    const data = await fetchAvailabilityForDate(inventorySkeleton, dateKey, {
      signal: controller.signal,
      onProgress: (progress: any) => {
        if (activeFetchId !== fetchId) return;
        useCampusStore.setState({
          dayFetch: {
            status: 'loading',
            progress: progress.ratio ?? 0,
            indeterminate: Boolean(progress.indeterminate),
            error: null,
            dateKey,
            completedRooms: progress.completedRooms ?? 0,
            totalRooms: progress.totalRooms ?? 0,
            completedBuildings: progress.completedBuildings ?? 0,
            totalBuildings: progress.totalBuildings ?? 0,
          },
        });
      },
    } as any);
    if (activeFetchId !== fetchId) return;
    const sorted = sortBuildings(data);
    boundedCacheSet(dayCache, dateKey, sorted, DAY_CACHE_LIMIT);
    persistDay(dateKey, sorted);
    classroomRaw = sorted;
    useCampusStore.setState({
      dayFetch: {
        status: 'ready',
        progress: 1,
        indeterminate: false,
        error: null,
        dateKey,
        completedRooms: roomTotal(sorted),
        totalRooms: roomTotal(sorted),
        completedBuildings: sorted.length,
        totalBuildings: sorted.length,
      },
    });
    recomputeDerived();
  } catch (err: any) {
    if (controller.signal.aborted || activeFetchId !== fetchId) return;
    console.error(`Error fetching availability for ${dateKey}:`, err);
    classroomRaw = inventorySkeleton;
    useCampusStore.setState({
      dayFetch: {
        status: 'error',
        progress: 0,
        indeterminate: false,
        error: err?.message || 'Failed to fetch that day.',
        dateKey,
        completedRooms: 0,
        totalRooms: roomTotal(inventorySkeleton),
        completedBuildings: 0,
        totalBuildings: inventorySkeleton.length,
      },
    });
    recomputeDerived();
  }
}

/** Prefetches the days before/after the active one (schedule mode only). */
function prefetchAdjacentDays(dateKey: string): void {
  const s = useCampusStore.getState();
  if (s.viewMode === 'now' || !inventorySkeleton.length || !bundledBuildings.length) return;

  const baseDate = new Date(`${dateKey}T12:00:00`);
  for (const offset of [-1, 1]) {
    const next = new Date(baseDate);
    next.setDate(baseDate.getDate() + offset);
    const key = getDateKey(next);
    if (
      key === dateKey ||
      isDateCovered(key, bundledCoverage) ||
      dayCache.has(key) ||
      prefetchInFlight.has(key)
    ) {
      continue;
    }
    prefetchInFlight.add(key);
    fetchAvailabilityForDate(inventorySkeleton, key, { concurrency: 4 })
      .then((data) => {
        boundedCacheSet(dayCache, key, sortBuildings(data), DAY_CACHE_LIMIT);
      })
      .catch((err) => {
        console.error(`Error prefetching availability for ${key}:`, err);
      })
      .finally(() => {
        prefetchInFlight.delete(key);
      });
  }
}

async function ensureLibCal(dateKey: string): Promise<void> {
  const cached = libcalCache.get(dateKey);
  if (cached) {
    libraryRaw = cached;
    recomputeDerived();
    return;
  }

  libcalAbort?.abort();
  const controller = new AbortController();
  libcalAbort = controller;

  try {
    const data = await fetchLibCalAvailabilityForDate(dateKey, { signal: controller.signal });
    const buildings = Array.isArray(data) ? data : [];
    boundedCacheSet(libcalCache, dateKey, buildings, DAY_CACHE_LIMIT);
    libraryRaw = buildings;
  } catch (err: any) {
    if (controller.signal.aborted) return;
    console.error(`Error loading LibCal availability for ${dateKey}:`, err);
    libraryRaw = [];
  }
  recomputeDerived();
}

async function ensureDining(dateKey: string): Promise<void> {
  const cached = diningCache.get(dateKey);
  if (cached) {
    diningRaw = cached;
    recomputeDerived();
    return;
  }

  diningAbort?.abort();
  const controller = new AbortController();
  diningAbort = controller;

  try {
    const data = await fetchDiningHallsForDate(dateKey, { signal: controller.signal });
    const halls = Array.isArray(data) ? data : [];
    boundedCacheSet(diningCache, dateKey, halls, DAY_CACHE_LIMIT);
    diningRaw = halls;
  } catch (err: any) {
    if (controller.signal.aborted) return;
    console.error(`Error loading dining information for ${dateKey}:`, err);
    diningRaw = [];
  }
  recomputeDerived();
}

/** Refetches everything keyed by the active campus day, then re-derives. */
function refreshForActiveDate(): void {
  const dateKey = useCampusStore.getState().activeDateKey;
  if (!bundledBuildings.length) {
    recomputeDerived();
    return;
  }
  void ensureDayData(dateKey).then(() => prefetchAdjacentDays(dateKey));
  void ensureLibCal(dateKey);
  void ensureDining(dateKey);
}

/** 60s tick in 'now' mode so statuses/parking/dining stay time-accurate. */
function syncNowTicker(): void {
  const isNow = useCampusStore.getState().viewMode === 'now';
  if (isNow && nowTicker == null) {
    nowTicker = setInterval(() => {
      const s = useCampusStore.getState();
      if (s.viewMode !== 'now') return;
      const dateKey = getDateKey(new Date());
      if (dateKey !== s.activeDateKey) {
        useCampusStore.setState({ activeDateKey: dateKey });
        refreshForActiveDate(); // crossed midnight — refetch the new day
      } else {
        recomputeDerived();
      }
    }, 60000);
  } else if (!isNow && nowTicker != null) {
    clearInterval(nowTicker);
    nowTicker = null;
  }
}

async function runInit(): Promise<void> {
  useCampusStore.setState({ loading: { status: 'loading', progress: 0, error: null } });

  // Metadata skeleton (non-blocking): gives the map building positions even
  // before / if the big bundled dataset arrives.
  fetch(`${BASE_URL}buildings_metadata.json`)
    .then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    })
    .then((data) => {
      metadataBuildings = sortBuildings(data);
      if (!bundledBuildings.length) recomputeDerived();
    })
    .catch((err) => console.error('Error loading building metadata:', err));

  try {
    const data = await fetchJsonWithProgress(`${BASE_URL}buildings_data.json`, {
      onProgress: ({ ratio }: { ratio: number | null }) => {
        useCampusStore.setState((prev) => ({
          loading: {
            status: 'loading',
            progress: ratio ?? prev.loading.progress,
            error: null,
          },
        }));
      },
    });

    const sorted = sortBuildings(data);
    bundledBuildings = sorted;
    inventorySkeleton = stripAvailability(sorted);
    bundledCoverage = getCoverageRange(sorted);

    useCampusStore.setState({
      coverage: bundledCoverage
        ? { start: bundledCoverage.minDate, end: bundledCoverage.maxDate }
        : null,
      loading: { status: 'ready', progress: 1, error: null },
    });

    await Promise.allSettled([
      ensureDayData(useCampusStore.getState().activeDateKey),
      ensureLibCal(useCampusStore.getState().activeDateKey),
      ensureDining(useCampusStore.getState().activeDateKey),
    ]);
    recomputeDerived();
    prefetchAdjacentDays(useCampusStore.getState().activeDateKey);
    syncNowTicker();
  } catch (err: any) {
    console.error('Error loading building data:', err);
    initPromise = null; // allow a later init() call to retry
    useCampusStore.setState({
      loading: {
        status: 'error',
        progress: 0,
        error: err?.message || 'Failed to load room data.',
      },
    });
  }
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

const initialSchedule = readInitialSchedule();

export const useCampusStore = create<CampusStore>()((set, get) => ({
  // data
  buildings: [],
  dining: [],
  parking: [],
  loading: { status: 'idle', progress: 0, error: null },
  coverage: null,

  // ui state
  viewMode: initialSchedule.viewMode,
  scheduleDate: initialSchedule.scheduleDate,
  minDurationMin: 0,
  minCapacity: 0,
  searchQuery: '',
  activeOverlays: loadOverlays(),
  selected: null,
  darkMode: loadDarkMode(),
  darkModeAuto: true,
  favorites: loadFavorites(),
  flyTo: null,
  legendOpen: false,

  // additive state
  dayFetch: EMPTY_DAY_FETCH_STATE,
  activeDateKey: getDateKey(
    initialSchedule.viewMode === 'now' ? new Date() : initialSchedule.scheduleDate
  ),
  pendingDeepLink: readDeepLink(),
  selectionSource: null,
  favoritesOpen: false,

  // actions
  init: () => {
    if (!initPromise) {
      initPromise = runInit();
    }
    return initPromise;
  },

  setViewMode: (m) => {
    if (get().viewMode === m) return;
    const dateKey = getDateKey(m === 'now' ? new Date() : get().scheduleDate);
    set({ viewMode: m, activeDateKey: dateKey });
    refreshForActiveDate();
    syncNowTicker();
  },

  setScheduleDate: (d) => {
    if (!(d instanceof Date) || isNaN(d.getTime())) return;
    const dateKey = getDateKey(d);
    const changedDay = dateKey !== get().activeDateKey;
    set({ scheduleDate: d, activeDateKey: dateKey });
    if (changedDay) {
      refreshForActiveDate(); // availability refetch for the new day
    } else {
      recomputeDerived(); // same day, new time window — re-derive statuses only
    }
  },

  setSearchQuery: (q) => set({ searchQuery: q }),

  setMinDuration: (min) => {
    set({ minDurationMin: min });
    recomputeDerived(); // duration filter feeds availability status derivation
  },

  setMinCapacity: (seats) => {
    const next = Math.max(0, Number(seats) || 0);
    if (get().minCapacity === next) return;
    set({ minCapacity: next });
    recomputeDerived(); // capacity filter changes the derived room lists
  },

  toggleOverlay: (k) => {
    const current = get().activeOverlays;
    const next = current.includes(k) ? current.filter((o) => o !== k) : [...current, k];
    persistOverlays(next);
    set({ activeOverlays: next });
  },

  select: (s, opts) => set({ selected: s, selectionSource: opts?.source ?? 'panel' }),

  clearSelection: () => set({ selected: null, selectionSource: null }),

  toggleDarkMode: () => {
    const next = !get().darkMode;
    safeStorageSet('darkMode', JSON.stringify(next));
    set({ darkMode: next, darkModeAuto: false }); // manual override for the session
  },

  setDarkModeAuto: (dark) => {
    if (get().darkMode === dark) return;
    set({ darkMode: dark }); // solar-driven; not persisted, keeps darkModeAuto
  },

  toggleFavorite: (key) => {
    const current = get().favorites;
    const next = current.includes(key) ? current.filter((f) => f !== key) : [...current, key];
    safeStorageSet('favorites', JSON.stringify(next));
    set({ favorites: next });
  },

  requestFlyTo: (t) => set({ flyTo: t }),

  clearFlyTo: () => set({ flyTo: null }),

  setLegendOpen: (open) => set({ legendOpen: open }),

  setFavoritesOpen: (open) => set({ favoritesOpen: open }),
}));

// Dev-only QA hook: lets headless probes drive selections deterministically.
// Stripped from production builds (import.meta.env.DEV is false there).
if (import.meta.env.DEV) {
  (window as unknown as Record<string, unknown>).__campusStore = useCampusStore;
}
