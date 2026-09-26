// src/components/map3d/scene/geometry.ts
//
// Builds the static campus geometry from campus-data.json. Everything is
// merged per category (ground / buildings / roads / areas / water+waterways /
// trees / contact shadows / lamp poles / lamp heads / shrubs) so the whole
// campus renders in ~10 draw calls. Local frame:
// x = east, z = south, y = up, ground at y = 0 (see projection.ts).
//
// Vertical stacking uses decimeter steps (grass .10 < sport .12 < water stack
// .136–.154 < parking .16 < contact shadows .18 < path .2 < service .3 <
// road .4): visually identical to the contract's centimeter steps but robust
// against depth-buffer precision at 4km viewing distances. Water/fountain/
// pool polygons live in their OWN merged mesh (see buildWater) so scene.ts
// can give them a dedicated glint material.

import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  bboxOf,
  centroidOf,
  extrudeFootprint,
  extrudeWithHoles,
  hash01,
  mergeAll,
  outsetRing,
  ringToShapePoints,
  scaleAbout,
  withColor,
} from './geom-utils';
import {
  LANDMARK_MODULES,
  landmarkPresetParts,
  makeLandmarkCtx,
} from './landmarks';
import { buildParkedCars } from './cars';
import type { Projection } from './projection';
import type { AreaKind, CampusBuilding, CampusData, RoadKind } from './types';

export interface CampusGeometries {
  ground: THREE.BufferGeometry;
  buildings: THREE.BufferGeometry;
  roads: THREE.BufferGeometry;
  areas: THREE.BufferGeometry;
  trees: THREE.BufferGeometry;
  /** Merged fake-AO blobs under every building; flat at CONTACT_SHADOW_Y. */
  contactShadows: THREE.BufferGeometry;
  /** Merged lamp poles (thin dark cylinders), bases at y = 0. Plain material. */
  lampPoles: THREE.BufferGeometry;
  /** Merged lamp head spheres at ~5.6m — scene.ts drives the warm glow. */
  lampHeads: THREE.BufferGeometry;
  /** Merged ground-glow discs under every lamp (flat circles at LAMP_POOL_Y);
   * scene.ts maps a radial-gradient texture onto them and drives opacity. */
  lampGlow: THREE.BufferGeometry;
  /** The few stuttering lamps, kept OUT of lampHeads/lampGlow so scene.ts can
   * give each its own material and flicker them independently — the shared
   * material would otherwise blink every lamp on campus in lockstep. Index i
   * of each array is the same lamp. */
  lampFlickerHeads: THREE.BufferGeometry[];
  lampFlickerGlow: THREE.BufferGeometry[];
  /** Parallel to the two arrays: true = stutters only in the 2AM window. */
  lampFlickerLate: boolean[];
  /** Merged lit-window facade quads (deterministic lit subset only, positions
   * only — no normals/uv/color); scene.ts drives the warm glow opacity. */
  windows: THREE.BufferGeometry;
  /** Daylight glazing on named campus buildings; merged into one draw call. */
  dayWindows: THREE.BufferGeometry;
  /** Merged water/fountain/pool polygons + waterway ribbons, pulled out of
   * the flat areas mesh so scene.ts can use a dedicated MeshPhongMaterial
   * (soft sun/moon glint). Baked vertex colors: teal shore -> deep-blue
   * middle gradient stack + a darker shore-outline ring. */
  water: THREE.BufferGeometry;
  /** Merged squashed-icosahedron shrubs, vertex-colored muted greens. */
  shrubs: THREE.BufferGeometry;
  /** Lying snow: blobby discs scattered inside grass/sport polygons. Flat,
   * position+normal only; seasons.ts drives the white material's opacity. */
  snowPatches: THREE.BufferGeometry;
  /** Merged low-poly parked cars in the parking lots (see cars.ts) —
   * vertex-colored body+cabin boxes; one mesh in scene.ts, castShadow. */
  parkedCars: THREE.BufferGeometry;
}

const GROUND_SIZE = 9000; // meters, centered on campus — far beyond bbox
const AREA_Y: Record<AreaKind, number> = {
  grass: 0.1,
  sport: 0.12,
  water: 0.14,
  fountain: 0.14,
  pool: 0.14,
  parking: 0.16,
};
const WATERWAY_Y = 0.15; // top of the water stack (.134–.149), below parking (.16)
const CONTACT_SHADOW_Y = 0.18; // above parking (.16), below paths (.20)
const ROAD_Y: Record<RoadKind, number> = { path: 0.2, service: 0.3, road: 0.4 };
const MIN_ROAD_WIDTH = 2.4; // meters — keeps paths legible from 2km out
const MIN_WATERWAY_WIDTH = 2; // meters — legibility floor for ditches/drains

// Phase 3 de-beige pass: clearly separated hues, still warm + low saturation.
export const COLORS = {
  building: new THREE.Color(0xf8f4ea), // bright warm off-white (per-building hue+lightness jitter)
  road: new THREE.Color(0x9d9c96), // cooler grays, less tan
  service: new THREE.Color(0xb1b0a8),
  path: new THREE.Color(0xbdbcb5), // concrete walks; quieter against the lawns
  grass: new THREE.Color(0x79ad6b), // Maryland lawn green
  water: new THREE.Color(0x7ea9c8), // clear sky blue
  fountain: new THREE.Color(0x7ea9c8), // same blue as open water
  pool: new THREE.Color(0x7ea9c8), // same blue as open water
  parking: new THREE.Color(0x84837b), // neutral dark gray
  sport: new THREE.Color(0x689553), // deeper green than grass
  tree: new THREE.Color(0x567b4f),
  treeTop: new THREE.Color(0x78a567),
};

// NOTE: hash01, signedArea, ringToShapePoints, withColor, mergeAll,
// extrudeFootprint, centroidOf, scaleAbout, bboxOf, and outsetRing now live
// in ./geom-utils (moved verbatim, imported above) so the landmark builder
// modules under ./landmarks/ can share them without an import cycle.

// ---------------------------------------------------------------------------
// Buildings — extruded footprints, hash(id) height jitter ±12%, tint jitter.
// Buildings whose id is in LANDMARK_MODULES skip the jitter and get
// hand-tuned procedural detail instead (see the Landmarks section below).
// ---------------------------------------------------------------------------

function buildingTint(b: CampusBuilding): THREE.Color {
  const name = (b.name ?? '').toLowerCase();
  // Apply campus materials by known building families. A title like
  // "Engineering" or "Library" says nothing reliable about its facade:
  // McKeldin, Hornbake and many engineering halls are red brick.
  const garage = /parking garage|garage|utility|scub|maintenance|hvac/.test(name);
  const venue = /stadium|arena|fieldhouse|recreation|sports|xfinity/.test(name);
  const modern = /iribe|physical sciences|idea factory|thurgood marshall|hotel|clarice smith|jeong h\. kim/.test(name);
  const brick = [0x9a6554, 0xa46b57, 0x98604d, 0xa8735e];
  const c = !b.name ? COLORS.building.clone()
    : new THREE.Color(garage ? 0xb9b8b0 : venue ? 0xc6bcae : modern ? 0xb4bdbb
      : brick[Math.floor(hash01(`${b.id}:masonry`) * brick.length)]);
  c.offsetHSL(
    (hash01(`${b.id}:hh`) - 0.5) * 0.012,
    (hash01(`${b.id}:ss`) - 0.5) * 0.03,
    (hash01(`${b.id}:ll`) - 0.5) * 0.035,
  );
  return c;
}

function colorizeBuilding(geom: THREE.BufferGeometry, facade: THREE.Color, b: CampusBuilding): THREE.BufferGeometry {
  const result = withColor(geom, facade);
  const normals = result.getAttribute('normal');
  const colors = result.getAttribute('color');
  const name = (b.name ?? '').toLowerCase();
  const modern = /iribe|physical sciences|idea factory|thurgood marshall|hotel|clarice smith|jeong h\. kim/.test(name);
  const garage = /parking garage|garage|utility|scub|maintenance|hvac/.test(name);
  // The aerial shows membrane roofs in several *material* families: pale
  // reflective roofs on larger halls, slate-gray academic roofs, and darker
  // mechanical/garage roofs. Keep the choice stable per building.
  const roofFamily = hash01(`${b.id}:roof-style`);
  const roof = new THREE.Color(garage ? 0x737c7e
    : modern ? (roofFamily < 0.5 ? 0xc4c5bf : 0x818d90)
      : b.name ? (roofFamily < 0.25 ? 0xd0d0c7 : roofFamily < 0.7 ? 0x969d9d : 0x686f72)
        : 0xb5b3aa);
  roof.offsetHSL(0, 0, (hash01(`${b.id}:roof`) - 0.5) * 0.025);
  // Extruded caps already have separate vertices from the walls. Recoloring
  // upward faces gives every footprint a legible roof without extra meshes.
  for (let i = 0; i < normals.count; i++) {
    if (normals.getY(i) > 0.75) colors.setXYZ(i, roof.r, roof.g, roof.b);
  }
  return result;
}

function brickCornice(pts: THREE.Vector2[], height: number): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const y0 = height - 0.8;
  const y1 = height - 0.38;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy);
    if (len < 1.5) continue;
    const nx = dy / len;
    const nz = dx / len;
    const ax = a.x + nx * 0.09;
    const az = -a.y + nz * 0.09;
    const bx = b.x + nx * 0.09;
    const bz = -b.y + nz * 0.09;
    positions.push(ax, y0, az, bx, y0, bz, bx, y1, bz,
      ax, y0, az, bx, y1, bz, ax, y1, az);
    for (let k = 0; k < 6; k++) normals.push(nx, 0, nz);
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  return withColor(geom, new THREE.Color(0xe5d9bf));
}

