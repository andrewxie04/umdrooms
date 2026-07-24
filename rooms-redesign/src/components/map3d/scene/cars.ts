// src/components/map3d/scene/cars.ts
//
// Parked cars — deterministic, low-poly, vertex-colored, merged into ONE
// BufferGeometry consumed by geometry.ts (`parkedCars`) and rendered by
// scene.ts as a single MeshLambertMaterial({ vertexColors: true }) mesh.
//
// Placement: for every `parking` area polygon, stalls are laid out in loose
// rows aligned to the polygon's LONGEST bbox axis (stall rows perpendicular
// to it), jittered, point-in-polygon tested (center + all four car corners,
// so cars never hang over the lot edge), with a ~20% empty-spot chance so
// lots don't read 100% full. Count is proportional to polygon area (~1 car
// per 60 m², capped at 30/lot; tiny slivers are skipped). Parking polygons
// whose centroid falls inside a building footprint (e.g. the Mowatt Lane
// Garage rooftop deck) get NO cars — garages shouldn't sprout rooftop cars.
//
// Determinism: every choice rides hash01() of the polygon index + stall
// ordinal, so the layout is stable across reloads. Local frame: x = east,
// z = south, y = up; cars sit on the parking tier (y = 0.16 in geometry.ts)
// with their base at PARKED_CAR_BASE_Y.
//
// Also exports buildDrivingCarGeometry(): the small body+cabin merged
// geometry scene.ts uses as the InstancedMesh source for animated traffic.
// Body vertices are WHITE and the cabin is a fixed mid-gray, so the
// per-instance color (setColorAt) tints the body while the cabin always
// reads as darker glass.

import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { Projection } from './projection';
import type { CampusData } from './types';

// -- car dimensions (meters) ----------------------------------------------------
const CAR_LENGTH = 4.4;
const CAR_WIDTH = 1.8;
const BODY_HEIGHT = 0.9;
const CABIN_LENGTH = 2.3;
const CABIN_WIDTH = 1.6;
const CABIN_HEIGHT = 0.55;
/** Base of parked cars — just above the parking-area tier (y = 0.16). */
const PARKED_CAR_BASE_Y = 0.17;

// -- lot layout ------------------------------------------------------------------
/** One car per ~60 m² of parking polygon. */
const SQUARE_METERS_PER_CAR = 60;
/** Hard cap per lot (big lots still read as lots, not carpets). NOTE: this
 * cap — not the divisor — sets the count in every big lot (a 5,000 m² lot
 * blows past any sane per-area target), so the ~30% fleet reduction had to
 * lower it 50 -> 30 alongside the divisor change. */
const LOT_CAR_CAP = 30;
/** Polygons smaller than this (m²) are slivers — skip them. */
const LOT_MIN_AREA = 90;
/** Both bbox dimensions must exceed this (m) — median strips / slivers. */
const LOT_MIN_DIMENSION = 6;
/** Stall grid: stall pitch along the row, stall depth, drive aisle. */
const STALL_WIDTH = 2.7;
const STALL_DEPTH = 5.8;
const AISLE_WIDTH = 6.0;
const ROW_PERIOD = STALL_DEPTH + AISLE_WIDTH; // one stall row per period
/** Edge margin kept between the bbox and the first/last stall. */
const LOT_EDGE_MARGIN = 0.8;
/** Fraction of stalls left empty so lots don't look 100% full. */
const EMPTY_SPOT_CHANCE = 0.2;

// -- palette ---------------------------------------------------------------------
// Muted real-car colors weighted toward white/silver/charcoal/black, with
// occasional blue/red — plus an overrepresented UMD red for fun.
const CAR_COLORS: { hex: number; weight: number }[] = [
  { hex: 0xe8e8e6, weight: 0.24 }, // white
  { hex: 0xb9bcbf, weight: 0.2 }, // silver
  { hex: 0x3a3d40, weight: 0.16 }, // charcoal
  { hex: 0x17181a, weight: 0.12 }, // black
  { hex: 0x7d8185, weight: 0.08 }, // mid gray
  { hex: 0x2f4d7a, weight: 0.06 }, // muted blue
  { hex: 0x8e1f24, weight: 0.04 }, // dark red
  { hex: 0xe21833, weight: 0.1 }, // UMD red (overrepresented on purpose)
];
const GLASS_TINT = new THREE.Color(0x23272b); // cabins lerp toward this
const GLASS_MIX = 0.72;

/** Deterministic 32-bit hash -> [0, 1). FNV-1a + finalizer (same recipe as
 * geometry.ts so both files agree on the deterministic-aesthetic contract). */
