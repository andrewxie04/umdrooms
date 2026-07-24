// browse/utils.ts — Shell-local helpers (status presentation, search text
// normalization ported from the legacy sidebarUtils.js, selection resolving,
// and navigation links). Kept inside browse/ per the parallel-agent rule that
// shared helpers must be duplicated rather than placed in shared files.

import type { BuildingEntry, CampusSelection, RoomEntry, Status } from '@/types/campus';
import { haversineDistance } from '@/lib/geo.js';
import { isUniversityHoliday } from '@/lib/availability.js';

// ---------------------------------------------------------------------------
// Status presentation
// ---------------------------------------------------------------------------

export const STATUS_RANK: Record<Status, number> = {
  available: 0,
  'opening-soon': 1,
  unknown: 2,
  unavailable: 3,
};

export const STATUS_LABEL: Record<Status, string> = {
  available: 'Available',
  'opening-soon': 'Opening soon',
  unavailable: 'Unavailable',
  unknown: 'No data',
};

export const STATUS_DOT_CLASS: Record<Status, string> = {
  available: 'bg-status-available',
  'opening-soon': 'bg-status-opening-soon',
  unavailable: 'bg-status-unavailable',
  unknown: 'bg-status-unknown',
};

// ---------------------------------------------------------------------------
// Favorites keys (contract: 'b:CODE' | 'r:CODE/ROOMID')
// ---------------------------------------------------------------------------

export function buildingFavKey(code: string): string {
  return `b:${code}`;
}

export function roomFavKey(buildingCode: string, roomId: string): string {
  return `r:${buildingCode}/${roomId}`;
}

/** Canonical room-selection id shared with the features agent. */
export function roomSelectionId(buildingCode: string, roomId: string): string {
  return `${buildingCode}/${roomId}`;
}

// ---------------------------------------------------------------------------
// Search normalization (ported from legacy sidebarUtils.js)
// ---------------------------------------------------------------------------

export function normalizeSearchText(value: unknown): string {
  return String(value || '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      if (word.endsWith('ies') && word.length > 4) return `${word.slice(0, -3)}y`;
      if (word.endsWith('ses') && word.length > 4) return word.slice(0, -2);
      if (word.endsWith('s') && !word.endsWith('ss') && word.length > 3) return word.slice(0, -1);
      return word;
    })
    .join(' ');
}

function getRoomSearchHaystack(room: RoomEntry): string {
  const raw = room.raw ?? {};
  const parts: string[] = [room.name, raw.type];

  if (raw.has_projector) parts.push('projector');
  if (raw.has_whiteboard) parts.push('whiteboard');
  if (raw.has_computers) parts.push('computers', 'computer');
  if (raw.source === 'libcal') parts.push('study room', 'bookable room', 'library room');
  if (raw.type === 'Large Lecture Hall' || raw.type === 'Small Lecture Hall') {
    parts.push('lecture hall', 'lecture halls');
  }

  return normalizeSearchText(parts.filter(Boolean).join(' '));
}

export interface RoomMatch {
  room: RoomEntry;
  building: BuildingEntry;
  /** Set when the match came from a class/event name rather than the room name. */
  matchedEventName: string | null;
}

/** Room match: room name/type haystack, or class/event names for the active day. */
export function matchRoom(
  room: RoomEntry,
  building: BuildingEntry,
  normalizedQuery: string,
  activeDateKey: string
): RoomMatch | null {
  if (!normalizedQuery) return null;

  if (getRoomSearchHaystack(room).includes(normalizedQuery)) {
    return { room, building, matchedEventName: null };
  }

  const events = Array.isArray(room.events) ? room.events : [];
  for (const timeRange of events) {
    const eventDatePart = String(timeRange?.date || '').split('T')[0];
    if (eventDatePart !== activeDateKey) continue;
    const eventName = String(timeRange?.event_name || '');
    if (eventName && normalizeSearchText(eventName).includes(normalizedQuery)) {
      return { room, building, matchedEventName: eventName };
    }
  }

  return null;
}

export function buildingMatchesQuery(building: BuildingEntry, normalizedQuery: string): boolean {
  if (!normalizedQuery) return true;
  const haystack = normalizeSearchText(`${building.name} ${building.code}`);
  return haystack.includes(normalizedQuery);
}

// ---------------------------------------------------------------------------
// Selection resolving
// ---------------------------------------------------------------------------

export interface ResolvedSelection {
  building: BuildingEntry;
  room: RoomEntry | null;
}

/**
 * Resolves a store selection to a building (+ room when kind==='room').
 * Room selections use the canonical 'CODE/ROOMID' id, but a bare room id is
 * also accepted (first match across buildings) for robustness.
 */
