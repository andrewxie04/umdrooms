import { toZonedTime } from 'date-fns-tz';

const PARKING_TIME_ZONE = 'America/New_York';
const PARKING_DISPLAY_OFFSETS = {
  'Lot U2': { lat: -0.00010, lng: -0.00035 },
  'Mowatt Lane Garage': { lat: 0.00010, lng: 0.00035 },
  'Regents Drive Garage (Unrestricted Levels)': { lat: 0.00010, lng: -0.00030 },
  'Regents Drive Garage': { lat: -0.00010, lng: 0.00030 },
};

export const PARKING_RULES = {
  global_rules: {
    timezone: PARKING_TIME_ZONE,
    weekend_unrestricted: true,
    weekend_start: { day: 5, time: '16:00' },
    weekend_end: { day: 1, time: '07:00' },
  },
  free_lots: {
    'Lot 1': {
      lat: 38.986145,
      lng: -76.950234,
      description: 'West of Cole Field House / Ludwig Field (Lot 1 area)',
      free_hours: { weekdays: { start: '16:00', end: '07:00' }, weekends: 'All Day' },
    },
    'Lot Z': {
      lat: 38.988132,
      lng: -76.94932,
      description: 'West campus between Cole Field House and Jones-Hill House',
      free_hours: { weekdays: { start: '16:00', end: '07:00' }, weekends: 'All Day' },
    },
    'Lot U1': {
      lat: 38.982518,
      lng: -76.943732,
      description: 'South campus near South Campus Commons / Mowatt Lane',
      free_hours: { weekdays: { start: '16:00', end: '07:00' }, weekends: 'All Day' },
    },
    'Lot U2': {
      lat: 38.981821,
      lng: -76.945551,
      description: 'Mowatt Lane Garage U2 area',
      free_hours: { weekdays: { start: '16:00', end: '07:00' }, weekends: 'All Day' },
    },
    'Terrapin Trail Garage': {
      lat: 38.994998,
      lng: -76.943362,
      description: 'North campus near Xfinity Center. Warning: Often restricted during basketball/sports games.',
      free_hours: { weekdays: { start: '16:00', end: '07:00' }, weekends: 'All Day' },
    },
    'Regents Drive Garage (Unrestricted Levels)': {
      lat: 38.989729,
      lng: -76.94146,
      description: 'Central campus, unrestricted levels only (check signs)',
      free_hours: { weekdays: { start: '16:00', end: '07:00' }, weekends: 'All Day' },
    },
    'Lot 9': {
      lat: 38.994263,
      lng: -76.939216,
      description: 'North campus near the engineering buildings',
      free_hours: { weekdays: { start: '16:00', end: '07:00' }, weekends: 'All Day' },
    },
    'Lot 11': {
      lat: 38.993773,
      lng: -76.936247,
      description: 'North campus near the View/Varsity',
      free_hours: { weekdays: { start: '16:00', end: '07:00' }, weekends: 'All Day' },
    },
    'Lot 16': {
      lat: 38.983962,
      lng: -76.934927,
      description: 'East campus near Fraternity Row (Lot 16 area)',
      free_hours: { weekdays: { start: '16:00', end: '07:00' }, weekends: 'All Day' },
    },
  },
  paid_visitor_garages: {
    'Mowatt Lane Garage': {
      lat: 38.981826,
      lng: -76.945571,
      description: 'South campus near Van Munching Hall',
      status: 'Paid 24/7 · Specific permits only',
    },
    'Union Lane Garage': {
      lat: 38.98841,
      lng: -76.945847,
      description: 'Central campus next to Stamp Student Union',
      status: 'Paid 24/7 · Specific permits only',
    },
    'Regents Drive Garage': {
      lat: 38.989729,
      lng: -76.94146,
      description: 'Central campus, ground levels',
      status: 'Paid 24/7 · Specific permits only',
    },
  },
};

function parseTimeToMinutes(timeString) {
  const [hours, minutes] = String(timeString).split(':').map(Number);
  return hours * 60 + minutes;
}

function formatParkingTime(timeString) {
  const [hours, minutes] = String(timeString).split(':').map(Number);
  const suffix = hours >= 12 ? 'PM' : 'AM';
  const normalizedHour = hours % 12 || 12;
  if (minutes === 0) return `${normalizedHour} ${suffix}`;
  return `${normalizedHour}:${String(minutes).padStart(2, '0')} ${suffix}`;
}

function isWithinWeekendWindow(date) {
  if (!PARKING_RULES.global_rules.weekend_unrestricted) return false;

  const day = date.getDay();
  const minutes = date.getHours() * 60 + date.getMinutes();
  const weekendStartMinutes = parseTimeToMinutes(PARKING_RULES.global_rules.weekend_start.time);
  const weekendEndMinutes = parseTimeToMinutes(PARKING_RULES.global_rules.weekend_end.time);

  if (day === PARKING_RULES.global_rules.weekend_start.day && minutes >= weekendStartMinutes) {
    return true;
  }

  if (day === 6 || day === 0) {
    return true;
  }

  if (day === PARKING_RULES.global_rules.weekend_end.day && minutes < weekendEndMinutes) {
    return true;
  }

  return false;
}