function hash01(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 13;
  h = Math.imul(h, 0x5bd1e995);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

function pickCarColor(key: string): THREE.Color {
  const r = hash01(`${key}:col`);
  let acc = 0;
  let hex = CAR_COLORS[0].hex;
  for (const c of CAR_COLORS) {
    acc += c.weight;
    if (r < acc) {
      hex = c.hex;
      break;
    }
  }
  const color = new THREE.Color(hex);
  // Tiny per-car lightness variance so same-color neighbors still differ.
  color.offsetHSL(0, 0, (hash01(`${key}:lit`) - 0.5) * 0.03);
  return color;
}

/** Ray-cast point-in-polygon on [lng, lat] rings (coarse checks only). */
function pointInLngLatRing(lng: number, lat: number, ring: [number, number][]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > lat !== yj > lat && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/** Ray-cast point-in-polygon on world-space Vector2s (x = east, y holds world z). */
function pointInPolygon(x: number, z: number, pts: THREE.Vector2[]): boolean {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i];
    const b = pts[j];
    if (a.y > z !== b.y > z && x < ((b.x - a.x) * (z - a.y)) / (b.y - a.y) + a.x) {
      inside = !inside;
    }
  }
  return inside;
}

/** [lng, lat] ring -> world-space Vector2s (x = east, y = world z = south),
 * closure point removed. Winding is irrelevant for containment tests. */
function ringToWorldPoints(ring: [number, number][], proj: Projection): THREE.Vector2[] {
  const pts: THREE.Vector2[] = [];
  for (const [lng, lat] of ring) {
    const p = proj.toLocal(lng, lat);
    const last = pts[pts.length - 1];
    if (last && Math.abs(last.x - p.x) < 0.05 && Math.abs(last.y - p.z) < 0.05) continue;
    pts.push(new THREE.Vector2(p.x, p.z));
  }
  while (pts.length > 1) {
    const first = pts[0];
    const last = pts[pts.length - 1];
    if (Math.abs(first.x - last.x) < 0.05 && Math.abs(first.y - last.y) < 0.05) pts.pop();
    else break;
  }
  return pts;
}

function polygonArea(pts: THREE.Vector2[]): number {
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    s += a.x * b.y - b.x * a.y;
  }
  return Math.abs(s) / 2;
}

/** Sets a constant per-vertex color on a geometry (position/normal/color
 * layout, non-indexed, no uv) so parts merge cleanly. */
function withColor(geom: THREE.BufferGeometry, color: THREE.Color): THREE.BufferGeometry {
  const g = geom.index ? geom.toNonIndexed() : geom;
  g.deleteAttribute('uv');
  const count = g.getAttribute('position').count;
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    arr[i * 3] = color.r;
    arr[i * 3 + 1] = color.g;
    arr[i * 3 + 2] = color.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(arr, 3));
  return g;
}

/**
 * Low-poly car: body box (CAR_WIDTH x BODY_HEIGHT x CAR_LENGTH) + slightly
 * rearward cabin box, base at y = 0, forward = +z. Body and cabin get their
 * own flat colors (cabin lerped toward dark glass).
 */
function makeCarGeometry(bodyColor: THREE.Color): THREE.BufferGeometry {
  const glass = bodyColor.clone().lerp(GLASS_TINT, GLASS_MIX);
  const body = new THREE.BoxGeometry(CAR_WIDTH, BODY_HEIGHT, CAR_LENGTH);
  body.translate(0, BODY_HEIGHT / 2, 0);
  const cabin = new THREE.BoxGeometry(CABIN_WIDTH, CABIN_HEIGHT, CABIN_LENGTH);
  cabin.translate(0, BODY_HEIGHT + CABIN_HEIGHT / 2, -0.25);
  return mergeGeometries([withColor(body, bodyColor), withColor(cabin, glass)], false) ??
    new THREE.BufferGeometry();
}

