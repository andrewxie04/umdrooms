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
  // Lot 16 = the Fraternity Row loop parking: a clean U (rotated left,
  // opening west) around the field — 98 north arm + 97 south arm, joined by a
  // custom arc band ON the ring road around the garden plaza (43-51m radius,
  // ~8m wide, centered on the Lot 16 marker). The OSM crescents (309/310)
  // swing ~90m out around the plaza and read as a mushroom — not used.
  // NOT 71 (NE strip), 306 (outer curve), 69 (SE triangle lot), 309/310.
  'Lot 16': {
    areaIndices: [98, 97],
    connectors: [
      [
        [-76.934906, 38.984423],
        [-76.934844, 38.984419],
        [-76.934783, 38.984409],
        [-76.934724, 38.984395],
        [-76.934666, 38.984377],
        [-76.934612, 38.984353],
        [-76.934561, 38.984325],
        [-76.934514, 38.984294],
        [-76.934472, 38.984258],
        [-76.934434, 38.984220],
        [-76.934402, 38.984179],
        [-76.934376, 38.984135],
        [-76.934356, 38.984089],
        [-76.934342, 38.984042],
        [-76.934334, 38.983994],
        [-76.934333, 38.983946],
        [-76.934339, 38.983898],
        [-76.934350, 38.983850],
        [-76.934369, 38.983804],
        [-76.934393, 38.983760],
        [-76.934423, 38.983718],
        [-76.934459, 38.983678],
        [-76.934500, 38.983642],
        [-76.934545, 38.983609],
        [-76.934595, 38.983580],
        [-76.934648, 38.983555],
        [-76.934704, 38.983534],
        [-76.934763, 38.983519],
        [-76.934824, 38.983508],
        [-76.934886, 38.983502],
        [-76.934910, 38.983573],
        [-76.934857, 38.983577],
        [-76.934806, 38.983585],
        [-76.934756, 38.983597],
        [-76.934707, 38.983613],
        [-76.934661, 38.983632],
        [-76.934619, 38.983656],
        [-76.934579, 38.983682],
        [-76.934543, 38.983712],
        [-76.934512, 38.983745],
        [-76.934485, 38.983779],
        [-76.934462, 38.983816],
        [-76.934445, 38.983855],
        [-76.934434, 38.983894],
        [-76.934427, 38.983935],
        [-76.934426, 38.983976],
        [-76.934431, 38.984016],
        [-76.934441, 38.984056],
        [-76.934456, 38.984095],
        [-76.934477, 38.984132],
        [-76.934502, 38.984168],
        [-76.934532, 38.984201],
        [-76.934567, 38.984232],
        [-76.934605, 38.984260],
        [-76.934647, 38.984284],
        [-76.934692, 38.984305],
        [-76.934739, 38.984323],
        [-76.934789, 38.984336],
        [-76.934840, 38.984345],
        [-76.934892, 38.984350]
      ],
    ],
  },
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