const TRIMMED_HISTORIC_BUILDINGS = new Set([
  'way/23502752', // Woods Hall
  'way/23544831', // Marie Mount Hall
  'way/23544871', // Francis Scott Key Hall
  'way/23546167', // Tydings Hall
  'way/23579209', // Skinner Building
  'way/23579330', // Shoemaker Building
  'way/23937007', // Symons Hall
  'way/24306090', // Morrill Hall
  'way/23546179', // Chincoteague Hall
  'way/23891414', // Queen Anne's Hall
  'way/23891435', // Somerset Hall
  'way/23579434', // Caroline Hall
  'way/23546215', // Worcester Hall
]);

/** Shallow projected courses give the flat OSM wall extrusions a readable
 * plinth, floor scale and roof edge. The strips share the buildings' one
 * vertex-colored mesh; no additional draw calls or material slots are used. */
function facadeCourses(pts: THREE.Vector2[], height: number, b: CampusBuilding): THREE.BufferGeometry {
  const name = (b.name ?? '').toLowerCase();
  const historic = TRIMMED_HISTORIC_BUILDINGS.has(b.id);
  const modern = /iribe|physical sciences|idea factory|thurgood marshall|hotel|clarice smith|jeong h\. kim|engineering|science|technology/.test(name);
  const garage = /parking garage|garage/.test(name);
  const pos: number[] = [];
  const norm: number[] = [];
  const cols: number[] = [];
  const plinth = new THREE.Color(garage ? 0x8c8982 : modern ? 0x8f9897 : 0x8d7669);
  const eave = new THREE.Color(garage ? 0xa9aaa5 : modern ? 0x9fa9a8 : historic ? 0xe2d9c8 : 0x926f60);
  const belt = new THREE.Color(modern ? 0x879391 : historic ? 0xd2c4ae : 0xa37361);
  const roofLip = new THREE.Color(modern ? 0x969f9c : historic ? 0xc9c5b7 : 0x898d88);
  const add = (a: THREE.Vector2, c: THREE.Vector2, y0: number, y1: number, off: number, color: THREE.Color) => {
    const dx = c.x - a.x;
    const dy = c.y - a.y;
    const len = Math.hypot(dx, dy);
    if (len < 2.5) return;
    // CCW shape-space ring: right side is the exterior. World z is -north.
    const nx = dy / len;
    const nz = dx / len;
    const ax = a.x + nx * off;
    const az = -a.y + nz * off;
    const bx = c.x + nx * off;
    const bz = -c.y + nz * off;
    pos.push(ax, y0, az, bx, y0, bz, bx, y1, bz,
      ax, y0, az, bx, y1, bz, ax, y1, az);
    for (let j = 0; j < 6; j++) {
      norm.push(nx, 0, nz);
      cols.push(color.r, color.g, color.b);
    }
  };
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const c = pts[(i + 1) % pts.length];
    const dx = c.x - a.x;
    const dy = c.y - a.y;
    const len = Math.hypot(dx, dy);
    if (len < 2.5) continue;
    const nx = dy / len;
    const nz = dx / len;
    add(a, c, 0.34, Math.min(0.96, height * 0.14), 0.045, plinth);
    // Historic buildings already have a projecting pale cornice.
    if (!historic) add(a, c, height - 0.42, height - 0.07, 0.11, eave);
    if (historic && height > 9) add(a, c, 3.65, 3.82, 0.07, belt);
    if (height > 10) {
      for (let y = 3.55; y < height - 1.4; y += 3.45) {
        add(a, c, y, y + (modern || garage ? 0.16 : 0.11), 0.075, belt);
      }
    }
    // A vertical parapet reads as roof depth from an oblique camera. The old
    // 2.5cm horizontal lip nearly shared the roof's depth plane and its strips
    // overlapped at corners. This wall is separated in both height and plan.
    const y0 = height + 0.04;
    const y1 = height + (garage ? 0.48 : 0.36);
    const ax = a.x + nx * 0.13;
    const az = -a.y + nz * 0.13;
    const bx = c.x + nx * 0.13;
    const bz = -c.y + nz * 0.13;
    pos.push(ax, y0, az, bx, y0, bz, bx, y1, bz,
      ax, y0, az, bx, y1, bz, ax, y1, az);
    for (let j = 0; j < 6; j++) {
      norm.push(nx, 0, nz);
      cols.push(roofLip.r, roofLip.g, roofLip.b);
    }
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geom.setAttribute('normal', new THREE.Float32BufferAttribute(norm, 3));
  geom.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  return geom;
}

/** Keep every raised part clear of roof edges and courtyard voids. Sampling
 * across the rectangle also catches narrow concave wings where corners alone
 * can be inside the outline while the middle crosses open air. */
function roofRectFits(
  x: number, y: number, w: number, d: number,
  pts: THREE.Vector2[], holes: THREE.Vector2[][],
): boolean {
  for (let ix = -2; ix <= 2; ix++) for (let iy = -2; iy <= 2; iy++) {
    const px = x + ix * (w / 4 + 0.2);
    const py = y + iy * (d / 4 + 0.2);
    if (!pointInShapeRing(px, py, pts) || holes.some((hole) => pointInShapeRing(px, py, hole))) return false;
  }
  return true;
}

/** The campus aerial has small clusters of low mechanical housings, raised
 * access boxes and skylights on flat roofs. These are actual volumes, never
 * coplanar decals, with deterministic positions for stable rerenders. */
function rooftopEquipment(
  pts: THREE.Vector2[], holes: THREE.Vector2[][], height: number, b: CampusBuilding,
): THREE.BufferGeometry | null {
  if (!b.name || height < 8) return null;
  const bb = bboxOf(pts);
  const roofW = bb.maxX - bb.minX;
  const roofD = bb.maxY - bb.minY;
  if (roofW < 9 || roofD < 9) return null;
  const { cx, cy } = centroidOf(pts);
  const garage = /parking garage|garage/.test(b.name.toLowerCase());
  const parts: THREE.BufferGeometry[] = [];
  const placed: { x: number; y: number; w: number; d: number }[] = [];
  const box = (x: number, y: number, w: number, d: number, bottom: number, top: number, color: number) => {
    const g = new THREE.BoxGeometry(w, top - bottom, d);
    g.translate(x, (bottom + top) / 2, -y);
    parts.push(withColor(g, new THREE.Color(color)));
  };
  const candidates = [
    [cx, cy],
    [cx - roofW * 0.24, cy + roofD * 0.22],
    [cx + roofW * 0.24, cy - roofD * 0.22],
    [cx + roofW * 0.24, cy + roofD * 0.22],
    [cx - roofW * 0.24, cy - roofD * 0.22],
    [cx, cy + roofD * 0.3],
    [cx, cy - roofD * 0.3],
  ];
  const count = roofW * roofD > 1200 ? 3 : roofW * roofD > 350 ? 2 : 1;
  for (let i = 0; i < candidates.length && placed.length < count; i++) {
    const [x, y] = candidates[i];
    const kind = garage ? 'vent' : i === 0 && roofW * roofD > 500 && hash01(`${b.id}:penthouse`) < 0.55
      ? 'access' : hash01(`${b.id}:unit:${i}`) < 0.28 ? 'skylight' : 'vent';
    const w = Math.min(kind === 'access' ? 5.8 : kind === 'skylight' ? 3.4 : 3.2, roofW * 0.15);
    const d = Math.min(kind === 'access' ? 4.8 : kind === 'skylight' ? 2.4 : 2.8, roofD * 0.15);
    if (!roofRectFits(x, y, w, d, pts, holes)) continue;
    if (placed.some((p) => Math.abs(p.x - x) < (p.w + w) / 2 + 1.2 && Math.abs(p.y - y) < (p.d + d) / 2 + 1.2)) continue;
    placed.push({ x, y, w, d });
    if (kind === 'access') {
      box(x, y, w + 0.22, d + 0.22, height + 0.025, height + 0.12, 0x686f70);
      box(x, y, w, d, height + 0.14, height + 0.75, 0xc3c1b7);
      box(x, y, w + 0.16, d + 0.16, height + 0.77, height + 0.82, 0x555f63);
    } else if (kind === 'skylight') {
      box(x, y, w + 0.18, d + 0.18, height + 0.025, height + 0.14, 0x777f7d);
      box(x, y, w, d, height + 0.16, height + 0.22, 0x637f8b);
    } else {
      box(x, y, w + 0.16, d + 0.16, height + 0.025, height + 0.12, 0x5e6566);
      box(x, y, w, d, height + 0.14, height + 0.57, 0xadb5b2);
      box(x, y, w * 0.7, d * 0.68, height + 0.59, height + 0.64, 0x566064);
    }
  }
  return parts.length ? mergeAll(parts) : null;
}

// ---------------------------------------------------------------------------
// Landmarks — hand-tuned parts for the iconic buildings registered in
// ./landmarks/ (one self-contained module per building in
// ./landmarks/buildings/, auto-collected via import.meta.glob). Modules with
// a custom `build` run it; the rest render through the shared presets in
// ./landmarks/presets.ts (the former landmarkParts path, moved verbatim).
// Every part is merged into the SAME buildings geometry with the same
// position/normal/color attribute layout, so scene.ts materials/shadows are
// untouched; per-landmark colors ride in vertex colors. Landmark heights are
// exact (no hash jitter). NOTE on nightGlow: the buildings material emissive
// is global (scene.ts/palette.ts), so true per-landmark emissive isn't
// possible without changing scene.ts — instead nightGlow lerps the
// landmark's vertex colors slightly toward warm amber (withGlow in presets).
// ---------------------------------------------------------------------------

