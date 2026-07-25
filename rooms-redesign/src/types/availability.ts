export type RoomAvailabilityStatus =
  | 'Available'
  | 'Opening Soon'
  | 'Bookable Later'
  | 'Unavailable'
  | 'Closed'
  | 'Unknown';

export interface RoomTimeSlot {
  date: string;
  time_start: number | string;
  time_end: number | string;
  status: number | string;
  event_name?: string;
  additional_details?: string;
}

export interface SupplementalHoursConfig {
  type: 'always' | 'weekday-window' | 'weekly-windows';
  start?: number;
  end?: number;
  holidayClosed?: boolean;
  windows?: Record<number, Array<{ start: number; end: number }>>;
}

export interface SupplementalRoomConfig {
  hours?: SupplementalHoursConfig;
  calendar_id?: string;
  mode?: 'hours' | 'calendar';
}

export interface RoomData {
  id?: string;
  name?: string;
  code?: string;
  building_code?: string;
  source?: '25live' | 'libcal' | 'supplemental';
  availability_times?: RoomTimeSlot[];
  schedule?: RoomTimeSlot[];
  supplemental?: SupplementalRoomConfig;
  libcal?: Record<string, unknown>;
}

export interface BuildingAvailabilityResult {
  overallStatus: RoomAvailabilityStatus;
  totalRooms: number;
  availableRooms: number;
}
