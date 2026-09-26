// src/lib/store.ts
//
// Zustand store implementing the plan.md "Store shape" contract, with the
// full data-loading pipeline ported from the legacy CRA app's App.js:
//   - small room inventory at boot; bundled schedule fetched on demand
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
import { invalidatePersistedDay, persistDay, readPersistedDay } from './dayCachePersistence';
import { computeSunPosition } from './solar';
import type {
  CampusBuildingRecord,
  CampusRoomRecord,
  BuildingEntry,
  CampusSelection,
  DiningHall,
  LibraryBrowseDate,
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
  libcalStatus: 'idle' | 'loading' | 'ready' | 'error';

  // ui state
  viewMode: ViewMode;
  scheduleDate: Date; // selected date/time window (schedule mode)
  minDurationMin: number; // 0 | 60 | 120 | 180
  minCapacity: number; // 0 (All) | 20 | 50 | 100 | 150 — minimum-seat filter
  searchQuery: string;
  activeOverlays: OverlayKind[]; // which marker layers show
  selected: CampusSelection;
  darkMode: boolean;
  /** When true, the UI theme follows the campus solar day/night cycle.
   * The user's auto/day/night preference survives reloads. */
  darkModeAuto: boolean;
  favorites: string[]; // 'b:CODE' | 'r:CODE/ROOMID'
  flyTo: MapFlyTarget | null; // map listens and clears after flying
  legendOpen: boolean;

  // actions
  init(): Promise<void>; // full data load pipeline (ported from App.js)
  retryDayData(): void;
  refreshDayData(): void;
  retryLibCal(): void;
  setViewMode(m: ViewMode): void;
  setScheduleDate(d: Date): void; // triggers availability refetch for that day
  setSearchQuery(q: string): void;
  setMinDuration(min: number): void;
  setMinCapacity(seats: number): void;
  toggleOverlay(k: OverlayKind): void;
  select(s: CampusStore['selected'], opts?: { source?: 'map' | 'panel' }): void;
  clearSelection(): void;
  toggleDarkMode(): void;
  /** Solar-cycle hook: sets darkMode without changing the preference. */
  setDarkModeAuto(dark: boolean): void;
  /** Persisted 3-state preference: 'auto' follows the campus sun; 'day' and
   * 'night' keep a manual appearance until the user changes it. */
  setTimePreference(pref: 'auto' | 'day' | 'night'): void;
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
  /** Where the latest selection came from. */
  selectionSource: 'map' | 'panel' | null;
  /** Desktop and landscape browse panel can be tucked away to explore the map. */
  browsePanelHidden: boolean;
  setBrowsePanelHidden(hidden: boolean): void;
  /** Keeps the long-list room filter through responsive panel remounts. */
  availableOnlyFilter: { key: string; enabled: boolean };
  setAvailableOnlyFilter(key: string, enabled: boolean): void;
  roomExpansion: { key: string; roomId: string | null };
  setRoomExpansion(key: string, roomId: string | null): void;
  /** Retains only the browsed date, never booking holds or form state. */
  libraryBrowseDate: LibraryBrowseDate | null;
  setLibraryBrowseDate(selectionId: string, dateKey: string): void;
  /** Favorites view open flag (rendered inside the shell panel). */
  favoritesOpen: boolean;
  setFavoritesOpen(open: boolean): void;
}

