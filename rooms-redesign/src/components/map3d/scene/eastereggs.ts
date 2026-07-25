// src/components/map3d/scene/eastereggs.ts
//
// Easter eggs — self-contained module wired into scene.ts through a narrow
// hook region (one init call, one update call, one guarded time-mode wrapper,
// dispose). Owns eight eggs:
//
//   1. TESTUDO STATUE — a small dark-bronze turtle statue on a plinth in front
//      of McKeldin Library (Mall side). Clickable via a click-vs-drag
//      discriminator (pointerdown/up within 6px) raycasting into the statue
//      group; on click the nose pulses gold for ~3s and a window CustomEvent
//      ('umd-easteregg', detail.kind = 'testudo') is dispatched so the React
//      side (EasterEggs.tsx) can toast.
//   2. THE DUCK — a tiny duck swimming a slow endless loop on Lake Artemesia
//      (SE campus) with gentle sinusoidal bobbing and a faint trailing wake.
//   3. SHUTTLE-UM BUS — one bus driving a continuous loop stitched from
//      Campus Drive + Regents Drive + Stadium Drive fragments, ~6 m/s with
//      8–15s dwell stops at four marked bus stops (small blue discs).
//   4. TURTLE MODE — setTurtleMode(true) swaps the driving-car InstancedMesh
//      geometry for turtles, tints instances green-white, and crawls the
//      fleet at 0.5 m/s for 60s, then auto-restores.
//   5. 2AM MODE — while the scene is in 'auto' time mode and local time is
//      02:00–05:00, lit windows drop to ~12%, lamp glow to ~25%, the driving
//      fleet collapses to one lone car, the duck sleeps, and Testudo's nose
//      keeps a faint permanent glow. All eased (damp), never snapped.
//   6. ODK FOUNTAIN — clicking the McKeldin Mall pool throws an expanding
//      splash ring and toasts. The pool lives inside the merged water mesh,
//      so an invisible flat proxy carries the raycast. On the last day of
//      classes a swimmer is already floating in it.
//   7. CHERRY BLOSSOMS — late March through April the campus trees ease from
//      green to blossom pink. Tree color is baked per-vertex and the mesh
//      shares `flatMat`, so this lerps the color ATTRIBUTE (tinting the
//      material would repaint the ground and buildings too).
//   8. SQUIRRELS — 16 hash-placed eastern grays around the baked tree
//      positions, dart-and-freeze: long stillness, quick 3.4 m/s sprints
//      with a little hop, then frozen mid-stare again.
//
// Constraints honored: deterministic placement (hash-seeded), clean dispose,
// zero per-frame allocations (module-level scratch objects), no effect on day
// or normal-night rendering when no egg is active (factors sit at 1 and the
// base-value tracker passes values through untouched).

import * as THREE from 'three';
import type { Projection } from './projection';
import type { CampusData } from './types';
import { buildBusGeometry, buildDrivingTurtleGeometry, buildSquirrelGeometry } from './cars';

/** Minimal view of scene.ts's internal DriveCar — only what the eggs touch.
 * The runtime objects carry more (route/s/dir); the optional fields below are
 * read only by the QA debug() snapshot. */
export interface EasterEggDriveCar {
  speed: number;
  s?: number;
  route?: { pts: { x: number; z: number }[]; cum: number[]; length: number };
}

export interface EasterEggsDeps {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  canvas: HTMLCanvasElement;
  proj: Projection;
  data: CampusData;
  carBodies: THREE.InstancedMesh | null;
  carHeadlights: THREE.InstancedMesh | null;
  headlightMat: THREE.MeshBasicMaterial | null;
  driveCars: EasterEggDriveCar[];
  windowMat: THREE.MeshBasicMaterial;
  lampHeadMat: THREE.MeshLambertMaterial;
  lampPoolMat: THREE.MeshBasicMaterial;
  /** Merged tree geometry. Tree color is baked per-vertex and the mesh shares
   * `flatMat` with the ground/buildings/roads, so the bloom egg tints the
   * color ATTRIBUTE rather than a material (which would repaint the campus). */
  treesGeometry: THREE.BufferGeometry;
  /** Time mode in effect when the scene was created. */
  initialTimeMode: string;
  /** The scene's solar clock — the wall clock normally, or the user's chosen
   * instant in schedule mode. Every date-driven egg (2AM ambience, cherry
   * blossoms, the last-day-of-classes swimmer) reads this so the whole
   * environment agrees on "when" it is. */
  now: () => Date;
  markDirty: () => void;
}

export interface EasterEggsHandle {
  /** Advance all eggs. Call AFTER updateTimeOfDay so the 2AM dimming can
   * post-multiply the freshly-written material values. Returns true when a
   * re-render is needed. */
  update(dt: number): boolean;
  setTurtleMode(active: boolean): void;
  /** 0..1 eased 2AM stillness. scene.ts uses it to bring the late-night
   * flicker lamps in and out on exactly the same ramp as the dimming. */
  getStillness(): number;
  /** Guarded hook called from the scene's time-mode setter (wrapped, never
   * modifying the other region). */
  setTimeMode(mode: string): void;
  /** QA/telemetry: current egg positions in lng/lat for screenshot targeting. */
  debug(): {
    statue: { lng: number; lat: number };
    duck: { lng: number; lat: number };
    bus: { lng: number; lat: number } | null;
    busStops: { lng: number; lat: number }[];
    cars: { lng: number; lat: number }[];
    stillT: number;
  };
  dispose(): void;
}

// -- tuning ----------------------------------------------------------------------
// Real Testudo statue: Mall (east) side of McKeldin, at the foot of the library
// steps. McKeldin's east wall sits at lng -76.944665 and the Mall grass starts
// at -76.94448, so this lands ~12m out in the plaza between the two — it used
// to sit ~58m east, floating out on the lawn well clear of the building.
const TESTUDO_LNG = -76.94453;
const TESTUDO_LAT = 38.98596; // library's north-south centerline
const NOSE_PULSE_SECONDS = 3;
const CLICK_DRAG_EPS_PX = 6;

const DUCK_TARGET_LNG = -76.923; // Lake Artemesia
const DUCK_TARGET_LAT = 38.9795;
const DUCK_SPEED = 0.35; // m/s along the loop
const DUCK_BOB_AMP = 0.12;
const DUCK_BOB_HZ = 0.8;

const BUS_SPEED = 6; // m/s
const BUS_ROUTE_NAMES = ['Campus Drive', 'Regents Drive', 'Stadium Drive'];
const BUS_CONNECT_EPS = 60; // meters — max gap bridged when joining routes
const BUS_STOP_FRACTIONS = [0.12, 0.37, 0.62, 0.87];
/** Arc-length window that counts as "at the stop". Generous enough that a
 * long frame (6 m/s x dt) can't skip straight past it. */
const BUS_STOP_TRIGGER_RADIUS = 3;
/** How far past a stop the bus must get before that stop can serve again —
 * comfortably outside the trigger window so it can't immediately re-arm. */
const BUS_STOP_RELEASE_RADIUS = 12;

const TURTLE_MODE_SECONDS = 60;
const TURTLE_SPEED = 0.5;

// -- 6. ODK FOUNTAIN --------------------------------------------------------------
/** The McKeldin Mall reflecting pool, matched by centroid (areas carry no
 * ids). Same anchor the bake's AREA_WIDEN entry uses. */
const FOUNTAIN_LAT = 38.98599;
const FOUNTAIN_LNG = -76.94186;
const FOUNTAIN_MATCH_RADIUS = 25; // meters
const SPLASH_SECONDS = 1.5;
const SPLASH_MAX_RADIUS = 9; // meters — the ring's outer edge at full spread
/** Approximate last day of classes (month, day) — fall and spring. UMD shifts
 * these a few days year to year; being a day off just means the swimmer shows
 * up on the wrong Tuesday, which is a very on-brand failure mode. */