/** Tagged/synthetic height of a building's MAIN mass — the single source of
 * truth shared by buildBuildings, the highlight shell, and the lit windows so
 * all three agree (landmark override, else the same hash jitter). */
function buildingBaseHeight(b: CampusBuilding): number {
  const landmark = LANDMARK_MODULES[b.id];
  if (landmark) return Math.max(1.5, landmark.spec.height ?? b.height ?? 11);
  const jitter = 0.88 + 0.24 * hash01(`${b.id}:h`);
  return Math.max(1.5, (b.height ?? 11) * jitter);
}

/** Tallest point of the building including generic roof equipment, landmark
 * roof treatment, or a custom builder's declared maxHeight. */
export function buildingMaxHeight(b: CampusBuilding): number {
  const base = buildingBaseHeight(b);
  const landmark = LANDMARK_MODULES[b.id];
  if (!landmark) return base + (b.name && base > 8 ? 0.82 : 0);
  // Custom builders that rise above the preset silhouette declare their apex.
  if (landmark.maxHeight != null) return landmark.maxHeight;
  switch (landmark.spec.roof) {
    case 'parapet':
      return base + 1.8; // rooftop setback extrudes +1.8m
    case 'hipped': {
      const baseH = base * 0.8;
      return baseH + Math.max(2.5, base - baseH); // ridge apex
    }
    case 'spire':
      return base + 12; // cone: height 12, base at `base`
    default:
      return base; // bowl / glass / unset top out at the base height
  }
}

/** Courtyard rings (OSM multipolygon `inner` members) in shape space, CCW to
 * match the outer ring — extrudeWithHoles reverses them internally. Degenerate
 * rings are dropped so one bad hole can't sink the whole building. */
function holeShapePoints(b: CampusBuilding, proj: Projection): THREE.Vector2[][] {
  if (!b.holes?.length) return [];
  const out: THREE.Vector2[][] = [];
  for (const hole of b.holes) {
    if (!hole || hole.length < 3) continue;
    const pts = ringToShapePoints(hole, proj);
    if (pts.length >= 3) out.push(pts);
  }
  return out;
}

function buildBuildings(data: CampusData, proj: Projection): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  for (const b of data.buildings) {
    if (!b.footprint || b.footprint.length < 3) continue;
    const pts = ringToShapePoints(b.footprint, proj);
    if (pts.length < 3) continue;
    const holes = holeShapePoints(b, proj);
    const landmark = LANDMARK_MODULES[b.id];
    if (landmark) {
      const base = buildingBaseHeight(b);
      if (landmark.build) {
        // Custom per-building builder module (scene/landmarks/buildings/).
        parts.push(...landmark.build(makeLandmarkCtx(pts, base, landmark.spec, holes)));
      } else {
        parts.push(...landmarkPresetParts(pts, base, landmark.spec));
      }
      continue;
    }
    // Courtyard buildings (relation multipolygons) extrude as a band so the
    // inner yard stays open; everything else takes the plain solid path.
    const height = buildingBaseHeight(b);
    const solid =
      holes.length > 0
        ? extrudeWithHoles(pts, holes, height)
        : extrudeFootprint(pts, height);
    parts.push(colorizeBuilding(solid, buildingTint(b), b));
    if (b.name && height > 5) {
      parts.push(facadeCourses(pts, height, b));
      const equipment = rooftopEquipment(pts, holes, height, b);
      if (equipment) parts.push(equipment);
      if (TRIMMED_HISTORIC_BUILDINGS.has(b.id) && height > 6) {
        parts.push(brickCornice(pts, height));
      }
    }
  }
  parts.push(buildWindowReveals(data, proj));
  return mergeAll(parts);
}

/**
 * Single-building solid used by the selection highlight (scene.ts). The shell
 * must FULLY ENVELOP the real building so the translucent overlay never
 * z-fights it: the footprint is outset a fixed 0.5m from the centroid (walls
 * clear the facade at any pitch/zoom) and the top rises 1.0m above the
 * tallest real part — the jittered height for plain buildings (the old
 * un-jittered shell could end up SHORTER than the actual building) and the
 * landmark roof/spire/setback apex for landmarks.
 */
const HIGHLIGHT_OUTSET = 0.5; // meters outward from every wall
const HIGHLIGHT_MARGIN = 1.0; // extra meters above the tallest part

export function buildingSolidGeometry(
  b: CampusBuilding,
  proj: Projection,
): THREE.BufferGeometry | null {
  if (!b.footprint || b.footprint.length < 3) return null;
  const pts = ringToShapePoints(b.footprint, proj);
  if (pts.length < 3) return null;
  const shell = outsetRing(pts, HIGHLIGHT_OUTSET);
  const depth = buildingMaxHeight(b) + HIGHLIGHT_MARGIN;
  // Courtyards stay punched out, but each hole is INSET by the same 0.5m
  // (negative outset shrinks it) so the shell still clears the courtyard-
  // facing facade instead of z-fighting it.
  const holes = holeShapePoints(b, proj).map((h) => outsetRing(h, -HIGHLIGHT_OUTSET));
  return holes.length > 0
    ? extrudeWithHoles(shell, holes, depth)
    : extrudeFootprint(shell, depth);
}

// ---------------------------------------------------------------------------
// Ribbons — flat strips with per-vertex averaged (miter) normals, shared by
// roads (ROAD_Y tiers) and waterways (single WATERWAY_Y tier).
// ---------------------------------------------------------------------------

function pushTri(
  positions: number[],
  normals: number[],
  colors: number[],
  y: number,
  color: THREE.Color,
  ax: number,
  az: number,
  bx: number,
  bz: number,
  cx: number,
  cz: number,
): void {
  positions.push(ax, y, az, bx, y, bz, cx, y, cz);
  normals.push(0, 1, 0, 0, 1, 0, 0, 1, 0);
  for (let i = 0; i < 3; i++) colors.push(color.r, color.g, color.b);
}

interface RibbonSpec {
  /** [lng, lat] polyline. */
  line: [number, number][];
  /** Meters. */
  width: number;
  /** Meters — legibility floor at campus-wide zooms. */
  minWidth: number;
  y: number;
  color: THREE.Color;
}

function addRibbon(
  spec: RibbonSpec,
  proj: Projection,
  positions: number[],
  normals: number[],
  colors: number[],
): void {
  if (!spec.line || spec.line.length < 2) return;
  const pts: { x: number; z: number }[] = [];
  for (const [lng, lat] of spec.line) {
    const p = proj.toLocal(lng, lat);
    const last = pts[pts.length - 1];
    if (last && Math.hypot(last.x - p.x, last.z - p.z) < 0.2) continue;
    pts.push(p);
  }
  const n = pts.length;
  if (n < 2) return;

  const halfW = Math.max(spec.width, spec.minWidth) / 2;
  const y = spec.y;
  const color = spec.color;

  // Per-vertex miter normal: average of adjacent segment normals, rescaled
  // by 1/cos(half-angle), clamped to avoid spikes on hairpins.
  const leftX = new Float32Array(n);
  const leftZ = new Float32Array(n);
  const rightX = new Float32Array(n);
  const rightZ = new Float32Array(n);
  const segNX = new Float32Array(n - 1);
  const segNZ = new Float32Array(n - 1);
  for (let i = 0; i < n - 1; i++) {
    const dx = pts[i + 1].x - pts[i].x;
    const dz = pts[i + 1].z - pts[i].z;
    const len = Math.hypot(dx, dz) || 1;
    segNX[i] = -dz / len; // left normal of the segment
    segNZ[i] = dx / len;
  }
  for (let j = 0; j < n; j++) {
    let nx = 0;
    let nz = 0;
    let count = 0;
    if (j > 0) {
      nx += segNX[j - 1];
      nz += segNZ[j - 1];
      count++;
    }
    if (j < n - 1) {
      nx += segNX[j];
      nz += segNZ[j];
      count++;
    }
    const nl = Math.hypot(nx, nz);
    if (nl < 1e-6) {
      nx = 0;
      nz = 1;
    } else {
      nx /= nl;
      nz /= nl;
    }
    let scale = 1;
    if (count === 2) {
      const dot = segNX[j - 1] * nx + segNZ[j - 1] * nz;
      scale = Math.min(2.5, 1 / Math.max(dot, 0.4));
    }
    const w = halfW * scale;
    leftX[j] = pts[j].x + nx * w;
    leftZ[j] = pts[j].z + nz * w;
    rightX[j] = pts[j].x - nx * w;
    rightZ[j] = pts[j].z - nz * w;
  }
  for (let i = 0; i < n - 1; i++) {
    // Winding gives +y normals: (L_i, L_{i+1}, R_i) and (R_i, L_{i+1}, R_{i+1}).
    pushTri(positions, normals, colors, y, color, leftX[i], leftZ[i], leftX[i + 1], leftZ[i + 1], rightX[i], rightZ[i]);
    pushTri(positions, normals, colors, y, color, rightX[i], rightZ[i], leftX[i + 1], leftZ[i + 1], rightX[i + 1], rightZ[i + 1]);
  }
}

function buildRibbonGeometry(
  positions: number[],
  normals: number[],
  colors: number[],
): THREE.BufferGeometry {
  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geom.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geom.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  return geom;
}

