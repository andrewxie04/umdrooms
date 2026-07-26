// src/components/map3d/scene/seasons.ts
//
// Seasonal repaint of the living parts of campus: tree foliage and the grass /
// sport lawns. Driven by the scene's SOLAR CLOCK, so schedule mode shows the
// campus as it looks at the date you picked — pick late October and the trees
// are gold, pick January and the ground is frosted over.
//
// Why it lives here rather than in the eggs: cherry blossoms started life as a
// standalone egg writing the tree colour attribute directly, and a second
// system tinting the same buffer would have fought it every frame. Blossom is
// now just the spring peak of one continuous curve, and this module is the
// only owner of those two colour attributes.
//
// How the tint is applied:
//   - Trees are entirely foliage (two cones), so every vertex is repainted.
//     A per-tree `seasonSeed` attribute (baked in geometry.buildTrees) shifts
//     each tree's hue slightly, so autumn reads as a mix of gold/orange/red
//     rather than one flat colour.
//   - The areas mesh merges grass, sport and parking together, so a MASK is
//     built once by comparing each vertex's baked colour against the exported
//     COLORS constants — grass repaints fully, sport a little less, parking
//     not at all. (Comparison is safe: the three are exact, distinct values.)
//   - Both keep their original colours so the season can be eased in BOTH
//     directions, and dispose() hands the buffers back untouched.
//
// Everything is a lerp from the base colour, which preserves the existing
// contrast (the upper cone stays lighter than the lower, sport stays deeper
// than grass) instead of flattening the campus to a single hue.

import * as THREE from 'three';
import { COLORS } from './geometry';

/** A point in the year and the palette the campus wears there. */
interface SeasonKey {
  /** Day of year, 1–366. Interpolation wraps, so Dec blends into Jan. */
  day: number;
  label: string;
  /** Foliage target. */
  tree: number;
  /** Lawn target. */
  grass: number;
  /** How far foliage moves toward `tree` (blossom needs a stronger push). */
  treeMix: number;
  /** How far lawns move toward `grass`. */
  grassMix: number;
  /** Hue spread across individual trees — wide in autumn, tight when green. */
  spread: number;
  /** The big ground plane under everything (scene.ts owns the material). */
  ground: number;
  /** Falling-snow intensity, 0–1. Also whitens the lawns and ground. */
  snow: number;
}

/** The year, as a loop. Dates are approximate on purpose: this is mood, not a
 * phenology model. Blossom peak is deliberately narrow so it stays a treat. */
const YEAR: SeasonKey[] = [
  // grassMix is deliberately strong at the cold end: at 0.6 toward a pale
  // target the lawns still read as ordinary summer green, because the base is
  // a saturated mid-green and the eye compares them side by side.
  { day: 15, label: 'deep winter', tree: 0x9aa3a6, grass: 0xdfe4e6, treeMix: 0.86, grassMix: 0.92, spread: 0.02, ground: 0xd3d9da, snow: 1 },
  { day: 70, label: 'thaw', tree: 0x7a7d5f, grass: 0xa8ac86, treeMix: 0.55, grassMix: 0.6, spread: 0.03, ground: 0xb0b5a0, snow: 0.25 },
  { day: 92, label: 'blossom', tree: 0xf2b6cd, grass: 0x8fbc72, treeMix: 0.86, grassMix: 0.3, spread: 0.04, ground: 0xa8b190, snow: 0 },
  { day: 120, label: 'late spring', tree: 0x87b064, grass: 0x8dba6f, treeMix: 0.6, grassMix: 0.3, spread: 0.03, ground: 0xa8b190, snow: 0 },
  { day: 190, label: 'high summer', tree: 0x6f8a5c, grass: 0x86ab68, treeMix: 0.45, grassMix: 0.2, spread: 0.03, ground: 0xa5b08c, snow: 0 },
  { day: 250, label: 'first turn', tree: 0x93974f, grass: 0xa3ad6f, treeMix: 0.45, grassMix: 0.4, spread: 0.06, ground: 0xacae8b, snow: 0 },
  { day: 295, label: 'peak autumn', tree: 0xc9762e, grass: 0xb8ad72, treeMix: 0.85, grassMix: 0.62, spread: 0.11, ground: 0xb3ab86, snow: 0 },
  { day: 325, label: 'bare', tree: 0x7d6a55, grass: 0xbdb794, treeMix: 0.78, grassMix: 0.72, spread: 0.05, ground: 0xb8b493, snow: 0.5 },
];

/** Ease rate toward the target palette. Slow — a season should drift in, and
 * this also smooths the jump when someone scrubs the schedule date. */
