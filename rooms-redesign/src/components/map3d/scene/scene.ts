// src/components/map3d/scene/scene.ts
//
// createCampusScene — self-contained three.js campus renderer implementing
// the plan.md Phase 2 scene contract. Loads campus-data.json, builds merged
// geometry (few draw calls), a real solar day/night cycle (NOAA-style sun
// elevation/azimuth for College Park, continuous 3-stop palette, light
// direction following the sun so shadows sweep across campus), custom map
// controls with flyTo tweens, a selection pulse ring, and a dirty-checked
// render loop: renderer.render only runs when something changed, while
// onFrame callbacks fire every tick (cheap) so HTML overlay markers stay in
// sync.

import * as THREE from 'three';
import { MapControls } from './controls';
import type { CameraPose } from './controls';
import { buildSceneGeometries, buildingSolidGeometry } from './geometry';
import { extrudeFootprint, mergeAll, outsetRing, ringToShapePoints } from './geom-utils';
import { buildDrivingCarGeometry } from './cars';
import { initEasterEggs } from './eastereggs';
import { createSeasons } from './seasons';
import { PaletteController } from './palette';
import { createProjection } from './projection';
import type { CampusData, CampusSceneHandle } from './types';
import { PARKING_HIGHLIGHT_TARGETS } from '../../../lib/parkingData.js';

const DATA_URL = `${import.meta.env.BASE_URL}campus-data.json`;

const FOV = 45;
const MIN_DISTANCE = 120;
const MAX_DISTANCE = 4000;
const MAX_PHI = 1.15; // rad from +y — min pitch ~24 deg above horizon
const PAN_BOUND = 2300; // meters around the campus center — covers Paint Branch + Lake Artemesia at the bbox east/south edges
/** The canonical "home" camera pose — the load-in view, and what the compass
 * recenter button and back-to-list navigation return to. Expressed in the
 * flyTo contract's units (lat/lng/zoom/pitch/bearing) so CampusMap3D can
 * replay it through `flyTo` verbatim; the initial controls pose below is
 * derived from the same numbers. */
export const HOME_VIEW = {
  lat: 38.9864,
  lng: -76.94496,
  zoom: 15.74, // distance = 2600 * 2^(15 - zoom) ≈ 1557 m
  pitch: 48,
  bearing: -20,
};
/** Canonical top-down pose for 2D mode — what the 2D toggle flies to. */
export const HOME_VIEW_2D = {
  lat: 38.98803,
  lng: -76.94516,
  zoom: 15.6, // distance = 2600 * 2^(15 - zoom) ≈ 1714 m
  pitch: 90,
  bearing: -20,
};
const INITIAL_DISTANCE = 2600 * Math.pow(2, 15 - HOME_VIEW.zoom);
const INITIAL_PHI = THREE.MathUtils.degToRad(90 - HOME_VIEW.pitch);
const INITIAL_THETA = THREE.MathUtils.degToRad(HOME_VIEW.bearing);
const FLYTO_DURATION_MS = 1200;
const PULSE_PERIOD_MS = 1600;
const PULSE_COLOR = 0xe21833; // UMD red
const PULSE_Y = 0.7;
/** Parking-lot highlight plates float above the road tier (roads sit at 0.4)
 * so road-covered parking lanes still show their highlight. */
const PARKING_PLATE_Y = 0.45;
/** Cap on the expanding pulse ring (meters) — past this it smears into a
 * huge red blob at high camera pitch instead of reading as a ring. */
const PULSE_MAX_RADIUS = 28;
const VISIBILITY_MARGIN = 40; // css px beyond the canvas rect

// -- campus lamp glow ------------------------------------------------------------
/** Lamp heads are unlit fixtures at/above this sun elevation (degrees)… */
const LAMP_GLOW_OFF_ELEV = 6;
/** …and reach full warm glow at/below this one (just past golden hour). */
const LAMP_GLOW_FULL_ELEV = -3;
/** Peak emissiveIntensity for the #ffd9a0 head material at night. */
const LAMP_GLOW_MAX = 2.6;
/** Fraction of each flicker lamp's cycle spent stuttering; the rest is steady.
 * Small on purpose — a lamp that flickers constantly reads as broken chrome
 * rather than a detail you notice once and enjoy. */
const FLICKER_BURST_FRACTION = 0.09;
/** How much of the head's dip the ground pool follows (0 = steady pool). */
const FLICKER_POOL_RESPONSE = 0.5;
/** Peak opacity for the warm ground-glow pools under each lamp at night. */
const LAMP_POOL_MAX_OPACITY = 0.3;
/** Min visible change before the material is touched (dirty-check friendly). */
const LAMP_GLOW_EPS = 0.004;

// -- lit windows (cozy night mode) ------------------------------------------------
/** Window glow is invisible at/above this sun elevation (degrees)… */
const WINDOW_GLOW_OFF_ELEV = 4;
/** …and reaches full warm glow at/below this one (ramping up through dusk). */
const WINDOW_GLOW_FULL_ELEV = -6;
/** Peak opacity for the #ffd9a0 window quads at night. */
const WINDOW_GLOW_MAX = 0.92;

// -- solar cycle ---------------------------------------------------------------
/** Campus location: College Park, MD. */
const CAMPUS_LAT = 38.9869;
const CAMPUS_LNG = -76.9426;
/** How often the real sun position is recomputed in auto mode. */
const SOLAR_RECOMPUTE_SECONDS = 1;
/** Fixed distance of the directional light from campus center along the sun
 * vector — shadow ortho stays fitted to campus regardless of sun angle. */
const SUN_DISTANCE = 4200;
/** Min elevation used for the light direction while the sun is up, so golden
 * hour shadows get long but never degenerate/infinitely stretched. */
const MIN_LIGHT_ELEV = 4;
/** Synthetic elevations eased toward in the forced modes. */
const FORCE_DAY_ELEV = 35;
const FORCE_NIGHT_ELEV = -20;
/** Fixed light angles: forced day uses the classic warm southeast sun; night
 * (real or forced) uses a fixed cool moonlight from the northwest. */
const FORCE_DAY_AZ = 155;
const NIGHT_AZ = 320;
const NIGHT_LIGHT_ELEV = 42;
/** Convergence rate for eased transitions (elevation + forced azimuth).
 * lambda 2 reaches >99% of the target in ~2.5s — forced day/night eases in
 * smoothly, never snaps. */
const TRANSITION_LAMBDA = 2;

export type SceneTimeMode = 'auto' | 'force-day' | 'force-night';

/** Extended scene handle: the solar time-of-day API. `setDarkMode` is kept
 * from the base contract and delegates to the forced modes. */
export interface CampusSceneHandleV2 extends CampusSceneHandle {
  /** 'auto' follows the real solar cycle; the forced modes ease into a fixed
   * day/night look over ~2.5s. */
  setTimeMode(mode: SceneTimeMode): void;
  /** Current REAL solar elevation in degrees at the campus (negative = sun
   * below the horizon), independent of the active time mode. */
  getSunElevation(): number;
  /** Drive the sky, sun angle and time-of-day eggs from a specific instant
   * instead of the live clock — schedule mode shows the campus as it will
   * look at the time the user picked. Pass null to follow the real clock
   * again. Only affects 'auto' time mode; an explicit day/night toggle still
   * wins, since that is a deliberate user choice. */
  setSolarTime(date: Date | null): void;
  /** QA/telemetry snapshot of the current (post-damping) camera pose:
   * target offsets x/z in meters (east/south of campus center), distance in
   * meters, phi = polar angle from +y (radians), theta = bearing of the view
   * direction (radians, clockwise from north). */
  getPose(): { x: number; z: number; distance: number; phi: number; theta: number };
  /** Easter egg: Turtle Mode — swaps the driving fleet to crawling turtles
   * for 60s (auto-restores). Optional so older handles stay assignable. */
  setTurtleMode?(active: boolean): void;
}