function isWithinOvernightRange(minutes, startMinutes, endMinutes) {
  if (startMinutes <= endMinutes) {
    return minutes >= startMinutes && minutes < endMinutes;
  }
  return minutes >= startMinutes || minutes < endMinutes;
}

/**
 * Curated map for the 3D parking-lot selection highlight (scene.ts
 * setHighlightParking). Garages reuse their real building footprints from
 * campus-data.json (building ids verified against data.buildings); surface
 * lots reference indices into campus-data.json areas[] (kind 'parking'),
 * verified by proximity to each lot's raw coords in PARKING_RULES.
 */
export const PARKING_HIGHLIGHT_TARGETS = {
  // Garages -> building footprint shells.
  'Mowatt Lane Garage': { buildingId: 'way/23579407' },
  'Union Lane Garage': { buildingId: 'way/23502756' },
  'Terrapin Trail Garage': { buildingId: 'way/23502762' },
  'Regents Drive Garage': { buildingId: 'way/23544624' },
  'Regents Drive Garage (Unrestricted Levels)': { buildingId: 'way/23544624' },
  // Surface lots -> flat red plates over the parking polygon(s).
  'Lot 1': { areaIndices: [259] },
  'Lot Z': { areaIndices: [199] },
  'Lot U1': { areaIndices: [20, 64] },
  'Lot U2': { areaIndices: [210, 413] },
  'Lot 9': { areaIndices: [7] },
  'Lot 11': { areaIndices: [9] },
  // Lot 16 is the parking lining the Fraternity Row loop road, fragmented in
  // OSM. The long arms are the west aisle strips (97/98) and the east winding
  // polygons (309/306); 310 + 69 close the south/SE bend and 71 the north
  // corner, so the highlight reads as the full U loop rather than two bars.
  'Lot 16': { areaIndices: [309, 306, 310, 97, 98] },
};

export function getParkingReferenceDate(viewMode, selectedStartDateTime) {
  return viewMode === 'now' ? new Date() : selectedStartDateTime;
}

export function getParkingStatus(lot, referenceDate = new Date()) {
  const zonedDate = toZonedTime(referenceDate, PARKING_TIME_ZONE);

  if (lot.kind === 'paid') {
    return 'Visitor';
  }

  if (isWithinWeekendWindow(zonedDate)) {
    return 'Free';
  }

  const minutes = zonedDate.getHours() * 60 + zonedDate.getMinutes();
  const weekdays = lot.free_hours?.weekdays;
  if (!weekdays) return 'Restricted';

  const startMinutes = parseTimeToMinutes(weekdays.start);
  const endMinutes = parseTimeToMinutes(weekdays.end);
  return isWithinOvernightRange(minutes, startMinutes, endMinutes) ? 'Free' : 'Restricted';
}

export function getParkingStatusLabel(status) {
  if (status === 'Free') return 'free now';
  if (status === 'Visitor') return 'visitor paid';
  return 'permit required';
}

function getParkingRuleSummary(lot, kind) {
  if (kind === 'paid') {
    return lot.status;
  }

  const weekdays = lot.free_hours?.weekdays;
  if (!weekdays) return 'Check posted parking signage';

  return `Free weekdays ${formatParkingTime(weekdays.start)}–${formatParkingTime(weekdays.end)} · Free all day on weekends`;
}

export function getParkingFeatures(referenceDate = new Date()) {
  const freeLots = Object.entries(PARKING_RULES.free_lots).map(([name, lot]) => {
    const offset = PARKING_DISPLAY_OFFSETS[name] || { lat: 0, lng: 0 };
    return ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [lot.lng + offset.lng, lot.lat + offset.lat],
    },
    properties: {
      name,
      description: lot.description,
      status: getParkingStatus({ ...lot, kind: 'free' }, referenceDate),
      kind: 'free',
      detail: getParkingRuleSummary(lot, 'free'),
      trueLongitude: lot.lng,
      trueLatitude: lot.lat,
    },
  })});

  const visitorGarages = Object.entries(PARKING_RULES.paid_visitor_garages).map(([name, lot]) => {
    const offset = PARKING_DISPLAY_OFFSETS[name] || { lat: 0, lng: 0 };
    return ({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [lot.lng + offset.lng, lot.lat + offset.lat],
    },
    properties: {
      name,
      description: lot.description,
      status: getParkingStatus({ ...lot, kind: 'paid' }, referenceDate),
      kind: 'paid',
      detail: getParkingRuleSummary(lot, 'paid'),
      trueLongitude: lot.lng,
      trueLatitude: lot.lat,
    },
  })});

  return [...freeLots, ...visitorGarages];
}