const SEASON_LAMBDA = 0.9;
/** Skip the buffer rewrite until the blend has moved at least this much. */
const SEASON_EPS = 0.002;
/** Colour-match tolerance when classifying merged area vertices. */
const MATCH_EPS = 0.004;

// -- snowfall ------------------------------------------------------------------
/** Flake count. Rendered as ONE THREE.Points, so this is a single draw call
 * and the per-frame cost is just the position walk. */
const SNOW_COUNT = 1600;
/** Screen-space flake size in PIXELS. sizeAttenuation is off deliberately:
 * with it on, flakes vanish at browsing zoom and turn into golf balls up
 * close — the same distance problem the squirrels had. Constant pixel size is
 * both cheaper and how snow is usually faked. */
const SNOW_SIZE_PX = 2.6;
/** Column height the flakes fall through. */
const SNOW_CEILING = 260;
const SNOW_FALL_MIN = 2.4; // m/s
const SNOW_FALL_MAX = 6.0;
const SNOW_SWAY = 1.4; // metres of horizontal drift amplitude
const SNOW_MAX_OPACITY = 0.85;

export interface SeasonsDeps {
  treesGeometry: THREE.BufferGeometry;
  areasGeometry: THREE.BufferGeometry;
  /** The big ground plane's material — tinted toward snow in winter. */
  groundMaterial: THREE.MeshLambertMaterial;
  /** Scene to host the snowfall points. */
  scene: THREE.Scene;
  /** Where the camera is looking and how far out, so the snow column can be
   * kept centred on the view and scaled to cover it. */
  getFocus: () => { x: number; z: number; distance: number };
  /** The scene's solar clock (real time, or the scheduled instant). */
  now: () => Date;
}

export interface SeasonsHandle {
  /** Advance the eased blend. Returns true when a re-render is needed. */
  update(dt: number): boolean;
  /** Current season label, for QA/telemetry. */
  current(): string;
  /** Restores the original baked colours. */
  dispose(): void;
}

function dayOfYear(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 0);
  return Math.floor((d.getTime() - start.getTime()) / 86400000);
}

/** Circular position between the two keys bracketing `day`. */
function bracket(day: number): { a: SeasonKey; b: SeasonKey; t: number } {
  const last = YEAR[YEAR.length - 1];
  // Before the first key or after the last: wrap across the new year.
  if (day < YEAR[0].day || day >= last.day) {
    const span = 365 - last.day + YEAR[0].day;
    const into = day >= last.day ? day - last.day : 365 - last.day + day;
    return { a: last, b: YEAR[0], t: span > 0 ? into / span : 0 };
  }
  for (let i = 0; i < YEAR.length - 1; i++) {
    if (day >= YEAR[i].day && day < YEAR[i + 1].day) {
      const span = YEAR[i + 1].day - YEAR[i].day;
      return { a: YEAR[i], b: YEAR[i + 1], t: (day - YEAR[i].day) / span };
    }
  }
  return { a: last, b: YEAR[0], t: 0 };
}