/** Compact NOAA-style solar approximation (accurate to ~1 arcminute for this
 * century). Returns sun elevation and azimuth (degrees, azimuth clockwise
 * from north) for the campus location at the given instant. Timezone-free:
 * works off UTC minutes, so the result is correct regardless of the device's
 * local timezone. */
function computeSunPosition(date: Date): { elevation: number; azimuth: number } {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - start) / 86400000);
  const utcHours =
    date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;
  const gamma = ((2 * Math.PI) / 365) * (dayOfYear - 1 + (utcHours - 12) / 24);

  const eqtime =
    229.18 *
    (0.000075 +
      0.001868 * Math.cos(gamma) -
      0.032077 * Math.sin(gamma) -
      0.014615 * Math.cos(2 * gamma) -
      0.040849 * Math.sin(2 * gamma)); // minutes
  const decl =
    0.006918 -
    0.399912 * Math.cos(gamma) +
    0.070257 * Math.sin(gamma) -
    0.006758 * Math.cos(2 * gamma) +
    0.000907 * Math.sin(2 * gamma) -
    0.002697 * Math.cos(3 * gamma) +
    0.00148 * Math.sin(3 * gamma); // radians

  // True solar time (minutes) at the campus longitude, straight from UTC.
  const tst = utcHours * 60 + eqtime + 4 * CAMPUS_LNG;
  const ha = ((tst / 4 - 180) * Math.PI) / 180; // hour angle, radians

  const lat = (CAMPUS_LAT * Math.PI) / 180;
  const cosZenith =
    Math.sin(lat) * Math.sin(decl) + Math.cos(lat) * Math.cos(decl) * Math.cos(ha);
  const zenith = Math.acos(THREE.MathUtils.clamp(cosZenith, -1, 1));
  const elevation = 90 - (zenith * 180) / Math.PI;

  const sinZenith = Math.sin(zenith);
  let azimuth = 180; // fallback: due south
  if (sinZenith > 1e-6) {
    const cosAz = THREE.MathUtils.clamp(
      (Math.sin(lat) * cosZenith - Math.sin(decl)) / (Math.cos(lat) * sinZenith),
      -1,
      1,
    );
    const az = (Math.acos(cosAz) * 180) / Math.PI;
    azimuth = ha > 0 ? (az + 180) % 360 : (540 - az) % 360;
  }
  return { elevation, azimuth };
}

/** Soft radial glow texture (white core -> transparent edge) shared by every
 * lamplight pool disc. Generated once on a tiny canvas — no asset fetch. */