const LAST_DAY_OF_CLASSES: [number, number][] = [
  [5, 12], // ~mid-May, spring
  [12, 8], // ~early Dec, fall
];

// -- 7. CHERRY BLOSSOMS -----------------------------------------------------------
/** Bloom window: late March through April (inclusive month/day pairs). */
const BLOOM_START: [number, number] = [3, 20];
const BLOOM_END: [number, number] = [4, 30];
const BLOSSOM_COLOR = 0xf2b6cd; // pale cherry pink
const BLOSSOM_MIX = 0.82; // how far tree greens lerp toward the pink
const BLOOM_LAMBDA = 0.5; // ease rate, matches the 2AM feel

// -- 8. SQUIRRELS -----------------------------------------------------------------
const SQUIRREL_COUNT = 16;
/** Distance-compensated scale. A fixed upscale cannot work here: the source
 * geometry is ~1m tall, and at the default camera distance (~1557m) that is
 * 1.1 SCREEN PIXELS — invisible. Sizing them to read at that range instead
 * (~8m) makes them taller than a house when you zoom in. So the scale tracks
 * camera distance and clamps at both ends: natural up close, ~6px through the
 * mid range, capped far out so they never become landmarks. Reference: a
 * driving car reads ~5.5px at the default view. */
const SQUIRREL_SCALE_PER_METER = 0.0055;
const SQUIRREL_SCALE_MIN = 2.0; // ~18px at MIN_DISTANCE, still squirrel-shaped
const SQUIRREL_SCALE_MAX = 8.0; // ~5.6px at HOME_VIEW, on par with the cars
/** Rescale/redraw threshold on camera distance (meters). */
const SQUIRREL_CAM_EPS = 2;
/** Anchor squirrels to trees near the campus core only. The bake scatters its
 * 40 tree anchors across the whole 2km bbox (median ~830m from the default
 * view), so uniform random picking put 10 of 16 squirrels 0.8–2.1km
 * off-screen. Mirrors HOME_VIEW; kept as literals rather than importing it,
 * since scene.ts already imports this module. */
const SQUIRREL_CORE_LNG = -76.94496;
const SQUIRREL_CORE_LAT = 38.9864;
const SQUIRREL_CORE_RADIUS = 620; // meters
/** Dart-and-freeze: they hold still far longer than they move. */
const SQUIRREL_FREEZE_MIN = 2.2;
const SQUIRREL_FREEZE_MAX = 7.0;
const SQUIRREL_DART_SPEED = 3.4; // m/s — genuinely quick
const SQUIRREL_ROAM_RADIUS = 7; // meters from its home tree
const SQUIRREL_TURN_RATE = 14; // rad/s toward the dart heading
const SQUIRREL_HOP_HZ = 3.2; // little vertical bounce while darting
const SQUIRREL_HOP_AMP = 0.09;

const TWOAM_WINDOW_FACTOR = 0.12; // lit-window opacity floor
/** Lamp head/pool/headlight factor at full 2AM stillness. Raised 0.25 -> 0.4
 * to give the Mall's late-night flicker set room to swing — the stutter is a
 * multiplier on top of this, so at 0.25 its dips landed too dim to read. */
const TWOAM_LAMP_FACTOR = 0.4;
const TWOAM_LAMBDA = 0.6; // ease rate in/out of the still window
const TWOAM_NOSE_GLOW = 0.35; // faint permanent nose glow at 2AM

/** Deterministic 32-bit hash -> [0, 1). Same recipe as geometry.ts/cars.ts. */
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

// -- module scratch (zero per-frame allocation) ------------------------------------
const scratchV3 = new THREE.Vector3();
const scratchQuat = new THREE.Quaternion();
const scratchScale = new THREE.Vector3(1, 1, 1);
/** Squirrels rescale per frame with camera distance, so they get their own
 * scratch — sharing scratchScale would resize the bus (which composes with
 * whatever the vector last held). */
const scratchSquirrelScale = new THREE.Vector3(1, 1, 1);
const scratchM4 = new THREE.Matrix4();
const scratchYAxis = new THREE.Vector3(0, 1, 0);
const scratchNdc = new THREE.Vector2();
const scratchColor = new THREE.Color();
const raycaster = new THREE.Raycaster();

type Pt = { x: number; z: number };

interface EggRoute {
  pts: Pt[];
  cum: number[];
  length: number;
  loop: boolean;
}

/** Same-name road fragments stitched into chains (same greedy recipe as the
 * driving-car route builder in scene.ts), then chains joined into one loop. */
function buildBusRoute(data: CampusData, proj: Projection): EggRoute | null {
  const fragsByName = new Map<string, Pt[][]>();
  for (const road of data.roads) {
    if (road.kind !== 'road' || !road.name) continue;
    if (!BUS_ROUTE_NAMES.includes(road.name)) continue;
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
  const near = (a: Pt, b: Pt, eps: number): boolean => Math.hypot(a.x - b.x, a.z - b.z) < eps;

  const chains: Pt[][] = [];
  for (const name of BUS_ROUTE_NAMES) {
    const frags = fragsByName.get(name);
    if (!frags || frags.length === 0) continue;
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
        if (near(tail, fs, 14)) chain.push(...f.slice(1));
        else if (near(tail, fe, 14)) chain.push(...f.slice(0, -1).reverse());
        else if (near(head, fe, 14)) chain.unshift(...f.slice(0, -1));
        else if (near(head, fs, 14)) chain.unshift(...f.slice(1).reverse());
        else continue;
        remaining.splice(i, 1);
        grew = true;
        break;
      }
    }
    chains.push(chain);
  }
  if (chains.length === 0) return null;

  // Join chains into one big loop, bridging modest gaps with straight
  // connectors (bus drives across the intersection).
  chains.sort((a, b) => b.length - a.length);
  const joined = chains.shift()!.slice();
  for (const chain of chains) {
    const tail = joined[joined.length - 1];
    const head = joined[0];
    const fs = chain[0];
    const fe = chain[chain.length - 1];
    // Pick the cheapest attachment of this chain to either end.
    const options = [
      { d: Math.hypot(tail.x - fs.x, tail.z - fs.z), run: () => joined.push(...chain) },
      { d: Math.hypot(tail.x - fe.x, tail.z - fe.z), run: () => joined.push(...chain.slice().reverse()) },
      { d: Math.hypot(head.x - fe.x, head.z - fe.z), run: () => joined.unshift(...chain) },
      { d: Math.hypot(head.x - fs.x, head.z - fs.z), run: () => joined.unshift(...chain.slice().reverse()) },
    ].sort((a, b) => a.d - b.d);
    if (options[0].d < BUS_CONNECT_EPS) options[0].run();
    // Unbridgeable chains are simply dropped — the loop still reads fine.
  }

  const head = joined[0];
  const tail = joined[joined.length - 1];
  const loop = near(tail, head, BUS_CONNECT_EPS);

  const cum: number[] = [0];
  for (let i = 1; i < joined.length; i++) {
    cum.push(cum[i - 1] + Math.hypot(joined[i].x - joined[i - 1].x, joined[i].z - joined[i - 1].z));
  }
  if (loop) {
    joined.push({ x: head.x, z: head.z });
    cum.push(cum[cum.length - 1] + Math.hypot(head.x - tail.x, head.z - tail.z));
  }
  const length = cum[cum.length - 1];
  if (length < 200) return null;
  return { pts: joined, cum, length, loop };
}