function buildRoads(data: CampusData, proj: Projection): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const colors: number[] = [];
  for (const road of data.roads) {
    addRibbon(
      {
        line: road.line,
        width: road.width ?? 3,
        minWidth: MIN_ROAD_WIDTH,
        y: ROAD_Y[road.kind] ?? ROAD_Y.service,
        color: COLORS[road.kind] ?? COLORS.service,
      },
      proj,
      positions,
      normals,
      colors,
    );
  }
  return buildRibbonGeometry(positions, normals, colors);
}

// ---------------------------------------------------------------------------
// Waterways — river/canal/stream/ditch/drain ribbons in the shared water blue
// at WATERWAY_Y (Paint Branch river along the east edge is width 10). Merged
// into the dedicated `water` mesh by buildWater so rivers share the glint
// material — no scene.ts change beyond the one water mesh.
// ---------------------------------------------------------------------------

function buildWaterways(data: CampusData, proj: Projection): THREE.BufferGeometry {
  const positions: number[] = [];
  const normals: number[] = [];
  const colors: number[] = [];
  for (const w of data.waterways ?? []) {
    addRibbon(
      {
        line: w.line,
        width: w.width ?? 3,
        minWidth: MIN_WATERWAY_WIDTH,
        y: WATERWAY_Y,
        color: COLORS.water,
      },
      proj,
      positions,
      normals,
      colors,
    );
  }
  return buildRibbonGeometry(positions, normals, colors);
}

// ---------------------------------------------------------------------------
// Areas — flat ShapeGeometry polygons, kind-tinted, y-staggered. Water-kind
// polygons (water/fountain/pool) are EXCLUDED here — they get their own
// merged mesh + glint material (see buildWater below).
// ---------------------------------------------------------------------------

function buildAreas(data: CampusData, proj: Projection): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  for (const area of data.areas) {
    if (area.kind === 'water' || area.kind === 'fountain' || area.kind === 'pool') continue;
    if (!area.polygon || area.polygon.length < 3) continue;
    const pts = ringToShapePoints(area.polygon, proj);
    if (pts.length < 3) continue;
    const geom = new THREE.ShapeGeometry(new THREE.Shape(pts), 1);
    geom.rotateX(-Math.PI / 2);
    geom.translate(0, AREA_Y[area.kind] ?? AREA_Y.grass, 0);
    parts.push(withColor(geom, COLORS[area.kind] ?? COLORS.grass));
  }
  return mergeAll(parts);
}

// ---------------------------------------------------------------------------
// Water — water/fountain/pool polygons pulled OUT of the flat areas mesh into
// their own merged geometry so scene.ts can give them a dedicated
// MeshPhongMaterial (moderate shininess -> soft sun glint by day, cool moon
// glint at night; day/night comes free from the palette-driven lights).
//
// Crafted-but-stylized recipe per polygon:
//   1. Gradient stack: WATER_LAYERS concentric copies scaled about the
//      polygon centroid (a cheap chamfer/inset 'depth' approximation), each
//      inner copy lifted one 3mm step so it draws cleanly over the layer
//      beneath. Baked vertex colors lerp light teal (shoreline) -> deeper
//      blue (middle).
//   2. Shore outline: a thin darker ring hugging the polygon edge (a flat
//      quad strip between the edge and a ~1.4m-inset copy), selling the
//      waterline against the grass.
// Waterway ribbons join this mesh too, so Paint Branch picks up the same
// glint. All layers sit between sport (.12) and parking (.16), 3mm apart —
// depth-safe at 4km viewing distances.
// ---------------------------------------------------------------------------

const WATER_BASE_Y = 0.134; // above sport (.12), clear of grass (.10)
const WATER_LAYER_STEP = 0.003; // per-gradient-layer lift (mm-scale, depth-safe)
const WATER_LAYERS = 5; // concentric inset copies per polygon
const WATER_INSET_FRACTION = 0.17; // each layer scales in by this much
const WATER_SHORE_WIDTH = 1.4; // meters — darker outline ring along the edge
const WATER_COLORS = {
  shore: new THREE.Color(0x9ec9d8), // light teal at the shoreline
  deep: new THREE.Color(0x4c83b2), // deeper blue toward the middle
  ring: new THREE.Color(0x3f6e92), // darker shore outline
};

function buildWater(data: CampusData, proj: Projection): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  for (const area of data.areas) {
    if (area.kind !== 'water' && area.kind !== 'fountain' && area.kind !== 'pool') continue;
    if (!area.polygon || area.polygon.length < 3) continue;
    const pts = ringToShapePoints(area.polygon, proj);
    if (pts.length < 3) continue;
    const { cx, cy } = centroidOf(pts);

    // Gradient stack: outermost copy = full polygon at the base tier, each
    // inner copy scaled toward the centroid and lifted one step.
    for (let i = 0; i < WATER_LAYERS; i++) {
      const f = 1 - i * WATER_INSET_FRACTION; // 1.0, .83, .66, .49, .32
      const color = WATER_COLORS.shore
        .clone()
        .lerp(WATER_COLORS.deep, i / (WATER_LAYERS - 1));
      const scaled =
        i === 0
          ? pts
          : pts.map((p) => new THREE.Vector2(cx + (p.x - cx) * f, cy + (p.y - cy) * f));
      const geom = new THREE.ShapeGeometry(new THREE.Shape(scaled), 1);
      geom.rotateX(-Math.PI / 2);
      geom.translate(0, WATER_BASE_Y + i * WATER_LAYER_STEP, 0);
      parts.push(withColor(geom, color));
    }

    // Shore outline ring: flat quad strip between the polygon edge and an
    // inset copy (fixed ~1.4m inward, clamped for tiny fountain basins).
    // ringToShapePoints guarantees CCW, so (outer_a, outer_b, inner_b) /
    // (outer_a, inner_b, inner_a) gives +y normals after the shape->world
    // z-flip (same winding the ribbon builder relies on).
    const positions: number[] = [];
    const normals: number[] = [];
    const colors: number[] = [];
    const y = WATER_BASE_Y + WATER_LAYERS * WATER_LAYER_STEP;
    const n = pts.length;
    for (let i = 0; i < n; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % n];
      const da = Math.hypot(a.x - cx, a.y - cy) || 1;
      const db = Math.hypot(b.x - cx, b.y - cy) || 1;
      const insetA = Math.min(WATER_SHORE_WIDTH, da * 0.4);
      const insetB = Math.min(WATER_SHORE_WIDTH, db * 0.4);
      const iax = a.x + ((cx - a.x) / da) * insetA;
      const iaz = -(a.y + ((cy - a.y) / da) * insetA); // shape y = north -> world z = -north
      const ibx = b.x + ((cx - b.x) / db) * insetB;
      const ibz = -(b.y + ((cy - b.y) / db) * insetB);
      pushTri(positions, normals, colors, y, WATER_COLORS.ring, a.x, -a.y, b.x, -b.y, ibx, ibz);
      pushTri(positions, normals, colors, y, WATER_COLORS.ring, a.x, -a.y, ibx, ibz, iax, iaz);
    }
    parts.push(buildRibbonGeometry(positions, normals, colors));
  }
  // Waterway ribbons ride along so rivers share the same glint material.
  const waterways = buildWaterways(data, proj);
  if ((waterways.getAttribute('position')?.count ?? 0) > 0) parts.push(waterways);
  return mergeAll(parts);
}

// ---------------------------------------------------------------------------
// Trees come from UMD's surveyed campus plant inventory. The source gives
// actual trunk coordinates, height and crown radius, so the oaks along the
// Mall and irregular groves keep their real spacing.
// ---------------------------------------------------------------------------