export interface DayFetchState {
  status: 'idle' | 'loading' | 'ready' | 'error';
  /** When the classroom feed last completed successfully (not a historical archive). */
  updatedAt?: number;
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
const NOW_REFRESH_MS = 15 * 60 * 1000;
const SCHEDULE_CACHE_MS = 60 * 60 * 1000;
const BASE_URL = import.meta.env.BASE_URL || '/';

let bundledBuildings: CampusBuildingRecord[] = []; // historical schedule, loaded only when needed
let bundledBuildingsPromise: Promise<CampusBuildingRecord[]> | null = null;
let inventorySkeleton: CampusBuildingRecord[] = []; // small room inventory without availability
let bundledCoverage: { minDate: string; maxDate: string } | null = null;
let metadataBuildings: CampusBuildingRecord[] = []; // buildings_metadata.json (map skeleton fallback)
const libraryInventory: CampusBuildingRecord[] = getLibCalBuildingInventory(); // static LibCal metadata
let classroomRaw: CampusBuildingRecord[] = []; // classroom buildings for the active day
// A live day arrives one building at a time. Keep successful buildings usable
// while the rest load, and never interpret a failed empty fallback as free.
const resolvedClassroomCodes = new Set<string>();
const failedClassroomCodes = new Set<string>();
let libraryRaw: CampusBuildingRecord[] = []; // LibCal buildings for the active day
let diningRaw: DiningRecord[] = []; // dining halls + retail venues for the active day

interface DiningRecord {
  id?: string | number;
  name?: string;
  latitude?: number;
  longitude?: number;
  meals?: Record<string, unknown>[];
  dateKey?: string;
  kind?: string;
  [key: string]: unknown;
}

interface AvailabilityProgress {
  index?: number;
  building?: CampusBuildingRecord;
  succeeded?: boolean;
  ratio?: number;
  indeterminate?: boolean;
  completedRooms?: number;
  totalRooms?: number;
  completedBuildings?: number;
  totalBuildings?: number;
}

// The data pipeline is JavaScript and its inferred options omit `signal` and
// progress details. This is the shape the function actually accepts/emits.
const fetchLiveAvailability = fetchAvailabilityForDate as unknown as (
  buildings: CampusBuildingRecord[],
  dateKey: string,
  options: {
    signal?: AbortSignal;
    concurrency?: number;
    onProgress?: (progress: AvailabilityProgress) => void;
  }
) => Promise<CampusBuildingRecord[]>;

function errorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === 'string' && message) return message;
  }
  return fallback;
}

const dayCache = new Map<string, CampusBuildingRecord[]>();
const dayCacheAt = new Map<string, number>();
const libcalCache = new Map<string, CampusBuildingRecord[]>();
const diningCache = new Map<string, DiningRecord[]>();
const prefetchInFlight = new Set<string>();

function cacheDay(dateKey: string, buildings: CampusBuildingRecord[], at = Date.now()): void {
  boundedCacheSet(dayCache, dateKey, buildings, DAY_CACHE_LIMIT);
  dayCacheAt.set(dateKey, at);
  for (const key of dayCacheAt.keys()) {
    if (!dayCache.has(key)) dayCacheAt.delete(key);
  }
}

// ---------------------------------------------------------------------------
// Persistent day cache. A day outside the bundled coverage costs a 337-room
// live fetch; IndexedDB can hold the complete snapshot without localStorage's
// quota errors. The in-memory map above remains bounded by DAY_CACHE_LIMIT.
// ---------------------------------------------------------------------------

let activeFetchId = 0;
let dayAbort: AbortController | null = null;
let libcalAbort: AbortController | null = null;
let diningAbort: AbortController | null = null;
let initPromise: Promise<void> | null = null;
let nowTicker: ReturnType<typeof setInterval> | null = null;

// ---------------------------------------------------------------------------
// Persistence helpers (ported behavior; keys kept compatible with legacy app)
// ---------------------------------------------------------------------------

type TimePreference = 'auto' | 'day' | 'night';

function loadTimePreference(): TimePreference {
  const saved = safeStorageGet('timePreference');
  return saved === 'day' || saved === 'night' ? saved : 'auto';
}

const initialTimePreference = loadTimePreference();
const initialDarkMode = initialTimePreference === 'night' ||
  (initialTimePreference === 'auto' && computeSunPosition(new Date()).elevation < -1);

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

function sortBuildings(data: unknown): CampusBuildingRecord[] {
  return (Array.isArray(data) ? data as CampusBuildingRecord[] : [])
    .slice().sort((a, b) => a.name.localeCompare(b.name));
}

/** The older bundled schedule is useful for its own date range, but its
 *  multi-megabyte JSON should never block a visit to today's room browser. */