export function resolveBuildingSelection(
  buildings: BuildingEntry[],
  selected: CampusSelection
): ResolvedSelection | null {
  if (!selected || (selected.kind !== 'building' && selected.kind !== 'room')) return null;

  if (selected.kind === 'building') {
    const building =
      buildings.find((b) => b.code === selected.id || b.id === selected.id) ?? null;
    return building ? { building, room: null } : null;
  }

  const id = selected.id;
  if (id.includes('/')) {
    const [code, ...rest] = id.split('/');
    const roomId = rest.join('/');
    const building = buildings.find((b) => b.code === code || b.id === code) ?? null;
    if (building) {
      const room = (building.rooms ?? []).find((r) => r.id === roomId) ?? null;
      return { building, room };
    }
  }

  for (const building of buildings) {
    const room = (building.rooms ?? []).find((r) => r.id === id);
    if (room) return { building, room };
  }
  return null;
}

// ---------------------------------------------------------------------------
// External navigation link
// ---------------------------------------------------------------------------

export function getNavigationUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

// ---------------------------------------------------------------------------
// Campus-time helpers (America/New_York, matching lib/availability.js)
// ---------------------------------------------------------------------------

const CAMPUS_TZ = 'America/New_York';

/** Decimal hour (e.g. 13.5 for 1:30 PM) of `date` in the campus timezone. */
export function getCampusDecimalHour(date: Date): number {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: CAMPUS_TZ,
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    }).formatToParts(date);
    let hour = 0;
    let minute = 0;
    for (const part of parts) {
      if (part.type === 'hour') hour = Number(part.value) % 24;
      if (part.type === 'minute') minute = Number(part.value);
    }
    return hour + minute / 60;
  } catch {
    return date.getHours() + date.getMinutes() / 60;
  }
}

/** '6a' / '12p' / '12a' style tick labels for the room timeline. */
export function formatHourTick(hour: number): string {
  const h = ((hour % 24) + 24) % 24;
  if (h === 0) return '12a';
  if (h === 12) return '12p';
  return h < 12 ? `${h}a` : `${h - 12}p`;
}

/** Formats a decimal hour (14.5) as '2:30 PM'. */
export function formatDecimalHourLabel(decimal: number): string {
  const wrapped = ((decimal % 24) + 24) % 24;
  const hours = Math.floor(wrapped);
  const minutes = Math.round((wrapped - hours) * 60);
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

// ---------------------------------------------------------------------------
// Room detail helpers (ported from legacy Sidebar.js / sidebarUtils.js)
// ---------------------------------------------------------------------------

/** Splits a raw event_name ("ENES 200 05015, ENES 200 05025") into deduped names. */
export function parseEventNames(value: unknown): string[] {
  const parts = String(value || '')
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  return [...new Set(parts)];
}

/** Room floor: explicit raw.floor, else derived from the room name like legacy. */
export function getRoomFloor(room: RoomEntry): string {
  const rawFloor = room.raw?.floor;
  if (rawFloor != null && rawFloor !== '') return String(rawFloor);
  const parts = room.name.split(' ');
  if (parts.length >= 2) {
    const num = parts[1];
    if (num.startsWith('0')) return 'G';
    if (/^\d/.test(num)) return num.charAt(0);
  }
  return '1';
}

/** Feature chips for a classroom room (libcal rooms handled by the caller). */
export function getRoomFeatureTags(room: RoomEntry): string[] {
  const raw = room.raw ?? {};
  const tags: (string | null)[] = [
    raw.has_projector ? 'Projector' : null,
    raw.has_whiteboard ? 'Whiteboard' : null,
    raw.has_computers ? 'Computers' : null,
    raw.type === 'Computer Lab' ? 'Computer Lab' : null,
    // Supplemental-only types (legacy getSupplementalFeatureTags).
    raw.type === 'One Button Studio' ? 'One Button Studio' : null,
    raw.type === 'Innovation Space' ? 'Innovation Space' : null,
  ];
  return tags.filter((t): t is string => Boolean(t));
}

/** Notes lines shown in the detail grid (legacy getSupplementalNoteLines /
 *  the plain [access_note, details_note] fallback — same sources). */
export function getRoomNoteLines(room: RoomEntry): string[] {
  const raw = room.raw ?? {};
  return [raw.access_note, raw.details_note].filter(
    (line): line is string => typeof line === 'string' && line.trim().length > 0
  );
}

/** Posted-hours summary rows for supplemental rooms in 'hours' mode, ported
 *  from legacy Sidebar.js getSupplementalHoursRows. */
export function getSupplementalHoursLines(room: RoomEntry): string[] {
  const raw = room.raw ?? {};
  if (raw.source !== 'supplemental' || raw.supplemental?.mode !== 'hours') return [];
  const hours = raw.supplemental?.hours;
  if (!hours) return [];

  if (hours.type === 'always') {
    return ['Open 24/7'];
  }

  if (hours.type === 'weekday-window') {
    const startLabel = formatDecimalHourLabel(Number(hours.start ?? 7));
    const endLabel = formatDecimalHourLabel(Number(hours.end ?? 22));
    return [`Open ${startLabel}–${endLabel} Monday–Friday`, 'Closed weekends'];
  }

  if (hours.type === 'weekly-windows') {
    const firstWindow = (day: number): { start: number; end: number } | null =>
      (hours.windows?.[day] || [])[0] || null;
    const weekdayWindows = [1, 2, 3, 4].map(firstWindow).filter(Boolean) as {
      start: number;
      end: number;
    }[];
    const monThuMatch =
      weekdayWindows.length === 4 &&
      weekdayWindows.every(
        (w) => w.start === weekdayWindows[0].start && w.end === weekdayWindows[0].end
      );

    const rows: string[] = [];
    if (monThuMatch) {
      rows.push(
        `Open ${formatDecimalHourLabel(weekdayWindows[0].start)}–${formatDecimalHourLabel(
          weekdayWindows[0].end
        )} Monday–Thursday`
      );
    }
    const fridayWindow = firstWindow(5);
    if (fridayWindow) {
      rows.push(
        `Open ${formatDecimalHourLabel(fridayWindow.start)}–${formatDecimalHourLabel(
          fridayWindow.end
        )} Friday`
      );
    }
    rows.push('Closed weekends');
    return rows;
  }

  return [];
}

/** Clipboard copy with DOM fallback, ported from legacy sidebarUtils.js. */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to the DOM-based fallback.
    }
  }
  if (typeof document === 'undefined') {
    throw new Error('Clipboard is unavailable in this browser.');
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';
  textarea.style.top = '-9999px';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    const ok = document.execCommand('copy');
    if (!ok) throw new Error('Copy command was rejected.');
    return true;
  } finally {
    document.body.removeChild(textarea);
  }
}