function makeRadialGlowTexture(): THREE.CanvasTexture {
  const size = 128;
  const cv = document.createElement('canvas');
  cv.width = size;
  cv.height = size;
  const ctx = cv.getContext('2d');
  if (ctx) {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.4, 'rgba(255,255,255,0.55)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  return new THREE.CanvasTexture(cv);
}

export async function createCampusScene(
  container: HTMLElement,
  opts: { darkMode: boolean; timeMode?: SceneTimeMode },
): Promise<CampusSceneHandleV2> {
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error(`Failed to load campus-data.json (HTTP ${res.status})`);
  const data = (await res.json()) as CampusData;
  const proj = createProjection(data);

  // -- renderer ---------------------------------------------------------------
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const canvas = renderer.domElement;
  canvas.style.display = 'block';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.touchAction = 'none';
  canvas.style.userSelect = 'none';
  canvas.style.outline = 'none';
  container.appendChild(canvas);

  // -- scene / camera -----------------------------------------------------------
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff); // driven by the palette
  const fog = new THREE.Fog(0xffffff, 3400, 10000);
  scene.fog = fog;
  const camera = new THREE.PerspectiveCamera(FOV, 1, 10, 16000);

  // -- lights -------------------------------------------------------------------
  const hemi = new THREE.HemisphereLight(0xffffff, 0x888888, 1);
  scene.add(hemi);
  const sun = new THREE.DirectionalLight(0xffffff, 2);
  sun.position.set(1250, 2100, 950); // warm sun from the southeast
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -1800;
  sun.shadow.camera.right = 1800;
  sun.shadow.camera.top = 1800;
  sun.shadow.camera.bottom = -1800;
  sun.shadow.camera.near = 200;
  sun.shadow.camera.far = 6500;
  sun.shadow.bias = -0.0006;
  sun.shadow.normalBias = 3;
  sun.shadow.camera.updateProjectionMatrix();
  scene.add(sun);
  scene.add(sun.target); // target stays at the campus center (origin)

  // -- merged campus geometry ------------------------------------------------------
  const geoms = buildSceneGeometries(data, proj);
  const groundMat = new THREE.MeshLambertMaterial({ color: 0xa8b190 }); // muted warm-sage lawn base — slightly lighter/dustier than mapped grass (#8ab06e) so mowed lawns still read as distinct
  const buildingMat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const flatMat = new THREE.MeshLambertMaterial({ vertexColors: true });

  const ground = new THREE.Mesh(geoms.ground, groundMat);
  ground.receiveShadow = true;
  const buildings = new THREE.Mesh(geoms.buildings, buildingMat);
  buildings.castShadow = true;
  buildings.receiveShadow = true;
  const roads = new THREE.Mesh(geoms.roads, flatMat);
  roads.receiveShadow = true;
  const areas = new THREE.Mesh(geoms.areas, flatMat);
  areas.receiveShadow = true;
  // Water: dedicated merged mesh (water/fountain/pool polygons + waterway
  // ribbons, vertex-colored shore->deep gradient + shore ring baked in
  // geometry.ts). A subtle MeshPhongMaterial gives a soft specular glint from
  // the palette-driven sun by day and the cool moonlight at night — no
  // shaders, no per-frame work.
  const waterMat = new THREE.MeshPhongMaterial({
    vertexColors: true,
    shininess: 55, // moderate — a soft broad glint, not a hard sparkle
    specular: new THREE.Color(0xd8e4ec), // pale neutral glint (warm sun / cool moon tint it)
  });
  const water = new THREE.Mesh(geoms.water, waterMat);
  water.receiveShadow = true;
  const trees = new THREE.Mesh(geoms.trees, flatMat);
  trees.castShadow = true;
  // Lying snow: flat blobs over the lawns, hidden outside winter. Sits above
  // grass/sport but below paths, so walkways read as cleared.
  const snowPatchMat = new THREE.MeshLambertMaterial({
    color: 0xf4f8fa,
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const snowPatches = new THREE.Mesh(geoms.snowPatches, snowPatchMat);
  snowPatches.receiveShadow = true;
  snowPatches.visible = false; // seasons drives this
  scene.add(ground, buildings, roads, areas, water, trees, snowPatches);

  // Campus lamps: ONE merged dark-pole mesh + ONE merged head mesh. The head
  // material carries the warm #ffd9a0 glow — its emissiveIntensity is driven
  // by the sun elevation in updateTimeOfDay (unlit fixture by day, glowing at
  // dusk/night). Two extra draw calls, no per-frame work.
  const lampPoleMat = new THREE.MeshLambertMaterial({ color: 0x3d3a34 }); // dark warm charcoal
  const lampHeadMat = new THREE.MeshLambertMaterial({
    color: 0x6b675e, // unlit fixture gray by day
    emissive: new THREE.Color(0xffd9a0),
    emissiveIntensity: 0,
  });
  const lampPoles = new THREE.Mesh(geoms.lampPoles, lampPoleMat);
  const lampHeads = new THREE.Mesh(geoms.lampHeads, lampHeadMat);
  scene.add(lampPoles, lampHeads);

  // Warm lamplight pools: ONE merged mesh of flat discs under every lamp,
  // softened by a shared radial-gradient texture. Opacity follows sun
  // elevation alongside the lamp heads — invisible by day, warm pools at
  // night. One extra draw call, no per-frame work.
  const lampPoolTexture = makeRadialGlowTexture();
  const lampPoolMat = new THREE.MeshBasicMaterial({
    map: lampPoolTexture,
    color: 0xffc07a, // warm amber pool
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const lampPools = new THREE.Mesh(geoms.lampGlow, lampPoolMat);
  lampPools.renderOrder = 1; // over the flat fills, with the contact shadows
  lampPools.visible = false; // until the first dusk ramp
  scene.add(lampPools);

  // -- flickering lamps ------------------------------------------------------
  // A handful of lamps with a bad ballast. geometry.ts held these out of the
  // merged head/pool meshes so each can own its material: the shared material
  // would blink all ~820 lamps in lockstep, reading as a power cut. Driven in
  // updateLampFlicker AFTER the easter eggs, so 2AM dimming still applies.
  interface FlickerLamp {
    head: THREE.Mesh;
    pool: THREE.Mesh;
    headMat: THREE.MeshLambertMaterial;
    poolMat: THREE.MeshBasicMaterial;
    /** Only stutters during the 2AM window (the Mall-heavy late set). */
    lateOnly: boolean;
    /** Per-lamp constants so no two stutter together. */
    period: number;
    phase: number;
    rate: number;
    depth: number;
  }
  const flickerLamps: FlickerLamp[] = geoms.lampFlickerHeads.map((headGeom, i) => {
    const headMat = lampHeadMat.clone();
    const poolMat = lampPoolMat.clone();
    poolMat.map = lampPoolTexture; // clone() keeps the ref, but be explicit
    const head = new THREE.Mesh(headGeom, headMat);
    const pool = new THREE.Mesh(geoms.lampFlickerGlow[i], poolMat);
    pool.renderOrder = 1;
    pool.visible = false;
    scene.add(head, pool);
    const h = (s: string): number => {
      let x = 2166136261;
      const id = `flick:${i}:${s}`;
      for (let k = 0; k < id.length; k++) {
        x ^= id.charCodeAt(k);
        x = Math.imul(x, 16777619);
      }
      x ^= x >>> 13;
      x = Math.imul(x, 0x5bd1e995);
      x ^= x >>> 15;
      return (x >>> 0) / 4294967296;
    };
    return {
      head,
      pool,
      headMat,
      poolMat,
      lateOnly: geoms.lampFlickerLate[i] === true,
      period: 8 + h('p') * 10, // a burst every 8–18s
      phase: h('ph'),
      // Stutter speed. Kept at 5–9 Hz deliberately: fast enough to read as a
      // failing ballast, slow enough to stay clear of strobe territory, and
      // comfortably sampled at 60fps (a 20Hz+ wave aliased into a different
      // pattern at every framerate).
      rate: 5 + h('r') * 4,
      depth: 0.1 + h('d') * 0.15, // how dark the low part of the stutter goes
    };
  });

  // Lit windows: ONE merged mesh of facade quads (geometry.ts bakes only the
  // deterministic 25–45% lit subset per building). The unlit warm material
  // IS the glow — its opacity follows sun elevation in updateTimeOfDay
  // (0 by day, full at night), so day mode is completely untouched.
  const windowMat = new THREE.MeshBasicMaterial({
    color: 0xffd9a0, // warm incandescent
    transparent: true,
    opacity: 0,
    depthWrite: false,
  });
  const windows = new THREE.Mesh(geoms.windows, windowMat);
  windows.renderOrder = 1;
  windows.visible = false; // zero cost by day
  scene.add(windows);

  // Shrubs: ONE merged vertex-colored mesh (muted deep greens) — one draw call.
  const shrubMat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const shrubs = new THREE.Mesh(geoms.shrubs, shrubMat);
  shrubs.receiveShadow = true;
  scene.add(shrubs);

  // Parked cars: ONE merged vertex-colored mesh (cars.ts bakes deterministic
  // stalls into every parking lot) — one draw call, real shadows by day.
  const parkedCarMat = new THREE.MeshLambertMaterial({ vertexColors: true });
  const parkedCars = new THREE.Mesh(geoms.parkedCars, parkedCarMat);
  parkedCars.castShadow = true;
  parkedCars.receiveShadow = true;
  scene.add(parkedCars);

  // Fake-AO contact-shadow blobs (geometry.ts contract — wrapped defensively):
  // a soft dark skirt around every building footprint for stronger grounding.
  if (geoms.contactShadows) {
    const contactShadowMat = new THREE.MeshBasicMaterial({
      color: 0x1a1410,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
    });
    const contactShadows = new THREE.Mesh(geoms.contactShadows, contactShadowMat);
    contactShadows.renderOrder = 1; // over the flat fills, under the pulse ring
    scene.add(contactShadows);
  }

  // -- driving cars (animated campus traffic) --------------------------------------
  // A handful of low-poly cars circulating on the named campus loop roads.
  // ONE InstancedMesh (merged body+cabin, per-instance color) + ONE
  // InstancedMesh of warm headlight quads that fade in with the same
  // sun-elevation curve as the lamp heads. Matrices update every frame in the
  // render loop; while any car is moving the frame is marked dirty (same
  // pattern as the selection pulse ring). Cars ride the right lane, ping-pong
  // at polyline ends, and pause briefly at random intervals (traffic feel).
  const DRIVE_ROAD_Y = 0.42; // just above the road ribbon tier (ROAD_Y.road = .4)
  const DRIVE_CAR_COUNT = 30; // ~4 per named loop road
  /** US-1 (Baltimore Avenue) — the big arterial along the east edge. It gets
   * its own dedicated fleet: denser, faster, and no stop-and-go pauses. */
  const HIGHWAY_ROAD_NAME = 'Baltimore Avenue';
  const HIGHWAY_CAR_COUNT = 18;
  /** Stylized upscaling so moving cars stay legible at browsing zooms — at
   * real scale a 4.4 m car is a handful of px from a few hundred meters up,
   * which read as "no cars" even though they were driving. */
  const DRIVE_CAR_SCALE = 1.8;
  /** Preferred circulation roads, in priority order. The data fragments named
   * roads into many short polylines; same-name fragments whose endpoints meet
   * (within STITCH_EPS) are stitched into one long route. */
  const DRIVE_ROAD_NAMES = [
    'Campus Drive',
    'Regents Drive',
    'Stadium Drive',
    'Paint Branch Drive',
    'Union Lane',
    'Mowatt Lane',
    'Preinkert Drive',
    'Valley Drive',
  ];
  const DRIVE_MIN_ROUTE_LEN = 220; // meters — shorter fragments aren't drivable
  /** Warm headlight quads: opacity peak at full night (same curve as lamps). */
  const HEADLIGHT_MAX_OPACITY = 0.95;

  /** Deterministic 32-bit hash -> [0, 1). Same recipe as geometry.ts/cars.ts. */
  const driveHash01 = (id: string): number => {
    let h = 2166136261;
    for (let i = 0; i < id.length; i++) {
      h ^= id.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    h ^= h >>> 13;
    h = Math.imul(h, 0x5bd1e995);
    h ^= h >>> 15;
    return (h >>> 0) / 4294967296;
  };

  interface DriveRoute {
    name: string;
    pts: { x: number; z: number }[];
    /** Cumulative arc length, cum[0] = 0. */
    cum: number[];
    length: number;
  }

  interface DriveCar {
    route: DriveRoute;
    /** Arc-length position along the route. */
    s: number;
    dir: 1 | -1;
    speed: number; // m/s
    lane: number; // right-lane offset, meters
    pauseUntil: number; // perf-clock seconds
    nextPauseAt: number; // perf-clock seconds
  }

  /** Same-name road fragments whose endpoints sit within this (meters) are
   * considered contiguous and stitched into one chain. */
  const STITCH_EPS = 14;

  const driveRoutes: DriveRoute[] = [];
  let highwayRoute: DriveRoute | null = null;
  {
    type Pt = { x: number; z: number };
    const routeNames = [...DRIVE_ROAD_NAMES, HIGHWAY_ROAD_NAME];
    const fragsByName = new Map<string, Pt[][]>();
    for (const road of data.roads) {
      if (road.kind !== 'road' || !road.name) continue;
      if (!routeNames.includes(road.name)) continue;
      if (!road.line || road.line.length < 2) continue;
      const pts: Pt[] = [];
      for (const [lng, lat] of road.line) {
        const p = proj.toLocal(lng, lat);
        const last = pts[pts.length - 1];
        if (last && Math.hypot(last.x - p.x, last.z - p.z) < 0.2) continue;
        pts.push(p);
      }
      if (pts.length < 2) continue;
      const frags = fragsByName.get(road.name);
      if (frags) frags.push(pts);
      else fragsByName.set(road.name, [pts]);
    }

    const fragLen = (f: Pt[]): number => {
      let len = 0;
      for (let i = 1; i < f.length; i++) len += Math.hypot(f[i].x - f[i - 1].x, f[i].z - f[i - 1].z);
      return len;
    };
    const near = (a: Pt, b: Pt): boolean => Math.hypot(a.x - b.x, a.z - b.z) < STITCH_EPS;

    /** Greedily grows the longest fragment by attaching same-name fragments
     * at either end (reversed as needed) until nothing else connects. */
    const stitchRoute = (name: string): DriveRoute | null => {
      const frags = fragsByName.get(name);
      if (!frags || frags.length === 0) return null;
      const remaining = [...frags].sort((a, b) => fragLen(b) - fragLen(a));
      const chain = remaining.shift()!.slice();
      let grew = true;
      while (grew && remaining.length > 0) {
        grew = false;
        for (let i = 0; i < remaining.length; i++) {
          const f = remaining[i];
          const head = chain[0];
          const tail = chain[chain.length - 1];
          const fs = f[0];
          const fe = f[f.length - 1];
          if (near(tail, fs)) chain.push(...f.slice(1));
          else if (near(tail, fe)) chain.push(...f.slice(0, -1).reverse());
          else if (near(head, fe)) chain.unshift(...f.slice(0, -1));
          else if (near(head, fs)) chain.unshift(...f.slice(1).reverse());
          else continue;
          remaining.splice(i, 1);
          grew = true;
          break;
        }
      }
      const cum: number[] = [0];
      for (let i = 1; i < chain.length; i++) {
        cum.push(cum[i - 1] + Math.hypot(chain[i].x - chain[i - 1].x, chain[i].z - chain[i - 1].z));
      }
      const length = cum[cum.length - 1];
      if (length < DRIVE_MIN_ROUTE_LEN) return null;
      return { name, pts: chain, cum, length };
    };

    for (const name of DRIVE_ROAD_NAMES) {
      const route = stitchRoute(name);
      if (route) driveRoutes.push(route);
    }
    highwayRoute = stitchRoute(HIGHWAY_ROAD_NAME);
    // One-time diagnostic: if a data bake ever renames/fragments the loop
    // roads the cars silently vanish — say so loudly instead.
    if (driveRoutes.length === 0 && !highwayRoute) {
      console.warn('[map3d] driving cars disabled: no named road matched DRIVE_ROAD_NAMES');
    } else {
      const all = [...driveRoutes, ...(highwayRoute ? [highwayRoute] : [])];
      console.info(
        `[map3d] driving routes: ${all.map((r) => `${r.name} (${Math.round(r.length)}m)`).join(', ')}`,
      );
    }
  }

  /** Muted real-car palette for the driving cars (UMD red included). */
  const DRIVE_CAR_COLORS = [
    0xe8e8e6, // white
    0xb9bcbf, // silver
    0x3a3d40, // charcoal
    0x17181a, // black
    0x2f4d7a, // muted blue
    0xe21833, // UMD red
    0x8e1f24, // dark red
    0x7d8185, // mid gray
  ];

  const driveCars: DriveCar[] = [];
  let carBodies: THREE.InstancedMesh | null = null;
  let carHeadlights: THREE.InstancedMesh | null = null;
  let headlightMat: THREE.MeshBasicMaterial | null = null;

  const campusCarCount = driveRoutes.length > 0 ? DRIVE_CAR_COUNT : 0;
  const highwayCarCount = highwayRoute ? HIGHWAY_CAR_COUNT : 0;
  const totalCarCount = campusCarCount + highwayCarCount;

  if (totalCarCount > 0) {
    carBodies = new THREE.InstancedMesh(
      buildDrivingCarGeometry(),
      new THREE.MeshLambertMaterial({ vertexColors: true }),
      totalCarCount,
    );
    carBodies.castShadow = true;
    carBodies.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    for (let i = 0; i < totalCarCount; i++) {
      const onHighway = i >= campusCarCount;
      const route = onHighway ? highwayRoute! : driveRoutes[i % driveRoutes.length];
      driveCars.push({
        route,
        s: driveHash01(`drive:${i}:s`) * route.length,
        dir: driveHash01(`drive:${i}:dir`) < 0.5 ? 1 : -1,
        // Campus streets cruise 7–9 m/s; US-1 traffic moves 12–17 m/s and
        // never does the stop-and-go pauses (nextPauseAt: Infinity).
        speed: onHighway
          ? 12 + driveHash01(`drive:${i}:spd`) * 5
          : 7 + driveHash01(`drive:${i}:spd`) * 2,
        lane: onHighway
          ? 2.4 + driveHash01(`drive:${i}:lane`) * 1.4 // wide divided arterial
          : 1.1 + driveHash01(`drive:${i}:lane`) * 0.5,
        pauseUntil: 0,
        nextPauseAt: onHighway ? Infinity : 5 + driveHash01(`drive:${i}:pause`) * 12,
      });
      // Hash the color pick — with count > route count, an `i % colors` cycle
      // would put identical-color twins on the same road (route also cycles).
      carBodies.setColorAt(
        i,
        new THREE.Color(
          DRIVE_CAR_COLORS[Math.floor(driveHash01(`drive:${i}:col`) * DRIVE_CAR_COLORS.length)],
        ),
      );
    }
    scene.add(carBodies);

    // Headlight glow: one small warm pool of light thrown on the pavement
    // just ahead of every car, sharing the car matrix times a fixed local
    // offset (flat quad — a vertical bumper quad foreshortens to ~1px from
    // the map's typical high-pitch view). Invisible by day (opacity follows
    // the lamp-glow curve in updateTimeOfDay).
    headlightMat = new THREE.MeshBasicMaterial({
      color: 0xffdca8, // warm halogen
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
      fog: false,
    });
    carHeadlights = new THREE.InstancedMesh(new THREE.PlaneGeometry(1.7, 2.6), headlightMat, totalCarCount);
    carHeadlights.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    carHeadlights.visible = false; // until the first dusk ramp
    carHeadlights.renderOrder = 2;
    scene.add(carHeadlights);
  }

  // Per-frame scratch objects (allocation-free updates).
  const drivePos = new THREE.Vector3();
  const driveQuat = new THREE.Quaternion();
  const driveScale = new THREE.Vector3(DRIVE_CAR_SCALE, DRIVE_CAR_SCALE, DRIVE_CAR_SCALE);
  const driveYAxis = new THREE.Vector3(0, 1, 0);
  const driveM = new THREE.Matrix4();
  const driveHlM = new THREE.Matrix4();
  // Pool lies flat (rotation.x = -90deg) just ahead of the nose, floating a
  // hair above the road ribbon so it never z-fights the pavement.
  const driveHlOffset = new THREE.Matrix4()
    .makeTranslation(0, 0.16, 3.0)
    .multiply(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

  /** Advances every driving car and rewrites its instance matrix. Returns
   * true while any car is moving (caller marks the frame dirty). */
  const updateDrivingCars = (dt: number, nowSec: number): boolean => {
    if (!carBodies || driveCars.length === 0) return false;
    let anyMoved = false;
    for (let i = 0; i < driveCars.length; i++) {
      const car = driveCars[i];
      const { route } = car;
      // Traffic feel: brief random pauses, then back to cruising.
      if (nowSec >= car.nextPauseAt) {
        const tick = Math.floor(nowSec);
        car.pauseUntil = nowSec + 1 + driveHash01(`drive:${i}:pd:${tick}`) * 2;
        car.nextPauseAt = car.pauseUntil + 8 + driveHash01(`drive:${i}:pn:${tick}`) * 14;
      }
      if (nowSec >= car.pauseUntil) {
        car.s += car.speed * dt * car.dir;
        anyMoved = true;
        if (car.s >= route.length) {
          car.s = route.length - 0.01;
          car.dir = -1;
        } else if (car.s <= 0) {
          car.s = 0.01;
          car.dir = 1;
        }
      }
      // Sample position + segment tangent at arc length s (binary search).
      const { pts, cum } = route;
      let lo = 0;
      let hi = cum.length - 1;
      while (lo < hi - 1) {
        const mid = (lo + hi) >> 1;
        if (cum[mid] <= car.s) lo = mid;
        else hi = mid;
      }
      const segLen = cum[lo + 1] - cum[lo] || 1;
      const t = THREE.MathUtils.clamp((car.s - cum[lo]) / segLen, 0, 1);
      const a = pts[lo];
      const b = pts[lo + 1];
      const tx = (b.x - a.x) / segLen;
      const tz = (b.z - a.z) / segLen;
      const fx = tx * car.dir; // travel direction (ping-pong flips it)
      const fz = tz * car.dir;
      // Right lane of the travel direction: right = (-fz, fx) in x-east/z-south.
      drivePos.set(a.x + (b.x - a.x) * t - fz * car.lane, DRIVE_ROAD_Y, a.z + (b.z - a.z) * t + fx * car.lane);
      driveQuat.setFromAxisAngle(driveYAxis, Math.atan2(fx, fz)); // car forward = +z
      driveM.compose(drivePos, driveQuat, driveScale);
      carBodies.setMatrixAt(i, driveM);
      if (carHeadlights) {
        driveHlM.multiplyMatrices(driveM, driveHlOffset);
        carHeadlights.setMatrixAt(i, driveHlM);
      }
    }
    carBodies.instanceMatrix.needsUpdate = true;
    if (carHeadlights) carHeadlights.instanceMatrix.needsUpdate = true;
    return anyMoved;
  };

  updateDrivingCars(0, 0); // place every car before the first render

  // -- selection pulse ring (UMD red) ------------------------------------------------
  const ringMat = new THREE.MeshBasicMaterial({
    color: PULSE_COLOR,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    side: THREE.DoubleSide,
    fog: false,
  });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.62, 1, 48), ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = PULSE_Y;
  ring.visible = false;
  ring.renderOrder = 10;
  scene.add(ring);

  // -- whole-building selection highlight (UMD red translucent shell) ---------
  // One-off extruded footprint mesh swapped on selection change. Possible
  // because we own the geometry now — mapbox fill-extrusion could never do
  // per-building 3D highlighting.
  const highlightMat = new THREE.MeshLambertMaterial({
    color: 0xe21833, // UMD red
    emissive: new THREE.Color(0xe21833),
    emissiveIntensity: 0.3,
    transparent: true,
    opacity: 0.72,
    // Belt-and-braces on top of the geometric fix: buildingSolidGeometry now
    // outsets the shell 0.5m past the facade and 1m above the tallest part,
    // and this nudges the shell's depth toward the camera as a final guard
    // against z-fighting at any pitch/zoom.
    polygonOffset: true,
    polygonOffsetFactor: -2,
    polygonOffsetUnits: -2,
  });
  let highlightMesh: THREE.Mesh | null = null;

  const clearHighlight = (): void => {
    if (!highlightMesh) return;
    scene.remove(highlightMesh);
    highlightMesh.geometry.dispose();
    highlightMesh = null;
    needsRender = true;
  };

  const setHighlight = (t: { lng: number; lat: number; code?: string }): void => {
    // Match by UMD code first — ALL footprints carrying the code, since some
    // buildings are mapped as several OSM ways (e.g. AJC = main mass + the
    // angled prow) — then fall back to the nearest footprint centroid.
    let matches: CampusData['buildings'][number][] = [];
    if (t.code) {
      const code = t.code.toUpperCase();
      matches = data.buildings.filter((b) => b.umdCode?.toUpperCase() === code);
    }
    let match: CampusData['buildings'][number] | undefined;
    if (matches.length === 0) {
      const p = proj.toLocal(t.lng, t.lat);
      let best = Infinity;
      for (const b of data.buildings) {
        if (!b.footprint || b.footprint.length < 3) continue;
        let cx = 0;
        let cz = 0;
        for (const [lng, lat] of b.footprint) {
          const q = proj.toLocal(lng, lat);
          cx += q.x;
          cz += q.z;
        }
        cx /= b.footprint.length;
        cz /= b.footprint.length;
        const d = Math.hypot(cx - p.x, cz - p.z);
        if (d < best) {
          best = d;
          match = b;
        }
      }
      if (best > 80) match = undefined; // nothing plausibly at this point
      if (match) matches = [match];
    }
    clearHighlight();
    if (matches.length === 0) return;
    const parts = matches
      .map((m) => buildingSolidGeometry(m, proj))
      .filter((g): g is NonNullable<typeof g> => Boolean(g));
    if (parts.length === 0) return;
    const geom = parts.length === 1 ? parts[0] : mergeAll(parts);
    if (!geom) return;
    highlightMesh = new THREE.Mesh(geom, highlightMat);
    highlightMesh.renderOrder = 2; // over contact shadows, under the pulse ring
    scene.add(highlightMesh);
    needsRender = true;
  };

  // -- parking lot selection highlight -------------------------------------------
  // Parking equivalent of the building shell above, driven by the curated
  // PARKING_HIGHLIGHT_TARGETS map (parkingData.js): garages reuse their real
  // building footprint (same red shell as buildings); surface lots get a flat
  // ~0.3m-tall red plate over their campus-data parking polygon(s), outset
  // 0.3m so it clears the lot edge paint. Shares highlightMat; separate mesh
  // state so building and parking highlights never fight over one slot.
  let parkingHighlightMesh: THREE.Mesh | null = null;

  const clearParkingHighlight = (): void => {
    if (!parkingHighlightMesh) return;
    scene.remove(parkingHighlightMesh);
    parkingHighlightMesh.geometry.dispose();
    parkingHighlightMesh = null;
    needsRender = true;
  };

  const setParkingHighlight = ({ name }: { name: string }): void => {
    clearParkingHighlight();
    const targets = PARKING_HIGHLIGHT_TARGETS as unknown as Record<
      string,
      { buildingId?: string; areaIndices?: number[]; connectors?: [number, number][][] }
    >;
    const target = targets[name];
    if (!target) return;
    let geom: THREE.BufferGeometry | null = null;
    if (target.buildingId) {
      const building = data.buildings.find((b) => b.id === target.buildingId);
      if (building) geom = buildingSolidGeometry(building, proj);
    } else if (target.areaIndices && target.areaIndices.length > 0) {
      const parts: THREE.BufferGeometry[] = [];
      for (const idx of target.areaIndices) {
        const area = data.areas[idx];
        if (!area || area.kind !== 'parking' || area.polygon.length < 3) continue;
        const pts = ringToShapePoints(area.polygon, proj);
        if (pts.length < 3) continue;
        // Lift the plate above ROAD_Y (0.4): lots mapped as road-side lanes
        // (e.g. Lot 16's Fraternity Row inner crescent) have the road ribbon
        // drawn OVER the parking polygon — a ground-level plate is hidden.
        const plate = extrudeFootprint(outsetRing(pts, 0.3), 0.3);
        plate.translate(0, PARKING_PLATE_Y, 0);
        parts.push(plate);
      }
      // Hand-drawn connector rings that visually join fragmented polygons
      // (driveway/intersection cuts). +0.02m avoids coplanar z-fighting
      // with the main plates where they kiss.
      for (const ring of target.connectors ?? []) {
        const pts = ringToShapePoints(ring, proj);
        if (pts.length < 3) continue;
        const plate = extrudeFootprint(pts, 0.32);
        plate.translate(0, PARKING_PLATE_Y + 0.02, 0);
        parts.push(plate);
      }
      if (parts.length === 1) geom = parts[0];
      else if (parts.length > 1) geom = mergeAll(parts);
    }
    if (!geom) return;
    parkingHighlightMesh = new THREE.Mesh(geom, highlightMat);
    parkingHighlightMesh.renderOrder = 2; // over contact shadows, under the pulse ring
    scene.add(parkingHighlightMesh);
    needsRender = true;
  };

  // -- controls --------------------------------------------------------------------
  const controls = new MapControls(camera, canvas, {
    minDistance: MIN_DISTANCE,
    maxDistance: MAX_DISTANCE,
    minPhi: 0,
    maxPhi: MAX_PHI,
    panBound: PAN_BOUND,
  });
  const homeTarget = proj.toLocal(HOME_VIEW.lng, HOME_VIEW.lat);
  controls.setPose({
    x: homeTarget.x,
    z: homeTarget.z,
    distance: INITIAL_DISTANCE,
    phi: INITIAL_PHI,
    theta: INITIAL_THETA,
  });
  controls.applyToCamera();

  // -- palette + solar time-of-day ---------------------------------------------------
  const palette = new PaletteController({
    scene,
    fog,
    hemi,
    sun,
    buildingMaterial: buildingMat,
  });

  // Backward compat: callers that only pass darkMode get the equivalent
  // forced mode; CampusMap3D passes timeMode explicitly.
  let timeMode: SceneTimeMode =
    opts.timeMode ?? (opts.darkMode ? 'force-night' : 'force-day');

  /** When set, the sun (and every time-of-day easter egg) reads this instant
   * instead of the wall clock. Schedule mode points it at the selected
   * date/time so the environment matches what the user is planning for. */
  let solarOverride: Date | null = null;
  const solarNow = (): Date => solarOverride ?? new Date();

  let realSun = computeSunPosition(solarNow());
  let solarTimer = SOLAR_RECOMPUTE_SECONDS; // recompute on the first frame too
  /** Effective elevation the palette/light actually follow: the real sun in
   * auto mode, an eased synthetic value in the forced modes. */
  let effectiveElev =
    timeMode === 'auto'
      ? realSun.elevation
      : timeMode === 'force-day'
        ? FORCE_DAY_ELEV
        : FORCE_NIGHT_ELEV;
  /** Light azimuth is damped separately so direction changes (including the
   * day->moonlight handoff) sweep smoothly instead of snapping. */
  let lightAz = NaN;
  let lightElev = NaN;

  const sunTargets = (): { az: number; elev: number } => {
    if (timeMode === 'auto') return { az: 0, elev: realSun.elevation }; // az unused in auto
    return timeMode === 'force-day'
      ? { az: FORCE_DAY_AZ, elev: FORCE_DAY_ELEV }
      : { az: NIGHT_AZ, elev: FORCE_NIGHT_ELEV };
  };

  /** Advances the solar state. Returns true when a re-render is needed. */
  const updateTimeOfDay = (dt: number): boolean => {
    solarTimer += dt;
    if (timeMode === 'auto' && solarTimer >= SOLAR_RECOMPUTE_SECONDS) {
      solarTimer %= SOLAR_RECOMPUTE_SECONDS;
      realSun = computeSunPosition(solarNow());
    }

    // Ease the effective elevation toward its target. In auto mode the real
    // sun moves <= ~0.004 deg/s, so the same damp also absorbs 1s recompute
    // steps and any tab-sleep jumps — continuous, never snappy.
    const { elev: targetElev } = sunTargets();
    effectiveElev = THREE.MathUtils.damp(effectiveElev, targetElev, TRANSITION_LAMBDA, dt);

    // Light direction: real sun above the horizon follows the computed
    // azimuth (elevation clamped so shadows stay sane); forced day uses the
    // fixed warm angle; anything below the horizon is fixed moonlight.
    const aboveHorizon = effectiveElev > 0;
    let targetAz: number;
    let targetLightElev: number;
    if (aboveHorizon && timeMode !== 'force-night') {
      targetAz = timeMode === 'auto' ? realSun.azimuth : FORCE_DAY_AZ;
      targetLightElev = Math.max(MIN_LIGHT_ELEV, effectiveElev);
    } else if (aboveHorizon) {
      // force-night still easing down through the last daylight degrees
      targetAz = NIGHT_AZ;
      targetLightElev = Math.max(MIN_LIGHT_ELEV, effectiveElev);
    } else {
      targetAz = NIGHT_AZ;
      targetLightElev = NIGHT_LIGHT_ELEV;
    }

    let changed = false;
    if (!Number.isFinite(lightAz)) {
      lightAz = targetAz; // no sweep on load — start correct
      lightElev = targetLightElev;
      changed = true;
    } else {
      const dAz = ((((targetAz - lightAz) % 360) + 540) % 360) - 180;
      const nextAz = lightAz + dAz * (1 - Math.exp(-TRANSITION_LAMBDA * dt));
      const nextElev = THREE.MathUtils.damp(lightElev, targetLightElev, TRANSITION_LAMBDA, dt);
      if (Math.abs(nextAz - lightAz) > 0.0005 || Math.abs(nextElev - lightElev) > 0.0005) {
        lightAz = nextAz;
        lightElev = nextElev;
        changed = true;
      }
    }
    if (changed) {
      // Local frame: x = east, z = south (north = -z), azimuth clockwise
      // from north. Light sits along the sun vector at a fixed distance; the
      // shadow ortho stays fitted to campus, target = campus center.
      const azRad = THREE.MathUtils.degToRad(lightAz);
      const elRad = THREE.MathUtils.degToRad(lightElev);
      sun.position.set(
        SUN_DISTANCE * Math.cos(elRad) * Math.sin(azRad),
        SUN_DISTANCE * Math.sin(elRad),
        -SUN_DISTANCE * Math.cos(elRad) * Math.cos(azRad),
      );
    }

    if (palette.setElevation(effectiveElev)) changed = true;

    // Lamp glow follows the same elevation as the palette: smoothstep from
    // fully off (day) to a warm dusk/night glow. Scalar-only, allocation-free;
    // the material is touched only when the change is visible.
    const glowT = THREE.MathUtils.clamp(
      (LAMP_GLOW_OFF_ELEV - effectiveElev) / (LAMP_GLOW_OFF_ELEV - LAMP_GLOW_FULL_ELEV),
      0,
      1,
    );
    const glow = glowT * glowT * (3 - 2 * glowT); // smoothstep
    const lampIntensity = glow * LAMP_GLOW_MAX;
    if (Math.abs(lampIntensity - lampHeadMat.emissiveIntensity) > LAMP_GLOW_EPS) {
      lampHeadMat.emissiveIntensity = lampIntensity;
      changed = true;
    }

    // Lamplight pools ride the same elevation curve as the heads — a scalar
    // opacity ramp plus a visibility gate so the mesh costs nothing by day.
    const poolOpacity = glow * LAMP_POOL_MAX_OPACITY;
    if (Math.abs(poolOpacity - lampPoolMat.opacity) > LAMP_GLOW_EPS) {
      lampPoolMat.opacity = poolOpacity;
      changed = true;
    }
    const poolsVisible = poolOpacity > LAMP_GLOW_EPS;
    if (lampPools.visible !== poolsVisible) {
      lampPools.visible = poolsVisible;
      changed = true;
    }

    // Car headlights ride the same dusk curve as the lamp heads — a scalar
    // opacity ramp plus a visibility gate so the quads cost nothing by day.
    if (headlightMat && carHeadlights) {
      const hlOpacity = glow * HEADLIGHT_MAX_OPACITY;
      if (Math.abs(hlOpacity - headlightMat.opacity) > LAMP_GLOW_EPS) {
        headlightMat.opacity = hlOpacity;
        changed = true;
      }
      const hlVisible = hlOpacity > LAMP_GLOW_EPS;
      if (carHeadlights.visible !== hlVisible) {
        carHeadlights.visible = hlVisible;
        changed = true;
      }
    }

    // Lit windows come on a touch earlier than the lamps and reach full warm
    // glow once twilight deepens — same smoothstep, same dirty-check pattern.
    const winT = THREE.MathUtils.clamp(
      (WINDOW_GLOW_OFF_ELEV - effectiveElev) / (WINDOW_GLOW_OFF_ELEV - WINDOW_GLOW_FULL_ELEV),
      0,
      1,
    );
    const winGlow = winT * winT * (3 - 2 * winT);
    const winOpacity = winGlow * WINDOW_GLOW_MAX;
    if (Math.abs(winOpacity - windowMat.opacity) > LAMP_GLOW_EPS) {
      windowMat.opacity = winOpacity;
      changed = true;
    }
    const windowsVisible = winOpacity > LAMP_GLOW_EPS;
    if (windows.visible !== windowsVisible) {
      windows.visible = windowsVisible;
      changed = true;
    }
    return changed;
  };

  /**
   * Drives the bad-ballast lamps. Baseline is whatever the SHARED lamp
   * materials ended up at this frame (sun ramp, then any 2AM dimming), so a
   * flicker lamp is never brighter than its steady neighbours — it only ever
   * drops below them.
   *
   * Shape: mostly steady, with a short stutter burst every 6–15s. Inside a
   * burst a fast square-ish wave drops the lamp to `depth`, which is what a
   * failing fixture actually looks like — not a sine wave.
   */
  const updateLampFlicker = (nowSec: number, stillness: number): boolean => {
    if (flickerLamps.length === 0) return false;
    const baseIntensity = lampHeadMat.emissiveIntensity;
    const basePool = lampPoolMat.opacity;
    const lit = baseIntensity > LAMP_GLOW_EPS;
    let changed = false;
    for (const f of flickerLamps) {
      // Late-set lamps fade their stutter in with the 2AM ramp, so the
      // campus gets visibly more decrepit in the small hours and is perfectly
      // steady by day. Always-on lamps ignore it.
      const amount = f.lateOnly ? stillness : 1;
      let factor = 1;
      if (lit && amount > 0.01) {
        const t = (nowSec / f.period + f.phase) % 1;
        if (t < FLICKER_BURST_FRACTION) {
          const bt = t / FLICKER_BURST_FRACTION; // 0..1 through the burst
          // Envelope so the burst fades in/out instead of starting mid-stutter.
          const env = Math.sin(bt * Math.PI);
          const wave = Math.sin(bt * f.rate * Math.PI * 2);
          if (wave < 0) factor = 1 - (1 - f.depth) * env * amount;
        }
      }
      const wantIntensity = baseIntensity * factor;
      // The ground pool is a ~13m disc — a lot of screen area up close — and
      // real spill light is diffuse anyway, so it only follows part of the
      // way down. Keeps the effect on the bulb, not the whole street.
      const wantPool = basePool * (1 - (1 - factor) * FLICKER_POOL_RESPONSE);
      if (Math.abs(f.headMat.emissiveIntensity - wantIntensity) > LAMP_GLOW_EPS) {
        f.headMat.emissiveIntensity = wantIntensity;
        changed = true;
      }
      if (Math.abs(f.poolMat.opacity - wantPool) > LAMP_GLOW_EPS) {
        f.poolMat.opacity = wantPool;
        changed = true;
      }
      // Match the shared pool's visibility gate so day frames cost nothing.
      const poolVisible = wantPool > LAMP_GLOW_EPS;
      if (f.pool.visible !== poolVisible) {
        f.pool.visible = poolVisible;
        changed = true;
      }
      f.headMat.color.copy(lampHeadMat.color);
    }
    return changed;
  };

  updateTimeOfDay(0); // apply the initial palette + light before first render
  updateLampFlicker(0, 0);

  // -- sizing ---------------------------------------------------------------------------
  let needsRender = true;
  const applySize = (): void => {
    const w = Math.max(1, container.clientWidth);
    const h = Math.max(1, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    needsRender = true;
  };
  const resizeObserver = new ResizeObserver(applySize);
  resizeObserver.observe(container);
  applySize();

  // -- easter eggs (hook region) ---------------------------------------------------
  // Self-contained module (scene/eastereggs.ts): Testudo statue + click
  // raycast, Lake Artemesia duck, Shuttle-UM bus, turtle mode, 2AM stillness.
  // Initialized after every dependency above exists; updated in the render
  // loop AFTER updateTimeOfDay; disposed with the scene.
  const easterEggs = initEasterEggs({
    scene,
    camera,
    canvas,
    proj,
    data,
    carBodies,
    carHeadlights,
    headlightMat,
    driveCars,
    windowMat,
    lampHeadMat,
    lampPoolMat,
    initialTimeMode: timeMode,
    now: solarNow,
    markDirty: () => {
      needsRender = true;
    },
  });

  // Seasons: repaints foliage + lawns from the solar clock. Owns the tree and
  // area colour attributes outright (cherry blossom used to be an egg writing
  // the same buffer — two writers would have fought every frame).
  const seasons = createSeasons({
    treesGeometry: geoms.trees,
    areasGeometry: geoms.areas,
    groundMaterial: groundMat,
    snowPatchMesh: snowPatches,
    snowPatchMaterial: snowPatchMat,
    now: solarNow,
  });

  // -- render loop ------------------------------------------------------------------------
  let disposed = false;
  let rafId = 0;
  let lastTime = performance.now();
  const frameCallbacks = new Set<() => void>();
  const pulse = { active: false, startMs: 0 };
  const scratchNdc = new THREE.Vector3();
  const scratchView = new THREE.Vector3();

  const renderFrame = (nowMs: number): void => {
    if (disposed) return;
    rafId = requestAnimationFrame(renderFrame);
    const dt = Math.min(0.05, Math.max(0, (nowMs - lastTime) / 1000));
    lastTime = nowMs;

    if (controls.update(dt)) {
      controls.applyToCamera();
      needsRender = true;
    }
    if (updateTimeOfDay(dt)) needsRender = true;
    // Driving cars: per-frame matrix updates; mark dirty while anything moves.
    if (updateDrivingCars(dt, nowMs / 1000)) needsRender = true;
    // Easter eggs: runs after updateTimeOfDay so 2AM dimming post-multiplies
    // the freshly-written lamp/window values.
    if (easterEggs.update(dt)) needsRender = true;
    // Flicker last: it reads the FINAL shared-lamp values as its baseline, so
    // the bad ballasts dim with everything else at 2AM instead of blazing on.
    if (updateLampFlicker(nowMs / 1000, easterEggs.getStillness())) needsRender = true;
    if (seasons.update(dt)) needsRender = true;

    if (pulse.active) {
      const phase = ((nowMs - pulse.startMs) % PULSE_PERIOD_MS) / PULSE_PERIOD_MS;
      // Grow to a capped max, then hold + fade — uncapped growth smeared into
      // a huge red blob on the ground at high camera pitch.
      const radius = Math.min(9 + phase * 40, PULSE_MAX_RADIUS); // meters
      ring.scale.set(radius, radius, 1);
      ringMat.opacity = 0.8 * (1 - phase);
      needsRender = true;
    }

    camera.updateMatrixWorld(); // keep project() matrices fresh for callbacks
    for (const cb of frameCallbacks) {
      try {
        cb();
      } catch (err) {
        console.error('[map3d] onFrame callback failed', err);
      }
    }

    if (needsRender) {
      renderer.render(scene, camera);
      needsRender = false;
    }
  };

  // -- handle -------------------------------------------------------------------------------
  const handle: CampusSceneHandleV2 = {
    setDarkMode(dark: boolean): void {
      // Backward-compatible shim over the time-mode API.
      timeMode = dark ? 'force-night' : 'force-day';
    },

    setTimeMode(mode: SceneTimeMode): void {
      timeMode = mode;
      if (mode === 'auto') {
        // Resync with the active solar clock right away; the damp eases any
        // difference.
        realSun = computeSunPosition(solarNow());
        solarTimer = 0;
      }
    },

    setSolarTime(date: Date | null): void {
      const next = date && Number.isFinite(date.getTime()) ? date : null;
      // Same instant to the minute? Nothing to do — schedule-mode pickers
      // fire on every keystroke and this runs on each one.
      const same =
        (next === null && solarOverride === null) ||
        (next !== null &&
          solarOverride !== null &&
          Math.floor(next.getTime() / 60000) === Math.floor(solarOverride.getTime() / 60000));
      if (same) return;
      solarOverride = next;
      // Recompute immediately rather than waiting out the recompute interval,
      // so the sky starts moving the moment the user changes the time.
      realSun = computeSunPosition(solarNow());
      solarTimer = 0;
      needsRender = true;
    },

    getSunElevation(): number {
      return realSun.elevation;
    },

    getPose(): { x: number; z: number; distance: number; phi: number; theta: number } {
      return controls.getPose();
    },

    flyTo(t): void {
      const pose: Partial<CameraPose> = {};
      const p = proj.toLocal(t.lng, t.lat);
      pose.x = p.x;
      pose.z = p.z;
      if (t.zoom != null) {
        pose.distance = THREE.MathUtils.clamp(
          2600 * Math.pow(2, 15 - t.zoom),
          MIN_DISTANCE,
          MAX_DISTANCE,
        );
      }
      if (t.pitch != null) {
        pose.phi = THREE.MathUtils.clamp(THREE.MathUtils.degToRad(90 - t.pitch), 0, MAX_PHI);
      }
      if (t.bearing != null) {
        pose.theta = THREE.MathUtils.degToRad(t.bearing);
      }
      controls.flyTo(pose, FLYTO_DURATION_MS);
    },

    project(lng: number, lat: number) {
      const p = proj.toLocal(lng, lat);
      // view-space check: is the point in front of the camera?
      scratchView.set(p.x, 0, p.z).applyMatrix4(camera.matrixWorldInverse);
      const inFront = scratchView.z < -0.1;
      scratchNdc.set(p.x, 0, p.z).project(camera);
      const w = container.clientWidth;
      const h = container.clientHeight;
      const x = ((scratchNdc.x + 1) / 2) * w;
      const y = ((1 - scratchNdc.y) / 2) * h;
      const visible =
        inFront &&
        scratchNdc.z > -1 &&
        scratchNdc.z < 1 &&
        x >= -VISIBILITY_MARGIN &&
        x <= w + VISIBILITY_MARGIN &&
        y >= -VISIBILITY_MARGIN &&
        y <= h + VISIBILITY_MARGIN;
      return { x, y, visible };
    },

    onFrame(cb: () => void): () => void {
      frameCallbacks.add(cb);
      return () => {
        frameCallbacks.delete(cb);
      };
    },

    setPulseRing(lng: number, lat: number): void {
      const p = proj.toLocal(lng, lat);
      ring.position.set(p.x, PULSE_Y, p.z);
      ring.visible = true;
      pulse.active = true;
      pulse.startMs = performance.now();
      needsRender = true;
    },

    clearPulseRing(): void {
      pulse.active = false;
      ring.visible = false;
      needsRender = true;
    },

    setHighlightBuilding(t: { lng: number; lat: number; code?: string }): void {
      setHighlight(t);
    },

    clearHighlightBuilding(): void {
      clearHighlight();
    },

    setHighlightParking(t: { name: string }): void {
      setParkingHighlight(t);
    },

    clearHighlightParking(): void {
      clearParkingHighlight();
    },

    dispose(): void {
      if (disposed) return;
      disposed = true;
      cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      controls.dispose();
      frameCallbacks.clear();
      easterEggs.dispose(); // restores car geometry/count before disposal below
      seasons.dispose(); // hands the baked foliage/lawn colours back
      delete (window as unknown as Record<string, unknown>).__campusScene;
      delete (window as unknown as Record<string, unknown>).__campusEggs;
      // InstancedMesh instance buffers aren't covered by geometry/material
      // disposal in the traverse below.
      if (carBodies) carBodies.dispose();
      if (carHeadlights) carHeadlights.dispose();
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          const material = obj.material as THREE.Material | THREE.Material[];
          if (Array.isArray(material)) material.forEach((m) => m.dispose());
          else material.dispose();
        }
      });
      lampPoolTexture.dispose(); // canvas texture — not covered by material.dispose()
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };

  // -- easter-egg handle wiring ---------------------------------------------------
  // Wrap (never edit) the time-mode setter so the eggs track the active mode
  // without touching the time-mode region; expose turtle mode + a dev handle.
  const baseSetTimeMode = handle.setTimeMode.bind(handle);
  handle.setTimeMode = (mode: SceneTimeMode): void => {
    baseSetTimeMode(mode);
    easterEggs.setTimeMode(mode);
  };
  handle.setTurtleMode = easterEggs.setTurtleMode;
  (window as unknown as Record<string, unknown>).__campusScene = handle;
  (window as unknown as Record<string, unknown>).__campusEggs = {
    debug: easterEggs.debug,
  };

  rafId = requestAnimationFrame(renderFrame);
  return handle;
}