function loadBundledBuildings(): Promise<CampusBuildingRecord[]> {
  if (bundledBuildings.length) return Promise.resolve(bundledBuildings);
  if (!bundledBuildingsPromise) {
    bundledBuildingsPromise = fetchJsonWithProgress(`${BASE_URL}buildings_data.json`)
      .then((data: unknown) => {
        if (!Array.isArray(data) || !data.length) throw new Error('Bundled schedule is empty');
        bundledBuildings = sortBuildings(data);
        return bundledBuildings;
      })
      .catch((error: unknown) => {
        bundledBuildingsPromise = null; // a later date selection may retry
        throw error;
      });
  }
  return bundledBuildingsPromise;
}

// Ported verbatim from App.js: merges supplemental (LibCal) buildings into the
// classroom dataset by code/name, appending non-duplicate rooms.
function mergeBuildingCollections(
  baseBuildings: CampusBuildingRecord[], supplementalBuildings: CampusBuildingRecord[]
): CampusBuildingRecord[] {
  const merged = new Map<string, CampusBuildingRecord>();

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

    const existingRoomIds = new Set((existing.classrooms || []).map((room) => String(room.id)));
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

const LIBCAL_CODES = new Set<string>(LIBCAL_BUILDING_METADATA.map((b) => b.code));

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
function roomMatchesCapacity(room: CampusRoomRecord, minCapacity: number): boolean {
  if (minCapacity <= 0) return true;
  const capacity = Number(room?.capacity);
  return Number.isFinite(capacity) && capacity >= minCapacity;
}

function deriveBuildings(ctx: DeriveContext): BuildingEntry[] {
  const { dayFetch, libcalStatus } = useCampusStore.getState();
  const base = classroomRaw.length
    ? classroomRaw
    : inventorySkeleton.length
      ? inventorySkeleton
      : metadataBuildings;
  const supplemental = libraryRaw.length ? libraryRaw : libraryInventory;
  const merged = mergeBuildingCollections(base, supplemental);

  return merged.map((b) => {
    const allClassrooms = Array.isArray(b.classrooms) ? b.classrooms : [];
    const hasClassroomFeedRooms = allClassrooms.some((room: { source?: string }) =>
      room.source !== 'libcal' && room.source !== 'supplemental'
    );
    // Capacity filter (legacy "Minimum seats" chips) applies before the
    // render-state summary so building counts reflect the filtered rooms.
    const classrooms = allClassrooms.filter((room) =>
      roomMatchesCapacity(room, ctx.minCapacity)
    );
    // The legacy JS helper infers null-only options; describe the values it
    // accepts and returns at this TypeScript boundary.
    const renderBuilding = getBuildingRenderState as unknown as (
      rooms: CampusRoomRecord[],
      options: { startTime: Date; endTime: Date | null; isNow: boolean; durationFilter: number }
    ) => {
      status: string;
      totalRooms: number;
      availableCount: number;
      roomStates: { room: CampusRoomRecord; state: {
        displayStatus?: string | null;
        rawStatus?: string | null;
        availableUntil?: string | null;
      } }[];
    };
    const summary = renderBuilding(classrooms, {
      startTime: ctx.startTime,
      endTime: ctx.endTime,
      isNow: ctx.isNow,
      durationFilter: ctx.durationHours,
    });
    const stateByRoom = new Map<CampusRoomRecord, {
      displayStatus?: string | null;
      rawStatus?: string | null;
      availableUntil?: string | null;
    }>();
    for (const rs of summary.roomStates || []) stateByRoom.set(rs.room, rs.state);

    const code = String(b.code ?? b.name ?? '');
    const classroomIssue = hasClassroomFeedRooms &&
      (failedClassroomCodes.has(code) ||
        (dayFetch.status !== 'ready' && !resolvedClassroomCodes.has(code)));
    const rooms: RoomEntry[] = classrooms.map((room, idx: number) => {
      const st = stateByRoom.get(room);
      const classroomPending = classroomIssue &&
        room.source !== 'libcal' && room.source !== 'supplemental';
      return {
        id: String(room.id ?? room.name ?? idx),
        name: String(room.name ?? room.id ?? `Room ${idx + 1}`),
        buildingCode: code,
        status: classroomPending ? 'unknown' : toContractStatus(st?.displayStatus ?? st?.rawStatus),
        displayStatus: classroomPending ? null : st?.displayStatus ?? st?.rawStatus ?? null,
        availableUntil: classroomPending ? null : st?.availableUntil ?? null,
        events: Array.isArray(room.availability_times) ? room.availability_times : [],
        raw: room,
      };
    });

    const kind: BuildingEntry['kind'] =
      b.libcalBuilding === true || LIBCAL_CODES.has(code) ? 'library' : 'classroom';
    const libraryIssue = LIBCAL_CODES.has(code) && libcalStatus !== 'ready';
    const dataIssueSource = classroomIssue && libraryIssue ? 'both'
      : classroomIssue ? 'classrooms'
      : libraryIssue ? 'library'
      : undefined;
    const dataIssue = classroomIssue || libraryIssue
      ? ((classroomIssue && (failedClassroomCodes.has(code) || dayFetch.status === 'error')) ||
          (libraryIssue && libcalStatus === 'error')
        ? 'error' : 'loading')
      : undefined;

    return {
      id: code,
      name: String(b.name ?? code),
      code,
      lat: Number(b.latitude ?? 0),
      lng: Number(b.longitude ?? 0),
      kind,
      totalRooms: summary.totalRooms ?? classrooms.length,
      availableRooms: summary.availableCount ?? 0,
      status: dataIssue ? 'unknown' : summary.totalRooms ? toContractStatus(summary.status) : 'unknown',
      dataIssue,
      dataIssueSource,
      rooms,
      raw: b,
    };
  });
}

function deriveDining(ctx: DeriveContext): DiningHall[] {
  return diningRaw.map((hall, idx: number) => {
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
  return getParkingFeatures(reference).map((feature) => {
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

function roomTotal(buildings: CampusBuildingRecord[]): number {
  return buildings.reduce((sum, b) => sum + (b.classrooms || []).length, 0);
}

/** Ensures classroom availability data for a campus date key (yyyy-MM-dd). */
async function ensureDayData(dateKey: string, force = false): Promise<void> {
  if (!inventorySkeleton.length) return;

  // Fetch the historical archive only when the selected day is inside it.
  if (isDateCovered(dateKey, bundledCoverage)) {
    dayAbort?.abort();
    const fetchId = ++activeFetchId;
    resolvedClassroomCodes.clear();
    failedClassroomCodes.clear();
    classroomRaw = inventorySkeleton.slice();
    useCampusStore.setState({ dayFetch: {
      ...EMPTY_DAY_FETCH_STATE,
      status: 'loading',
      indeterminate: true,
      dateKey,
      totalRooms: roomTotal(inventorySkeleton),
      totalBuildings: inventorySkeleton.length,
    } });
    recomputeDerived();
    try {
      const data = await loadBundledBuildings();
      if (activeFetchId !== fetchId) return;
      classroomRaw = data;
      useCampusStore.setState({ dayFetch: {
        ...EMPTY_DAY_FETCH_STATE,
        status: 'ready',
        progress: 1,
        dateKey,
        completedRooms: roomTotal(data),
        totalRooms: roomTotal(data),
        completedBuildings: data.length,
        totalBuildings: data.length,
      } });
      recomputeDerived();
      return;
    } catch (error) {
      if (activeFetchId !== fetchId) return;
      console.warn('Bundled schedule unavailable; fetching the selected day live:', error);
    }
  }

  const maxAge = useCampusStore.getState().viewMode === 'now'
    ? NOW_REFRESH_MS : SCHEDULE_CACHE_MS;
  let cached = force ? undefined : dayCache.get(dateKey);
  if (cached && Date.now() - (dayCacheAt.get(dateKey) ?? 0) >= maxAge) {
    dayCache.delete(dateKey);
    dayCacheAt.delete(dateKey);
    cached = undefined;
  }
  if (!cached && !force) {
    // Reload/revisit within the TTL: restore the persisted result instead of
    // re-running the full live fetch.
    const cacheReadId = ++activeFetchId;
    const persisted = await readPersistedDay<CampusBuildingRecord>(dateKey);
    if (cacheReadId !== activeFetchId) return;
    if (persisted && Date.now() - persisted.at < maxAge) {
      cached = persisted.buildings;
      cacheDay(dateKey, cached, persisted.at);
    }
  }
  if (cached) {
    dayAbort?.abort();
    activeFetchId += 1;
    resolvedClassroomCodes.clear();
    failedClassroomCodes.clear();
    classroomRaw = cached;
    useCampusStore.setState({
      dayFetch: {
        status: 'ready',
        updatedAt: dayCacheAt.get(dateKey),
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
  resolvedClassroomCodes.clear();
  failedClassroomCodes.clear();

  // Show the availability-stripped inventory while the day loads.
  classroomRaw = inventorySkeleton.slice();
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
    if (force) {
      await invalidatePersistedDay(dateKey);
      if (activeFetchId !== fetchId || controller.signal.aborted) return;
    }
    const data = await fetchLiveAvailability(inventorySkeleton, dateKey, {
      signal: controller.signal,
      onProgress: (progress: AvailabilityProgress) => {
        if (activeFetchId !== fetchId) return;
        if (typeof progress.index === 'number' && Number.isInteger(progress.index) && progress.building) {
          const code = String(inventorySkeleton[progress.index]?.code ?? progress.building.code ?? '');
          classroomRaw[progress.index] = progress.building;
          if (progress.succeeded) resolvedClassroomCodes.add(code);
          else failedClassroomCodes.add(code);
        }
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
        if (typeof progress.index === 'number' && Number.isInteger(progress.index) && progress.building) recomputeDerived();
      },
    });
    if (activeFetchId !== fetchId) return;
    const sorted = sortBuildings(data);
    if (failedClassroomCodes.size === 0) {
      cacheDay(dateKey, sorted);
      void persistDay(dateKey, sorted);
    }
    classroomRaw = sorted;
    const updatedAt = failedClassroomCodes.size ? undefined : Date.now();
    useCampusStore.setState({
      dayFetch: {
        status: failedClassroomCodes.size ? 'error' : 'ready',
        updatedAt,
        progress: 1,
        indeterminate: false,
        error: failedClassroomCodes.size
          ? `${failedClassroomCodes.size} building${failedClassroomCodes.size === 1 ? '' : 's'} could not load availability.`
          : null,
        dateKey,
        completedRooms: roomTotal(sorted),
        totalRooms: roomTotal(sorted),
        completedBuildings: sorted.length,
        totalBuildings: sorted.length,
      },
    });
    recomputeDerived();
  } catch (err: unknown) {
    if (controller.signal.aborted || activeFetchId !== fetchId) return;
    console.error(`Error fetching availability for ${dateKey}:`, err);
    // Successful buildings already streamed to the list; retain them while
    // marking the unfinished buildings unknown and offering a retry.
    useCampusStore.setState({
      dayFetch: {
        status: 'error',
        progress: 0,
        indeterminate: false,
        error: errorMessage(err, 'Failed to fetch that day.'),
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

/** A partial live-day failure should not repeat the successful requests. */
async function retryFailedDayData(dateKey: string): Promise<void> {
  if (useCampusStore.getState().dayFetch.status === 'loading') return;
  const failedIndexes = inventorySkeleton
    .map((building, index) => failedClassroomCodes.has(String(building.code ?? '')) ? index : -1)
    .filter((index) => index >= 0);
  if (!failedIndexes.length || useCampusStore.getState().dayFetch.dateKey !== dateKey) {
    await ensureDayData(dateKey);
    return;
  }

  dayAbort?.abort();
  const controller = new AbortController();
  dayAbort = controller;
  const fetchId = ++activeFetchId;
  const pendingCodes = failedIndexes.map((index) => String(inventorySkeleton[index].code ?? ''));
  const pendingBuildings = failedIndexes.map((index) => inventorySkeleton[index]);
  failedClassroomCodes.clear();
  useCampusStore.setState({ dayFetch: {
    ...EMPTY_DAY_FETCH_STATE,
    status: 'loading',
    dateKey,
    totalRooms: roomTotal(pendingBuildings),
    totalBuildings: pendingBuildings.length,
  } });
  recomputeDerived();

  try {
    await fetchLiveAvailability(pendingBuildings, dateKey, {
      signal: controller.signal,
      onProgress: (progress: AvailabilityProgress) => {
        if (activeFetchId !== fetchId) return;
        if (typeof progress.index === 'number' && Number.isInteger(progress.index) && progress.building) {
          const fullIndex = failedIndexes[progress.index];
          const code = pendingCodes[progress.index];
          classroomRaw[fullIndex] = progress.building;
          if (progress.succeeded) resolvedClassroomCodes.add(code);
          else failedClassroomCodes.add(code);
          recomputeDerived();
        }
        useCampusStore.setState({ dayFetch: {
          status: 'loading',
          progress: progress.ratio ?? 0,
          indeterminate: Boolean(progress.indeterminate),
          error: null,
          dateKey,
          completedRooms: progress.completedRooms ?? 0,
          totalRooms: progress.totalRooms ?? roomTotal(pendingBuildings),
          completedBuildings: progress.completedBuildings ?? 0,
          totalBuildings: progress.totalBuildings ?? pendingBuildings.length,
        } });
      },
    });
    if (activeFetchId !== fetchId) return;
    const sorted = sortBuildings(classroomRaw);
    classroomRaw = sorted;
    if (failedClassroomCodes.size === 0) {
      cacheDay(dateKey, sorted);
      void persistDay(dateKey, sorted);
    }
    useCampusStore.setState({ dayFetch: {
      status: failedClassroomCodes.size ? 'error' : 'ready',
      updatedAt: failedClassroomCodes.size ? undefined : Date.now(),
      progress: 1,
      indeterminate: false,
      error: failedClassroomCodes.size
        ? `${failedClassroomCodes.size} building${failedClassroomCodes.size === 1 ? '' : 's'} could not load availability.`
        : null,
      dateKey,
      completedRooms: roomTotal(sorted),
      totalRooms: roomTotal(sorted),
      completedBuildings: sorted.length,
      totalBuildings: sorted.length,
    } });
    recomputeDerived();
  } catch (error) {
    if (controller.signal.aborted || activeFetchId !== fetchId) return;
    for (const code of pendingCodes) {
      if (!resolvedClassroomCodes.has(code)) failedClassroomCodes.add(code);
    }
    console.error(`Error retrying availability for ${dateKey}:`, error);
    useCampusStore.setState({ dayFetch: {
      ...EMPTY_DAY_FETCH_STATE,
      status: 'error',
      error: `${failedClassroomCodes.size} building${failedClassroomCodes.size === 1 ? '' : 's'} could not load availability.`,
      dateKey,
    } });
    recomputeDerived();
  }
}

/** Prefetches the days before/after the active one (schedule mode only). */
function prefetchAdjacentDays(dateKey: string): void {
  const s = useCampusStore.getState();
  if (s.viewMode === 'now' || !inventorySkeleton.length) return;

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
    let failed = false;
    const options = {
      concurrency: 4,
      onProgress: (progress: { succeeded?: boolean }) => {
        if (progress.succeeded === false) failed = true;
      },
    };
    fetchAvailabilityForDate(inventorySkeleton, key, options)
      .then((data) => {
        if (!failed) {
          cacheDay(key, sortBuildings(data));
        }
      })
      .catch((err) => {
        console.error(`Error prefetching availability for ${key}:`, err);
      })
      .finally(() => {
        prefetchInFlight.delete(key);
      });
  }
}

async function ensureLibCal(dateKey: string, force = false): Promise<void> {
  const cached = force ? undefined : libcalCache.get(dateKey);
  if (cached) {
    libraryRaw = cached;
    useCampusStore.setState({ libcalStatus: 'ready' });
    recomputeDerived();
    return;
  }

  libcalAbort?.abort();
  const controller = new AbortController();
  libcalAbort = controller;
  libraryRaw = [];
  useCampusStore.setState({ libcalStatus: 'loading' });
  recomputeDerived();

  let lastError: unknown;
  for (const delay of [0, 350, 1000]) {
    if (delay) await new Promise<void>((resolve) => setTimeout(resolve, delay));
    if (controller.signal.aborted) return;
    try {
      const buildings = await fetchLibCalAvailabilityForDate(dateKey, { signal: controller.signal });
      if (controller.signal.aborted) return;
      const returnedCodes = new Set(buildings.map((building: { code?: unknown }) => String(building.code ?? '')));
      if ([...LIBCAL_CODES].some((code) => !returnedCodes.has(code))) {
        throw new Error('Incomplete library room response');
      }
      boundedCacheSet(libcalCache, dateKey, buildings, DAY_CACHE_LIMIT);
      libraryRaw = buildings;
      useCampusStore.setState({ libcalStatus: 'ready' });
      recomputeDerived();
      return;
    } catch (err: unknown) {
      if (controller.signal.aborted) return;
      lastError = err;
    }
  }
  console.error(`Error loading LibCal availability for ${dateKey}:`, lastError);
  useCampusStore.setState({ libcalStatus: 'error' });
  recomputeDerived();
}

async function ensureDining(dateKey: string, force = false): Promise<void> {
  const cached = force ? undefined : diningCache.get(dateKey);
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
  } catch (err: unknown) {
    if (controller.signal.aborted) return;
    console.error(`Error loading dining information for ${dateKey}:`, err);
    diningRaw = [];
  }
  recomputeDerived();
}

/** Refetches everything keyed by the active campus day, then re-derives. */
function refreshForActiveDate(force = false): void {
  const dateKey = useCampusStore.getState().activeDateKey;
  if (!inventorySkeleton.length) {
    recomputeDerived();
    return;
  }
  void ensureDayData(dateKey, force).then(() => prefetchAdjacentDays(dateKey));
  void ensureLibCal(dateKey, force);
  void ensureDining(dateKey, force);
}

function maybeRefreshNow(): void {
  const s = useCampusStore.getState();
  if (s.viewMode !== 'now' || s.dayFetch.status !== 'ready' ||
      isDateCovered(s.activeDateKey, bundledCoverage) ||
      (typeof document !== 'undefined' && document.visibilityState === 'hidden')) return;
  const lastFetch = dayCacheAt.get(s.activeDateKey) ?? 0;
  if (Date.now() - lastFetch < NOW_REFRESH_MS) return;
  // A failed refresh must not make an older snapshot look fresh on a later
  // mode switch. The loading state prevents overlapping refreshes.
  dayCache.delete(s.activeDateKey);
  dayCacheAt.delete(s.activeDateKey);
  refreshForActiveDate(true);
}

function onNowVisible(): void {
  if (document.visibilityState === 'visible') maybeRefreshNow();
}

/** 60s tick in 'now' mode keeps statuses current and renews older feeds. */
function syncNowTicker(): void {
  const isNow = useCampusStore.getState().viewMode === 'now';
  if (isNow && nowTicker == null) {
    if (typeof document !== 'undefined') document.addEventListener('visibilitychange', onNowVisible);
    nowTicker = setInterval(() => {
      const s = useCampusStore.getState();
      if (s.viewMode !== 'now') return;
      const dateKey = getDateKey(new Date());
      if (dateKey !== s.activeDateKey) {
        useCampusStore.setState({ activeDateKey: dateKey });
        refreshForActiveDate(); // crossed midnight — refetch the new day
      } else {
        recomputeDerived();
        maybeRefreshNow();
      }
    }, 60000);
    maybeRefreshNow();
  } else if (!isNow && nowTicker != null) {
    clearInterval(nowTicker);
    nowTicker = null;
    if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onNowVisible);
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
    const data = await fetchJsonWithProgress(`${BASE_URL}buildings_inventory.json`, {
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

    // The generated inventory has the same rooms and metadata as the large
    // archive, but no old time slots. Accept an array in older test fixtures.
    const legacyArray = Array.isArray(data);
    const source = legacyArray ? data : data?.buildings;
    if (!Array.isArray(source) || !source.length) throw new Error('Room inventory is empty');
    const sorted = sortBuildings(source);
    inventorySkeleton = legacyArray ? stripAvailability(sorted) : sorted;
    if (legacyArray) bundledBuildings = sorted;
    bundledCoverage = legacyArray ? getCoverageRange(sorted) : data.coverage ?? null;

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
  } catch (err: unknown) {
    console.error('Error loading building data:', err);
    initPromise = null; // allow a later init() call to retry
    useCampusStore.setState({
      loading: {
        status: 'error',
        progress: 0,
        error: errorMessage(err, 'Failed to load room data.'),
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
  libcalStatus: 'idle',

  // ui state
  viewMode: initialSchedule.viewMode,
  scheduleDate: initialSchedule.scheduleDate,
  minDurationMin: 0,
  minCapacity: 0,
  searchQuery: '',
  activeOverlays: loadOverlays(),
  selected: null,
  darkMode: initialDarkMode,
  darkModeAuto: initialTimePreference === 'auto',
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
  browsePanelHidden: false,
  availableOnlyFilter: { key: '', enabled: false },
  roomExpansion: { key: '', roomId: null },
  libraryBrowseDate: null,
  favoritesOpen: false,

  // actions
  init: () => {
    if (!initPromise) {
      initPromise = runInit();
    }
    return initPromise;
  },
  retryDayData: () => { void retryFailedDayData(get().activeDateKey); },
  refreshDayData: () => {
    const state = get();
    if (state.viewMode !== 'now' || state.dayFetch.status !== 'ready') return;
    dayCache.delete(state.activeDateKey);
    dayCacheAt.delete(state.activeDateKey);
    refreshForActiveDate(true);
  },
  // A failed refresh may leave an older cached success; Retry must recheck the feed.
  retryLibCal: () => { void ensureLibCal(get().activeDateKey, true); },

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

  select: (s, opts) => set((state) => ({
    selected: s,
    selectionSource: opts?.source ?? 'panel',
    libraryBrowseDate: s?.kind === 'room' && state.selected?.kind === 'room' &&
      s.id === state.selected.id ? state.libraryBrowseDate : null,
    // A map pick needs its details visible, even if the user was exploring
    // with the desktop browser tucked away.
    browsePanelHidden: s ? false : state.browsePanelHidden,
  })),

  setBrowsePanelHidden: (hidden) => set({ browsePanelHidden: hidden }),
  setAvailableOnlyFilter: (key, enabled) => set({ availableOnlyFilter: { key, enabled } }),
  setRoomExpansion: (key, roomId) => set({ roomExpansion: { key, roomId } }),
  setLibraryBrowseDate: (selectionId, dateKey) => {
    const state = get();
    if (state.selected?.kind !== 'room' || state.selected.id !== selectionId) return;
    if (state.libraryBrowseDate?.selectionId === selectionId &&
        state.libraryBrowseDate.dateKey === dateKey) return;
    set({ libraryBrowseDate: { selectionId, dateKey } });
  },

  clearSelection: () => set({ selected: null, selectionSource: null, libraryBrowseDate: null }),

  toggleDarkMode: () => {
    const next = !get().darkMode;
    safeStorageSet('darkMode', JSON.stringify(next));
    safeStorageSet('timePreference', next ? 'night' : 'day');
    set({ darkMode: next, darkModeAuto: false });
  },

  setDarkModeAuto: (dark) => {
    if (get().darkMode === dark) return;
    set({ darkMode: dark }); // solar-driven; not persisted, keeps darkModeAuto
  },

  setTimePreference: (pref) => {
    safeStorageSet('timePreference', pref);
    if (pref === 'auto') {
      // Match the sun immediately, including when the scene is still loading.
      const state = get();
      const date = state.viewMode === 'schedule' ? state.scheduleDate : new Date();
      set({ darkModeAuto: true, darkMode: computeSunPosition(date).elevation < -1 });
      return;
    }
    const dark = pref === 'night';
    safeStorageSet('darkMode', JSON.stringify(dark));
    set({ darkMode: dark, darkModeAuto: false }); // manual override
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