export function buildParkedCars(data: CampusData, proj: Projection): THREE.BufferGeometry {
  const buildingRings = data.buildings
    .filter((b) => b.footprint && b.footprint.length >= 3)
    .map((b) => b.footprint);

  const parts: THREE.BufferGeometry[] = [];

  data.areas.forEach((area, ai) => {
    if (area.kind !== 'parking') return;
    if (!area.polygon || area.polygon.length < 3) return;
    const pts = ringToWorldPoints(area.polygon, proj);
    if (pts.length < 3) return;

    const m2 = polygonArea(pts);
    if (m2 < LOT_MIN_AREA) return;

    let minX = Infinity;
    let maxX = -Infinity;
    let minZ = Infinity;
    let maxZ = -Infinity;
    for (const p of pts) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minZ) minZ = p.y;
      if (p.y > maxZ) maxZ = p.y;
    }
    const spanX = maxX - minX;
    const spanZ = maxZ - minZ;
    if (Math.min(spanX, spanZ) < LOT_MIN_DIMENSION) return; // median strip / sliver

    // Garage guard: a parking polygon whose centroid sits inside a building
    // footprint is a rooftop deck / garage footprint — no cars up there.
    let cLng = 0;
    let cLat = 0;
    for (const [lng, lat] of area.polygon) {
      cLng += lng;
      cLat += lat;
    }
    cLng /= area.polygon.length;
    cLat /= area.polygon.length;
    for (const ring of buildingRings) {
      if (pointInLngLatRing(cLng, cLat, ring)) return;
    }

    const target = Math.min(LOT_CAR_CAP, Math.max(1, Math.round(m2 / SQUARE_METERS_PER_CAR)));

    // Stall rows aligned to the polygon's LONGEST bbox axis: stalls run along
    // that axis (u), cars face the perpendicular (v), one row per period.
    const longX = spanX >= spanZ;
    const minU = longX ? minX : minZ;
    const maxU = longX ? maxX : maxZ;
    const minV = longX ? minZ : minX;
    const maxV = longX ? maxZ : maxX;
    const halfL = CAR_LENGTH / 2;
    const halfW = CAR_WIDTH / 2;

    interface Candidate {
      x: number;
      z: number;
      heading: number; // rotation.y, car forward = +z
      key: string;
      h: number; // deterministic order key for the over-target spread
    }
    const candidates: Candidate[] = [];
    let row = 0;
    for (
      let vRow = minV + LOT_EDGE_MARGIN + STALL_DEPTH / 2;
      vRow + STALL_DEPTH / 2 <= maxV - LOT_EDGE_MARGIN;
      vRow += ROW_PERIOD, row++
    ) {
      const facing = row % 2 === 0 ? 1 : -1; // alternate stall orientation
      let col = 0;
      for (
        let u = minU + LOT_EDGE_MARGIN + STALL_WIDTH / 2;
        u + STALL_WIDTH / 2 <= maxU - LOT_EDGE_MARGIN;
        u += STALL_WIDTH, col++
      ) {
        const key = `car:${ai}:${row}:${col}`;
        if (hash01(`${key}:empty`) < EMPTY_SPOT_CHANCE) continue; // vacant spot
        const uu = u + (hash01(`${key}:ju`) - 0.5) * 0.5; // ±0.25m along the row
        const vv = vRow + (hash01(`${key}:jv`) - 0.5) * 0.5; // ±0.25m in the stall
        const x = longX ? uu : vv;
        const z = longX ? vv : uu;
        // Heading: car forward points along ±v (perpendicular to the row).
        const fx = longX ? 0 : facing;
        const fz = longX ? facing : 0;
        const heading = Math.atan2(fx, fz);
        // Full-car containment: center + all four corners inside the polygon.
        const cosH = Math.cos(heading);
        const sinH = Math.sin(heading);
        let inside = pointInPolygon(x, z, pts);
        for (let cxi = -1; cxi <= 1 && inside; cxi += 2) {
          for (let czi = -1; czi <= 1 && inside; czi += 2) {
            // car-local (±halfW, ±halfL) rotated by heading into world
            const wx = x + cxi * halfW * cosH + czi * halfL * sinH;
            const wz = z - cxi * halfW * sinH + czi * halfL * cosH;
            inside = pointInPolygon(wx, wz, pts);
          }
        }
        if (!inside) continue;
        candidates.push({ x, z, heading, key, h: hash01(`${key}:ord`) });
      }
    }

    // Over target -> deterministic spread across the lot (hash order).
    candidates.sort((a, b) => a.h - b.h);
    if (candidates.length > target) candidates.length = target;

    for (const c of candidates) {
      const geom = makeCarGeometry(pickCarColor(c.key));
      geom.rotateY(c.heading + (hash01(`${c.key}:rot`) - 0.5) * 0.06); // tiny angle jitter
      geom.translate(c.x, PARKED_CAR_BASE_Y, c.z);
      parts.push(geom);
    }
  });

  if (parts.length === 0) return new THREE.BufferGeometry();
  return mergeGeometries(parts, false) ?? new THREE.BufferGeometry();
}

/**
 * Instance-source geometry for the animated driving cars (scene.ts): same
 * low-poly body + cabin, base at y = 0, forward = +z. Body vertices are
 * WHITE so InstancedMesh per-instance color tints them; cabin vertices are
 * a fixed mid-gray so the "glass" always multiplies darker than the body.
 */
export function buildDrivingCarGeometry(): THREE.BufferGeometry {
  return makeCarGeometry(new THREE.Color(0xffffff));
}