function buildTrees(data: CampusData, proj: Projection): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  const seeds: number[] = [];
  data.trees.forEach(([lng, lat, mappedHeight, mappedCrown, kind], i) => {
    const p = proj.toLocal(lng, lat);
    const height = mappedHeight ?? 10;
    const radius = mappedCrown ?? 3.7;
    const seed = hash01(`tree:${i}:season`);
    const add = (geom: THREE.BufferGeometry, color: THREE.Color, seasonSeed: number) => {
      const colored = withColor(geom, color);
      parts.push(colored);
      for (let k = 0; k < colored.getAttribute('position').count; k++) seeds.push(seasonSeed);
    };
    // Campus oaks have a low, broad crown. Tucking the visible trunk into the
    // lower lobes avoids the lollipop silhouette at the map's home zoom.
    const trunkHeight = Math.max(2.4, height - radius * 1.55);
    const trunkRadius = THREE.MathUtils.clamp(height * 0.035, 0.25, 0.72);
    const trunk = new THREE.CylinderGeometry(trunkRadius * 0.78, trunkRadius, trunkHeight, 8);
    trunk.translate(p.x, trunkHeight / 2, p.z);
    add(trunk, new THREE.Color(0x635342), -1);
    if (kind === 1) {
      const lower = new THREE.ConeGeometry(radius, height * 0.78, 10);
      lower.translate(p.x, height * 0.51, p.z);
      add(lower, new THREE.Color(0x425d47), -1);
      const upper = new THREE.ConeGeometry(radius * 0.7, height * 0.58, 10);
      upper.translate(p.x, height * 0.7, p.z);
      add(upper, new THREE.Color(0x567555), -1);
    } else {
      const foliage = kind === 2 ? new THREE.Color(0x4a7550) : COLORS.tree;
      const foliageSeed = kind === 2 ? -1 : seed;
      const phase = hash01(`tree:${i}:crown`) * Math.PI * 2;
      const shape = hash01(`tree:${i}:shape`);
      // Three overlapping lobes read as one broad oak from the map and show
      // irregular branching up close. Low-detail smooth meshes cost fewer
      // vertices together than the previous single high-detail sphere.
      const dx = Math.cos(phase), dz = Math.sin(phase);
      const lobes = [
        { x: 0, z: 0, y: 0.8, sx: 0.77 + shape * 0.08, sy: 0.86, sz: 0.77, tone: 1 },
        { x: dx * 0.31, z: dz * 0.31, y: 1.06, sx: 0.69, sy: 0.66, sz: 0.67, tone: 0.97 },
        { x: -dx * 0.31, z: -dz * 0.31, y: 1.01, sx: 0.7, sy: 0.7, sz: 0.65, tone: 1.02 },
      ];
      for (let l = 0; l < lobes.length; l++) {
        const lobe = lobes[l];
        const crown = new THREE.IcosahedronGeometry(1, 1);
        const positions = crown.getAttribute('position');
        for (let v = 0; v < positions.count; v++) {
          const x = positions.getX(v), y = positions.getY(v), z = positions.getZ(v);
          const angle = Math.atan2(z, x);
          const edge = 1 + 0.075 * Math.sin(3 * angle + phase + l * 1.8 + y)
            + 0.035 * Math.sin(6 * angle - phase + y * 2);
          positions.setXYZ(v,
            p.x + radius * (lobe.x + x * lobe.sx * edge),
            height - radius * lobe.y + radius * y * lobe.sy,
            p.z + radius * (lobe.z + z * lobe.sz * edge),
          );
        }
        crown.deleteAttribute('uv');
        crown.deleteAttribute('normal');
        const smoothCrown = mergeVertices(crown, 1e-4);
        smoothCrown.computeVertexNormals();
        const colored = withColor(smoothCrown, foliage);
        const colors = colored.getAttribute('color');
        const crownPositions = colored.getAttribute('position');
        const bottom = foliage.clone().multiplyScalar(0.84 * lobe.tone);
        const top = foliage.clone().lerp(COLORS.treeTop, kind === 2 ? 0.14 : 0.44)
          .multiplyScalar(lobe.tone);
        for (let v = 0; v < colors.count; v++) {
          const t = THREE.MathUtils.clamp(
            (crownPositions.getY(v) - (height - radius * 1.8)) / (radius * 1.85), 0, 1,
          );
          const localX = crownPositions.getX(v) - p.x;
          const localZ = crownPositions.getZ(v) - p.z;
          const fleck = 0.975 + 0.025 * Math.sin(localX * 1.7 + phase)
            * Math.sin(localZ * 2.1 - phase * 0.6 + t * 4);
          colors.setXYZ(v,
            THREE.MathUtils.lerp(bottom.r, top.r, t) * fleck,
            THREE.MathUtils.lerp(bottom.g, top.g, t) * fleck,
            THREE.MathUtils.lerp(bottom.b, top.b, t) * fleck,
          );
        }
        parts.push(colored);
        for (let v = 0; v < colors.count; v++) seeds.push(foliageSeed);
      }
    }
  });
  const merged = mergeAll(parts);
  merged.setAttribute('seasonSeed', new THREE.BufferAttribute(new Float32Array(seeds), 1));
  return merged;
}

// ---------------------------------------------------------------------------
// Lamp posts — deterministic samples along road+path lines: every ~35m of arc
// length (per-road deterministic phase), offset just off the edge of the
// ribbon, alternating sides. Candidates are deduped with a 12m spatial hash
// (intersecting/parallel paths share lamps), then — when over budget — spread
// deterministically by sorting on a per-lamp hash and keeping LAMP_CAP, so
// the surviving lamps cover the whole campus instead of clustering on the
// first-listed roads. Poles merge into ONE geometry, heads into ANOTHER (the
// heads get their own material in scene.ts so the warm #ffd9a0 glow can be
// driven by sun elevation: unlit fixture by day, glowing at dusk/night).
// ---------------------------------------------------------------------------

const LAMP_SPACING = 28; // meters between samples along a line (denser for a warmer night)
const LAMP_DEDUPE = 12; // meters — min distance between any two lamps
const LAMP_CAP = 820;
const LAMP_POLE_HEIGHT = 5.5; // second enlargement — reads clearly at campus zoom
const LAMP_HEAD_Y = 5.62; // sphere center — overlaps the pole top slightly
const LAMP_EDGE_OFFSET = 0.9; // meters beyond the ribbon half-width
/** Warm ground-glow pool under each lamp (scene.ts textures + fades it). */
const LAMP_POOL_RADIUS = 6.5;
const LAMP_POOL_Y = 0.45; // above roads (.4) so the pool never clips pavement
/** A few lamps on campus have a bad ballast and stutter. They are HELD OUT of
 * the merged head/glow geometry and returned individually, because every
 * other lamp shares one material — flickering that would blink all 820 in
 * unison (a power cut, not a dying bulb). Poles still merge with the rest;
 * only the head and its ground pool are separated. */
const LAMP_FLICKER_COUNT = 5;
/** Extra lamps that stutter ONLY during the 2AM window — the campus visibly
 * gets more decrepit in the small hours. Concentrated on McKeldin Mall, where
 * you are actually looking. Steady the rest of the day. */
const LAMP_FLICKER_LATE_COUNT = 14;
/** McKeldin Mall in local metres (grass polygon centroid + padded half-span),
 * measured from campus-data: centre (-7, 100), lawn spans x -163..207. */
const MALL_X = -7;
const MALL_Z = 100;
const MALL_HALF_X = 230;
const MALL_HALF_Z = 105;
/** Restrict the stutterers to lamps near the campus core. `accepted` is sorted
 * by HASH, so simply striding it picks spatially random lamps — the first cut
 * put all five 660-1340m from the default view, i.e. permanently off-screen.
 * Mirrors HOME_VIEW in scene.ts (kept local to avoid an import cycle). */
const LAMP_FLICKER_CORE_LNG = -76.94496;
const LAMP_FLICKER_CORE_LAT = 38.9864;
const LAMP_FLICKER_CORE_RADIUS = 420; // meters — comfortably inside the default view

interface LampPoint {
  x: number;
  z: number;
  /** Deterministic per-lamp hash — used for the over-cap spread selection. */
  h: number;
}

interface LampGeometries {
  poles: THREE.BufferGeometry;
  heads: THREE.BufferGeometry;
  /** Accepted lamp positions (world meters) — reused for path-edge shrubs. */
  points: LampPoint[];
  /** The stuttering lamps, one head geometry each (excluded from `heads`). */
  flickerHeads: THREE.BufferGeometry[];
  /** Matching ground pools, one per flicker lamp (excluded from lampGlow). */
  flickerGlow: THREE.BufferGeometry[];
  /** true = only stutters during the 2AM window; false = always. Parallel. */
  flickerLate: boolean[];
  /** Indices into `points` that were held out — buildLampGlow skips these. */
  flickerIndices: Set<number>;
}

