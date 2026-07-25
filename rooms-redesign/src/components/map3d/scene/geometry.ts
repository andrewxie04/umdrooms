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
import {
  centroidOf,
  extrudeFootprint,
  hash01,
  mergeAll,
  outsetRing,
  ringToShapePoints,
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
  /** Merged lit-window facade quads (deterministic lit subset only, positions
   * only — no normals/uv/color); scene.ts drives the warm glow opacity. */
  windows: THREE.BufferGeometry;
  /** Merged water/fountain/pool polygons + waterway ribbons, pulled out of
   * the flat areas mesh so scene.ts can use a dedicated MeshPhongMaterial
   * (soft sun/moon glint). Baked vertex colors: teal shore -> deep-blue
   * middle gradient stack + a darker shore-outline ring. */
  water: THREE.BufferGeometry;
  /** Merged squashed-icosahedron shrubs, vertex-colored muted greens. */
  shrubs: THREE.BufferGeometry;
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
const COLORS = {
  building: new THREE.Color(0xf8f4ea), // bright warm off-white (per-building hue+lightness jitter)
  road: new THREE.Color(0x9d9c96), // cooler grays, less tan
  service: new THREE.Color(0xb1b0a8),
  path: new THREE.Color(0xcccabf), // lightest
  grass: new THREE.Color(0x8ab06e), // clear warm green
  water: new THREE.Color(0x7ea9c8), // clear sky blue
  fountain: new THREE.Color(0x7ea9c8), // same blue as open water
  pool: new THREE.Color(0x7ea9c8), // same blue as open water
  parking: new THREE.Color(0x84837b), // neutral dark gray
  sport: new THREE.Color(0x7b9c5e), // deeper green than grass
  tree: new THREE.Color(0x7c9068),
  treeTop: new THREE.Color(0x87996f),
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

function buildingTint(id: string): THREE.Color {
  const c = COLORS.building.clone();
  c.offsetHSL(
    (hash01(`${id}:hh`) - 0.5) * 0.04, // ±2% hue variance, not just lightness
    (hash01(`${id}:ss`) - 0.5) * 0.05,
    (hash01(`${id}:ll`) - 0.5) * 0.055,
  );
  return c;
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

/** Tallest point of the building including its landmark roof treatment
 * (parapet setback / hipped ridge / spire cone) or a custom builder's
 * declared maxHeight. Plain extrusions top out at the base height. */
export function buildingMaxHeight(b: CampusBuilding): number {
  const base = buildingBaseHeight(b);
  const landmark = LANDMARK_MODULES[b.id];
  if (!landmark) return base;
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

function buildBuildings(data: CampusData, proj: Projection): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  for (const b of data.buildings) {
    if (!b.footprint || b.footprint.length < 3) continue;
    const pts = ringToShapePoints(b.footprint, proj);
    if (pts.length < 3) continue;
    const landmark = LANDMARK_MODULES[b.id];
    if (landmark) {
      const base = buildingBaseHeight(b);
      if (landmark.build) {
        // Custom per-building builder module (scene/landmarks/buildings/).
        parts.push(...landmark.build(makeLandmarkCtx(pts, base, landmark.spec)));
      } else {
        parts.push(...landmarkPresetParts(pts, base, landmark.spec));
      }
      continue;
    }
    parts.push(withColor(extrudeFootprint(pts, buildingBaseHeight(b)), buildingTint(b.id)));
  }
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
  return extrudeFootprint(shell, buildingMaxHeight(b) + HIGHLIGHT_MARGIN);
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
// Trees — two-cone low-poly pines (only ~24, decorative). Scaled ~1.8x up
// from the original tiny pines so canopies read at whole-campus zoom; the
// deterministic per-tree hash jitter is preserved.
// ---------------------------------------------------------------------------

const TREE_SCALE = 1.8; // campus-wide enlargement (canopy radius AND height)

function buildTrees(data: CampusData, proj: Projection): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  data.trees.forEach(([lng, lat], i) => {
    const p = proj.toLocal(lng, lat);
    const s = (0.85 + 0.3 * hash01(`tree:${i}`)) * TREE_SCALE;
    const lower = new THREE.ConeGeometry(2.6 * s, 5.5 * s, 6);
    lower.translate(p.x, 2.75 * s, p.z);
    parts.push(withColor(lower, COLORS.tree));
    const upper = new THREE.ConeGeometry(1.7 * s, 3.6 * s, 6);
    upper.translate(p.x, 5.6 * s, p.z);
    parts.push(withColor(upper, COLORS.treeTop));
  });
  return mergeAll(parts);
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

  const poleParts: THREE.BufferGeometry[] = [];
  const headParts: THREE.BufferGeometry[] = [];
  for (const p of accepted) {
    const pole = new THREE.CylinderGeometry(0.09, 0.14, LAMP_POLE_HEIGHT, 5);
    pole.translate(p.x, LAMP_POLE_HEIGHT / 2, p.z);
    poleParts.push(pole);
    const head = new THREE.SphereGeometry(0.45, 6, 5);
    head.translate(p.x, LAMP_HEAD_Y, p.z);
    headParts.push(head);
  }
  return { poles: mergeAll(poleParts), heads: mergeAll(headParts), points: accepted };
}

/** Flat ground-glow discs under every accepted lamp. Merged into ONE
 * geometry; scene.ts applies a radial-gradient texture and drives opacity
 * from sun elevation (invisible by day, soft warm pools at night). */
function buildLampGlow(points: LampPoint[]): THREE.BufferGeometry {
  const parts: THREE.BufferGeometry[] = [];
  for (const p of points) {
    const disc = new THREE.CircleGeometry(LAMP_POOL_RADIUS, 20);
    disc.rotateX(-Math.PI / 2);
    disc.translate(p.x, LAMP_POOL_Y, p.z);
    const flat = disc.index ? disc.toNonIndexed() : disc;
    // KEEP uv: scene.ts maps a radial-gradient texture through it (uv spans
    // the unit square per disc, so each disc samples the full glow falloff).
    parts.push(flat);
  }
  return mergeAll(parts);
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
// a window grid (columns ~2.8m, rows ~3.0m) on every building's MAIN mass;
// only LIT windows are baked (unlit ones would be invisible at night anyway),
// so day mode renders nothing extra. Quads float 6cm off the facade so they
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
const WIN_OFFSET = 0.06; // meters off the facade — z-fighting guard
const WIN_CAP = 42000; // quad budget (deterministic campus-wide spread)

function buildWindows(data: CampusData, proj: Projection): THREE.BufferGeometry {
  interface Win {
    cx: number;
    cz: number;
    y0: number;
    tx: number;
    tz: number;
    h: number;
  }
  const wins: Win[] = [];
  for (const b of data.buildings) {
    if (!b.footprint || b.footprint.length < 3) continue;
    const pts = ringToShapePoints(b.footprint, proj);
    if (pts.length < 3) continue;
    // Windows live on the main mass only: a hipped landmark's walls stop at
    // 80% height (the ridge above carries none); every other part tops out at
    // or above the base walls, so the base height is the right cap.
    const landmark = LANDMARK_MODULES[b.id];
    const baseH = buildingBaseHeight(b);
    const wallH = landmark?.spec.roof === 'hipped' ? baseH * 0.8 : baseH;
    if (wallH < WIN_FIRST_Y + WIN_H + WIN_TOP_MARGIN) continue;
    const litFrac = 0.25 + 0.2 * hash01(`${b.id}:litfrac`); // 25–45% lit
    const phase = WIN_COL_SPACING * hash01(`${b.id}:winphase`);
    let wi = 0; // window ordinal — hashed lit-or-not, so the subset is stable
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const c = pts[(i + 1) % pts.length];
      const dx = c.x - a.x;
      const dy = c.y - a.y;
      const len = Math.hypot(dx, dy);
      if (len < WIN_EDGE_MARGIN * 2 + WIN_W) continue;
      const ux = dx / len; // edge direction (shape space: x east, y north)
      const uy = dy / len;
      // CCW ring -> interior is left of each edge, so outward is right.
      const ox = uy;
      const oy = -ux;
      for (let d = WIN_EDGE_MARGIN + phase; d + WIN_W / 2 <= len - WIN_EDGE_MARGIN; d += WIN_COL_SPACING) {
        for (let y0 = WIN_FIRST_Y; y0 + WIN_H <= wallH - WIN_TOP_MARGIN; y0 += WIN_ROW_SPACING) {
          const lit = hash01(`${b.id}:win:${wi}`) < litFrac;
          const h = hash01(`${b.id}:winord:${wi}`);
          wi++;
          if (!lit) continue;
          const mx = a.x + ux * d + ox * WIN_OFFSET;
          const my = a.y + uy * d + oy * WIN_OFFSET;
          wins.push({
            cx: mx,
            cz: -my, // shape y = north -> world z = -north
            y0,
            tx: ux, // world tangent = (ux, -uy)/len
            tz: -uy,
            h,
          });
        }
      }
    }
  }
  // Over budget -> deterministic campus-wide spread (same trick as lamps).
  wins.sort((p, q) => p.h - q.h);
  if (wins.length > WIN_CAP) wins.length = WIN_CAP;

  const positions = new Float32Array(wins.length * 18);
  let o = 0;
  const hw = WIN_W / 2;
  for (const w of wins) {
    const ax = w.cx - w.tx * hw;
    const az = w.cz - w.tz * hw;
    const bx = w.cx + w.tx * hw;
    const bz = w.cz + w.tz * hw;
    const y1 = w.y0 + WIN_H;
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
    const geom = new THREE.ShapeGeometry(new THREE.Shape(scaled), 1);
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
    lampGlow: buildLampGlow(lamps.points),
    windows: buildWindows(data, proj),
    shrubs: buildShrubs(data, proj, lamps.points),
    parkedCars: buildParkedCars(data, proj),
  };
}
