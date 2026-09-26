// Architecture contract types — see plan.md "Architecture contract".
// All agents MUST code against these exact shapes.

export type ViewMode = 'now' | 'schedule' | 'all';
export type Status = 'available' | 'opening-soon' | 'unavailable' | 'unknown';
export type OverlayKind = 'classrooms' | 'library' | 'dining' | 'parking';

/** Fields retained from the classroom and LibCal feeds for room details. */
export interface CampusTimeBlock {
  date?: string;
  time_start?: string;
  time_end?: string;
  status?: number;
  event_name?: string;
  [key: string]: unknown;
}

export interface CampusRoomRecord {
  id?: string | number;
  name?: string;
  source?: string;
  type?: string;
  floor?: string | number;
  capacity?: string | number;
  has_projector?: boolean;
  has_whiteboard?: boolean;
  has_computers?: boolean;
  availability_times?: CampusTimeBlock[];
  source_url?: string;
  source_label?: string;
  source_secondary_url?: string;
  source_secondary_label?: string;
  access_note?: string;
  details_note?: string;
  libcal?: { available_blocks?: CampusTimeBlock[]; [key: string]: unknown };
  supplemental?: {
    mode?: string;
    hours?: {
      type?: string;
      start?: number;
      end?: number;
      windows?: Record<number, { start: number; end: number }[]>;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

export interface CampusBuildingRecord {
  name: string;
  code?: string;
  latitude?: number;
  longitude?: number;
  libcalBuilding?: boolean;
  classrooms?: CampusRoomRecord[];
  [key: string]: unknown;
}

export interface BuildingEntry {
  id: string;            // building code, e.g. 'IRB'
  name: string;
  code: string;
  lat: number;
  lng: number;
  kind: 'classroom' | 'library';
  totalRooms: number;
  availableRooms: number;
  status: Status;
  /** One or more room feeds have not loaded, so availability may be incomplete. */
  dataIssue?: 'loading' | 'error';
  dataIssueSource?: 'classrooms' | 'library' | 'both';
  rooms: RoomEntry[];    // may be [] until detail loads
  raw?: CampusBuildingRecord; // original record for detail views
}
export interface RoomEntry {
  id: string;
  name: string;
  buildingCode: string;
  status: Status;
  /** Engine display status from availability.js getRoomRenderState(). Richer
   *  than the 4-value Status union: may also be 'Closed' (after hours /
   *  weekend / holiday) or 'Bookable Later' (LibCal room free later today).
   *  The Status union stays authoritative for map markers; list UI prefers
   *  this label when present. */
  displayStatus?: string | null;
  /** Formatted 'h:mm a' time the current availability ends (Now mode,
   *  available rooms only), from availability.js getRoomRenderState(). */
  availableUntil?: string | null;
  events?: CampusTimeBlock[]; // timeline blocks from availability.js
  raw?: CampusRoomRecord; // raw room record (type, floor, capacity,
                         // has_projector/has_whiteboard, availability_times,
                         // plus supplemental-source fields: source, source_url,
                         // source_label, source_secondary_url/label,
                         // access_note, details_note, supplemental.hours)
}
export interface DiningHall {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: Status;
  statusText: string;
  meals?: Record<string, unknown>[];
  raw?: { dateKey?: string; kind?: string; [key: string]: unknown };
}
export interface ParkingLot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: Status;
  statusText: string;
  raw?: { status?: string; description?: string; [key: string]: unknown };
}
export interface MapFlyTarget {
  lat: number;
  lng: number;
  zoom?: number;
  pitch?: number;
  screenX?: number;
  screenY?: number;
}

/** Browsed library date retained for the currently selected room across layout remounts. */
export interface LibraryBrowseDate {
  /** Canonical room selection ID (CODE/ROOMID), matching selected.id. */
  selectionId: string;
  dateKey: string; // yyyy-MM-dd
}

// Convenience alias for the store's `selected` field (same shape as the
// contract's inline type).
export type CampusSelection = {
  kind: 'building' | 'room' | 'dining' | 'parking' | 'residence' | 'map-building';
  id: string;
} | null;