/** Sample position + forward direction at arc length s (binary search). */
function sampleRoute(route: EggRoute, sRaw: number, out: { x: number; z: number; fx: number; fz: number }): void {
  let s = sRaw;
  if (route.loop) {
    s = ((s % route.length) + route.length) % route.length;
  } else {
    s = THREE.MathUtils.clamp(s, 0, route.length);
  }
  const { pts, cum } = route;
  let lo = 0;
  let hi = cum.length - 1;
  while (lo < hi - 1) {
    const mid = (lo + hi) >> 1;
    if (cum[mid] <= s) lo = mid;
    else hi = mid;
  }
  const segLen = cum[lo + 1] - cum[lo] || 1;
  const t = THREE.MathUtils.clamp((s - cum[lo]) / segLen, 0, 1);
  const a = pts[lo];
  const b = pts[lo + 1];
  out.x = a.x + (b.x - a.x) * t;
  out.z = a.z + (b.z - a.z) * t;
  out.fx = (b.x - a.x) / segLen;
  out.fz = (b.z - a.z) / segLen;
}

export function initEasterEggs(deps: EasterEggsDeps): EasterEggsHandle {
  const { scene, camera, canvas, proj, data } = deps;
  const metersPerDegLng = 111320 * Math.cos((proj.centerLat * Math.PI) / 180);
  const toLngLat = (x: number, z: number): { lng: number; lat: number } => ({
    lng: proj.centerLng + x / metersPerDegLng,
    lat: proj.centerLat - z / 111320,
  });
  const disposables: { dispose(): void }[] = [];
  let dirty = false;
  const mark = (): void => {
    dirty = true;
    deps.markDirty();
  };

  // == 1. TESTUDO STATUE ==========================================================
  const bronzeMat = new THREE.MeshLambertMaterial({ color: 0x4a3b28 }); // dark bronze
  const plinthMat = new THREE.MeshLambertMaterial({ color: 0x8d8578 }); // weathered granite
  const noseMat = new THREE.MeshLambertMaterial({
    color: 0x4a3b28,
    emissive: new THREE.Color(0xffc63a), // rubbed-gold
    emissiveIntensity: 0,
  });
  disposables.push(bronzeMat, plinthMat, noseMat);

  const statue = new THREE.Group();
  {
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.45, 1.2));
    plinth.position.y = 0.225;
    plinth.material = plinthMat;
    statue.add(plinth);

    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.55, 12, 8), bronzeMat);
    dome.scale.set(0.85, 0.6, 1.15);
    dome.position.y = 0.75;
    statue.add(dome);

    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.62, 0.14, 12), bronzeMat);
    rim.scale.set(0.85, 1, 1.15);
    rim.position.y = 0.62;
    statue.add(rim);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 8, 6), bronzeMat);
    head.position.set(0, 0.78, 0.72);
    statue.add(head);

    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 6), noseMat);
    nose.position.set(0, 0.75, 0.88);
    nose.name = 'testudo-nose';
    statue.add(nose);

    for (const [lx, lz] of [
      [-0.38, 0.4],
      [0.38, 0.4],
      [-0.38, -0.55],
      [0.38, -0.55],
    ] as const) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.25, 0.24), bronzeMat);
      leg.position.set(lx, 0.55, lz);
      statue.add(leg);
    }

    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.2, 6), bronzeMat);
    tail.rotation.x = Math.PI / 2;
    tail.position.set(0, 0.58, -0.72);
    statue.add(tail);

    // Inflated invisible hit-proxy so the small statue is easy to click.
    const proxy = new THREE.Mesh(
      new THREE.CylinderGeometry(1.1, 1.1, 1.6, 8),
      new THREE.MeshBasicMaterial({ visible: false }),
    );
    proxy.position.y = 0.8;
    proxy.name = 'testudo-proxy';
    statue.add(proxy);
    disposables.push(proxy.geometry, proxy.material as THREE.Material);
  }
  {
    const p = proj.toLocal(TESTUDO_LNG, TESTUDO_LAT);
    // Face the Mall (east, +x): turtle forward is +z; rotation.y = +90deg maps
    // +z onto +x (east). (Was -90deg, which faced WEST — the wrong way.)
    statue.rotation.y = Math.PI / 2;
    // Stylized 4.8x (was 1.6x — users reported it was too small to notice).
    // The hit-proxy lives inside the group, so it scales up along with the
    // statue and the click target stays generous.
    statue.scale.setScalar(4.8);
    statue.position.set(p.x, 0.45, p.z); // on the paved Mall tier
    statue.traverse((o) => {
      if (o instanceof THREE.Mesh && o.name !== 'testudo-proxy') {
        o.castShadow = true;
        disposables.push(o.geometry);
      }
    });
    scene.add(statue);
  }
  let nosePulseT = 0; // seconds remaining in the gold pulse

  // Click-vs-drag discriminator + raycast.
  let downX = 0;
  let downY = 0;
  let downActive = false;
  const onPointerDown = (e: PointerEvent): void => {
    downX = e.clientX;
    downY = e.clientY;
    downActive = true;
  };
  const onPointerUp = (e: PointerEvent): void => {
    if (!downActive) return;
    downActive = false;
    if (Math.hypot(e.clientX - downX, e.clientY - downY) > CLICK_DRAG_EPS_PX) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    scratchNdc.set(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -(((e.clientY - rect.top) / rect.height) * 2 - 1),
    );
    raycaster.setFromCamera(scratchNdc, camera);
    if (raycaster.intersectObject(statue, true).length > 0) {
      nosePulseT = NOSE_PULSE_SECONDS;
      window.dispatchEvent(new CustomEvent('umd-easteregg', { detail: { kind: 'testudo' } }));
      mark();
      return;
    }
    // Fountain proxy is a flat, fully transparent plane over the Mall pool.
    // Tested second so the statue always wins if they ever overlap on screen.
    if (fountainProxy && raycaster.intersectObject(fountainProxy, false).length > 0) {
      triggerSplash();
    }
  };
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointerup', onPointerUp);

  // == 2. THE DUCK ================================================================
  const duck = new THREE.Group();
  const duckBodyMat = new THREE.MeshLambertMaterial({ color: 0xf5f4ef });
  const duckBillMat = new THREE.MeshLambertMaterial({ color: 0xe8922a });
  const wakeMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.18,
    depthWrite: false,
  });
  disposables.push(duckBodyMat, duckBillMat, wakeMat);
  {
    const body = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 7), duckBodyMat);
    body.scale.set(0.85, 0.75, 1.2);
    body.position.y = 0.22;
    duck.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), duckBodyMat);
    head.position.set(0, 0.48, 0.32);
    duck.add(head);
    const bill = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.18, 6), duckBillMat);
    bill.rotation.x = Math.PI / 2;
    bill.position.set(0, 0.46, 0.5);
    duck.add(bill);
    const wake = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 1.6), wakeMat);
    wake.rotation.x = -Math.PI / 2;
    // Counter-positioned so that at the 7.5x group scale with duckBaseY = 0.56
    // the wake lands at the same world height (~0.15) it had at 2.5x/0.35 —
    // i.e. floating right ON the water, not under it.
    wake.position.set(0, -0.0547, -1.0);
    duck.add(wake);
    duck.traverse((o) => {
      if (o instanceof THREE.Mesh) disposables.push(o.geometry);
    });
    // Stylized 7.5x (was 2.5x) — a real 0.7m duck is a sub-pixel speck from
    // map zooms, and even 2.5x read as a dot.
    duck.scale.setScalar(7.5);
  }
  // Duck loop: an inscribed circle inside the Lake Artemesia water, so the
  // duck NEVER swims onto shore. The lake is mapped as MANY thin adjacent
  // 'water' polygons (per-polygon inscribed circles are only ~5m), so the
  // search treats the UNION of all candidate polygons as the water body:
  // rasterize water/land on a coarse grid over the candidate bbox, run a
  // two-pass chamfer distance transform, and take the deepest-water cell as
  // the loop center with radius = clearance * 0.85 (capped). One-time
  // placement math — nothing per-frame.
  const duckCenter = { x: 0, z: 0 };
  let duckRadius = 20;
  {
    const toWorld = (ring: [number, number][]): Pt[] => {
      const pts: Pt[] = [];
      for (const [lng, lat] of ring) pts.push(proj.toLocal(lng, lat));
      return pts;
    };
    const pointInPoly = (x: number, z: number, pts: Pt[]): boolean => {
      let inside = false;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const a = pts[i];
        const b = pts[j];
        if (a.z > z !== b.z > z && x < ((b.x - a.x) * (z - a.z)) / (b.z - a.z) + a.x) {
          inside = !inside;
        }
      }
      return inside;
    };

    const candidates: Pt[][] = [];
    for (const area of data.areas) {
      if (area.kind !== 'water' || !area.polygon || area.polygon.length < 12) continue;
      let clng = 0;
      let clat = 0;
      let minLng = Infinity;
      let maxLng = -Infinity;
      let minLat = Infinity;
      let maxLat = -Infinity;
      for (const [lng, lat] of area.polygon) {
        clng += lng;
        clat += lat;
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      }
      clng /= area.polygon.length;
      clat /= area.polygon.length;
      // Candidate when the centroid is near the lake OR the polygon's bbox
      // covers the lake point (huge water bodies — the real Lake Artemesia
      // polygon stretches kilometers south, so its centroid is far away).
      const nearCentroid =
        Math.hypot(clng - DUCK_TARGET_LNG, (clat - DUCK_TARGET_LAT) * 1.25) <= 0.008;
      const coversTarget =
        DUCK_TARGET_LNG >= minLng - 0.004 &&
        DUCK_TARGET_LNG <= maxLng + 0.004 &&
        DUCK_TARGET_LAT >= minLat - 0.004 &&
        DUCK_TARGET_LAT <= maxLat + 0.004;
      if (!nearCentroid && !coversTarget) continue;
      candidates.push(toWorld(area.polygon));
    }

    let found: { cx: number; cz: number; r: number } | null = null;
    if (candidates.length > 0) {
      // Raster window: ±520m around the lake target (NOT the union bbox —
      // the big lake polygon stretches for kilometers).
      const tc = proj.toLocal(DUCK_TARGET_LNG, DUCK_TARGET_LAT);
      const HALF = 520;
      const minX = tc.x - HALF;
      const maxX = tc.x + HALF;
      const minZ = tc.z - HALF;
      const maxZ = tc.z + HALF;
      const CELL = 6; // meters
      const W = Math.max(2, Math.ceil((maxX - minX) / CELL) + 1);
      const H = Math.max(2, Math.ceil((maxZ - minZ) / CELL) + 1);
      const water = new Uint8Array(W * H);
      for (let gz = 0; gz < H; gz++) {
        const z = minZ + gz * CELL;
        for (let gx = 0; gx < W; gx++) {
          const x = minX + gx * CELL;
          for (const pts of candidates) {
            if (pointInPoly(x, z, pts)) {
              water[gz * W + gx] = 1;
              break;
            }
          }
        }
      }
      // Two-pass chamfer distance transform: dist[i] = cells to nearest land.
      const INF = 1 << 20;
      const dist = new Int32Array(W * H);
      for (let i = 0; i < W * H; i++) dist[i] = water[i] ? INF : 0;
      for (let gz = 0; gz < H; gz++) {
        for (let gx = 0; gx < W; gx++) {
          const i = gz * W + gx;
          if (dist[i] === 0) continue;
          let m = dist[i];
          if (gx > 0) m = Math.min(m, dist[i - 1] + 1);
          if (gz > 0) m = Math.min(m, dist[i - W] + 1);
          if (gx > 0 && gz > 0) m = Math.min(m, dist[i - W - 1] + 1.5);
          if (gx < W - 1 && gz > 0) m = Math.min(m, dist[i - W + 1] + 1.5);
          dist[i] = m;
        }
      }
      for (let gz = H - 1; gz >= 0; gz--) {
        for (let gx = W - 1; gx >= 0; gx--) {
          const i = gz * W + gx;
          if (dist[i] === 0) continue;
          let m = dist[i];
          if (gx < W - 1) m = Math.min(m, dist[i + 1] + 1);
          if (gz < H - 1) m = Math.min(m, dist[i + W] + 1);
          if (gx < W - 1 && gz < H - 1) m = Math.min(m, dist[i + W + 1] + 1.5);
          if (gx > 0 && gz < H - 1) m = Math.min(m, dist[i + W - 1] + 1.5);
          dist[i] = m;
        }
      }
      let bestCells = 0;
      let bestI = -1;
      for (let i = 0; i < W * H; i++) {
        if (water[i] && dist[i] > bestCells) {
          bestCells = dist[i];
          bestI = i;
        }
      }
      if (bestI >= 0) {
        const gx = bestI % W;
        const gz = Math.floor(bestI / W);
        const r = Math.min(60, bestCells * CELL * 0.85);
        if (r >= 10) {
          found = { cx: minX + gx * CELL, cz: minZ + gz * CELL, r };
        }
      }
    }
    if (found) {
      duckCenter.x = found.cx;
      duckCenter.z = found.cz;
      duckRadius = found.r;
    } else {
      const c = proj.toLocal(DUCK_TARGET_LNG, DUCK_TARGET_LAT);
      duckCenter.x = c.x;
      duckCenter.z = c.z;
    }
    scene.add(duck);
  }
  let duckAngle = hash01('duck:start') * Math.PI * 2;

  // == 3. SHUTTLE-UM BUS ==========================================================
  const busRoute = buildBusRoute(data, proj);
  if (!busRoute) {
    // Route stitching failed SILENTLY before — surface exactly why.
    const matched = BUS_ROUTE_NAMES.map((n) => `${n}: 0`);
    const counts = new Map<string, number>();
    const allNames = new Set<string>();
    for (const road of data.roads) {
      if (road.kind !== 'road' || !road.name) continue;
      allNames.add(road.name);
      if (BUS_ROUTE_NAMES.includes(road.name)) {
        counts.set(road.name, (counts.get(road.name) ?? 0) + 1);
      }
    }
    for (let i = 0; i < matched.length; i++) {
      const n = BUS_ROUTE_NAMES[i];
      matched[i] = `${n}: ${counts.get(n) ?? 0} fragments`;
    }
    console.warn(
      '[eastereggs] Shuttle-UM bus NOT spawned — route stitching returned null ' +
        `(no usable chains or joined length < 200m). Fragment matches: ${matched.join(', ')}. ` +
        `Road names present in data: ${[...allNames].join(', ')}`,
    );
  } else {
    console.info(
      `[eastereggs] Shuttle-UM bus spawned — route ${busRoute.length.toFixed(0)}m, ` +
        `${busRoute.pts.length} pts, loop=${busRoute.loop}`,
    );
  }
  let bus: THREE.Mesh | null = null;
  let busS = 0;
  let busDir: 1 | -1 = 1;
  let busDwellUntil = 0;
  let busNow = 0;
  /** Index of the stop currently being served, or -1. Without this latch the
   * bus re-arms its dwell the instant the previous one expires: it only
   * advances ~0.1m per frame, so it is still inside the trigger radius and
   * inches out at 0.1m per dwell — ~5 minutes to clear one stop, which reads
   * as "the bus stopped and never started again". */
  let busServedStop = -1;
  const busStops: number[] = []; // arc-length stop positions
  const busStopGroup = new THREE.Group();
  const busStopLngLat: { lng: number; lat: number }[] = [];
  const busSample = { x: 0, z: 0, fx: 0, fz: 1 };
  if (busRoute) {
    const busGeom = buildBusGeometry();
    // Bolder livery: brighten every vertex tone (~18%, clamped) so the bus
    // pops at campus zoom, and repaint the muted Shuttle-UM blue beltline a
    // brighter electric blue with a UMD-red accent tail.
    const colorAttr = busGeom.getAttribute('color') as THREE.BufferAttribute | null;
    if (colorAttr) {
      const umdRed = { r: 0.85, g: 0.06, b: 0.12 };
      for (let i = 0; i < colorAttr.count; i++) {
        let r = colorAttr.getX(i);
        let g = colorAttr.getY(i);
        let b = colorAttr.getZ(i);
        // Beltline stripe blue (0x2456a6): b dominant, mid saturation.
        if (b > 0.5 && b > r * 2.5 && b > g * 1.5) {
          r = 0.12;
          g = 0.4;
          b = 0.95;
        } else {
          r = Math.min(1, r * 1.18);
          g = Math.min(1, g * 1.18);
          b = Math.min(1, b * 1.18);
        }
        colorAttr.setXYZ(i, r, g, b);
      }
      // UMD red accent: recolor the skirt's rear-most vertices red.
      const posAttr = busGeom.getAttribute('position') as THREE.BufferAttribute | null;
      if (posAttr) {
        let minZ = Infinity;
        for (let i = 0; i < posAttr.count; i++) minZ = Math.min(minZ, posAttr.getZ(i));
        for (let i = 0; i < posAttr.count; i++) {
          const z = posAttr.getZ(i);
          const y = posAttr.getY(i);
          if (z < minZ + 0.6 && y < 1.2) {
            colorAttr.setXYZ(i, umdRed.r, umdRed.g, umdRed.b);
          }
        }
      }
      colorAttr.needsUpdate = true;
    }
    bus = new THREE.Mesh(busGeom, new THREE.MeshLambertMaterial({ vertexColors: true }));
    bus.castShadow = true;
    // Stylized 1.6x (11m -> ~17.6m) so the bus is unmissable at campus zoom.
    // Re-applied every frame in the update below rather than set once here:
    // scratchScale is shared module scratch, and trusting it to keep this
    // value between frames is how the bus quietly inherits someone else's.
    scene.add(bus);
    disposables.push(bus.geometry, bus.material as THREE.Material);
    // Start the bus near the campus core rather than at a random point on the
    // 3.4km route: Campus Drive runs well east of the default view, and a
    // uniform seed spawned it ~1.4km off-screen where nobody ever saw it.
    {
      const core = proj.toLocal(SQUIRREL_CORE_LNG, SQUIRREL_CORE_LAT);
      let bestS = 0;
      let bestD = Infinity;
      for (let i = 0; i < busRoute.pts.length; i++) {
        const p = busRoute.pts[i];
        const d = Math.hypot(p.x - core.x, p.z - core.z);
        if (d < bestD) {
          bestD = d;
          bestS = busRoute.cum[i];
        }
      }
      // Small deterministic offset so it isn't pinned to the exact same metre.
      busS = (bestS + (hash01('bus:s') - 0.5) * 160 + busRoute.length) % busRoute.length;
    }

    // Bus stops: blue discs on the sidewalk (right of travel), a touch
    // bigger + brighter so they read at campus zoom.
    const stopMat = new THREE.MeshBasicMaterial({ color: 0x1e6fe0 });
    const stopGeom = new THREE.CircleGeometry(2.0, 16);
    disposables.push(stopMat, stopGeom);
    for (let i = 0; i < BUS_STOP_FRACTIONS.length; i++) {
      const s = BUS_STOP_FRACTIONS[i] * busRoute.length;
      sampleRoute(busRoute, s, busSample);
      // right of travel in x-east/z-south: (-fz, fx)
      const disc = new THREE.Mesh(stopGeom, stopMat);
      disc.rotation.x = -Math.PI / 2;
      disc.position.set(busSample.x - busSample.fz * 4.2, 0.45, busSample.z + busSample.fx * 4.2);
      busStopGroup.add(disc);
      busStops.push(s);
      busStopLngLat.push(toLngLat(busSample.x, busSample.z));
    }
    scene.add(busStopGroup);
  }

  // == 4. TURTLE MODE =============================================================
  const turtleGeom = buildDrivingTurtleGeometry();
  disposables.push(turtleGeom);
  let turtleActive = false;
  let turtleT = 0;
  let savedCarGeom: THREE.BufferGeometry | null = null;
  let savedColors: Float32Array | null = null;
  const savedSpeeds: number[] = [];

  const setTurtleMode = (active: boolean): void => {
    const { carBodies, driveCars } = deps;
    if (active) {
      turtleT = TURTLE_MODE_SECONDS;
      if (turtleActive) return;
      turtleActive = true;
      if (carBodies) {
        savedCarGeom = carBodies.geometry;
        carBodies.geometry = turtleGeom;
        const colorAttr = carBodies.instanceColor;
        if (colorAttr) {
          savedColors = (colorAttr.array as Float32Array).slice();
          for (let i = 0; i < carBodies.count; i++) {
            // Slight per-turtle variance around olive white (vertex colors
            // carry the greens; near-white tints keep them saturated).
            const l = 0.85 + hash01(`turtle:${i}:tint`) * 0.15;
            carBodies.setColorAt(i, scratchColor.setRGB(l, l, l * 0.96));
          }
          if (carBodies.instanceColor) carBodies.instanceColor.needsUpdate = true;
        }
      }
      savedSpeeds.length = 0;
      for (const car of driveCars) {
        savedSpeeds.push(car.speed);
        car.speed = TURTLE_SPEED;
      }
    } else {
      turtleT = 0;
      if (!turtleActive) return;
      turtleActive = false;
      if (carBodies) {
        if (savedCarGeom) carBodies.geometry = savedCarGeom;
        savedCarGeom = null;
        if (savedColors && carBodies.instanceColor) {
          (carBodies.instanceColor.array as Float32Array).set(savedColors);
          carBodies.instanceColor.needsUpdate = true;
        }
        savedColors = null;
      }
      for (let i = 0; i < driveCars.length; i++) {
        if (i < savedSpeeds.length) driveCars[i].speed = savedSpeeds[i];
      }
      savedSpeeds.length = 0;
    }
    mark();
  };

  // == 5. 2AM MODE ================================================================
  let timeMode = deps.initialTimeMode;
  let stillT = 0; // eased 0..1 depth of the 2AM stillness
  let stillTarget = 0;
  let lastCheckSec = -1;
  const totalCarCount = deps.carBodies ? deps.carBodies.count : 0;
  let carsReduced = false;

  const setTimeMode = (mode: string): void => {
    timeMode = mode;
  };

  /** Post-multiply a material scalar by `factor`, tracking the writer's base
   * so we never compound. Returns true when the material changed. */
  const applyFactor = (
    current: number,
    factor: number,
    last: { base: number; applied: number },
    write: (v: number) => void,
  ): boolean => {
    const base = Math.abs(current - last.applied) > 1e-6 ? current : last.base;
    const applied = base * factor;
    last.base = base;
    if (Math.abs(applied - current) > 1e-4) {
      write(applied);
      last.applied = applied;
      return true;
    }
    last.applied = applied;
    return false;
  };
  const winLast = { base: 0, applied: -1 };
  const lampLast = { base: 0, applied: -1 };
  const poolLast = { base: 0, applied: -1 };
  const hlLast = { base: 0, applied: -1 };

  // At the 7.5x duck scale the body underside sits ~0.32 below the group
  // origin; 0.56 keeps the waterline exactly where the 2.5x duck had it.
  const duckBaseY = 0.56;

  // == 6. ODK FOUNTAIN ============================================================
  // Click the McKeldin Mall pool -> an expanding splash ring + toast. The pool
  // is one polygon inside the merged `water` mesh, so it gets an invisible
  // flat proxy for the raycast rather than trying to hit-test the merge.
  // On the last day of classes someone has already beaten you to it.
  const fountainGroup = new THREE.Group();
  let fountainProxy: THREE.Mesh | null = null;
  let splashRing: THREE.Mesh | null = null;
  let splashT = 0; // seconds remaining in the splash animation
  let splashMat: THREE.MeshBasicMaterial | null = null;
  let fountainSwimmer: THREE.Group | null = null;

  const isLastDayOfClasses = (d: Date): boolean =>
    LAST_DAY_OF_CLASSES.some(([m, day]) => d.getMonth() + 1 === m && d.getDate() === day);

  {
    // Locate the pool by centroid, same anchor the bake's AREA_WIDEN uses.
    const target = proj.toLocal(FOUNTAIN_LNG, FOUNTAIN_LAT);
    let best: { cx: number; cz: number; halfX: number; halfZ: number } | null = null;
    let bestD = FOUNTAIN_MATCH_RADIUS;
    for (const area of data.areas) {
      if (area.kind !== 'water' && area.kind !== 'fountain') continue;
      const poly = area.polygon;
      if (!poly || poly.length < 3) continue;
      let minX = Infinity;
      let maxX = -Infinity;
      let minZ = Infinity;
      let maxZ = -Infinity;
      for (const [lng, lat] of poly) {
        const p = proj.toLocal(lng, lat);
        if (p.x < minX) minX = p.x;
        if (p.x > maxX) maxX = p.x;
        if (p.z < minZ) minZ = p.z;
        if (p.z > maxZ) maxZ = p.z;
      }
      const cx = (minX + maxX) / 2;
      const cz = (minZ + maxZ) / 2;
      const d = Math.hypot(cx - target.x, cz - target.z);
      if (d < bestD) {
        bestD = d;
        best = { cx, cz, halfX: (maxX - minX) / 2, halfZ: (maxZ - minZ) / 2 };
      }
    }

    if (best) {
      // Invisible click target. Kept `visible` (raycaster skips hidden
      // objects) but fully transparent and depth-neutral, and padded so the
      // thin pool is still comfortably tappable on a phone.
      const padX = Math.max(best.halfX * 2 + 4, 8);
      const padZ = Math.max(best.halfZ * 2 + 4, 8);
      const proxyMat = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0,
        depthWrite: false,
        depthTest: false,
      });
      const proxyGeom = new THREE.PlaneGeometry(padX, padZ);
      proxyGeom.rotateX(-Math.PI / 2);
      fountainProxy = new THREE.Mesh(proxyGeom, proxyMat);
      fountainProxy.position.set(best.cx, 0.2, best.cz);
      fountainProxy.renderOrder = -1;
      fountainGroup.add(fountainProxy);
      disposables.push(proxyGeom, proxyMat);

      // Splash ring — expands and fades, same idea as the selection pulse.
      splashMat = new THREE.MeshBasicMaterial({
        color: 0xdff1fb,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide,
        fog: false,
      });
      const ringGeom = new THREE.RingGeometry(0.72, 1, 40);
      ringGeom.rotateX(-Math.PI / 2);
      splashRing = new THREE.Mesh(ringGeom, splashMat);
      splashRing.position.set(best.cx, 0.24, best.cz);
      splashRing.visible = false;
      splashRing.renderOrder = 3;
      fountainGroup.add(splashRing);
      disposables.push(ringGeom, splashMat);

      // Last day of classes: a swimmer is already in there. Built once but
      // shown/hidden per frame off the solar clock, so scheduling that date
      // brings them out instead of the decision being baked in at load.
      {
        const skinMat = new THREE.MeshLambertMaterial({ color: 0xd8a37e });
        const shirtMat = new THREE.MeshLambertMaterial({ color: 0xe21833 }); // UMD red
        const swimmer = new THREE.Group();
        const torso = new THREE.CapsuleGeometry(0.34, 0.7, 4, 8);
        torso.rotateX(Math.PI / 2); // lying back in the water
        const torsoMesh = new THREE.Mesh(torso, shirtMat);
        torsoMesh.position.set(0, 0.42, 0);
        const headGeom = new THREE.SphereGeometry(0.28, 10, 8);
        const headMesh = new THREE.Mesh(headGeom, skinMat);
        headMesh.position.set(0, 0.52, 0.72);
        swimmer.add(torsoMesh, headMesh);
        for (const sx of [-1, 1]) {
          const armGeom = new THREE.CapsuleGeometry(0.13, 0.62, 4, 6);
          armGeom.rotateZ(Math.PI / 2);
          const arm = new THREE.Mesh(armGeom, skinMat);
          arm.position.set(sx * 0.56, 0.42, 0.12);
          swimmer.add(arm);
          disposables.push(armGeom);
        }
        swimmer.position.set(best.cx, 0, best.cz);
        swimmer.rotation.y = 0.4;
        swimmer.visible = false; // update() decides, from the solar clock
        fountainGroup.add(swimmer);
        fountainSwimmer = swimmer;
        disposables.push(torso, headGeom, skinMat, shirtMat);
      }

      scene.add(fountainGroup);
    }
  }

  /** Fires the splash + toast. Exposed so the pointer handler stays thin. */
  const triggerSplash = (): void => {
    splashT = SPLASH_SECONDS;
    window.dispatchEvent(new CustomEvent('umd-easteregg', { detail: { kind: 'fountain' } }));
    mark();
  };

  // == 7. CHERRY BLOSSOMS =========================================================
  // Late March -> April the campus trees bloom. Tree color is baked into the
  // merged geometry's vertex-color attribute and the mesh shares `flatMat`
  // with the ground/buildings, so this lerps the ATTRIBUTE (a material tint
  // would repaint half the campus). Original greens are kept so the ease can
  // run both directions.
  const treeColorAttr = deps.treesGeometry.getAttribute('color') as
    | THREE.BufferAttribute
    | undefined;
  const treeBaseColors = treeColorAttr ? Float32Array.from(treeColorAttr.array) : null;
  let bloomT = 0; // 0 = normal green, 1 = full bloom
  let bloomApplied = -1; // last value written, so we only touch the GPU on change

  const inBloomSeason = (now: Date): boolean => {
    const m = now.getMonth() + 1;
    const d = now.getDate();
    const after = m > BLOOM_START[0] || (m === BLOOM_START[0] && d >= BLOOM_START[1]);
    const before = m < BLOOM_END[0] || (m === BLOOM_END[0] && d <= BLOOM_END[1]);
    return after && before;
  };

  const applyBloom = (t: number): void => {
    if (!treeColorAttr || !treeBaseColors) return;
    if (Math.abs(t - bloomApplied) < 0.004) return;
    bloomApplied = t;
    const arr = treeColorAttr.array as Float32Array;
    const pink = scratchColor.set(BLOSSOM_COLOR);
    const k = t * BLOSSOM_MIX;
    for (let i = 0; i < arr.length; i += 3) {
      arr[i] = treeBaseColors[i] + (pink.r - treeBaseColors[i]) * k;
      arr[i + 1] = treeBaseColors[i + 1] + (pink.g - treeBaseColors[i + 1]) * k;
      arr[i + 2] = treeBaseColors[i + 2] + (pink.b - treeBaseColors[i + 2]) * k;
    }
    treeColorAttr.needsUpdate = true;
  };

  // == 8. SQUIRRELS ===============================================================
  // Bold campus squirrels: dart-and-freeze around the baked tree positions.
  // One InstancedMesh, hash-seeded so the layout is stable across reloads.
  interface Squirrel {
    homeX: number;
    homeZ: number;
    x: number;
    z: number;
    targetX: number;
    targetZ: number;
    heading: number;
    /** Seconds left frozen; <= 0 means it is darting. */
    freezeT: number;
    hopPhase: number;
    seed: string;
  }

  const squirrels: Squirrel[] = [];
  let squirrelMesh: THREE.InstancedMesh | null = null;

  {
    const treePts = (data.trees ?? [])
      .map(([lng, lat]) => proj.toLocal(lng, lat))
      .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.z));
    if (treePts.length > 0) {
      const geom = buildSquirrelGeometry();
      const mat = new THREE.MeshLambertMaterial({ vertexColors: true });
      squirrelMesh = new THREE.InstancedMesh(geom, mat, SQUIRREL_COUNT);
      squirrelMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      squirrelMesh.castShadow = true;
      squirrelMesh.frustumCulled = false; // instances move well outside the source bbox
      disposables.push(geom, mat);

      // Keep only trees near the campus core, then walk them in a shuffled
      // order so each squirrel gets a DISTINCT tree — random picking stacked
      // five of them on one trunk.
      const core = proj.toLocal(SQUIRREL_CORE_LNG, SQUIRREL_CORE_LAT);
      const nearCore = treePts.filter(
        (p) => Math.hypot(p.x - core.x, p.z - core.z) < SQUIRREL_CORE_RADIUS,
      );
      const pool = (nearCore.length >= 4 ? nearCore : treePts)
        .map((p, i) => ({ p, k: hash01(`squirrel:shuffle:${i}`) }))
        .sort((a, b) => a.k - b.k)
        .map((e) => e.p);

      for (let i = 0; i < SQUIRREL_COUNT; i++) {
        const seed = `squirrel:${i}`;
        const home = pool[i % pool.length];
        const a = hash01(`${seed}:a`) * Math.PI * 2;
        const r = 1.5 + hash01(`${seed}:r`) * (SQUIRREL_ROAM_RADIUS - 1.5);
        const x = home.x + Math.cos(a) * r;
        const z = home.z + Math.sin(a) * r;
        squirrels.push({
          homeX: home.x,
          homeZ: home.z,
          x,
          z,
          targetX: x,
          targetZ: z,
          heading: hash01(`${seed}:h`) * Math.PI * 2,
          // Stagger the first move so they don't all bolt on frame one.
          freezeT: SQUIRREL_FREEZE_MIN + hash01(`${seed}:f`) * SQUIRREL_FREEZE_MAX,
          hopPhase: hash01(`${seed}:p`) * Math.PI * 2,
          seed,
        });
      }
      scene.add(squirrelMesh);
    }
  }

  /** Picks the next dart destination within the squirrel's home radius. */
  let squirrelTick = 0;
  const retargetSquirrel = (s: Squirrel): void => {
    squirrelTick += 1;
    const a = hash01(`${s.seed}:ta:${squirrelTick}`) * Math.PI * 2;
    const r = 1.2 + hash01(`${s.seed}:tr:${squirrelTick}`) * (SQUIRREL_ROAM_RADIUS - 1.2);
    s.targetX = s.homeX + Math.cos(a) * r;
    s.targetZ = s.homeZ + Math.sin(a) * r;
  };

  let lastSquirrelCamY = -1;
  const updateSquirrels = (dt: number, nowSec: number): boolean => {
    if (!squirrelMesh || squirrels.length === 0) return false;
    let moved = false;
    // Zooming rescales them even when nobody is running, so treat a camera
    // move as a reason to redraw. Height is a good stand-in for orbit
    // distance and needs no reach into the controls.
    const camY = camera.position.y;
    if (Math.abs(camY - lastSquirrelCamY) > SQUIRREL_CAM_EPS) {
      lastSquirrelCamY = camY;
      moved = true;
    }
    for (let i = 0; i < squirrels.length; i++) {
      const s = squirrels[i];
      let hop = 0;
      if (s.freezeT > 0) {
        // Frozen: hold the pose, no matrix write needed beyond the first.
        s.freezeT -= dt;
        if (s.freezeT <= 0) retargetSquirrel(s);
      } else {
        const dx = s.targetX - s.x;
        const dz = s.targetZ - s.z;
        const dist = Math.hypot(dx, dz);
        if (dist < 0.15) {
          // Arrived — freeze and stare at nothing for a while.
          squirrelTick += 1;
          s.freezeT =
            SQUIRREL_FREEZE_MIN +
            hash01(`${s.seed}:fz:${squirrelTick}`) * (SQUIRREL_FREEZE_MAX - SQUIRREL_FREEZE_MIN);
        } else {
          const step = Math.min(SQUIRREL_DART_SPEED * dt, dist);
          s.x += (dx / dist) * step;
          s.z += (dz / dist) * step;
          // Turn toward travel; squirrel forward is +z.
          const want = Math.atan2(dx, dz);
          let delta = ((want - s.heading + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
          const maxTurn = SQUIRREL_TURN_RATE * dt;
          delta = THREE.MathUtils.clamp(delta, -maxTurn, maxTurn);
          s.heading += delta;
          hop = Math.abs(Math.sin(nowSec * Math.PI * 2 * SQUIRREL_HOP_HZ + s.hopPhase)) *
            SQUIRREL_HOP_AMP;
          moved = true;
        }
      }
      // Per-instance camera distance so squirrels near the screen edge at a
      // steep pitch don't shrink relative to ones under the cursor.
      const dxC = camera.position.x - s.x;
      const dyC = camera.position.y;
      const dzC = camera.position.z - s.z;
      const camDist = Math.sqrt(dxC * dxC + dyC * dyC + dzC * dzC);
      const scale = THREE.MathUtils.clamp(
        camDist * SQUIRREL_SCALE_PER_METER,
        SQUIRREL_SCALE_MIN,
        SQUIRREL_SCALE_MAX,
      );
      scratchV3.set(s.x, hop * scale, s.z);
      scratchQuat.setFromAxisAngle(scratchYAxis, s.heading);
      scratchSquirrelScale.set(scale, scale, scale);
      scratchM4.compose(scratchV3, scratchQuat, scratchSquirrelScale);
      squirrelMesh.setMatrixAt(i, scratchM4);
    }
    squirrelMesh.instanceMatrix.needsUpdate = true;
    return moved;
  };

  updateSquirrels(0, 0); // place them before the first render

  // == update =====================================================================
  const update = (dt: number): boolean => {
    dirty = false;
    busNow += dt;

    // -- Testudo nose pulse --
    if (nosePulseT > 0) {
      nosePulseT = Math.max(0, nosePulseT - dt);
      const phase = 1 - nosePulseT / NOSE_PULSE_SECONDS;
      // Two soft gold throbs decaying over the pulse window.
      const throb = 0.6 + 0.4 * Math.sin(phase * Math.PI * 4);
      noseMat.emissiveIntensity = (1 - phase) * 1.6 * throb + stillT * TWOAM_NOSE_GLOW;
      dirty = true;
    } else {
      const target = stillT * TWOAM_NOSE_GLOW;
      if (Math.abs(noseMat.emissiveIntensity - target) > 0.004) {
        noseMat.emissiveIntensity = target;
        dirty = true;
      }
    }

    // -- Duck swim + bob --
    if (duck.visible) {
      duckAngle += (DUCK_SPEED / duckRadius) * dt;
      const bob = Math.sin(busNow * Math.PI * 2 * DUCK_BOB_HZ) * DUCK_BOB_AMP;
      const x = duckCenter.x + Math.cos(duckAngle) * duckRadius;
      const z = duckCenter.z + Math.sin(duckAngle) * duckRadius;
      duck.position.set(x, duckBaseY + bob, z);
      // Tangent of the circle = travel direction; duck forward is +z.
      duck.rotation.y = Math.atan2(-Math.sin(duckAngle), Math.cos(duckAngle)) + Math.PI / 2;
      dirty = true;
    }

    // -- Bus drive + dwell stops --
    if (bus && busRoute) {
      let moving = busNow >= busDwellUntil;
      if (moving) {
        busS += BUS_SPEED * dt * busDir;
        if (busRoute.loop) {
          busS = ((busS % busRoute.length) + busRoute.length) % busRoute.length;
        } else if (busS >= busRoute.length) {
          busS = busRoute.length - 0.01;
          busDir = -1;
        } else if (busS <= 0) {
          busS = 0.01;
          busDir = 1;
        }
        // Release the latch once we're properly clear of the served stop, so
        // the same stop can serve again on the return leg of the ping-pong.
        if (
          busServedStop >= 0 &&
          Math.abs(busS - busStops[busServedStop]) > BUS_STOP_RELEASE_RADIUS
        ) {
          busServedStop = -1;
        }
        // Dwell at stops (8–15s, deterministic per stop + lap).
        for (let i = 0; i < busStops.length; i++) {
          if (i === busServedStop) continue; // already served; drive on
          const d = Math.abs(busS - busStops[i]);
          if (d < BUS_STOP_TRIGGER_RADIUS) {
            const lap = Math.floor(busNow / 120);
            busDwellUntil = busNow + 8 + hash01(`bus:dwell:${i}:${lap}`) * 7;
            busServedStop = i;
            moving = false;
            break;
          }
        }
      }
      sampleRoute(busRoute, busS, busSample);
      scratchV3.set(busSample.x - busSample.fz * 1.6, 0.42, busSample.z + busSample.fx * 1.6);
      scratchQuat.setFromAxisAngle(
        scratchYAxis,
        Math.atan2(busSample.fx * busDir, busSample.fz * busDir),
      );
      scratchScale.set(1.6, 1.6, 1.6); // owned here, not inherited
      scratchM4.compose(scratchV3, scratchQuat, scratchScale);
      bus.matrixAutoUpdate = false;
      bus.matrix.copy(scratchM4);
      bus.matrixWorldNeedsUpdate = true;
      dirty = true;
    }

    // -- Turtle mode countdown --
    if (turtleActive) {
      turtleT -= dt;
      if (turtleT <= 0) setTurtleMode(false);
      dirty = true;
    }

    // -- 2AM stillness (eased) --
    // Check the wall clock once per second; the damp does the smoothing.
    const nowSecFloor = Math.floor(busNow);
    if (nowSecFloor !== lastCheckSec) {
      lastCheckSec = nowSecFloor;
      const d = deps.now();
      const hour = d.getHours() + d.getMinutes() / 60;
      const inWindow = timeMode === 'auto' && hour >= 2 && hour < 5;
      stillTarget = inWindow ? 1 : 0;
    }
    const prevStill = stillT;
    stillT = THREE.MathUtils.damp(stillT, stillTarget, TWOAM_LAMBDA, dt);
    if (Math.abs(stillT - prevStill) > 1e-5 || stillTarget > 0 || prevStill > 0) {
      const winF = 1 + (TWOAM_WINDOW_FACTOR - 1) * stillT;
      const lampF = 1 + (TWOAM_LAMP_FACTOR - 1) * stillT;
      if (
        applyFactor(deps.windowMat.opacity, winF, winLast, (v) => {
          deps.windowMat.opacity = v;
        })
      )
        dirty = true;
      if (
        applyFactor(deps.lampHeadMat.emissiveIntensity, lampF, lampLast, (v) => {
          deps.lampHeadMat.emissiveIntensity = v;
        })
      )
        dirty = true;
      if (
        applyFactor(deps.lampPoolMat.opacity, lampF, poolLast, (v) => {
          deps.lampPoolMat.opacity = v;
        })
      )
        dirty = true;
      if (deps.headlightMat) {
        if (
          applyFactor(deps.headlightMat.opacity, lampF, hlLast, (v) => {
            deps.headlightMat!.opacity = v;
          })
        )
          dirty = true;
      }
      // Lone-car reduction (hysteresis so it never flickers at the edge).
      const shouldReduce = stillT > 0.6;
      const shouldRestore = stillT < 0.4;
      if (deps.carBodies && totalCarCount > 1) {
        if (shouldReduce && !carsReduced) {
          carsReduced = true;
          deps.carBodies.count = 1;
          if (deps.carHeadlights) deps.carHeadlights.count = 1;
          dirty = true;
        } else if (shouldRestore && carsReduced) {
          carsReduced = false;
          deps.carBodies.count = totalCarCount;
          if (deps.carHeadlights) deps.carHeadlights.count = totalCarCount;
          dirty = true;
        }
      }
      // Duck sleeps.
      const duckVisible = stillT < 0.5;
      if (duck.visible !== duckVisible) {
        duck.visible = duckVisible;
        dirty = true;
      }
    }

    // -- Fountain splash: ring expands outward while fading out --
    if (splashT > 0 && splashRing && splashMat) {
      splashT = Math.max(0, splashT - dt);
      const phase = 1 - splashT / SPLASH_SECONDS; // 0 -> 1
      // Ease-out so it leaps then settles, like a real splash ring.
      const spread = 1 - Math.pow(1 - phase, 3);
      const radius = 0.6 + spread * SPLASH_MAX_RADIUS;
      splashRing.scale.set(radius, 1, radius);
      splashMat.opacity = (1 - phase) * 0.85;
      splashRing.visible = splashT > 0;
      dirty = true;
    }

    // -- Fountain swimmer: present only on the last day of classes --
    if (fountainSwimmer) {
      const wantSwimmer = isLastDayOfClasses(deps.now());
      if (fountainSwimmer.visible !== wantSwimmer) {
        fountainSwimmer.visible = wantSwimmer;
        dirty = true;
      }
    }

    // -- Cherry blossoms: ease toward the seasonal target --
    if (treeColorAttr) {
      const bloomTarget = inBloomSeason(deps.now()) ? 1 : 0;
      const prevBloom = bloomT;
      bloomT = THREE.MathUtils.damp(bloomT, bloomTarget, BLOOM_LAMBDA, dt);
      if (Math.abs(bloomT - bloomTarget) < 0.002) bloomT = bloomTarget;
      if (bloomT !== prevBloom || bloomApplied < 0) {
        applyBloom(bloomT);
        dirty = true;
      }
    }

    // -- Squirrels: dart and freeze --
    if (updateSquirrels(dt, busNow)) dirty = true;

    if (dirty) deps.markDirty();
    return dirty;
  };

  // == dispose ====================================================================
  const dispose = (): void => {
    canvas.removeEventListener('pointerdown', onPointerDown);
    canvas.removeEventListener('pointerup', onPointerUp);
    setTurtleMode(false);
    if (carsReduced && deps.carBodies) {
      deps.carBodies.count = totalCarCount;
      if (deps.carHeadlights) deps.carHeadlights.count = totalCarCount;
    }
    scene.remove(statue);
    scene.remove(duck);
    if (bus) scene.remove(bus);
    scene.remove(busStopGroup);
    scene.remove(fountainGroup);
    if (squirrelMesh) {
      scene.remove(squirrelMesh);
      squirrelMesh.dispose();
    }
    // The trees geometry is owned by geometry.ts, not us — hand back the
    // original greens so a re-init doesn't start from bloomed colors.
    if (treeColorAttr && treeBaseColors) {
      (treeColorAttr.array as Float32Array).set(treeBaseColors);
      treeColorAttr.needsUpdate = true;
    }
    // Shared geometries/materials (statue parts, duck parts, bus, stop
    // geom/mat) were each pushed once — dispose them all here.
    for (const d of disposables) d.dispose();
  };

  // == debug (QA) ==================================================================
  const debugSample = { x: 0, z: 0, fx: 0, fz: 1 };
  const debug = (): {
    statue: { lng: number; lat: number };
    duck: { lng: number; lat: number };
    bus: { lng: number; lat: number } | null;
    busStops: { lng: number; lat: number }[];
    cars: { lng: number; lat: number }[];
    stillT: number;
  } => {
    const busPos = busRoute ? toLngLat(busSample.x, busSample.z) : null;
    const cars: { lng: number; lat: number }[] = [];
    for (let i = 0; i < Math.min(3, deps.driveCars.length); i++) {
      const car = deps.driveCars[i];
      if (car.s == null || !car.route) continue;
      sampleRoute(car.route as EggRoute, car.s, debugSample);
      cars.push(toLngLat(debugSample.x, debugSample.z));
    }
    return {
      statue: { lng: TESTUDO_LNG, lat: TESTUDO_LAT },
      duck: toLngLat(duck.position.x, duck.position.z),
      bus: busPos,
      busStops: busStopLngLat,
      cars,
      stillT,
    };
  };

  return { update, setTurtleMode, setTimeMode, getStillness: () => stillT, debug, dispose };
}