function buildLamps(data: CampusData, proj: Projection): LampGeometries {
  const candidates: LampPoint[] = [];
  data.roads.forEach((road, ri) => {
    if (road.kind !== 'road' && road.kind !== 'path') return;
    if (!road.line || road.line.length < 2) return;
    const pts: { x: number; z: number }[] = [];
    for (const [lng, lat] of road.line) {
      const p = proj.toLocal(lng, lat);
      const last = pts[pts.length - 1];
      if (last && Math.hypot(last.x - p.x, last.z - p.z) < 0.2) continue;
      pts.push(p);
    }
    if (pts.length < 2) return;
    const offset = Math.max(road.width ?? 3, MIN_ROAD_WIDTH) / 2 + LAMP_EDGE_OFFSET;
    // Deterministic phase so lamps don't stack on shared line start points.
    let nextAt = LAMP_SPACING * (0.35 + 0.3 * hash01(`lamp:${ri}:start`));
    let acc = 0;
    let ordinal = 0;
    for (let i = 0; i < pts.length - 1; i++) {
      const dx = pts[i + 1].x - pts[i].x;
      const dz = pts[i + 1].z - pts[i].z;
      const len = Math.hypot(dx, dz);
      if (len < 1e-3) continue;
      while (acc + len >= nextAt) {
        const t = (nextAt - acc) / len;
        const px = pts[i].x + dx * t;
        const pz = pts[i].z + dz * t;
        const nx = -dz / len; // left normal of the segment
        const nz = dx / len;
        const side = ordinal % 2 === 0 ? 1 : -1;
        candidates.push({
          x: px + nx * offset * side,
          z: pz + nz * offset * side,
          h: hash01(`lamp:${ri}:${ordinal}`),
        });
        ordinal++;
        nextAt += LAMP_SPACING;
      }
      acc += len;
    }
  });

  // Dedupe: 12m grid neighborhood check (parallel/intersecting paths).
  const grid = new Map<string, { x: number; z: number }[]>();
  const accepted: LampPoint[] = [];
  for (const c of candidates) {
    const gx = Math.floor(c.x / LAMP_DEDUPE);
    const gz = Math.floor(c.z / LAMP_DEDUPE);
    let tooClose = false;
    for (let ix = gx - 1; ix <= gx + 1 && !tooClose; ix++) {
      for (let iz = gz - 1; iz <= gz + 1 && !tooClose; iz++) {
        const bucket = grid.get(`${ix},${iz}`);
        if (!bucket) continue;
        for (const p of bucket) {
          const ddx = p.x - c.x;
          const ddz = p.z - c.z;
          if (ddx * ddx + ddz * ddz < LAMP_DEDUPE * LAMP_DEDUPE) {
            tooClose = true;
            break;
          }
        }
      }
    }
    if (tooClose) continue;
    accepted.push(c);
    const key = `${gx},${gz}`;
    let bucket = grid.get(key);
    if (!bucket) {
      bucket = [];
      grid.set(key, bucket);
    }
    bucket.push(c);
  }

  // Over budget -> deterministic campus-wide spread (hash order, not data order).
  accepted.sort((a, b) => a.h - b.h);
  if (accepted.length > LAMP_CAP) accepted.length = LAMP_CAP;

  // Pick the stutterers. Two sets: a handful of permanently bad ballasts
  // anywhere in the core, plus a larger Mall-heavy set that only stutters in
  // the 2AM window. Both stride their hash-ordered candidate list, so picks
  // land in different places rather than side by side on one path.
  const lateByIdx = new Map<number, boolean>();
  {
    const core = proj.toLocal(LAMP_FLICKER_CORE_LNG, LAMP_FLICKER_CORE_LAT);
    const mall: number[] = [];
    const coreRest: number[] = [];
    accepted.forEach((p, i) => {
      if (Math.abs(p.x - MALL_X) < MALL_HALF_X && Math.abs(p.z - MALL_Z) < MALL_HALF_Z) {
        mall.push(i);
      } else if (Math.hypot(p.x - core.x, p.z - core.z) < LAMP_FLICKER_CORE_RADIUS) {
        coreRest.push(i);
      }
    });

    /** Takes `want` evenly-strided picks from `pool`, skipping anything
     * already chosen. Returns how many it actually placed. */
    const take = (pool: number[], want: number, late: boolean, salt: string): number => {
      if (want <= 0 || pool.length === 0) return 0;
      const stride = Math.max(1, Math.floor(pool.length / want));
      let placed = 0;
      for (let i = 0; i < want; i++) {
        const offset = Math.floor(hash01(`${salt}:${i}`) * stride) % stride;
        // Walk forward from the strided slot until an unused lamp turns up.
        for (let probe = 0; probe < pool.length; probe++) {
          const idx = pool[(i * stride + offset + probe) % pool.length];
          if (lateByIdx.has(idx)) continue;
          lateByIdx.set(idx, late);
          placed += 1;
          break;
        }
      }
      return placed;
    };

    // Always-on: core-wide (excluding nothing — the Mall is fair game too).
    const anywhere = coreRest.concat(mall);
    take(anywhere, LAMP_FLICKER_COUNT, false, 'lampflicker');
    // Late-night: Mall first, topped up from the rest of the core.
    const placedMall = take(mall, LAMP_FLICKER_LATE_COUNT, true, 'lamplate');
    take(coreRest, LAMP_FLICKER_LATE_COUNT - placedMall, true, 'lamplate2');
  }
  const flickerIdx = new Set(lateByIdx.keys());

  const poleParts: THREE.BufferGeometry[] = [];
  const headParts: THREE.BufferGeometry[] = [];
  const flickerHeads: THREE.BufferGeometry[] = [];
  const flickerGlow: THREE.BufferGeometry[] = [];
  const flickerLate: boolean[] = [];
  accepted.forEach((p, i) => {
    const pole = new THREE.CylinderGeometry(0.09, 0.14, LAMP_POLE_HEIGHT, 5);
    pole.translate(p.x, LAMP_POLE_HEIGHT / 2, p.z);
    poleParts.push(pole);
    const head = new THREE.SphereGeometry(0.45, 6, 5);
    head.translate(p.x, LAMP_HEAD_Y, p.z);
    if (flickerIdx.has(i)) {
      flickerHeads.push(head);
      flickerGlow.push(lampGlowDisc(p));
      flickerLate.push(lateByIdx.get(i) === true);
    } else {
      headParts.push(head);
    }
  });
  return {
    poles: mergeAll(poleParts),
    heads: mergeAll(headParts),
    points: accepted,
    flickerHeads,
    flickerGlow,
    flickerLate,
    flickerIndices: flickerIdx,
  };
}

/** One ground-glow disc, shared by the merged pass and the flicker lamps. */
function lampGlowDisc(p: LampPoint): THREE.BufferGeometry {
  const disc = new THREE.CircleGeometry(LAMP_POOL_RADIUS, 20);
  disc.rotateX(-Math.PI / 2);
  disc.translate(p.x, LAMP_POOL_Y, p.z);
  // KEEP uv: scene.ts maps a radial-gradient texture through it (uv spans
  // the unit square per disc, so each disc samples the full glow falloff).
  return disc.index ? disc.toNonIndexed() : disc;
}

/** Flat ground-glow discs under every accepted lamp. Merged into ONE
 * geometry; scene.ts applies a radial-gradient texture and drives opacity
 * from sun elevation (invisible by day, soft warm pools at night). */
function buildLampGlow(points: LampPoint[], skip: Set<number>): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  points.forEach((p, i) => {
    // Flicker lamps carry their own pool so it can dim with the head; leaving
    // one here too would keep a steady pool glowing under the stutter.
    if (skip.has(i)) return;
    parts.push(lampGlowDisc(p));
  });
  return mergeAll(parts);
}

// ---------------------------------------------------------------------------
// Snow patches — lying snow, scattered rather than a uniform white wash.
// Deterministic blobby discs sampled INSIDE grass/sport polygons (rejection
// sampling against the ring, same approach the parked cars use for lots), so
// snow only ever settles on open ground — never on roads, roofs or water.
//
// One merged geometry, one white material in scene.ts whose opacity the
// season curve drives. Sits at SNOW_PATCH_Y: above grass (.10) and sport
// (.12) so it covers them, but BELOW paths (.20) and roads (.40) — which
// means the walkways read as cleared while the lawns stay covered.
// ---------------------------------------------------------------------------

const SNOW_PATCH_Y = 0.132; // over grass+sport, under the water stack (.134)
/** One drift per this many m2 of eligible lawn. Dense enough that neighbours
 * OVERLAP: real snow is a broken sheet, not scattered dots. */
const SQ_M_PER_PATCH = 150;
const SNOW_PATCH_CAP = 1500;
const SNOW_PATCH_MIN_AREA = 120; // m2 - skip slivers
const SNOW_PATCH_MIN_R = 7;
const SNOW_PATCH_MAX_R = 24;
/** Per-vertex radius wobble, so drifts read as organic not circular. */
const SNOW_PATCH_WOBBLE = 0.5;
const SNOW_PATCH_SEGMENTS = 14;
/** Where the opaque core ends and the feathered rim begins, as a fraction of
 * the radius. The rim fades to alpha 0, which is what kills the "paper cutout"
 * look — a hard-edged disc never reads as snow. */
const SNOW_CORE_FRACTION = 0.52;
/** Per-drift brightness spread: thin cover is duller than deep drifts. */
const SNOW_MIN_BRIGHT = 0.72;

function buildSnowPatches(data: CampusData, proj: Projection): THREE.BufferGeometry {
  interface Patch {
    x: number;
    z: number;
    r: number;
    bright: number;
    h: number;
  }
  const patches: Patch[] = [];

  data.areas.forEach((area, ai) => {
    if (area.kind !== 'grass' && area.kind !== 'sport') return;
    if (!area.polygon || area.polygon.length < 3) return;
    const pts = ringToShapePoints(area.polygon, proj);
    if (pts.length < 3) return;
    let a2 = 0;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      const q = pts[(i + 1) % pts.length];
      a2 += p.x * q.y - q.x * p.y;
    }
    const areaM2 = Math.abs(a2) / 2;
    if (areaM2 < SNOW_PATCH_MIN_AREA) return;

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const p of pts) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }

    const want = Math.max(1, Math.round(areaM2 / SQ_M_PER_PATCH));
    for (let n = 0, tries = 0; n < want && tries < want * 8; tries++) {
      const seed = `snow:${ai}:${tries}`;
      const x = minX + hash01(`${seed}:x`) * (maxX - minX);
      const y = minY + hash01(`${seed}:y`) * (maxY - minY);
      if (!pointInShapeRing(x, y, pts)) continue;
      n += 1;
      // Skew small: many modest drifts plus a few big sheets reads better
      // than a uniform spread of mid-size blobs.
      const t = hash01(`${seed}:r`);
      patches.push({
        x,
        z: -y, // shape y = north -> world z = -north
        r: SNOW_PATCH_MIN_R + t * t * (SNOW_PATCH_MAX_R - SNOW_PATCH_MIN_R),
        bright: SNOW_MIN_BRIGHT + hash01(`${seed}:b`) * (1 - SNOW_MIN_BRIGHT),
        h: hash01(`${seed}:h`),
      });
    }
  });

  patches.sort((a, b) => a.h - b.h);
  if (patches.length > SNOW_PATCH_CAP) patches.length = SNOW_PATCH_CAP;

  // One buffer for the lot: a soft disc per drift = centre fan (opaque core)
  // plus a rim skirt fading to alpha 0. RGBA vertex colours carry both the
  // per-drift brightness and the feather.
  const positions: number[] = [];
  const normals: number[] = [];
  const colors: number[] = [];
  const push = (x: number, z: number, a: number, b: number): void => {
    positions.push(x, 0, z);
    normals.push(0, 1, 0);
    colors.push(b, b, b, a);
  };

  for (const p of patches) {
    const core: [number, number][] = [];
    const rim: [number, number][] = [];
    for (let i = 0; i < SNOW_PATCH_SEGMENTS; i++) {
      const ang = (i / SNOW_PATCH_SEGMENTS) * Math.PI * 2;
      const wob =
        1 + (hash01(`${p.x.toFixed(1)}:${p.z.toFixed(1)}:${i}`) - 0.5) * SNOW_PATCH_WOBBLE;
      const rr = p.r * wob;
      core.push([p.x + Math.cos(ang) * rr * SNOW_CORE_FRACTION, p.z + Math.sin(ang) * rr * SNOW_CORE_FRACTION]);
      rim.push([p.x + Math.cos(ang) * rr, p.z + Math.sin(ang) * rr]);
    }
    for (let i = 0; i < SNOW_PATCH_SEGMENTS; i++) {
      const j = (i + 1) % SNOW_PATCH_SEGMENTS;
      // Opaque core fan (CCW in world x/z so the +y normal faces up).
      push(p.x, p.z, 1, p.bright);
      push(core[j][0], core[j][1], 1, p.bright);
      push(core[i][0], core[i][1], 1, p.bright);
      // Feathered skirt: core (alpha 1) -> rim (alpha 0).
      push(core[i][0], core[i][1], 1, p.bright);
      push(core[j][0], core[j][1], 1, p.bright);
      push(rim[j][0], rim[j][1], 0, p.bright);
      push(core[i][0], core[i][1], 1, p.bright);
      push(rim[j][0], rim[j][1], 0, p.bright);
      push(rim[i][0], rim[i][1], 0, p.bright);
    }
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
  geom.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3));
  // itemSize 4: three multiplies the alpha channel into fragment alpha, which
  // is what makes the rim fade instead of just going grey.
  geom.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 4));
  geom.translate(0, SNOW_PATCH_Y, 0);
  return geom;
}