export function createSeasons(deps: SeasonsDeps): SeasonsHandle {
  const treeAttr = deps.treesGeometry.getAttribute('color') as THREE.BufferAttribute | undefined;
  const seedAttr = deps.treesGeometry.getAttribute('seasonSeed') as
    | THREE.BufferAttribute
    | undefined;
  const areaAttr = deps.areasGeometry.getAttribute('color') as THREE.BufferAttribute | undefined;

  const treeBase = treeAttr ? Float32Array.from(treeAttr.array as Float32Array) : null;
  const areaBase = areaAttr ? Float32Array.from(areaAttr.array as Float32Array) : null;

  /** Per-vertex repaint weight for the merged areas mesh: grass fully, sport
   * a little less (it is already a deeper green), parking/everything else 0. */
  const areaMask: Float32Array | null = (() => {
    if (!areaBase) return null;
    const m = new Float32Array(areaBase.length / 3);
    const near = (i: number, c: THREE.Color): boolean =>
      Math.abs(areaBase[i] - c.r) < MATCH_EPS &&
      Math.abs(areaBase[i + 1] - c.g) < MATCH_EPS &&
      Math.abs(areaBase[i + 2] - c.b) < MATCH_EPS;
    for (let v = 0, i = 0; i < areaBase.length; i += 3, v++) {
      m[v] = near(i, COLORS.grass) ? 1 : near(i, COLORS.sport) ? 0.75 : 0;
    }
    return m;
  })();

  const groundBase = deps.groundMaterial.color.clone();

  // -- snowfall ---------------------------------------------------------------
  // One Points cloud recycled inside a column that follows the camera focus,
  // so it always fills the view instead of being a fixed patch of weather
  // somewhere over the stadium.
  const snowPos = new Float32Array(SNOW_COUNT * 3);
  const snowFall = new Float32Array(SNOW_COUNT);
  const snowPhase = new Float32Array(SNOW_COUNT);
  const snowSwayHz = new Float32Array(SNOW_COUNT);
  for (let i = 0; i < SNOW_COUNT; i++) {
    snowPos[i * 3] = Math.random() - 0.5; // unit box; scaled to the column each frame
    snowPos[i * 3 + 1] = Math.random() * SNOW_CEILING;
    snowPos[i * 3 + 2] = Math.random() - 0.5;
    snowFall[i] = SNOW_FALL_MIN + Math.random() * (SNOW_FALL_MAX - SNOW_FALL_MIN);
    snowPhase[i] = Math.random() * Math.PI * 2;
    snowSwayHz[i] = 0.25 + Math.random() * 0.5;
  }
  const snowGeom = new THREE.BufferGeometry();
  // World-space buffer the update writes into (the unit box above is only the
  // seed layout; positions below are absolute metres).
  const snowWorld = new Float32Array(SNOW_COUNT * 3);
  snowGeom.setAttribute('position', new THREE.BufferAttribute(snowWorld, 3));
  const snowMat = new THREE.PointsMaterial({
    color: 0xf6fbff,
    size: SNOW_SIZE_PX,
    sizeAttenuation: false,
    transparent: true,
    opacity: 0,
    depthWrite: false,
    fog: false,
  });
  const snowPoints = new THREE.Points(snowGeom, snowMat);
  snowPoints.frustumCulled = false; // the column moves with the camera
  snowPoints.renderOrder = 5;
  snowPoints.visible = false;
  deps.scene.add(snowPoints);
  let snowTime = 0;

  const updateSnow = (dt: number, amount: number): boolean => {
    const visible = amount > 0.01;
    let changed = false;
    if (snowPoints.visible !== visible) {
      snowPoints.visible = visible;
      changed = true;
    }
    const wantOpacity = amount * SNOW_MAX_OPACITY;
    if (Math.abs(snowMat.opacity - wantOpacity) > 0.004) {
      snowMat.opacity = wantOpacity;
      changed = true;
    }
    if (!visible) return changed;

    snowTime += dt;
    const focus = deps.getFocus();
    // Column wide enough to cover the view at this zoom, clamped so close-ups
    // stay dense and far-outs don't spread 1600 flakes across the whole county.
    const half = THREE.MathUtils.clamp(focus.distance * 0.7, 160, 1400);
    for (let i = 0; i < SNOW_COUNT; i++) {
      const o = i * 3;
      let y = snowPos[o + 1] - snowFall[i] * dt;
      if (y < 0) y += SNOW_CEILING; // recycle to the top of the column
      snowPos[o + 1] = y;
      const sway = Math.sin(snowTime * snowSwayHz[i] * Math.PI * 2 + snowPhase[i]) * SNOW_SWAY;
      // snowPos x/z stay as unit offsets so the column can be re-scaled and
      // re-centred every frame without the flakes visibly jumping.
      snowWorld[o] = focus.x + snowPos[o] * 2 * half + sway;
      snowWorld[o + 1] = y;
      snowWorld[o + 2] = focus.z + snowPos[o + 2] * 2 * half + sway * 0.6;
    }
    snowGeom.getAttribute('position').needsUpdate = true;
    return true;
  };

  // Eased blend state: the palette actually on screen right now.
  const cur = {
    tree: new THREE.Color(0xffffff),
    grass: new THREE.Color(0xffffff),
    ground: new THREE.Color(0xffffff),
    treeMix: 0,
    grassMix: 0,
    spread: 0,
    snow: 0,
  };
  let started = false;
  let label = '';
  let lastApplied = -1;

  const scratch = new THREE.Color();
  const target = { tree: new THREE.Color(), grass: new THREE.Color(), ground: new THREE.Color() };

  const sample = (): { treeMix: number; grassMix: number; spread: number; snow: number } => {
    const { a, b, t } = bracket(dayOfYear(deps.now()));
    // smoothstep so keyframes ease rather than corner
    const e = t * t * (3 - 2 * t);
    target.tree.set(a.tree).lerp(scratch.set(b.tree), e);
    target.grass.set(a.grass).lerp(scratch.set(b.grass), e);
    target.ground.set(a.ground).lerp(scratch.set(b.ground), e);
    label = e < 0.5 ? a.label : b.label;
    return {
      treeMix: a.treeMix + (b.treeMix - a.treeMix) * e,
      grassMix: a.grassMix + (b.grassMix - a.grassMix) * e,
      spread: a.spread + (b.spread - a.spread) * e,
      snow: a.snow + (b.snow - a.snow) * e,
    };
  };

  /** Repaints both buffers from the current eased palette. */
  const apply = (): void => {
    if (treeAttr && treeBase) {
      const arr = treeAttr.array as Float32Array;
      const seeds = seedAttr?.array as Float32Array | undefined;
      for (let v = 0, i = 0; i < arr.length; i += 3, v++) {
        // Per-tree hue shift so autumn is a mix, not one flat orange.
        scratch.copy(cur.tree);
        if (seeds && cur.spread > 0) {
          scratch.offsetHSL((seeds[v] - 0.5) * cur.spread, 0, (seeds[v] - 0.5) * 0.05);
        }
        arr[i] = treeBase[i] + (scratch.r - treeBase[i]) * cur.treeMix;
        arr[i + 1] = treeBase[i + 1] + (scratch.g - treeBase[i + 1]) * cur.treeMix;
        arr[i + 2] = treeBase[i + 2] + (scratch.b - treeBase[i + 2]) * cur.treeMix;
      }
      treeAttr.needsUpdate = true;
    }
    if (areaAttr && areaBase && areaMask) {
      const arr = areaAttr.array as Float32Array;
      for (let v = 0, i = 0; i < arr.length; i += 3, v++) {
        const w = areaMask[v] * cur.grassMix;
        if (w === 0) continue; // parking/roads keep their baked colour
        arr[i] = areaBase[i] + (cur.grass.r - areaBase[i]) * w;
        arr[i + 1] = areaBase[i + 1] + (cur.grass.g - areaBase[i + 1]) * w;
        arr[i + 2] = areaBase[i + 2] + (cur.grass.b - areaBase[i + 2]) * w;
      }
      areaAttr.needsUpdate = true;
    }
    deps.groundMaterial.color.copy(cur.ground);
  };

  const update = (dt: number): boolean => {
    const mix = sample();
    if (!started) {
      // First frame: snap, so the campus loads already wearing the season.
      started = true;
      cur.tree.copy(target.tree);
      cur.grass.copy(target.grass);
      cur.ground.copy(target.ground);
      cur.treeMix = mix.treeMix;
      cur.grassMix = mix.grassMix;
      cur.spread = mix.spread;
      cur.snow = mix.snow;
      apply();
      updateSnow(dt, cur.snow);
      lastApplied = 0;
      return true;
    }
    const prevTreeMix = cur.treeMix;
    const prevGrassMix = cur.grassMix;
    const before = scratch.copy(cur.tree).getHex();
    const k = 1 - Math.exp(-SEASON_LAMBDA * dt);
    cur.tree.lerp(target.tree, k);
    cur.grass.lerp(target.grass, k);
    cur.ground.lerp(target.ground, k);
    cur.snow = THREE.MathUtils.damp(cur.snow, mix.snow, SEASON_LAMBDA, dt);
    cur.treeMix = THREE.MathUtils.damp(cur.treeMix, mix.treeMix, SEASON_LAMBDA, dt);
    cur.grassMix = THREE.MathUtils.damp(cur.grassMix, mix.grassMix, SEASON_LAMBDA, dt);
    cur.spread = THREE.MathUtils.damp(cur.spread, mix.spread, SEASON_LAMBDA, dt);
    // Cheap change detector: hue drift plus the two mix weights.
    const moved =
      before !== cur.tree.getHex() ||
      Math.abs(cur.treeMix - prevTreeMix) > SEASON_EPS ||
      Math.abs(cur.grassMix - prevGrassMix) > SEASON_EPS;
    // Snow animates every frame regardless of whether the palette moved —
    // it is falling, not a tint.
    const snowChanged = updateSnow(dt, cur.snow);
    if (!moved) return snowChanged;
    const stamp = cur.tree.getHex() + cur.treeMix + cur.grassMix;
    if (Math.abs(stamp - lastApplied) < 1e-6) return snowChanged;
    lastApplied = stamp;
    apply();
    return true;
  };

  return {
    update,
    current: () => label,
    dispose: () => {
      deps.scene.remove(snowPoints);
      snowGeom.dispose();
      snowMat.dispose();
      deps.groundMaterial.color.copy(groundBase);
      if (treeAttr && treeBase) {
        (treeAttr.array as Float32Array).set(treeBase);
        treeAttr.needsUpdate = true;
      }
      if (areaAttr && areaBase) {
        (areaAttr.array as Float32Array).set(areaBase);
        areaAttr.needsUpdate = true;
      }
    },
  };
}