// ---------------------------------------------------------------------------
// Campus-closed snapshot (ported from legacy Sidebar.js getCampusClosedSnapshot)
// ---------------------------------------------------------------------------

export interface CampusClosedSnapshot {
  message: string;
  countdown: string;
  opensLabel: string;
  isWeekend: boolean;
  isHoliday: boolean;
}

const CAMPUS_CLOSED_MESSAGES = [
  'Testudo is sleeping',
  'The classrooms are resting',
  'Campus is on standby',
  'Even Testudo needs a break',
  'The halls are quiet tonight',
  'McKeldin is dreaming of finals week',
  'Hornbake is whispering',
  'Stamp is lights out',
  'The mall is empty',
  'Lecture halls are in low power mode',
  'The whiteboards are blank',
  'Projectors are cooling down',
  'The quads are quiet',
  'The libraries are off duty',
  'Even the bells are taking a pause',
  'The campus is on airplane mode',
  'Silence on the sidewalks',
  'Terp time is napping',
  'The doors are locked for now',
];

/**
 * Returns a snapshot when campus is closed (weekend, before 7 AM / at or
 * after 10 PM, or a university holiday), including a countdown to the next
 * weekday 7 AM opening. Null when campus is open.
 */
export function getCampusClosedSnapshot(referenceDate: Date = new Date()): CampusClosedSnapshot | null {
  const now = referenceDate;
  const day = now.getDay();
  const hour = now.getHours() + now.getMinutes() / 60;
  const isHoliday = isUniversityHoliday(now);

  const isWeekend = day === 0 || day === 6;
  const isAfterHours = hour < 7 || hour >= 22;

  if (!isWeekend && !isAfterHours && !isHoliday) return null;

  // Next opening: next non-weekend, non-holiday day at 7 AM.
  const opensAt = new Date(now);
  opensAt.setHours(7, 0, 0, 0);
  if (now >= opensAt || isWeekend || isHoliday) {
    opensAt.setDate(opensAt.getDate() + 1);
  }
  while (opensAt.getDay() === 0 || opensAt.getDay() === 6 || isUniversityHoliday(opensAt)) {
    opensAt.setDate(opensAt.getDate() + 1);
  }

  const diffMs = opensAt.getTime() - now.getTime();
  const diffHours = Math.floor(diffMs / 3600000);
  const diffMins = Math.floor((diffMs % 3600000) / 60000);
  const countdown = diffHours > 0 ? `${diffHours}h ${diffMins}m` : `${diffMins}m`;

  const timeLabel = opensAt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  const opensLabel =
    diffMs > 24 * 3600000
      ? `${opensAt.toLocaleDateString('en-US', { weekday: 'long' })} at ${timeLabel}`
      : `at ${timeLabel}`;

  const msgIndex = Math.floor(now.getTime() / 3600000) % CAMPUS_CLOSED_MESSAGES.length;

  return {
    message: CAMPUS_CLOSED_MESSAGES[msgIndex],
    countdown,
    opensLabel,
    isWeekend,
    isHoliday,
  };
}

// ---------------------------------------------------------------------------
// Walk time (haversine via lib/geo.js; legacy speed: 80 m/min ≈ 4.8 km/h)
// ---------------------------------------------------------------------------

export function getWalkingMinutes(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
): number | null {
  if (!Number.isFinite(from.lat) || !Number.isFinite(from.lng)) return null;
  if (!Number.isFinite(to.lat) || !Number.isFinite(to.lng)) return null;
  const dist = haversineDistance(from.lng, from.lat, to.lng, to.lat);
  if (!Number.isFinite(dist)) return null;
  return Math.max(1, Math.round(dist / 80));
}