/** Ray-cast point-in-polygon on shape-space points (x, y = north). */
function pointInShapeRing(x: number, y: number, pts: THREE.Vector2[]): boolean {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i];
    const b = pts[j];
    if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) {
      inside = !inside;
    }
  }
  return inside;
}

// ---------------------------------------------------------------------------
// Shrubs — low squashed icosahedra in muted deep green (#6f8457 with slight
// per-shrub HSL variance, vertex-colored). Deterministic from the building
// id: ~45% of buildings get 1–3 shrubs placed just outside a hashed footprint
// corner; a few extra ride along path edges (jittered off the accepted lamp
// points so they never collide with poles). Over-budget building shrubs are
// spread campus-wide by hash order (same trick as the lamps). ONE merged
// geometry; scene.ts sets receiveShadow.
// ---------------------------------------------------------------------------

const SHRUB_BUILDING_FRACTION = 0.45;
const SHRUB_CAP = 900;
const SHRUB_PATH_CAP = 140;
const SHRUB_PATH_FRACTION = 0.25; // fraction of lamp points that get a shrub
const SHRUB_BASE = new THREE.Color(0x6f8457);

interface ShrubSpec {
  x: number;
  z: number;
  key: string;
  /** Deterministic order key for the over-cap spread selection. */
  h: number;
}

function shrubGeometry(spec: ShrubSpec): THREE.BufferGeometry {
  const key = spec.key;
  const r = 0.8 + 0.8 * hash01(`${key}:r`);
  const geom = new THREE.IcosahedronGeometry(r, 0);
  geom.rotateY(hash01(`${key}:rot`) * Math.PI * 2);
  geom.scale(1, 0.55 + 0.15 * hash01(`${key}:sq`), 1); // squash (normals fixed by applyMatrix4)
  geom.translate(spec.x, r * 0.42, spec.z); // nestled into the ground
  const color = SHRUB_BASE.clone();
  color.offsetHSL(
    (hash01(`${key}:h`) - 0.5) * 0.03,
    (hash01(`${key}:s`) - 0.5) * 0.06,
    (hash01(`${key}:l`) - 0.5) * 0.07,
  );
  return withColor(geom, color);
}

function buildShrubs(data: CampusData, proj: Projection, lampPoints: LampPoint[]): THREE.BufferGeometry {
  const specs: ShrubSpec[] = [];
  for (const b of data.buildings) {
    if (!b.footprint || b.footprint.length < 3) continue;
    if (hash01(`${b.id}:shrub`) >= SHRUB_BUILDING_FRACTION) continue;
    const pts = ringToShapePoints(b.footprint, proj);
    if (pts.length < 3) continue;
    const { cx, cy } = centroidOf(pts);
    const n = 1 + Math.floor(hash01(`${b.id}:shrubN`) * 3); // 1..3
    for (let k = 0; k < n; k++) {
      const key = `${b.id}:shrub${k}`;
      const corner = pts[Math.floor(hash01(`${key}:c`) * pts.length)];
      // Push the shrub just outside the corner, away from the centroid.
      let ox = corner.x - cx;
      let oy = corner.y - cy;
      const ol = Math.hypot(ox, oy);
      if (ol < 1e-3) {
        ox = 1;
        oy = 0;
      } else {
        ox /= ol;
        oy /= ol;
      }
      const push = 1.2 + 1.6 * hash01(`${key}:p`); // 1.2–2.8m outside the corner
      specs.push({
        x: corner.x + ox * push,
        z: -(corner.y + oy * push), // shape y = north -> world z = -north
        key,
        h: hash01(`${key}:o`),
      });
    }
  }
  // Deterministic campus-wide spread when over the building budget.
  specs.sort((a, b) => a.h - b.h);
  const buildingBudget = SHRUB_CAP - SHRUB_PATH_CAP;
  if (specs.length > buildingBudget) specs.length = buildingBudget;

  // Path-edge sprinkle (cheap: reuses the deduped lamp points, jittered so
  // the shrub never lands on its pole).
  let pathAdded = 0;
  for (let i = 0; i < lampPoints.length && pathAdded < SHRUB_PATH_CAP; i++) {
    if (hash01(`pathshrub:${i}`) >= SHRUB_PATH_FRACTION) continue;
    const p = lampPoints[i];
    const key = `pathshrub:${i}`;
    const ang = hash01(`${key}:a`) * Math.PI * 2;
    const d = 0.9 + 1.1 * hash01(`${key}:d`);
    specs.push({ x: p.x + Math.cos(ang) * d, z: p.z + Math.sin(ang) * d, key, h: 0 });
    pathAdded++;
  }

  return mergeAll(specs.map(shrubGeometry));
}

// ---------------------------------------------------------------------------
// Lit windows — ONE merged mesh of small facade quads for the cozy night
// look. A deterministic per-building hash picks a stable 25–45% lit subset of
// a window grid (columns ~2.8m, rows ~3.0m) on generic buildings and
// landmarks that explicitly opt in to full-wall glazing;
// only LIT windows are baked (unlit ones would be invisible at night anyway),
// so day mode renders nothing extra. Quads sit 10cm from the facade so they
// never z-fight it. Positions only (the scene material is unlit) — ONE draw
// call, zero per-frame work beyond the material opacity ramp in scene.ts.
// Landmark roof parts (parapet setback / hipped ridge / spire cone / stadium
// field) carry no windows: the grid is capped at the main-mass wall height.
// ---------------------------------------------------------------------------

const WIN_COL_SPACING = 2.8; // meters between window columns along a wall
const WIN_ROW_SPACING = 3.0; // meters between floors
const WIN_W = 1.1;
const WIN_H = 1.3;
const WIN_FIRST_Y = 1.7; // bottom of the first lit row
const WIN_TOP_MARGIN = 1.2; // keep the top row clear of the roofline
const WIN_EDGE_MARGIN = 0.5; // keep windows off the wall corners
const WIN_OFFSET = 0.10; // glass close to the wall; reveals sit 2cm proud of it
const WIN_CAP = 42000; // quad budget (deterministic campus-wide spread)

interface FacadeWindow {
  cx: number;
  cz: number;
  y0: number;
  tx: number;
  tz: number;
  width: number;
  height: number;
  style: 'brick' | 'stone' | 'metal';
  h: number;
}

/** One layout feeds daylight glazing, night lights, and their dark reveals.
 * The shared positions prevent a second facade pattern from drifting out of
 * alignment as the user switches time of day. */
