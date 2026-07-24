// Architecture contract types — see plan.md "Architecture contract".
// All agents MUST code against these exact shapes.

export type ViewMode = 'now' | 'schedule' | 'all';
export type Status = 'available' | 'opening-soon' | 'unavailable' | 'unknown';
export type OverlayKind = 'classrooms' | 'library' | 'dining' | 'parking';

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
  rooms: RoomEntry[];    // may be [] until detail loads
  raw?: any;             // original record for detail views
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
  events?: any[];        // timeline blocks from availability.js
  raw?: any;             // raw room record (type, floor, capacity,
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
  meals?: any[];
  raw?: any;
}
export interface ParkingLot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  status: Status;
  statusText: string;
  raw?: any;
}
export interface MapFlyTarget {
  lat: number;
  lng: number;
  zoom?: number;
  pitch?: number;
}

// Convenience alias for the store's `selected` field (same shape as the
// contract's inline type).
export type CampusSelection = {
  kind: 'building' | 'room' | 'dining' | 'parking';
  id: string;
} | null;