export function windowPlacements(data: CampusData, proj: Projection, daylight: boolean): FacadeWindow[] {
  const wins: FacadeWindow[] = [];
  for (const b of data.buildings) {
    if (daylight && !b.name) continue;
    const name = (b.name ?? '').toLowerCase();
    if (/stadium|arena|fieldhouse|field house|recreation|xfinity|parking garage|garage|utility|scub|hvac/.test(name)) continue;
    if (!b.footprint || b.footprint.length < 3) continue;
    const pts = ringToShapePoints(b.footprint, proj);
    if (pts.length < 3) continue;
    const modern = /iribe|physical sciences|edward st|idea factory|thurgood marshall|hotel|clarice smith|jeong h\. kim|engineering|science|technology/.test(name);
    const historic = TRIMMED_HISTORIC_BUILDINGS.has(b.id) || b.id === 'way/23408799' || b.id === 'way/23580263' || b.id === 'way/23544752';
    const width = modern ? 1.42 : historic ? 1.04 : WIN_W;
    // The sill is wider than the glass. Reserve enough wall at both ends for
    // the entire surround; otherwise the first/last sill hangs past a corner.
    const trimHalfWidth = (width + 0.46) / 2;
    const windowH = modern ? 1.6 : historic ? 1.48 : WIN_H;
    const style: FacadeWindow['style'] = modern ? 'metal' : historic ? 'stone' : 'brick';
    // Windows live on the main mass only: a hipped landmark's walls stop at
    // 80% height (the ridge above carries none); every other part tops out at
    // or above the base walls, so the base height is the right cap.
    const landmark = LANDMARK_MODULES[b.id];
    if (landmark?.build && !landmark.spec.genericWindows) continue;
    const baseH = buildingBaseHeight(b);
    const wallH = landmark?.spec.roof === 'hipped' ? baseH * 0.8 : baseH;
    if (wallH < WIN_FIRST_Y + windowH + WIN_TOP_MARGIN) continue;
    const cambridgeFloors = b.id === 'way/23543989' || b.id === 'way/23543940' || b.id === 'way/23543980'
      ? 4
      : b.id === 'way/23543957' || b.id === 'way/23543927' ? 9 : null;
    const firstRowY = cambridgeFloors ? 1.45 : WIN_FIRST_Y;
    const rowSpacing = cambridgeFloors ? (wallH - 2.7) / cambridgeFloors : WIN_ROW_SPACING;
    const litFrac = 0.25 + 0.2 * hash01(`${b.id}:litfrac`); // 25–45% lit
    const phase = WIN_COL_SPACING * hash01(`${b.id}:winphase`);
    let wi = 0; // window ordinal — hashed lit-or-not, so the subset is stable
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const c = pts[(i + 1) % pts.length];
      const dx = c.x - a.x;
      const dy = c.y - a.y;
      const len = Math.hypot(dx, dy);
      if (len < WIN_EDGE_MARGIN * 2 + trimHalfWidth * 2) continue;
      const ux = dx / len; // edge direction (shape space: x east, y north)
      const uy = dy / len;
      // CCW ring -> interior is left of each edge, so outward is right.
      const ox = uy;
      const oy = -ux;
      for (let d = WIN_EDGE_MARGIN + trimHalfWidth + phase;
        d + trimHalfWidth <= len - WIN_EDGE_MARGIN; d += WIN_COL_SPACING) {
        for (let y0 = firstRowY; y0 + windowH <= wallH - WIN_TOP_MARGIN; y0 += rowSpacing) {
          const lit = hash01(`${b.id}:win:${wi}`) < litFrac;
          const h = hash01(`${b.id}:winord:${wi}`);
          wi++;
          if (!daylight && !lit) continue;
          const offset = daylight ? WIN_OFFSET : WIN_OFFSET + 0.025;
          const mx = a.x + ux * d + ox * offset;
          const my = a.y + uy * d + oy * offset;
          wins.push({
            cx: mx,
            cz: -my, // shape y = north -> world z = -north
            y0,
            tx: ux, // world tangent = (ux, -uy)/len
            tz: -uy,
            width,
            height: windowH,
            style,
            h,
          });
        }
      }
    }
  }
  // Over budget -> deterministic campus-wide spread (same trick as lamps).
  wins.sort((p, q) => p.h - q.h);
  if (wins.length > (daylight ? 30000 : WIN_CAP)) wins.length = daylight ? 30000 : WIN_CAP;
  return wins;
}

function buildWindows(data: CampusData, proj: Projection, daylight = false): THREE.BufferGeometry {
  const wins = windowPlacements(data, proj, daylight);
  const positions = new Float32Array(wins.length * 18);
  let o = 0;
  for (const w of wins) {
    const hw = w.width / 2;
    const ax = w.cx - w.tx * hw;
    const az = w.cz - w.tz * hw;
    const bx = w.cx + w.tx * hw;
    const bz = w.cz + w.tz * hw;
    const y1 = w.y0 + w.height;
    // (A,B,C) + (A,C,D): winding gives the outward normal (tangent x up).
    positions[o++] = ax; positions[o++] = w.y0; positions[o++] = az;
    positions[o++] = bx; positions[o++] = w.y0; positions[o++] = bz;
    positions[o++] = bx; positions[o++] = y1; positions[o++] = bz;
    positions[o++] = ax; positions[o++] = w.y0; positions[o++] = az;
    positions[o++] = bx; positions[o++] = y1; positions[o++] = bz;
    positions[o++] = ax; positions[o++] = y1; positions[o++] = az;
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return geom;
}

/** Recess shadow plus a thin projecting sill. The daytime and night panes
 * both share the same placement; these details remain in the buildings mesh
 * and add no draw calls. */
function buildWindowReveals(data: CampusData, proj: Projection): THREE.BufferGeometry {
  const wins = windowPlacements(data, proj, true);
  const pos: number[] = [];
  const norm: number[] = [];
  const cols: number[] = [];
  const dark = new THREE.Color(0x42494a);
  const metal = new THREE.Color(0x465963);
  const stone = new THREE.Color(0xc7bfaf);
  const brickSill = new THREE.Color(0xab8e7d);
  const metalSill = new THREE.Color(0x899899);
  const quad = (w: FacadeWindow, y0: number, y1: number, width: number, offset: number, color: THREE.Color) => {
    const nx = -w.tz;
    const nz = w.tx;
    const cx = w.cx + nx * offset;
    const cz = w.cz + nz * offset;
    const hw = width / 2;
    const ax = cx - w.tx * hw;
    const az = cz - w.tz * hw;
    const bx = cx + w.tx * hw;
    const bz = cz + w.tz * hw;
    pos.push(ax, y0, az, bx, y0, bz, bx, y1, bz,
      ax, y0, az, bx, y1, bz, ax, y1, az);
    for (let i = 0; i < 6; i++) {
      norm.push(nx, 0, nz);
      cols.push(color.r, color.g, color.b);
    }
  };
  for (const w of wins) {
    // The dark surround sits 8cm behind the glazing plane so both remain
    // depth-distinct while the camera is zoomed out over campus.
    quad(w, w.y0 - 0.14, w.y0 + w.height + 0.14, w.width + 0.28, -0.08,
      w.style === 'metal' ? metal : dark);
    quad(w, w.y0 - 0.2, w.y0 - 0.08, w.width + 0.46, 0.055,
      w.style === 'metal' ? metalSill : w.style === 'stone' ? stone : brickSill);
  }
  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geom.setAttribute('normal', new THREE.Float32BufferAttribute(norm, 3));
  geom.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  return geom;
}

// ---------------------------------------------------------------------------
// Contact shadows — merged fake-AO blobs, one per building: the footprint
// triangulated flat, scaled 1.06x about its centroid, at CONTACT_SHADOW_Y
// (.18 — above grass .10 / water .14 / parking .16, below paths .20, so the
// skirt shows on every terrain surface but never smears over circulation).
// Position-only, non-indexed, NaN-free. Contract with scene.ts: wrapped
// defensively (`if (geoms.contactShadows)`) in a MeshBasicMaterial
// ({ color: 0x1a1410, transparent: true, opacity: 0.18, depthWrite: false }).
// ---------------------------------------------------------------------------

const CONTACT_SHADOW_SCALE = 1.06;

function buildContactShadows(data: CampusData, proj: Projection): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  for (const b of data.buildings) {
    if (!b.footprint || b.footprint.length < 3) continue;
    const pts = ringToShapePoints(b.footprint, proj);
    if (pts.length < 3) continue;
    let cx = 0;
    let cy = 0;
    for (const p of pts) {
      cx += p.x;
      cy += p.y;
    }
    cx /= pts.length;
    cy /= pts.length;
    const scaled = pts.map(
      (p) =>
        new THREE.Vector2(
          cx + (p.x - cx) * CONTACT_SHADOW_SCALE,
          cy + (p.y - cy) * CONTACT_SHADOW_SCALE,
        ),
    );
    const shape = new THREE.Shape(scaled);
    // Courtyards get no ground shadow — shrink each hole by the same 6% so
    // the blob still spills inward from the courtyard-facing walls.
    for (const hole of holeShapePoints(b, proj)) {
      const { cx: hx, cy: hy } = centroidOf(hole);
      shape.holes.push(
        new THREE.Path([...scaleAbout(hole, hx, hy, 1 / CONTACT_SHADOW_SCALE)].reverse()),
      );
    }
    const geom = new THREE.ShapeGeometry(shape, 1);
    geom.rotateX(-Math.PI / 2);
    geom.translate(0, CONTACT_SHADOW_Y, 0);
    const flat = geom.toNonIndexed();
    flat.deleteAttribute('uv');
    flat.deleteAttribute('normal'); // unlit MeshBasicMaterial needs positions only
    parts.push(flat);
  }
  return mergeAll(parts);
}

// ---------------------------------------------------------------------------

export function buildSceneGeometries(data: CampusData, proj: Projection): CampusGeometries {
  const ground = new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE);
  ground.rotateX(-Math.PI / 2);
  const lamps = buildLamps(data, proj);
  return {
    ground,
    buildings: buildBuildings(data, proj),
    roads: buildRoads(data, proj),
    areas: buildAreas(data, proj),
    water: buildWater(data, proj),
    trees: buildTrees(data, proj),
    contactShadows: buildContactShadows(data, proj),
    lampPoles: lamps.poles,
    lampHeads: lamps.heads,
    lampGlow: buildLampGlow(lamps.points, lamps.flickerIndices),
    lampFlickerHeads: lamps.flickerHeads,
    lampFlickerGlow: lamps.flickerGlow,
    lampFlickerLate: lamps.flickerLate,
    snowPatches: buildSnowPatches(data, proj),
    windows: buildWindows(data, proj),
    dayWindows: buildWindows(data, proj, true),
    shrubs: buildShrubs(data, proj, lamps.points),
    parkedCars: buildParkedCars(data, proj),
  };
}
